import { entryText } from '@/data/legalCorpus';
import { flaggedClauses } from '@/data/flaggedClauses';
import { clauseById } from '@/data/sampleContract';
import { translate } from '@/i18n';

import { MOCK_LATENCY, has } from './config';
import { streamChat, streamOutLocally, type LlmMessage, type OnToken } from './llmClient';
import { retrieve, toCitations, type Retrieved } from './retriever';
import type {
  ChatMessage,
  Citation,
  Language,
  MessageCard,
  ReadingLevel,
  SendOptions,
  SuggestedChip,
} from './types';

/**
 * The Coach brain. Each turn:
 *   1. retrieve grounding provisions from the corpus / vector store (RAG),
 *   2. decide which card the answer should be (plain / what-if / risk / escalate),
 *   3. for plain answers, generate grounded text — streamed from the LLM when
 *      configured, otherwise composed locally from the retrieved provisions.
 * Every answer carries a real Citation, stays literacy-not-advice, and routes to
 * PAO/DOLE when confidence is low. Never throws to the UI — failures degrade to
 * an escalation card.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let replyCounter = 0;
const nextId = () => `r-${++replyCounter}-${replyCounter * 7}`;

const has_ = (text: string, ...needles: string[]) => {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
};

/* --------------------------- Prompt construction ----------------------- */

const READING_GUIDE: Record<ReadingLevel, string> = {
  CHILD: 'Use very short, simple sentences a young teen could follow.',
  STUDENT: 'Explain like the reader is 15 — clear, friendly, no jargon.',
  ADULT: 'Be clear and complete; define any necessary legal term in plain words.',
  SENIOR: 'Use large, gentle, step-by-step phrasing; be patient and reassuring.',
};

const LANG_GUIDE: Record<SendOptions['language'], string> = {
  EN: 'Answer in English.',
  FIL: 'Answer in conversational Filipino/Tagalog (Taglish is fine).',
  CEB: 'Answer in conversational Cebuano (Bisaya).',
};

function systemPrompt(opts: SendOptions): string {
  return [
    'You are SULO, a legal-LITERACY assistant for Filipino workers. You explain employment and labor documents in plain language.',
    'Hard rules:',
    '- Teach understanding; do NOT give legal advice or predict legal outcomes. Never say what a court "will" decide.',
    '- Explain what the document/clause means and what the reader should ASK (e.g., HR, or for the exact policy in writing).',
    '- Ground every answer in the provided LEGAL CONTEXT and cite it. If the context does not cover the question, say you are not sure and recommend free help (PAO / DOLE hotline 1349).',
    '- Be honest about uncertainty. Keep it warm and brief.',
    LANG_GUIDE[opts.language],
    READING_GUIDE[opts.readingLevel],
  ].join('\n');
}

function contextBlock(retrieved: Retrieved[]): string {
  if (!retrieved.length) return 'LEGAL CONTEXT: (no matching provisions found)';
  return [
    'LEGAL CONTEXT (cite these by their label):',
    ...retrieved.map((r) => `- [${r.entry.label}] ${r.entry.text} (Source: ${r.entry.source})`),
  ].join('\n');
}

function buildMessages(
  history: ChatMessage[],
  text: string,
  retrieved: Retrieved[],
  opts: SendOptions
): LlmMessage[] {
  const msgs: LlmMessage[] = [{ role: 'system', content: systemPrompt(opts) }];
  msgs.push({ role: 'system', content: contextBlock(retrieved) });
  // Last few turns for continuity.
  for (const m of history.slice(-6)) {
    if (!m.text) continue;
    msgs.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text });
  }
  msgs.push({ role: 'user', content: text });
  return msgs;
}

/* --------------------- Local grounded fallback composer ---------------- */

function localCompose(text: string, retrieved: Retrieved[], opts: SendOptions): string {
  const lang = opts.language;
  if (!retrieved.length) {
    return translate(lang, 'ans.empty');
  }
  const top = retrieved[0].entry;
  const second = retrieved[1]?.entry;
  const parts = [
    translate(lang, 'ans.lead'),
    entryText(top, lang),
    second && second.id !== top.id ? translate(lang, 'ans.also') + entryText(second, lang) : '',
    translate(lang, 'ans.disclaimer'),
  ].filter(Boolean);
  return parts.join(opts.readingLevel === 'CHILD' ? ' ' : '\n\n');
}

/* ------------------------------ Suggestions ---------------------------- */

function suggestionsFor(retrieved: Retrieved[], language: Language): SuggestedChip[] {
  const topic = retrieved[0]?.entry.topic;
  const byTopic: Record<string, [import('@/i18n').StringKey, import('@/i18n').StringKey]> = {
    overtime: ['sug.otRate', 'sug.refuseOt'],
    probation: ['sug.probationFire', 'sug.regular'],
    resignation: ['sug.holdPay', 'sug.lastPay'],
  };
  const keys = byTopic[topic ?? ''] ?? (['sug.simpler', 'sug.askHR'] as const);
  return keys.map((k, i) => ({ id: `s-${i}`, label: translate(language, k) }));
}

