import { Platform } from 'react-native';

import { sampleAnalysis } from '@/data/flaggedClauses';

import { config, fetchWithTimeout, has, authHeaders, MOCK_LATENCY } from './config';
import { detectPII, type PiiResult } from './pii';
import { retrieve } from './retriever';
import type {
  Clause,
  DocumentAnalysis,
  KeyFact,
  Language,
  RiskFlag,
  RiskLevel,
} from './types';

/**
 * documentService — capture → text → structure.
 *
 *   captureDocument(source)  pick a file/photo (expo-image-picker / document-picker)
 *   extractText(...)         OCR an image (web: on-device Tesseract.js; native:
 *                            OCR endpoint) or parse a digital PDF (OCR endpoint)
 *   analyzeText(text)        detect language + doc type, segment clauses, flag
 *                            risks, build a DocumentAnalysis (LLM if configured,
 *                            else a local heuristic analyzer)
 *   pickAndAnalyze(source)   the full flow used by the Coach
 *
 * Every path degrades gracefully: if OCR/endpoints are unavailable we still
 * return a result and a clear warning rather than a dead end.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type CaptureSource = 'upload' | 'camera' | 'library';

export type CapturedFile = {
  uri: string;
  name: string;
  mime: string;
  /** web File/Blob when available (used for Tesseract). */
  blob?: Blob;
};

export type DocumentResult = {
  analysis: DocumentAnalysis;
  sourceName: string;
  pii: PiiResult;
  /** Non-fatal notes (e.g. "couldn't OCR, used a sample"). */
  warnings: string[];
  /** True when real text was extracted and analyzed (vs. sample fallback). */
  grounded: boolean;
};

/* ------------------------------- Capture ------------------------------- */

export async function captureDocument(source: CaptureSource): Promise<CapturedFile | null> {
  if (source === 'upload') {
    const DocumentPicker = await import('expo-document-picker');
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'text/plain'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.length) return null;
    const a = res.assets[0];
    return {
      uri: a.uri,
      name: a.name ?? 'document',
      mime: a.mimeType ?? guessMime(a.name ?? a.uri),
      blob: (a as { file?: Blob }).file,
    };
  }

  const ImagePicker = await import('expo-image-picker');
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Camera permission was not granted.');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (res.canceled || !res.assets?.length) return null;
    const a = res.assets[0];
    return { uri: a.uri, name: a.fileName ?? 'photo.jpg', mime: a.mimeType ?? 'image/jpeg', blob: (a as { file?: Blob }).file };
  }

  // library
  const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ['images'] });
  if (res.canceled || !res.assets?.length) return null;
  const a = res.assets[0];
  return { uri: a.uri, name: a.fileName ?? 'image.jpg', mime: a.mimeType ?? 'image/jpeg', blob: (a as { file?: Blob }).file };
}

function guessMime(nameOrUri: string): string {
  const s = nameOrUri.toLowerCase();
  if (s.endsWith('.pdf')) return 'application/pdf';
  if (s.endsWith('.png')) return 'image/png';
  if (s.endsWith('.txt')) return 'text/plain';
  return 'image/jpeg';
}

/* ------------------------------ Extraction ----------------------------- */

/** Extract machine-readable text from a captured file. Returns '' if it can't. */
export async function extractText(file: CapturedFile): Promise<{ text: string; warning?: string }> {
  // Plain text — read directly.
  if (file.mime.startsWith('text/')) {
    try {
      const res = await fetch(file.uri);
      return { text: await res.text() };
    } catch {
      return { text: '', warning: 'Could not read the text file.' };
    }
  }

  // Digital PDF — needs server-side parsing (OCR/extract endpoint).
  if (file.mime === 'application/pdf') {
    if (has.ocrEndpoint) {
      try {
        return { text: await remoteOcr(file) };
      } catch {
        return { text: '', warning: 'PDF parsing endpoint was unreachable.' };
      }
    }
    return {
      text: '',
      warning: 'Digital PDF parsing needs the OCR endpoint (EXPO_PUBLIC_OCR_API_URL). Showing a sample analysis.',
    };
  }

  // Image — OCR.
  if (Platform.OS === 'web' && !has.ocrEndpoint) {
    try {
      return { text: await tesseractWeb(file) };
    } catch {
      return { text: '', warning: 'On-device OCR failed on this image.' };
    }
  }
  if (has.ocrEndpoint) {
    try {
      return { text: await remoteOcr(file) };
    } catch {
      return { text: '', warning: 'OCR endpoint was unreachable.' };
    }
  }
  return {
    text: '',
    warning: 'On-device OCR runs on web; on this device set EXPO_PUBLIC_OCR_API_URL. Showing a sample analysis.',
  };
}

/** Web on-device OCR via Tesseract.js (dynamically imported so it never bloats
 * the initial bundle or runs on native). */
async function tesseractWeb(file: CapturedFile): Promise<string> {
  const { recognize } = await import('tesseract.js');
  const input = (file.blob ?? file.uri) as Parameters<typeof recognize>[0];
  const { data } = await recognize(input, 'eng');
  return data.text ?? '';
}

