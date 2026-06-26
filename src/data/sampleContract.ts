import type { Clause } from '@/services/types';

/**
 * A short, believable first-job BPO employment contract for the persona:
 * a fresh grad signing on as a Customer Support Associate. Used by the
 * document-analysis mock so the UI looks real on first load.
 *
 * This is fictional sample text for literacy purposes — not a real contract.
 */

export const contractHeader = {
  title: 'Employment Contract — Customer Support Associate',
  documentType: 'Employment Contract',
  employer: 'Brightline Support Solutions, Inc.',
  employee: 'The Employee',
  position: 'Customer Support Associate (Voice)',
  startDate: 'July 1, 2026',
};

export const contractClauses: Clause[] = [
  {
    id: 'clause-probation',
    title: 'Probationary Period',
    original:
      'The Employee shall serve a probationary period of six (6) months from the start date. During this period, the Company may terminate the Employee at any time without prior notice and without separation pay should performance be found unsatisfactory under the Company’s standards.',
    plainRewrite:
      'You are on probation for 6 months. During this time the company says it can let you go anytime without notice if it decides your performance is not good enough.',
  },
  {
    id: 'clause-overtime',
    title: 'Hours of Work & Overtime',
    original:
      'The Employee agrees to render overtime, night shift, and holiday work as may be required by operational demands. Overtime rendered shall be compensated in accordance with Company policy.',
    plainRewrite:
      'You may be asked to work overtime, night shifts, and holidays when the business needs it. The contract only says overtime is paid “according to company policy” — it does not state the actual rates.',
  },
  {
    id: 'clause-confidentiality',
    title: 'Confidentiality',
    original:
      'The Employee shall hold in strict confidence all client data, account information, and trade secrets obtained during employment, and shall not disclose the same during or after employment.',
    plainRewrite:
      'You must keep client and company information secret, both while employed and after you leave. This is standard for BPO work.',
  },
  {
    id: 'clause-noncompete',
    title: 'Non-Competition',
    original:
      'For a period of two (2) years following separation, the Employee shall not be employed by, or provide services to, any business engaged in customer support outsourcing within the Philippines.',
    plainRewrite:
      'For 2 years after you leave, this says you cannot work for any other customer-support outsourcing company in the Philippines. That is a wide and long restriction worth questioning.',
  },
  {
    id: 'clause-resignation',
    title: 'Resignation',
    original:
      'The Employee shall render at least thirty (30) days written notice prior to resignation. Failure to do so shall entitle the Company to withhold the Employee’s final pay and clearance.',
    plainRewrite:
      'If you resign, you must give 30 days written notice. The contract says if you don’t, the company can hold your final pay — a point worth checking against the law.',
  },
  {
    id: 'clause-salary',
    title: 'Compensation',
    original:
      'The Employee shall receive a monthly salary of PHP 18,000, subject to applicable taxes and statutory deductions, payable semi-monthly.',
    plainRewrite:
      'Your salary is PHP 18,000 per month before taxes and government deductions, paid twice a month.',
  },
];

export const clauseById = (id: string): Clause | undefined =>
  contractClauses.find((c) => c.id === id);
