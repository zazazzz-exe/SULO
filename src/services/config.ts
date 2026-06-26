/**
 * Client configuration. Reads public env vars (EXPO_PUBLIC_*) that Expo inlines
 * at build time. Every value is optional: when an endpoint is unset the matching
 * service degrades gracefully to its on-device / local-corpus fallback, so the
 * app is never a dead end. Document any new var in .env.example.
 *
 * NOTE: only EXPO_PUBLIC_* vars reach the client bundle. Do NOT put privileged
 * secrets here — front the model/vector store with your own server (which holds
 * the provider key) and point EXPO_PUBLIC_LLM_API_URL at that. The optional
 * EXPO_PUBLIC_LLM_API_KEY is for environments where a public, rate-limited key
 * (e.g. a self-hosted gateway) is acceptable.
 */

const read = (value: string | undefined): string => value?.trim() ?? '';

export const config = {
  // Chat LLM — OpenAI-compatible /chat/completions (streaming SSE).
  llmApiUrl: read(process.env.EXPO_PUBLIC_LLM_API_URL),
  llmApiKey: read(process.env.EXPO_PUBLIC_LLM_API_KEY),
  llmModel: read(process.env.EXPO_PUBLIC_LLM_MODEL) || 'sulo-legal',

  // Retrieval (RAG). Optional embeddings endpoint for query vectors.
  vectorStoreUrl: read(process.env.EXPO_PUBLIC_VECTOR_STORE_URL),
  embeddingsApiUrl: read(process.env.EXPO_PUBLIC_EMBEDDINGS_API_URL),

  // Capture / voice endpoints (used when on-device paths are unavailable).
  ocrApiUrl: read(process.env.EXPO_PUBLIC_OCR_API_URL),
  asrApiUrl: read(process.env.EXPO_PUBLIC_ASR_API_URL),
  ttsApiUrl: read(process.env.EXPO_PUBLIC_TTS_API_URL),

  // Tunables.
  topK: Number(process.env.EXPO_PUBLIC_RAG_TOP_K ?? 4) || 4,
  requestTimeoutMs: Number(process.env.EXPO_PUBLIC_REQUEST_TIMEOUT_MS ?? 30000) || 30000,
} as const;

export type Config = typeof config;

/** Per-capability availability — services branch on these. */
export const has = {
  llm: config.llmApiUrl.length > 0,
  vectorStore: config.vectorStoreUrl.length > 0,
  embeddings: config.embeddingsApiUrl.length > 0,
  ocrEndpoint: config.ocrApiUrl.length > 0,
  asrEndpoint: config.asrApiUrl.length > 0,
  ttsEndpoint: config.ttsApiUrl.length > 0,
} as const;

/** True once any real endpoint is configured. */
export const isLiveBackend = Object.values(has).some(Boolean);

/** Auth header for our own gateway, when a public key is provided. */
export function authHeaders(): Record<string, string> {
  return config.llmApiKey ? { Authorization: `Bearer ${config.llmApiKey}` } : {};
}

/** fetch() with a timeout (AbortController) — used by every network call. */
export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = config.requestTimeoutMs
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** Latency used by local fallbacks to keep the UI's typing/loading states honest. */
export const MOCK_LATENCY = {
  send: 650,
  typing: 1000,
  analyze: 1400,
  transcribe: 800,
} as const;