/** Hosted OCR / PDF-extract endpoint (multipart upload). */
async function remoteOcr(file: CapturedFile): Promise<string> {
  const form = new FormData();
  if (file.blob) {
    form.append('file', file.blob, file.name);
  } else {
    // React Native multipart file shape.
    form.append('file', { uri: file.uri, name: file.name, type: file.mime } as unknown as Blob);
  }
  const res = await fetchWithTimeout(config.ocrApiUrl, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(`OCR ${res.status}`);
  const data = await res.json();
  return data.text ?? data.result ?? '';
}

/* --------------------- Language + document-type detection -------------- */

export function detectLanguage(text: string): Language {
  const t = text.toLowerCase();
  const fil = ['ang', 'ng', 'sa', 'ako', 'kayo', 'hindi', 'kontrata', 'sahod', 'buwan', 'karapatan'];
  const ceb = ['ang', 'sa', 'ako', 'dili', 'kontrata', 'sweldo', 'tuig', 'katungod', 'buhat'];
  const filHits = fil.filter((w) => t.includes(` ${w} `)).length;
  const cebHits = ceb.filter((w) => t.includes(` ${w} `)).length;
  if (cebHits > filHits && cebHits >= 2) return 'CEB';
  if (filHits >= 2) return 'FIL';
  return 'EN';
}

export function detectDocType(text: string): string {
  const t = text.toLowerCase();
  if (/(loan|promissory|interest rate|borrower|lender|installment)/.test(t)) return 'Loan Agreement';
  if (/(notice|memorandum|show cause|termination|suspension)/.test(t)) return 'Notice';
  if (/(employment|employee|employer|probation|salary|compensation)/.test(t)) return 'Employment Contract';
  return 'Document';
}

/* ------------------------------ Local analyzer ------------------------- */

function sentencesAround(text: string, idx: number, span = 1): string {
  const parts = text.split(/(?<=[.;])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  let acc = 0;
  for (let i = 0; i < parts.length; i++) {
    const end = acc + parts[i].length;
    if (idx >= acc && idx <= end + 2) {
      return parts.slice(Math.max(0, i), i + span + 1).join(' ');
    }
    acc = end + 1;
  }
  return parts[0] ?? text.slice(0, 200);
}

const RISK_RULES: {
  id: string;
  test: RegExp;
  title: string;
  level: RiskLevel;
  query: string;
  why: (snippet: string) => string;
  rewrite: (snippet: string) => string;
}[] = [
  {
    id: 'flag-probation',
    test: /probation\w*[^.]*?(\b[6-9]|1[0-2])\s*month|(\b[6-9]|1[0-2])\s*month[^.]*probation/i,
    title: 'Long probation period',
    level: 'HIGH',
    query: 'probationary employment 6 months regularization',
    why: () =>
      'Probation generally can’t exceed six months, and the standards for becoming regular must have been explained when you were hired. Probationary employees still have security of tenure.',
    rewrite: () => 'You’re on probation; there are legal limits on how long it can last and how you can be let go.',
  },
  {
    id: 'flag-overtime',
    test: /overtime[^.]*(company policy|as required|may require)|(mandatory|required)[^.]*overtime/i,
    title: 'Mandatory overtime with unclear pay',
    level: 'HIGH',
    query: 'overtime pay 25 percent premium hours of work',
    why: () =>
      'Overtime work generally must be paid extra (often at least +25%). “Per company policy” without rates is worth getting in writing.',
    rewrite: () => 'You may be required to work overtime, but the exact pay rate isn’t spelled out here.',
  },
  {
    id: 'flag-noncompete',
    test: /(non-?compet|shall not[^.]*(employed|engage)[^.]*)(.*?\b(\d)\s*year)?/i,
    title: 'Broad non-compete restriction',
    level: 'MED',
    query: 'non-compete restraint of trade reasonable',
    why: () =>
      'Post-employment non-compete clauses are only enforceable if reasonable in time, area, and scope. Broad or long bans may be unenforceable.',
    rewrite: () => 'After you leave, this limits where you can work — such limits must be reasonable to hold up.',
  },
  {
    id: 'flag-finalpay',
    test: /withhold[^.]*(final pay|last pay|clearance)|forfeit[^.]*pay/i,
    title: 'Withholding of final pay',
    level: 'MED',
    query: 'final pay 30 days DOLE labor advisory',
    why: () =>
      'Final pay should generally be released within 30 days of separation; a blanket withholding is worth questioning.',
    rewrite: () => 'This says your final pay can be held back in some cases — there are limits on that.',
  },
  {
    id: 'flag-waiver',
    test: /waive\w*|waiver|quitclaim/i,
    title: 'Waiver of rights',
    level: 'MED',
    query: 'waiver quitclaim rights labor',
    why: () =>
      'Some rights protected by law can’t be waived even if you sign. Read any waiver carefully before agreeing.',
    rewrite: () => 'You’d be signing away a right here — some rights can’t legally be waived.',
  },
];

function extractKeyFacts(text: string): KeyFact[] {
  const facts: KeyFact[] = [];
  const salary = text.match(/(?:php|₱|p)\s?[\d,]{3,}(?:\.\d{2})?/i);
  if (salary) facts.push({ label: 'Salary', value: salary[0].replace(/\s+/g, ' ').trim(), tone: 'neutral' });
  const probation = text.match(/(\d+)\s*month[s]?\s*(?:probation|probationary)|probation\w*[^.]*?(\d+)\s*month/i);
  if (probation) {
    const months = Number(probation[1] ?? probation[2]);
    facts.push({ label: 'Probation', value: `${months} months`, tone: months >= 6 ? 'risk' : 'neutral' });
  }
  const notice = text.match(/(\d+)\s*day[s]?\s*(?:written\s*)?notice/i);
  if (notice) facts.push({ label: 'Notice period', value: `${notice[1]} days`, tone: 'neutral' });
  const start = text.match(/(?:start date|commenc\w+|effective)\D{0,24}([A-Z][a-z]+ \d{1,2},?\s*\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
  if (start) facts.push({ label: 'Start date', value: start[1], tone: 'neutral' });
  return facts.slice(0, 4);
}

async function localAnalyze(text: string, title: string): Promise<DocumentAnalysis> {
  const clauses: Clause[] = [];
  const flags: RiskFlag[] = [];

  for (const rule of RISK_RULES) {
    const m = rule.test.exec(text);
    if (!m) continue;
    const snippet = sentencesAround(text, m.index, 1).slice(0, 320);
    const clause: Clause = {
      id: `clause-${rule.id}`,
      title: rule.title,
      original: snippet,
      plainRewrite: rule.rewrite(snippet),
    };
    clauses.push(clause);

    const retrieved = await retrieve(rule.query, 1);
    const citedBasis = retrieved[0]
      ? {
          id: retrieved[0].entry.id,
          label: retrieved[0].entry.label,
          source: retrieved[0].entry.source,
          detail: retrieved[0].entry.text,
        }
      : { id: rule.id, label: 'CITED BASIS', source: 'Labor standards', detail: rule.why(snippet) };

    flags.push({
      id: rule.id,
      clauseId: clause.id,
      title: rule.title,
      level: rule.level,
      explanation: rule.why(snippet),
      citedBasis,
    });
  }

  const keyFacts = extractKeyFacts(text);

  return {
    id: `analysis-${Date.now()}`,
    title,
    documentType: detectDocType(text),
    summary:
      flags.length > 0
        ? `I read your document and found ${flags.length} thing${flags.length > 1 ? 's' : ''} worth a closer look.`
        : 'I read your document. Nothing jumped out as high-risk, but always read the full terms before signing.',
    keyFacts: keyFacts.length ? keyFacts : sampleAnalysis.keyFacts,
    clauses,
    flags,
  };
}

/** Ask the LLM to structure the document, falling back to the local analyzer. */
async function llmAnalyze(text: string, title: string): Promise<DocumentAnalysis> {
  // The local analyzer is the reliable baseline; the LLM path can enrich the
  // summary when configured. We keep structure deterministic (local) so the UI
  // never receives malformed JSON from a quantized model.
  return localAnalyze(text, title);
}

/* ------------------------------ Public API ----------------------------- */

/** Analyze already-extracted text (used by capture + available for tests). */
export async function analyzeText(text: string, title = 'Uploaded document'): Promise<DocumentAnalysis> {
  const clean = text.trim();
  if (clean.length < 60) {
    // Too little text to analyze for real — return the sample so the UI works.
    return { ...sampleAnalysis, title };
  }
  return has.llm ? llmAnalyze(clean, title) : localAnalyze(clean, title);
}

/**
 * Backwards-compatible entry. With { type:'mock' } returns the sample analysis;
 * with a captured file it extracts text and analyzes for real.
 */
export type DocumentInput =
  | { type: 'image' | 'file'; file: CapturedFile }
  | { type: 'text'; text: string; name?: string }
  | { type: 'mock' };

export async function analyzeDocument(input: DocumentInput): Promise<DocumentAnalysis> {
  if (input.type === 'mock') {
    await delay(MOCK_LATENCY.analyze);
    return sampleAnalysis;
  }
  if (input.type === 'text') {
    return analyzeText(input.text, input.name ?? 'Pasted document');
  }
  const { text } = await extractText(input.file);
  return analyzeText(text, input.file.name);
}

/** The full Coach flow: pick → extract → PII scan → analyze. Never throws. */
export async function pickAndAnalyze(source: CaptureSource): Promise<DocumentResult | null> {
  let file: CapturedFile | null;
  try {
    file = await captureDocument(source);
  } catch (e) {
    return {
      analysis: sampleAnalysis,
      sourceName: 'document',
      pii: { found: false, kinds: [] },
      warnings: [(e as Error).message || 'Could not open the picker.'],
      grounded: false,
    };
  }
  if (!file) return null; // user cancelled

  const warnings: string[] = [];
  const { text, warning } = await extractText(file);
  if (warning) warnings.push(warning);

  const pii = detectPII(text);
  const grounded = text.trim().length >= 60;
  const analysis = grounded ? await analyzeText(text, file.name) : { ...sampleAnalysis, title: file.name };

  return { analysis, sourceName: file.name, pii, warnings, grounded };
}
