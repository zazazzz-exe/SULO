# SULO 🔦

**Understand any legal document — in plain language, in your language.**

SULO is an AI legal-literacy app for Filipinos. A user photographs, uploads, or
speaks a legal document (an employment contract, a notice, a loan) and SULO
explains it in plain language, flags risky clauses, answers questions through
**the Coach** (chat), and points to free legal help.

> **Framing, everywhere: literacy, not advice.** SULO teaches people to read
> their own documents. It is **not** a lawyer and does not give legal advice.
> When a question needs real legal judgment, it routes to **PAO** and **DOLE**.

MVP domain: **employment & labor**. Built by **Team Siryus** for **ACM
TechSprint — Asteria: Illuminate the Future**.

---

## Phase 1 status — UI only ✅

This repo is **Phase 1: the complete interface on mock data behind a stubbed
service layer.** There is **no real AI, OCR, ASR/TTS, backend, or network call.**
Phase 2 fills in the service bodies without changing the UI. See
[**Phase-2 seams**](#phase-2-seams) below.

Runs from **one codebase** as a **web app** and on **iOS/Android via Expo**.

### Run it

```bash
npm install
npx expo start --web      # web
npx expo start            # then press i / a, or scan with Expo Go (native)
```

Typecheck / bundle checks:

```bash
npx tsc --noEmit
npx expo export --platform web      # produces dist/
npx expo export --platform android  # verifies the native babel/worklets pipeline
```

---

## Tech & conventions

- **Expo + React Native + react-native-web**, **Expo Router** (file-based, web + native).
- **React Native primitives only** — no raw HTML/DOM, no web-only CSS.
- **Styling:** `StyleSheet` + a typed token module. Every color/space/type/radius/
  shadow value lives in [`src/theme/tokens.ts`](src/theme/tokens.ts). No NativeWind.
- **Animation:** **Moti + Reanimated 3/4 only.** All non-essential motion gates on
  `useReducedMotionPref()`.
- **Responsive** via `useWindowDimensions` (`src/hooks/useResponsive.ts`) — one
  code path for desktop / tablet / mobile.
- **Persistence** via an AsyncStorage abstraction (`src/storage/storage.ts`).
  Never call `localStorage` directly.
- **TypeScript throughout.** All logic lives behind the service layer — components
  import from `src/services`, never `fetch` directly.

> **SDK note:** scaffolded on Expo SDK 56 (React Native 0.85, Reanimated 4). With
> Reanimated 4 the worklets Babel plugin (`react-native-worklets/plugin`) is added
> automatically by `babel-preset-expo`, so there is no custom `babel.config.js` —
> the spec's manual "add reanimated/plugin last" step does not apply on this SDK.

---

## Project structure

```
app/                       # Expo Router routes (web + native)
  _layout.tsx              # fonts + splash hold, SafeAreaProvider, SettingsProvider, Stack
  index.tsx                # Landing (torch glow, scroll reveals)
  coach.tsx                # The Legal Coach (chat) — the heart
  glossary.tsx             # FSL glossary
  settings.tsx             # Settings (modal)

src/
  theme/                   # tokens.ts (design system) + index.ts (useTheme: a11y palette/scale)
  hooks/                   # useResponsive, useReducedMotion
  storage/                 # AsyncStorage abstraction
  services/                # THE SEAM LAYER (typed stubs, mock returns)
    types.ts               # ChatMessage, MessageCard (6 kinds), DocumentAnalysis, Clause,
                           #   RiskFlag, Citation, GlossaryTerm, Settings, …
    config.ts              # reads EXPO_PUBLIC_* env → typed config + isLiveBackend flag
    coachService.ts        # sendMessage(history, text, opts) → mock MessageCards
    documentService.ts     # analyzeDocument(file|image) → mock contract analysis
    voiceService.ts        # transcribe(audio) / speak(text) → no-op
    settingsService.tsx    # Settings context + persistence
  data/                    # mock content (so the UI looks real on first load)
    sampleContract.ts      # ~6-clause BPO employment contract
    flaggedClauses.ts      # 3 risk flags + the assembled DocumentAnalysis
    sampleConversation.ts  # scripted Coach thread exercising all card types
    glossaryTerms.ts       # Probation / Waiver / Overtime / Penalty
    citations.ts           # mock grounded citations
  components/
    brand/                 # Wordmark, TorchGlow
    motion/                # Reveal (scroll-reveal), StepConnector
    nav/                   # AppHeader, Drawer, AppShell
    ui/                    # Text, Surface, Button, Badge, Chip, Container (token-driven)
    landing/               # Hero, HowItWorks, section parts
    coach/                 # MessageCard (6 card renderers), Composer, ClausePanel,
                           #   CitedBasis, ReadAloudButton, TypingIndicator
```

### The 6 assistant card types (`src/services/types.ts` → `MessageCard`)

1. `plain-answer` — plain-language answer + **CITED BASIS** chip + **Read aloud**
2. `doc-analysis` — title + key-facts strip + "I found N things worth a closer look"
3. `risk-flag` — HIGH/MED badge + plain explanation + cited basis → opens the clause
   in a **right panel (web)** / **bottom sheet (mobile)**
4. `what-if` — scenario → exact clause + consequence
5. `escalation` — low-confidence → **PAO** / **DOLE hotline** buttons
6. `typing` — flickering amber flame (shown live while a reply is in flight)

---

## Phase-2 seams

Everything below is mocked behind a stable interface. To go live, set the
matching `EXPO_PUBLIC_*` var (see [`.env.example`](.env.example)) and replace the
marked body — **no UI changes required**. Each file has a `PHASE-2 SEAM` comment.

| Seam | File | Replace with | Env var |
| --- | --- | --- | --- |
| Coach answers (LLM + RAG) | `src/services/coachService.ts` → `sendMessage` / `composeReply` | LLM call grounded by vector-store retrieval; map result → `MessageCard` | `EXPO_PUBLIC_LLM_API_URL`, `EXPO_PUBLIC_VECTOR_STORE_URL` |
| Document understanding | `src/services/documentService.ts` → `analyzeDocument` | OCR → clause parsing → risk classification → citation retrieval, returning the same `DocumentAnalysis` shape | `EXPO_PUBLIC_OCR_API_URL` (+ LLM/vector) |
| Voice in | `src/services/voiceService.ts` → `transcribe` | Real ASR (web: MediaRecorder upload; native: expo-av) | `EXPO_PUBLIC_ASR_API_URL` |
| Voice out | `src/services/voiceService.ts` → `speak` | Real TTS (web: Audio/Web Speech; native: expo-speech) | `EXPO_PUBLIC_TTS_API_URL` |
| Persistence backend | `src/storage/storage.ts` | Swap AsyncStorage for SecureStore / SQLite / server sync | — |
| FSL glossary clips | `src/components/glossary` placeholder (in `app/glossary.tsx`) + `GlossaryTerm.videoPlaceholder` | Real FSL video sources | — |
| Citation deep-links | `Citation.url` (`src/services/types.ts`) | Link out to the cited source | — |

`config.isLiveBackend` flips to `true` automatically once any `EXPO_PUBLIC_*` URL
is set, and each service already branches on it.

---

## Accessibility (built in now)

Touch targets ≥ 48dp · high-contrast mode · adjustable text size · reduced-motion
respected · icons always paired with text labels · `accessibilityLabel` /
`accessibilityRole` throughout · voice + captions controls placed (wiring is
Phase 2). All preferences live in **Settings** and persist on device.
