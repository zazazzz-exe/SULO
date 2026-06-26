import { sampleAnalysis } from '@/data/flaggedClauses';

import { MOCK_LATENCY, isLiveBackend } from './config';
import type { DocumentAnalysis } from './types';

/**
 * Document service — Phase 1 returns the mocked BPO contract analysis.
 *
 * PHASE-2 SEAM: replace the body with real OCR (config.ocrApiUrl) →
 * clause parsing → risk classification (config.llmApiUrl) → citation
 * retrieval (config.vectorStoreUrl). The DocumentAnalysis shape stays fixed,
 * so the UI does not change.
 */

export type DocumentInput =
  | { type: 'image'; uri: string; name?: string }
  | { type: 'file'; uri: string; name?: string }
  | { type: 'mock' };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function analyzeDocument(
  _input: DocumentInput
): Promise<DocumentAnalysis> {
  if (isLiveBackend) {
    // PHASE 2: call OCR + parsing + classification here.
  }
  await delay(MOCK_LATENCY.analyze);
  return sampleAnalysis;
}
