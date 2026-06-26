/**
 * Local PII detection. Runs on-device BEFORE any cloud-bound call so the UI can
 * warn the user about sensitive identifiers (TIN, SSS, account/card numbers,
 * etc.). Conservative patterns to avoid flagging ordinary salary figures.
 */

export type PiiKind =
  | 'TIN'
  | 'SSS'
  | 'PhilHealth'
  | 'Bank/Account number'
  | 'Card number'
  | 'Email'
  | 'Phone number';

const PATTERNS: { kind: PiiKind; re: RegExp }[] = [
  // TIN: 9–12 digits, usually grouped xxx-xxx-xxx(-xxx)
  { kind: 'TIN', re: /\b\d{3}-\d{3}-\d{3}(?:-\d{3})?\b/ },
  // SSS: 10 digits often xx-xxxxxxx-x
  { kind: 'SSS', re: /\b\d{2}-\d{7}-\d\b/ },
  // PhilHealth: 12 digits often xx-xxxxxxxxx-x
  { kind: 'PhilHealth', re: /\b\d{2}-\d{9}-\d\b/ },
  // Card: 13–16 digit runs (allow spaces/dashes)
  { kind: 'Card number', re: /\b(?:\d[ -]?){13,16}\b/ },
  // Bank/account: 10–19 bare digits
  { kind: 'Bank/Account number', re: /\b\d{10,19}\b/ },
  { kind: 'Email', re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/ },
  // PH mobile: 09xxxxxxxxx or +639xxxxxxxxx
  { kind: 'Phone number', re: /\b(?:\+?63|0)9\d{9}\b/ },
];

export type PiiResult = { found: boolean; kinds: PiiKind[] };

export function detectPII(text: string): PiiResult {
  if (!text) return { found: false, kinds: [] };
  const kinds = new Set<PiiKind>();
  for (const { kind, re } of PATTERNS) {
    if (re.test(text)) kinds.add(kind);
  }
  return { found: kinds.size > 0, kinds: [...kinds] };
}

/** A friendly, specific warning line for the UI notice banner. */
export function piiWarning(kinds: PiiKind[]): string {
  const list = kinds.join(', ');
  return `Heads up — this looks like it contains a personal identifier (${list}). You don’t need to share that with SULO; consider removing it before continuing.`;
}

/** Mask identifiers before anything leaves the device (defense in depth). */
export function redactPII(text: string): string {
  let out = text;
  for (const { re } of PATTERNS) {
    out = out.replace(new RegExp(re, 'g'), '⟨redacted⟩');
  }
  return out;
}
