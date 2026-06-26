import type { ChatMessage } from '@/services/types';

import { citations } from './citations';
import { sampleAnalysis, flaggedClauses } from './flaggedClauses';
import { clauseById } from './sampleContract';

/**
 * A scripted Coach thread that exercises the persistent assistant card types
 * (plain-answer, doc-analysis, risk-flag, what-if, escalation). The sixth card —
 * the typing indicator — is rendered live by the Coach whenever a reply is in
 * flight (see coachService + coach.tsx), so all six are demonstrably shown.
 */

const overtimeFlag = flaggedClauses.find((f) => f.id === 'flag-overtime')!;
const noncompeteFlag = flaggedClauses.find((f) => f.id === 'flag-noncompete')!;
const resignationClause = clauseById('clause-resignation')!;

export const sampleConversation: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    timeLabel: '9:02 AM',
    text: 'Can you check my employment contract before I sign?',
    attachmentName: 'BPO-contract.pdf',
  },
  {
    id: 'm2',
    role: 'assistant',
    timeLabel: '9:02 AM',
    text: sampleAnalysis.summary,
    card: {
      kind: 'doc-analysis',
      analysis: sampleAnalysis,
      intro: 'I read your contract. I found 3 things worth a closer look.',
    },
  },
  {
    id: 'm3',
    role: 'assistant',
    timeLabel: '9:02 AM',
    text: overtimeFlag.explanation,
    card: {
      kind: 'risk-flag',
      flag: overtimeFlag,
      clause: clauseById(overtimeFlag.clauseId)!,
    },
  },
  {
    id: 'm4',
    role: 'user',
    timeLabel: '9:04 AM',
    text: 'Pwede ba nila akong pilitin mag-overtime?',
  },
  {
    id: 'm5',
    role: 'assistant',
    timeLabel: '9:04 AM',
    text:
      'In general, an employer can require overtime in certain situations, but overtime work must be paid extra — usually at least an additional 25% of your hourly rate. Your contract only says “per company policy,” so the exact rate isn’t clear yet.',
    card: {
      kind: 'plain-answer',
      readAloud: true,
      text:
        'Sa pangkalahatan, puwedeng hilingin ng kumpanya ang overtime sa ilang sitwasyon — pero dapat itong bayaran nang dagdag, kadalasan ay hindi bababa sa 25% na dagdag sa iyong oras-oras na sahod. Ang kontrata mo ay nakasaad lang na “per company policy,” kaya hindi pa malinaw ang eksaktong rate.',
      citedBasis: citations.overtimePay,
      notLegalAdvice:
        'This isn’t legal advice — here’s what to ask HR so you get it in writing.',
      suggestions: [
        { id: 's1', label: 'What overtime rate should I ask for?' },
        { id: 's2', label: 'Is night-shift pay different?' },
        { id: 's3', label: 'Can I refuse overtime?' },
      ],
    },
  },
  {
    id: 'm6',
    role: 'user',
    timeLabel: '9:06 AM',
    text: 'What if I resign without giving 30 days notice?',
  },
  {
    id: 'm7',
    role: 'assistant',
    timeLabel: '9:06 AM',
    text:
      'If you resign without the 30-day notice, your contract says the company may withhold your final pay. In practice, final pay is generally expected within 30 days of leaving, so withholding it entirely can be questionable.',
    card: {
      kind: 'what-if',
      scenario: 'You resign without giving 30 days written notice.',
      clause: resignationClause,
      consequence:
        'Your contract lets the company hold your final pay and clearance. But DOLE guidance says final pay should usually be released within 30 days — so a total withholding is worth questioning.',
      citedBasis: citations.finalPay,
    },
  },
  {
    id: 'm8',
    role: 'assistant',
    timeLabel: '9:06 AM',
    text: noncompeteFlag.explanation,
    card: {
      kind: 'risk-flag',
      flag: noncompeteFlag,
      clause: clauseById(noncompeteFlag.clauseId)!,
    },
  },
  {
    id: 'm9',
    role: 'user',
    timeLabel: '9:08 AM',
    text: 'Can they sue me if I join a competitor after I leave?',
  },
  {
    id: 'm10',
    role: 'assistant',
    timeLabel: '9:08 AM',
    text:
      'I’m not certain enough to answer that confidently — whether a non-compete can be enforced against you depends on specifics a lawyer should review.',
    card: {
      kind: 'escalation',
      text:
        'This one depends on details I can’t weigh for you — and the answer really matters. Please talk to a real lawyer. Both of these are free:',
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
    },
  },
];
