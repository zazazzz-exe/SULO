import {
  legalCorpus,
  corpusById,
  toCitation,
  type CorpusEntry,
} from '@/data/legalCorpus';
import type { Citation, Language } from './types';

import { config, fetchWithTimeout, has, authHeaders } from './config';

/**
 * Retrieval for grounded answers (RAG). Two backends behind one interface:
 *   • remote — POST the query to EXPO_PUBLIC_VECTOR_STORE_URL (semantic search);
 *   • local  — a lightweight lexical scorer over the bundled legal corpus.
 * The local path means grounding + citations work fully offline; the remote
 * path is used automatically when the vector store is configured.
 */

export type Retrieved = { entry: CorpusEntry; score: number };

const STOP = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'can', 'could', 'i', 'my', 'me', 'to',
  'of', 'in', 'on', 'and', 'or', 'if', 'it', 'this', 'that', 'for', 'be', 'will',
  'what', 'how', 'ba', 'ang', 'ng', 'sa', 'na', 'ko', 'ako', 'po', 'nila', 'mag',
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Lexical score of one corpus entry against the query tokens. */
function scoreEntry(entry: CorpusEntry, tokens: string[]): number {
  const kw = entry.keywords.map((k) => k.toLowerCase());
  const hay = `${entry.text} ${entry.topic} ${entry.label} ${entry.source}`.toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (kw.some((k) => k === tok || k.includes(tok) || tok.includes(k))) score += 3;
    else if (hay.includes(tok)) score += 1;
  }
  // Reward multi-keyword phrase hits a little (e.g. "night shift").
  for (const k of kw) {
    if (k.includes(' ') && tokens.join(' ').includes(k)) score += 2;
  }
  return score;
}

function retrieveLocal(query: string, k: number): Retrieved[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  return legalCorpus
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

type RemoteMatch = {
  id?: string;
  score?: number;
  label?: string;
  source?: string;
  text?: string;
  metadata?: Partial<CorpusEntry>;
};

async function retrieveRemote(query: string, k: number): Promise<Retrieved[]> {
  const res = await fetchWithTimeout(config.vectorStoreUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ query, top_k: k }),
  });
  if (!res.ok) throw new Error(`vector store ${res.status}`);
  const data = (await res.json()) as { matches?: RemoteMatch[]; results?: RemoteMatch[] };
  const matches = data.matches ?? data.results ?? [];
  return matches.slice(0, k).map((m) => {
    // Prefer a known corpus entry by id; otherwise synthesize one from the hit.
    const known = m.id ? corpusById(m.id) : undefined;
    const entry: CorpusEntry =
      known ??
      ({
        id: m.id ?? `remote-${Math.abs(hash(m.text ?? m.label ?? query))}`,
        label: m.label ?? m.metadata?.label ?? 'CITED BASIS',
        source: m.source ?? m.metadata?.source ?? 'Retrieved provision',
        asOf: m.metadata?.asOf ?? 'remote',
        topic: m.metadata?.topic ?? 'retrieved',
        keywords: m.metadata?.keywords ?? [],
        text: m.text ?? m.metadata?.text ?? '',
      } satisfies CorpusEntry);
    return { entry, score: m.score ?? 1 };
  });
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Retrieve top-k grounding provisions for a query. Never throws — remote
 * failures fall back to the local corpus so grounding is always available. */
export async function retrieve(query: string, k = config.topK): Promise<Retrieved[]> {
  if (has.vectorStore) {
    try {
      const remote = await retrieveRemote(query, k);
      if (remote.length) return remote;
    } catch {
      // fall through to local
    }
  }
  return retrieveLocal(query, k);
}

/** Map retrieved entries to UI Citation objects (localized, dedup by id). */
export function toCitations(items: Retrieved[], language: Language = 'EN'): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const r of items) {
    if (seen.has(r.entry.id)) continue;
    seen.add(r.entry.id);
    out.push(toCitation(r.entry, language));
  }
  return out;
}
