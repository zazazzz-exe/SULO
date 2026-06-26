/**
 * SULO domain types — the stable contracts between the UI and the service
 * layer. Phase 2 fills in real AI/OCR/ASR/TTS behind these; the shapes here
 * must not change so the UI keeps working untouched.
 *
 * Framing reminder: SULO teaches legal LITERACY, it does not give ADVICE.
 */

/* ----------------------------- Preferences ----------------------------- */

export type Language = 'EN' | 'FIL' | 'CEB';

/** Reading level controls how plain/short the rewrites are. */
export type ReadingLevel = 'CHILD' | 'STUDENT' | 'ADULT' | 'SENIOR';

export type TextSize = 'SMALL' | 'DEFAULT' | 'LARGE' | 'XLARGE';

export type Settings = {
  language: Language;
  readingLevel: ReadingLevel;
  voiceEnabled: boolean;
  voiceSpeed: number; // 0.5–2.0
  highContrast: boolean;
  textSize: TextSize;
  reduceMotion: boolean;
  /** Web-only: replace the pointer with an animated flame torch cursor. */
  torchCursor: boolean;
};

/* ------------------------------ Citations ------------------------------ */

/**
 * A grounded reference to a legal source (Labor Code article, DOLE issuance,
 * etc.). In Phase 2 these come from the RAG vector store; here they are mock.
 */
export type Citation = {
  id: string;
  label: string; // short mono chip text, e.g. "LABOR CODE · ART. 87"
  source: string; // human-readable source name
  detail: string; // one-line summary of what it says
  url?: string; // optional deep link (Phase 2)
};

/* ------------------------------- Clauses ------------------------------- */

export type RiskLevel = 'HIGH' | 'MED' | 'LOW';

export type Clause = {
  id: string;
  title: string;
  original: string; // verbatim contract text
  plainRewrite: string; // plain-language explanation
};

export type RiskFlag = {
  id: string;
  clauseId: string;
  title: string;
  level: RiskLevel;
  explanation: string; // plain-language "why this matters"
  citedBasis: Citation;
};

/* --------------------------- Document analysis -------------------------- */

export type KeyFact = {
  label: string; // e.g. "Probation"
  value: string; // e.g. "6 months"
  tone?: 'neutral' | 'risk' | 'ok';
};

export type DocumentAnalysis = {
  id: string;
  title: string; // e.g. "Employment Contract — BPO Associate"
  documentType: string; // e.g. "Employment Contract"
  keyFacts: KeyFact[];
  clauses: Clause[];
  flags: RiskFlag[];
  summary: string;
};

/* ------------------------------ Chat cards ----------------------------- */

/**
 * The assistant renders one of six card types. Each is a discriminated union
 * member so the UI can switch on `kind`. User messages use `UserMessage`.
 */
export type SuggestedChip = {
  id: string;
  label: string;
  /** Optional text to send when tapped (defaults to label). */
  send?: string;
};

export type PlainAnswerCard = {
  kind: 'plain-answer';
  text: string;
  citedBasis?: Citation;
  notLegalAdvice?: string; // microcopy boundary line
  suggestions?: SuggestedChip[];
  readAloud?: boolean; // show "Read aloud" affordance
};

export type DocAnalysisCard = {
  kind: 'doc-analysis';
  analysis: DocumentAnalysis;
  intro: string; // e.g. "I found 3 things worth a closer look."
};

export type RiskFlagCard = {
  kind: 'risk-flag';
  flag: RiskFlag;
  /** Clause to open in the side panel / bottom sheet when tapped. */
  clause: Clause;
};

export type WhatIfCard = {
  kind: 'what-if';
  scenario: string;
  clause: Clause;
  consequence: string;
  citedBasis?: Citation;
};

export type EscalationCard = {
  kind: 'escalation';
  text: string;
  resources: { id: string; label: string; detail: string; action: string }[];
};

export type TypingCard = {
  kind: 'typing';
};

export type MessageCard =
  | PlainAnswerCard
  | DocAnalysisCard
  | RiskFlagCard
  | WhatIfCard
  | EscalationCard
  | TypingCard;

export type MessageCardKind = MessageCard['kind'];

/* ----------------------------- Chat messages --------------------------- */

export type Role = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: Role;
  /** Wall-clock label for the UI (already formatted; no Date math in render). */
  timeLabel?: string;
  /** Plain text for user turns; assistants may also carry text for a11y. */
  text?: string;
  /** Assistant turns render this card. */
  card?: MessageCard;
  /** Optional attachment shown on a user turn (e.g. a scanned doc). */
  attachmentName?: string;
};

export type SendOptions = {
  language: Language;
  readingLevel: ReadingLevel;
  /** Present when the user attached/scanned a document with the message. */
  attachment?: { name: string };
};

/* ------------------------------- Glossary ------------------------------ */

export type GlossaryTerm = {
  id: string;
  term: string;
  translation?: Partial<Record<Language, string>>;
  definition: string;
  /** Placeholder until real FSL clips exist (Phase 2). */
  videoPlaceholder: string;
};

/* ------------------------------- Voice --------------------------------- */

export type TranscriptionResult = {
  text: string;
  language: Language;
  confidence: number;
};
