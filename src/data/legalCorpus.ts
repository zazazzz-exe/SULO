import type { Citation, Language } from '@/services/types';

/**
 * SULO's grounding corpus — a curated, DATE-STAMPED index of real Philippine
 * labor-law provisions. Retrieval (RAG) draws citations from here so answers are
 * grounded in the law, not the model's memory. Summaries are written for legal
 * LITERACY (what the rule generally says) — not legal advice, and not a verbatim
 * reproduction of the statute.
 *
 * Article numbers follow the Labor Code as renumbered by DOLE Dept. Advisory
 * No. 01-15 (2015); historical numbers are noted in parentheses where useful.
 */

export const CORPUS_VERSION = '2024-06 (Labor Code renumbered per DOLE D.A. 01-15)';

export type CorpusEntry = {
  id: string;
  /** Mono chip text, e.g. "LABOR CODE · ART. 87". */
  label: string;
  /** Full human-readable source. */
  source: string;
  /** Date stamp / effectivity reference for this provision. */
  asOf: string;
  topic: string;
  keywords: string[];
  /** Plain-language summary of what the provision generally says. */
  text: string;
  url?: string;
};

export const legalCorpus: CorpusEntry[] = [
  {
    id: 'lc-art83-hours',
    label: 'LABOR CODE · ART. 83',
    source: 'Labor Code of the Philippines, Article 83 (Normal Hours of Work)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'hours of work',
    keywords: ['hours', 'work', '8 hours', 'eight', 'shift', 'normal hours', 'working time'],
    text: 'The normal hours of work of an employee generally may not exceed eight (8) hours a day. Time spent working beyond this is overtime and is treated differently.',
  },
  {
    id: 'lc-art86-night',
    label: 'LABOR CODE · ART. 86',
    source: 'Labor Code of the Philippines, Article 86 (Night Shift Differential)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'night shift',
    keywords: ['night', 'night shift', 'differential', 'graveyard', '10pm', 'shift pay'],
    text: 'An employee is generally entitled to a night-shift differential of at least 10% of the regular wage for each hour of work performed between 10:00 p.m. and 6:00 a.m.',
  },
  {
    id: 'lc-art87-overtime',
    label: 'LABOR CODE · ART. 87',
    source: 'Labor Code of the Philippines, Article 87 (Overtime Work)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'overtime',
    keywords: ['overtime', 'ot', 'extra hours', 'beyond 8', 'mag-overtime', 'render overtime', 'overtime pay'],
    text: 'Work beyond eight hours a day must be paid an additional premium — generally at least 25% of the hourly rate on ordinary days, and at least 30% on a rest day, special day, or regular holiday.',
  },
  {
    id: 'lc-art91-restday',
    label: 'LABOR CODE · ART. 91',
    source: 'Labor Code of the Philippines, Article 91 (Weekly Rest Period)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'rest day',
    keywords: ['rest day', 'weekly rest', 'day off', 'rest period', '24 hours'],
    text: 'An employer must generally provide each employee a rest period of at least twenty-four (24) consecutive hours after every six (6) consecutive normal workdays.',
  },
  {
    id: 'lc-art94-holiday',
    label: 'LABOR CODE · ART. 94',
    source: 'Labor Code of the Philippines, Article 94 (Holiday Pay)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'holiday pay',
    keywords: ['holiday', 'holiday pay', 'regular holiday', 'double pay', 'piyesta opisyal'],
    text: 'On a regular holiday, a covered employee is generally entitled to their daily wage even if unworked (100%); if they work, they are generally paid at least twice (200%) the daily wage.',
  },
  {
    id: 'lc-art95-sil',
    label: 'LABOR CODE · ART. 95',
    source: 'Labor Code of the Philippines, Article 95 (Service Incentive Leave)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'leave',
    keywords: ['leave', 'service incentive leave', 'sil', '5 days', 'paid leave', 'vacation'],
    text: 'An employee who has rendered at least one year of service is generally entitled to a yearly service incentive leave of five (5) days with pay, unless already enjoying an equivalent or greater benefit.',
  },
  {
    id: 'pd851-13thmonth',
    label: 'PD 851 · 13TH MONTH',
    source: 'Presidential Decree No. 851 (13th-Month Pay Law)',
    asOf: 'PD 851 (1975), DOLE guidelines',
    topic: '13th month pay',
    keywords: ['13th month', 'thirteenth', 'bonus', '13th-month pay', 'december', 'year-end'],
    text: 'Rank-and-file employees who worked at least one month in a calendar year are generally entitled to 13th-month pay of at least one-twelfth (1/12) of their basic annual salary, payable on or before December 24.',
  },
  {
    id: 'lc-art99-wage',
    label: 'LABOR CODE · ART. 99',
    source: 'Labor Code Art. 99 & RA 6727 (Wage Rationalization Act)',
    asOf: 'RA 6727 (1989); current regional wage orders',
    topic: 'minimum wage',
    keywords: ['minimum wage', 'wage', 'salary', 'sahod', 'underpaid', 'wage order', 'below minimum'],
    text: 'Minimum wage rates are set per region by the Regional Tripartite Wages and Productivity Boards. Paying below the applicable regional minimum wage is generally not allowed.',
  },
  {
    id: 'lc-art100-nondiminution',
    label: 'LABOR CODE · ART. 100',
    source: 'Labor Code of the Philippines, Article 100 (Non-Diminution of Benefits)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'benefits',
    keywords: ['benefits', 'diminution', 'reduce', 'remove benefit', 'take away', 'existing benefit'],
    text: 'Benefits already enjoyed by employees as a matter of practice or policy generally cannot be unilaterally reduced, withdrawn, or eliminated by the employer.',
  },
  {
    id: 'lc-art113-deductions',
    label: 'LABOR CODE · ART. 113',
    source: 'Labor Code of the Philippines, Article 113 (Wage Deductions)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'deductions',
    keywords: ['deduction', 'deductions', 'withhold', 'salary deduction', 'bawas', 'penalty', 'fine', 'cash bond'],
    text: 'An employer generally may not deduct from wages except in limited cases allowed by law or regulation, or with the employee’s written authorization for their benefit. Arbitrary fines or withholding are generally not permitted.',
  },
  {
    id: 'lc-art294-tenure',
    label: 'LABOR CODE · ART. 294',
    source: 'Labor Code Art. 294 (formerly 279) (Security of Tenure)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'security of tenure',
    keywords: ['security of tenure', 'regular employee', 'dismissal', 'illegal dismissal', 'fire', 'terminate', 'tanggal'],
    text: 'A regular employee generally may not be dismissed except for a just or authorized cause and only after due process. Dismissal without valid cause and procedure may be illegal.',
  },
  {
    id: 'lc-art296-probation',
    label: 'LABOR CODE · ART. 296',
    source: 'Labor Code Art. 296 (formerly 281) (Probationary Employment)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'probation',
    keywords: ['probation', 'probationary', 'regularization', '6 months', 'six months', 'standards'],
    text: 'Probationary employment generally may not exceed six (6) months. The reasonable standards for regularization must be made known to the employee at the time of engagement; otherwise the employee may be deemed regular. Probationary employees still enjoy security of tenure during the period.',
  },
  {
    id: 'lc-art297-justcause',
    label: 'LABOR CODE · ART. 297',
    source: 'Labor Code Art. 297 (formerly 282) (Termination by Employer — Just Causes)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'just cause',
    keywords: ['just cause', 'termination', 'misconduct', 'dismissal grounds', 'fire for cause', 'neglect', 'fraud'],
    text: 'Just causes for dismissal generally include serious misconduct, willful disobedience of lawful orders, gross and habitual neglect of duties, fraud or breach of trust, commission of a crime against the employer, and analogous causes — each requiring due process.',
  },
  {
    id: 'lc-art298-authorized',
    label: 'LABOR CODE · ART. 298',
    source: 'Labor Code Art. 298–299 (formerly 283–284) (Authorized Causes)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'authorized cause',
    keywords: ['authorized cause', 'redundancy', 'retrenchment', 'closure', 'separation pay', 'layoff'],
    text: 'Authorized causes (e.g., redundancy, retrenchment, closure, or disease) generally allow termination but require prior written notice to the employee and DOLE and payment of separation pay computed under the law.',
  },
  {
    id: 'lc-art300-resignation',
    label: 'LABOR CODE · ART. 300',
    source: 'Labor Code Art. 300 (formerly 285) (Termination by Employee)',
    asOf: 'PD 442, as renumbered 2015',
    topic: 'resignation',
    keywords: ['resign', 'resignation', 'notice', '30 days', 'quit', 'leave job', 'notice period'],
    text: 'An employee may resign by serving a written notice at least thirty (30) days in advance. Without a just cause to resign immediately, failure to serve notice may make the employee liable for damages — but it does not automatically forfeit wages already earned.',
  },
  {
    id: 'dole-la06-20-finalpay',
    label: 'DOLE · LA 06-20',
    source: 'DOLE Labor Advisory No. 06, Series of 2020 (Final Pay & Certificate of Employment)',
    asOf: 'Issued 2020',
    topic: 'final pay',
    keywords: ['final pay', 'last pay', 'back pay', 'clearance', 'certificate of employment', 'coe', 'release of pay'],
    text: 'Final pay should generally be released within thirty (30) days from separation, unless a more favorable company practice or agreement applies. A Certificate of Employment should generally be issued within three (3) days of request.',
  },
  {
    id: 'sss-philhealth-pagibig',
    label: 'SSS · PHIC · HDMF',
    source: 'RA 11199 (SSS), RA 11223 (PhilHealth/UHC), RA 9679 (Pag-IBIG)',
    asOf: 'RA 11199 (2018), RA 11223 (2019), RA 9679 (2009)',
    topic: 'mandatory contributions',
    keywords: ['sss', 'philhealth', 'pag-ibig', 'hdmf', 'contributions', 'remit', 'social security', 'benefits not remitted'],
    text: 'Employers are generally required to register employees and remit mandatory contributions to SSS, PhilHealth, and Pag-IBIG. Failing to deduct-and-remit these contributions may expose the employer to liability.',
  },
  {
    id: 'civil-1306-noncompete',
    label: 'CIVIL CODE · ART. 1306',
    source: 'Civil Code Art. 1306 (Autonomy of Contracts); jurisprudence on restraint of trade',
    asOf: 'Civil Code (RA 386); case law',
    topic: 'non-compete',
    keywords: ['non-compete', 'noncompete', 'restraint of trade', 'restriction', 'cannot work', 'competitor', 'post-employment'],
    text: 'Parties may set contract terms, but post-employment restraints (non-compete clauses) are only enforceable if reasonable in time, geographic area, and scope of activity. Overly broad or indefinite restraints may be held void for being against public policy.',
  },
  {
    id: 'ra11106-fsl',
    label: 'RA 11106 · FSL',
    source: 'Republic Act No. 11106 (Filipino Sign Language Act of 2018)',
    asOf: 'RA 11106 (2018)',
    topic: 'accessibility',
    keywords: ['filipino sign language', 'fsl', 'deaf', 'sign language', 'interpreter', 'accessibility', 'disability'],
    text: 'The Filipino Sign Language Act declares FSL the national sign language of the Filipino deaf and the medium of official communication in deaf transactions, including access to legal settings and interpreters.',
  },
];

