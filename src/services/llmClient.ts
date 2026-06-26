import { Platform } from 'react-native';

import { config, fetchWithTimeout, authHeaders } from './config';

/**
 * OpenAI-compatible chat client for the (quantized) SULO LLM behind
 * EXPO_PUBLIC_LLM_API_URL. Streams token deltas on web (SSE via ReadableStream);
 * React Native's fetch can't stream a response body, so on native it reads the
 * full reply and replays it to onToken so the UI's streaming path still runs.
 */

export type ChatRole = 'system' | 'user' | 'assistant';
export type LlmMessage = { role: ChatRole; content: string };
export type OnToken = (accumulatedText: string) => void;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Replay a finished string to onToken word-by-word (native / local fallback). */
export async function streamOutLocally(text: string, onToken?: OnToken): Promise<string> {
  if (!onToken) return text;
  const words = text.split(/(\s+)/);
  let acc = '';
  for (let i = 0; i < words.length; i++) {
    acc += words[i];
    if (words[i].trim().length > 0) {
      onToken(acc);
      // Small, varied cadence (no Math.random dependency on render).
      await delay(14 + (i % 5) * 8);
    }
  }
  return text;
}

async function readSSE(res: Response, onToken?: OnToken): Promise<string> {
  const reader = (res.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let acc = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const delta: string =
          json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.text ?? '';
        if (delta) {
          acc += delta;
          onToken?.(acc);
        }
      } catch {
        // ignore keep-alive / partial frames
      }
    }
  }
  return acc;
}

/**
 * Send a chat completion. Returns the full text; streams via onToken when
 * possible. Throws on network/HTTP error so callers can fall back.
 */
export async function streamChat(
  messages: LlmMessage[],
  onToken?: OnToken
): Promise<string> {
  const canStream = Platform.OS === 'web';
  const res = await fetchWithTimeout(config.llmApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      model: config.llmModel,
      messages,
      stream: canStream,
      temperature: 0.2,
      max_tokens: 700,
    }),
  });

  if (!res.ok) throw new Error(`LLM request failed (${res.status})`);

  // Stream on web when a readable body is present.
  if (canStream && res.body && typeof (res.body as ReadableStream).getReader === 'function') {
    return readSSE(res, onToken);
  }

  // Native / non-streaming: read full JSON, then replay locally.
  const data = await res.json();
  const text: string =
    data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? '';
  return streamOutLocally(text, onToken);
}
