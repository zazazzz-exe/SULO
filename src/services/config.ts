/**
 * Client configuration. Reads public env vars (EXPO_PUBLIC_*) that Expo inlines
 * at build time. In Phase 1 these are empty/placeholder — the services run on
 * mock data. Phase 2 sets real endpoints in .env and the same code lights up.
 *
 * NOTE: only EXPO_PUBLIC_* vars are exposed to the client bundle. Never put
 * secrets/keys here — those live server-side and are wired in Phase 2.
 */

const read = (value: string | undefined): string => value?.trim() ?? '';

export const config = {
  llmApiUrl: read(process.env.EXPO_PUBLIC_LLM_API_URL),
  vectorStoreUrl: read(process.env.EXPO_PUBLIC_VECTOR_STORE_URL),
  ocrApiUrl: read(process.env.EXPO_PUBLIC_OCR_API_URL),
  asrApiUrl: read(process.env.EXPO_PUBLIC_ASR_API_URL),
  ttsApiUrl: read(process.env.EXPO_PUBLIC_TTS_API_URL),
} as const;

export type Config = typeof config;

/** True once real endpoints are configured (Phase 2). Drives mock vs live. */
export const isLiveBackend = Object.values(config).some((v) => v.length > 0);

/** Simulated network latency for mock services (ms). */
export const MOCK_LATENCY = {
  send: 850,
  typing: 1100,
  analyze: 1600,
  transcribe: 900,
} as const;
