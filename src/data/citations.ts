import type { Citation } from '@/services/types';

/**
 * Mock grounded citations. Phase 2 replaces these with real retrievals from the
 * vector store. Labels use mono uppercase, matching the "CITED BASIS" chips.
 */
export const citations = {
  overtimePay: {
    id: 'cit-ot-87',
    label: 'LABOR CODE · ART. 87',
    source: 'Labor Code of the Philippines, Article 87 (Overtime Work)',
    detail:
      'Work beyond eight hours generally requires an additional 25% of the hourly rate (30% on rest days/holidays).',
  },
  probation: {
    id: 'cit-probation-296',
    label: 'LABOR CODE · ART. 296',
    source: 'Labor Code of the Philippines, Article 296 (Probationary Employment)',
    detail:
      'Probationary employment generally may not exceed six months, and standards must be made known at engagement.',
  },
  finalPay: {
    id: 'cit-finalpay-dole',
    label: 'DOLE · LA 06-20',
    source: 'DOLE Labor Advisory No. 06, Series of 2020 (Final Pay)',
    detail:
      'Final pay should generally be released within 30 days from separation, absent a more favorable company policy.',
  },
  nonCompete: {
    id: 'cit-noncompete-civil',
    label: 'CIVIL CODE · ART. 1306',
    source: 'Civil Code, Article 1306 (Autonomy of Contracts)',
    detail:
      'Restrictions must be reasonable in time, place, and trade; overly broad non-compete terms may be unenforceable.',
  },
} as const satisfies Record<string, Citation>;
