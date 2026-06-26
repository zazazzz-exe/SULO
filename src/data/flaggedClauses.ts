import type { DocumentAnalysis, RiskFlag } from '@/services/types';

import { citations } from './citations';
import { contractClauses, contractHeader } from './sampleContract';

/**
 * The three risk flags surfaced by the document-analysis mock. Each links to a
 * clause in sampleContract and carries a plain rewrite + cited basis.
 */
export const flaggedClauses: RiskFlag[] = [
  {
    id: 'flag-probation',
    clauseId: 'clause-probation',
    title: 'Probation period of 6 months',
    level: 'HIGH',
    explanation:
      'Six months is the legal maximum, and “terminate anytime without notice” is a strong term. Probationary employees still have rights — dismissal needs a just cause and the standards must have been explained to you when you were hired.',
    citedBasis: citations.probation,
  },
  {
    id: 'flag-overtime',
    clauseId: 'clause-overtime',
    title: 'Mandatory overtime with unclear pay',
    level: 'HIGH',
    explanation:
      'The contract requires overtime but only says it’s paid “per company policy” without stating rates. Overtime work generally must be paid extra by law, so you’ll want the exact policy in writing.',
    citedBasis: citations.overtimePay,
  },
  {
    id: 'flag-noncompete',
    clauseId: 'clause-noncompete',
    title: 'Non-compete, 2 years',
    level: 'MED',
    explanation:
      'A 2-year, nationwide ban on working in customer support is broad. Such restrictions are only enforceable if reasonable in time, area, and scope — this one is worth raising before you sign.',
    citedBasis: citations.nonCompete,
  },
];

/** The full mock analysis returned by documentService.analyzeDocument(). */
export const sampleAnalysis: DocumentAnalysis = {
  id: 'analysis-bpo-001',
  title: contractHeader.title,
  documentType: contractHeader.documentType,
  summary:
    'A first-job BPO employment contract. The pay and confidentiality terms are ordinary, but the probation, overtime-pay, and non-compete clauses are worth a closer look before signing.',
  keyFacts: [
    { label: 'Start date', value: contractHeader.startDate, tone: 'neutral' },
    { label: 'Probation', value: '6 months', tone: 'risk' },
    { label: 'Notice period', value: '30 days', tone: 'neutral' },
    { label: 'Salary', value: 'PHP 18,000 / mo', tone: 'neutral' },
  ],
  clauses: contractClauses,
  flags: flaggedClauses,
};
