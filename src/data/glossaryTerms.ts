import type { GlossaryTerm } from '@/services/types';

/**
 * FSL glossary terms. videoPlaceholder names the clip Phase 2 will supply.
 */
export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'term-probation',
    term: 'Probation',
    translation: { FIL: 'Probisyonaryo', CEB: 'Probisyonaryo' },
    definition:
      'A trial period at the start of a job (up to 6 months) when the employer checks if you meet the standards explained to you when hired. You still have rights during probation.',
    videoPlaceholder: 'fsl-probation.mp4',
  },
  {
    id: 'term-waiver',
    term: 'Waiver',
    translation: { FIL: 'Pagtalikod sa karapatan', CEB: 'Pagbiya sa katungod' },
    definition:
      'When you sign away a right you would otherwise have. Read waivers carefully — some rights protected by law cannot be waived even if you sign.',
    videoPlaceholder: 'fsl-waiver.mp4',
  },
  {
    id: 'term-overtime',
    term: 'Overtime',
    translation: { FIL: 'Obertaym', CEB: 'Sobra nga oras' },
    definition:
      'Work beyond the normal eight hours a day. Overtime generally must be paid at a higher rate than your regular hourly pay.',
    videoPlaceholder: 'fsl-overtime.mp4',
  },
  {
    id: 'term-penalty',
    term: 'Penalty',
    translation: { FIL: 'Multa / Parusa', CEB: 'Multa / Silot' },
    definition:
      'A charge or punishment in a contract if you break a rule — for example, withholding pay. Some penalties are not allowed by law, so it’s worth checking before agreeing.',
    videoPlaceholder: 'fsl-penalty.mp4',
  },
];