/* ------------------------------ Card builders -------------------------- */

function escalationCard(language: Language): MessageCard {
  return {
    kind: 'escalation',
    text: translate(language, 'ans.escalate'),
    resources: [
      {
        id: 'r-pao',
        label: 'PAO',
        detail: translate(language, 'res.pao.detail'),
        action: translate(language, 'res.pao.action'),
      },
      {
        id: 'r-dole',
        label: 'DOLE Hotline 1349',
        detail: translate(language, 'res.dole.detail'),
        action: translate(language, 'res.dole.action'),
      },
    ],
  };
}

const ESCALATE_WORDS = [
  'sue', 'court', 'file a case', 'file case', 'kaso', 'demand', 'complaint', 'reklamo',
  'abogado', 'lawyer', 'is it legal', 'legal ba', 'illegal ba', 'habol', 'small claims',
];

const WHATIF_WORDS = ['what if', 'kung', 'kapag', 'paano kung', 'what happens if'];
const RISK_WORDS = ['risk', 'risky', 'fair', 'patas', 'red flag', 'dapat ba'];

/* ------------------------------ Public API ----------------------------- */

/**
 * Send a user turn and resolve the assistant reply. `onToken` (optional)
 * receives the growing answer text so the UI can render streaming; it only
 * fires for plain-language answers.
 */
export async function sendMessage(
  history: ChatMessage[],
  text: string,
  opts: SendOptions,
  onToken?: OnToken
): Promise<ChatMessage> {
  let retrieved: Retrieved[] = [];
  try {
    retrieved = await retrieve(text);
  } catch {
    retrieved = [];
  }
  const citations: Citation[] = toCitations(retrieved, opts.language);
  const topScore = retrieved[0]?.score ?? 0;

  const card = await composeCard(history, text, opts, retrieved, citations, topScore, onToken);

  return {
    id: nextId(),
    role: 'assistant',
    text: cardToText(card),
    card,
  };
}

async function composeCard(
  history: ChatMessage[],
  text: string,
  opts: SendOptions,
  retrieved: Retrieved[],
  citations: Citation[],
  topScore: number,
  onToken?: OnToken
): Promise<MessageCard> {
  // Escalate on outcome-seeking questions or when grounding is too weak.
  if (has_(text, ...ESCALATE_WORDS) || retrieved.length === 0) {
    return escalationCard(opts.language);
  }

  // What-if scenarios → tie to a clause + the governing rule.
  if (has_(text, ...WHATIF_WORDS) || has_(text, 'resign', 'quit', 'mag-resign', 'notice')) {
    const clause =
      clauseById(has_(text, 'resign', 'quit', 'notice') ? 'clause-resignation' : 'clause-overtime') ??
      clauseById('clause-resignation')!;
    return {
      kind: 'what-if',
      scenario: text.trim(),
      clause,
      consequence: retrieved[0]
        ? `${entryText(retrieved[0].entry, opts.language)} ${translate(opts.language, 'ans.whatifTail')}`
        : translate(opts.language, 'ans.whatifFallback'),
      citedBasis: citations[0],
    };
  }

  // Specific risky-clause look-ups → risk-flag card.
  if (has_(text, 'probation', 'non-compete', 'noncompete', 'overtime') && has_(text, ...RISK_WORDS, 'mean', 'ibig sabihin')) {
    const flag =
      flaggedClauses.find((f) => has_(text, f.title.toLowerCase().split(' ')[0])) ?? flaggedClauses[0];
    return { kind: 'risk-flag', flag, clause: clauseById(flag.clauseId)! };
  }

  // Default: a grounded plain-language answer (streamed).
  let answer: string;
  if (has.llm) {
    try {
      answer = await streamChat(buildMessages(history, text, retrieved, opts), onToken);
      if (!answer.trim()) throw new Error('empty');
    } catch {
      answer = localCompose(text, retrieved, opts);
      await streamOutLocally(answer, onToken);
    }
  } else {
    answer = localCompose(text, retrieved, opts);
    await delay(MOCK_LATENCY.send);
    await streamOutLocally(answer, onToken);
  }

  // Low confidence → answer, but nudge toward real help.
  const lowConfidence = topScore < 3;
  return {
    kind: 'plain-answer',
    readAloud: true,
    text: answer,
    citedBasis: citations[0],
    notLegalAdvice: translate(opts.language, lowConfidence ? 'ans.lowConf' : 'card.notAdvice'),
    suggestions: suggestionsFor(retrieved, opts.language),
  };
}

/** Plain-text shadow of a card for accessibility / "Read aloud". */
function cardToText(card: MessageCard): string {
  switch (card.kind) {
    case 'plain-answer':
      return card.text;
    case 'doc-analysis':
      return `${card.intro} ${card.analysis.summary}`;
    case 'risk-flag':
      return `${card.flag.title}. ${card.flag.explanation}`;
    case 'what-if':
      return `${card.scenario} ${card.consequence}`;
    case 'escalation':
      return card.text;
    case 'typing':
      return '';
  }
}