/**
 * Filipino / Cebuano renderings of each provision's plain-language summary.
 * Keyed by entry id. The English `text` on each entry stays the grounding/LLM
 * context; these power local-fallback answers and citations in the user's
 * language. Missing keys fall back to English.
 */
export const corpusTx: Record<string, Partial<Record<Language, string>>> = {
  'lc-art83-hours': {
    FIL: 'Sa pangkalahatan, hindi dapat lumampas sa walong (8) oras kada araw ang normal na oras ng trabaho. Ang trabahong lampas dito ay overtime at may kaibang pagtrato.',
    CEB: 'Kasagaran, dili molapas sa walo (8) ka oras kada adlaw ang normal nga oras sa trabaho. Ang trabaho nga molapas niini overtime ug lahi ang pagtagad.',
  },
  'lc-art86-night': {
    FIL: 'Karaniwang may karapatan ang empleyado sa night-shift differential na hindi bababa sa 10% ng regular na sahod kada oras ng trabaho mula 10:00 ng gabi hanggang 6:00 ng umaga.',
    CEB: 'Kasagaran adunay katungod ang empleyado sa night-shift differential nga dili moubos sa 10% sa regular nga suhol kada oras sa trabaho gikan alas 10:00 sa gabii hangtod alas 6:00 sa buntag.',
  },
  'lc-art87-overtime': {
    FIL: 'Ang trabahong lampas sa walong oras kada araw ay dapat bayaran ng dagdag — kadalasan hindi bababa sa 25% ng oras-oras na sahod sa ordinaryong araw, at hindi bababa sa 30% kung rest day, special day, o regular holiday.',
    CEB: 'Ang trabaho nga molapas sa walo ka oras kada adlaw kinahanglan bayran og dugang — kasagaran dili moubos sa 25% sa oras-oras nga suhol sa ordinaryong adlaw, ug dili moubos sa 30% kon rest day, special day, o regular holiday.',
  },
  'lc-art91-restday': {
    FIL: 'Karaniwang kailangang bigyan ng employer ang bawat empleyado ng pahinga na hindi bababa sa dalawampu’t apat (24) na magkakasunod na oras pagkatapos ng anim (6) na magkakasunod na araw ng trabaho.',
    CEB: 'Kasagaran kinahanglan hatagan sa employer ang matag empleyado og pahulay nga dili moubos sa kawhaan ug upat (24) ka sunod-sunod nga oras human sa unom (6) ka sunod-sunod nga adlaw sa trabaho.',
  },
  'lc-art94-holiday': {
    FIL: 'Sa regular holiday, karaniwang may karapatan ang empleyado sa araw-araw niyang sahod kahit hindi pumasok (100%); kung magtrabaho, karaniwang binabayaran ng hindi bababa sa dalawang beses (200%) ng araw-araw na sahod.',
    CEB: 'Sa regular holiday, kasagaran adunay katungod ang empleyado sa iyang adlaw-adlaw nga suhol bisan walay trabaho (100%); kon motrabaho, kasagaran bayran og dili moubos sa doble (200%) sa adlaw-adlaw nga suhol.',
  },
  'lc-art95-sil': {
    FIL: 'Ang empleyadong nakapagtrabaho nang hindi bababa sa isang taon ay karaniwang may karapatan sa taunang service incentive leave na limang (5) araw na may bayad, maliban kung mayroon nang katumbas o mas malaking benepisyo.',
    CEB: 'Ang empleyado nga nakatrabaho og dili moubos sa usa ka tuig kasagaran adunay katungod sa tinuig nga service incentive leave nga lima (5) ka adlaw nga bayad, gawas kon naa nay katumbas o mas dako nga benepisyo.',
  },
  'pd851-13thmonth': {
    FIL: 'Ang rank-and-file na empleyadong nagtrabaho nang hindi bababa sa isang buwan sa loob ng taon ay karaniwang may karapatan sa 13th-month pay na hindi bababa sa ikalabindalawa (1/12) ng taunang basic salary, babayaran sa o bago mag-Disyembre 24.',
    CEB: 'Ang rank-and-file nga empleyado nga nagtrabaho og dili moubos sa usa ka bulan sulod sa tuig kasagaran adunay katungod sa 13th-month pay nga dili moubos sa ikanapulog-duha (1/12) sa tinuig nga basic salary, bayran sa o sa dili pa ang Disyembre 24.',
  },
  'lc-art99-wage': {
    FIL: 'Ang minimum wage ay itinatakda kada rehiyon ng Regional Tripartite Wages and Productivity Boards. Karaniwang hindi pinapayagan ang pagbabayad nang mas mababa sa minimum wage ng rehiyon.',
    CEB: 'Ang minimum wage gitakda kada rehiyon sa Regional Tripartite Wages and Productivity Boards. Kasagaran dili gitugotan ang pagbayad og mas ubos sa minimum wage sa rehiyon.',
  },
  'lc-art100-nondiminution': {
    FIL: 'Ang mga benepisyong tinatamasa na ng empleyado bilang kaugalian o patakaran ay karaniwang hindi basta-basta mababawasan, mababawi, o maaalis ng employer nang mag-isa.',
    CEB: 'Ang mga benepisyo nga gitagamtam na sa empleyado isip batasan o palisiya kasagaran dili basta-basta makunhuran, makuha, o matangtang sa employer nga siya ra.',
  },
  'lc-art113-deductions': {
    FIL: 'Karaniwang hindi maaaring magbawas ang employer sa sahod maliban sa ilang kaso na pinapayagan ng batas, o may nakasulat na pahintulot ang empleyado para sa kanyang kapakinabangan. Hindi karaniwang pinapayagan ang basta-bastang multa o pagpigil ng sahod.',
    CEB: 'Kasagaran dili makakuha ang employer sa suhol gawas sa pipila ka kaso nga gitugotan sa balaod, o may sinulat nga pagtugot sa empleyado para sa iyang kaayohan. Dili kasagaran gitugotan ang basta-basta nga multa o pagpugong sa suhol.',
  },
  'lc-art294-tenure': {
    FIL: 'Karaniwang hindi maaaring tanggalin ang regular na empleyado maliban kung may just o authorized cause at pagkatapos lamang ng tamang proseso. Ang pagtanggal nang walang balidong dahilan at proseso ay maaaring iligal.',
    CEB: 'Kasagaran dili matangtang ang regular nga empleyado gawas kon may just o authorized cause ug human lang sa hustong proseso. Ang pagtangtang nga walay balido nga rason ug proseso mahimong ilegal.',
  },
  'lc-art296-probation': {
    FIL: 'Karaniwang hindi lalampas sa anim (6) na buwan ang probationary employment. Dapat ipaalam sa empleyado ang makatwirang pamantayan para sa regularization sa simula ng trabaho; kung hindi, maaaring ituring na regular ang empleyado. May security of tenure pa rin ang probationary na empleyado sa panahong ito.',
    CEB: 'Kasagaran dili molapas sa unom (6) ka bulan ang probationary employment. Kinahanglan ipahibalo sa empleyado ang makatarunganon nga sukdanan para sa regularization sa sinugdan sa trabaho; kon dili, mahimong isipon nga regular ang empleyado. Aduna gihapoy security of tenure ang probationary nga empleyado niini nga panahon.',
  },
  'lc-art297-justcause': {
    FIL: 'Kabilang sa just causes ng pagtanggal ang seryosong maling pag-uugali, sadyang pagsuway sa legal na utos, malubha at paulit-ulit na pagpapabaya sa tungkulin, pandaraya o pagtataksil sa tiwala, paggawa ng krimen laban sa employer, at mga katulad na dahilan — lahat ay nangangailangan ng tamang proseso.',
    CEB: 'Apil sa just causes sa pagtangtang ang seryoso nga sayop nga panggawi, tinuyo nga pagsupak sa legal nga mando, grabe ug balik-balik nga pagpasagad sa katungdanan, panglimbong o pagluib sa pagsalig, pagbuhat og krimen batok sa employer, ug susama nga rason — tanan nanginahanglan og hustong proseso.',
  },
  'lc-art298-authorized': {
    FIL: 'Ang authorized causes (hal. redundancy, retrenchment, pagsasara, o sakit) ay karaniwang nagpapahintulot ng pagtanggal ngunit kailangan ng paunang nakasulat na abiso sa empleyado at DOLE at pagbabayad ng separation pay ayon sa batas.',
    CEB: 'Ang authorized causes (pananglitan redundancy, retrenchment, pagsira, o sakit) kasagaran nagtugot sa pagtangtang apan nanginahanglan og abante nga sinulat nga pahibalo sa empleyado ug DOLE ug bayad sa separation pay sumala sa balaod.',
  },
  'lc-art300-resignation': {
    FIL: 'Maaaring mag-resign ang empleyado sa pamamagitan ng nakasulat na abiso nang hindi bababa sa tatlumpung (30) araw na patiuna. Kung walang just cause para mag-resign agad, ang hindi pagbibigay ng abiso ay maaaring magpamanagot sa empleyado sa danyos — ngunit hindi nito basta-basta nawawala ang sahod na kinita na.',
    CEB: 'Mahimong mo-resign ang empleyado pinaagi sa sinulat nga pahibalo og dili moubos sa katloan (30) ka adlaw nga abante. Kon walay just cause sa pag-resign dayon, ang pagkapakyas sa paghatag og pahibalo mahimong mopaakon sa empleyado sa danyos — apan dili niini awtomatik nga mawala ang suhol nga nakita na.',
  },
  'dole-la06-20-finalpay': {
    FIL: 'Karaniwang dapat ilabas ang final pay sa loob ng tatlumpung (30) araw mula sa paghiwalay, maliban kung may mas paborableng patakaran o kasunduan ang kumpanya. Karaniwang dapat ibigay ang Certificate of Employment sa loob ng tatlong (3) araw mula sa kahilingan.',
    CEB: 'Kasagaran kinahanglan ihatag ang final pay sulod sa katloan (30) ka adlaw gikan sa pagbulag, gawas kon may mas maayong batasan o kasabotan ang kompanya. Kasagaran kinahanglan ihatag ang Certificate of Employment sulod sa tulo (3) ka adlaw gikan sa hangyo.',
  },
  'sss-philhealth-pagibig': {
    FIL: 'Karaniwang kailangan ng employer na irehistro ang empleyado at i-remit ang mandatoryong kontribusyon sa SSS, PhilHealth, at Pag-IBIG. Ang hindi pag-deduct-at-remit nito ay maaaring magpamanagot sa employer.',
    CEB: 'Kasagaran kinahanglan sa employer nga irehistro ang empleyado ug i-remit ang mandatory nga kontribusyon sa SSS, PhilHealth, ug Pag-IBIG. Ang dili pag-deduct-ug-remit niini mahimong mopaakon sa employer.',
  },
  'civil-1306-noncompete': {
    FIL: 'Maaaring magtakda ng mga termino ang mga partido, ngunit ang post-employment na restriksyon (non-compete) ay maipapatupad lamang kung makatwiran sa panahon, lugar, at saklaw. Ang sobrang lawak o walang katiyakang restriksyon ay maaaring ipawalang-bisa dahil labag sa public policy.',
    CEB: 'Mahimong magtakda og mga termino ang mga partido, apan ang post-employment nga pagpugong (non-compete) maipatuman lang kon makatarunganon sa panahon, lugar, ug sakup. Ang sobra ka lapad o walay kasigurohan nga pagpugong mahimong pawad-on og bili tungod kay supak sa public policy.',
  },
  'ra11106-fsl': {
    FIL: 'Idinedeklara ng Filipino Sign Language Act ang FSL bilang pambansang sign language ng mga Pilipinong bingi at midyum ng opisyal na komunikasyon sa mga transaksyon ng bingi, kabilang ang access sa legal na usapin at interpreter.',
    CEB: 'Gideklara sa Filipino Sign Language Act ang FSL isip nasudnong sign language sa mga Pilipinong bungol ug medium sa opisyal nga komunikasyon sa mga transaksyon sa bungol, lakip ang access sa legal nga panghitabo ug interpreter.',
  },
};

/** The provision summary in the requested language (English fallback). */
export function entryText(entry: CorpusEntry, language: Language = 'EN'): string {
  return corpusTx[entry.id]?.[language] ?? entry.text;
}

/** Build a UI Citation from a corpus entry (localized gloss for the chip). */
export function toCitation(entry: CorpusEntry, language: Language = 'EN'): Citation {
  const text = entryText(entry, language);
  return {
    id: entry.id,
    label: entry.label,
    source: entry.source,
    detail: text.length > 170 ? text.slice(0, 167).trimEnd() + '…' : text,
    url: entry.url,
  };
}

export const corpusById = (id: string): CorpusEntry | undefined =>
  legalCorpus.find((e) => e.id === id);
