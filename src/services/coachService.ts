import { citations } from '@/data/citations';
import { sampleAnalysis, flaggedClauses } from '@/data/flaggedClauses';
import { clauseById } from '@/data/sampleContract';

import { MOCK_LATENCY, isLiveBackend } from './config';
import type { ChatMessage, MessageCard, SendOptions } from './types';

/**
 * Coach service — the brain seam. Phase 1 returns scripted MessageCards chosen
 * by simple keyword matching so every card type is reachable by typing. It
 * simulates latency; the Coach screen shows the typing indicator meanwhile.
 *
 * PHASE-2 SEAM: replace `composeReply` with a real call to the LLM
 * (config.llmApiUrl) grounded by RAG retrievals (config.vectorStoreUrl).
 * Keep returning ChatMessage objects with a `card`, and the UI is unchanged.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let replyCounter = 0;
const nextId = () => `r-${++replyCounter}-${replyCounter * 7}`;

const has = (text: string, ...needles: string[]) => {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
};

function composeReply(text: string, opts: SendOptions): MessageCard {
  // Attached a document → analyze it.
  if (opts.attachment || has(text, 'contract', 'document', 'check my', 'review')) {
    return {
      kind: 'doc-analysis',
      analysis: sampleAnalysis,
      intro: 'I read your document. I found 3 things worth a closer look.',
    };
  }

  // Overtime questions → plain-language answer with cited basis.
  if (has(text, 'overtime', 'ot ', 'mag-overtime', 'extra hours')) {
    return {
      kind: 'plain-answer',
      readAloud: true,
      text:
        'In general, your employer can require overtime in some situations, but the work must be paid extra — usually at least 25% above your hourly rate. Get the exact rate in writing, since your contract only says “per company policy.”',
      citedBasis: citations.overtimePay,
      notLegalAdvice:
        'This isn’t legal advice — here’s what to ask HR so it’s in writing.',
      suggestions: [
        { id: 's-a', label: 'What overtime rate is required?' },
        { id: 's-b', label: 'Can I refuse overtime?' },
      ],
    };
  }

  // What-if / resignation scenarios.
  if (has(text, 'what if', 'resign', 'quit', 'leave', 'notice')) {
    const clause = clauseById('clause-resignation')!;
    return {
      kind: 'what-if',
      scenario: 'You resign without giving the 30-day written notice.',
      clause,
      consequence:
        'Your contract lets the company hold your final pay and clearance. But guidance says final pay should usually be released within 30 days — so a total withholding is worth questioning.',
      citedBasis: citations.finalPay,
    };
  }

  // Risk / specific clause look-ups.
  if (has(text, 'non-compete', 'noncompete', 'probation', 'risk', 'risky')) {
    const flag =
      flaggedClauses.find((f) => has(text, f.title.toLowerCase().split(' ')[0])) ??
      flaggedClauses[0];
    return {
      kind: 'risk-flag',
      flag,
      clause: clauseById(flag.clauseId)!,
    };
  }

  // Hard / outcome-dependent questions → escalate to real help.
  if (has(text, 'sue', 'lawyer', 'court', 'case', 'illegal', 'fire me', 'terminate')) {
    return {
      kind: 'escalation',
      text:
        'This depends on details I can’t weigh for you, and the answer matters. Please talk to a real lawyer — both of these are free:',
      resources: [
        {
          id: 'r-pao',
          label: 'PAO',
          detail: 'Public Attorney’s Office — free legal aid for qualified clients.',
          action: 'Find a PAO office',
        },
        {
          id: 'r-dole',
          label: 'DOLE Hotline 1349',
          detail: 'Department of Labor and Employment — labor concerns hotline.',
          action: 'Call 1349',
        },
      ],
    };
  }

  // Default plain-language reply.
  return {
    kind: 'plain-answer',
    readAloud: true,
    text:
      'I can explain what a clause means in plain language, flag terms worth a second look, and point you to free legal help. Try attaching your contract, or ask me about overtime, probation, or resigning.',
    notLegalAdvice: 'SULO teaches legal literacy — it isn’t legal advice.',
    suggestions: [
      { id: 's-d1', label: 'Scan my contract' },
      { id: 's-d2', label: 'Explain probation' },
      { id: 's-d3', label: 'Pwede ba akong tanggihan ang overtime?' },
    ],
  };
}

/**
 * Send a user turn and resolve the assistant's reply. `history` is accepted now
 * (unused by the mock) so the Phase-2 LLM has conversational context available.
 */
export async function sendMessage(
  _history: ChatMessage[],
  text: string,
  opts: SendOptions
): Promise<ChatMessage> {
  if (isLiveBackend) {
    // PHASE 2: call the LLM + RAG here, map the result to a MessageCard.
  }
  await delay(MOCK_LATENCY.send);
  const card = composeReply(text, opts);
  return {
    id: nextId(),
    role: 'assistant',
    text: cardToText(card),
    card,
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
