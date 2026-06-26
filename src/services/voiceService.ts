import { MOCK_LATENCY, isLiveBackend } from './config';
import type { Language, TranscriptionResult } from './types';

/**
 * Voice service — Phase 1 is a mock/no-op so the mic and "Read aloud" controls
 * are wired and reachable now.
 *
 * PHASE-2 SEAM:
 *   transcribe() → real ASR via config.asrApiUrl (web: MediaRecorder + upload;
 *                  native: expo-av recording + upload).
 *   speak()      → real TTS via config.ttsApiUrl (web: Audio element / Web
 *                  Speech; native: expo-speech or streamed audio).
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type AudioInput = { uri?: string; durationMs?: number };

export async function transcribe(
  _audio: AudioInput,
  language: Language = 'EN'
): Promise<TranscriptionResult> {
  if (isLiveBackend) {
    // PHASE 2: POST audio to config.asrApiUrl and return the transcript.
  }
  await delay(MOCK_LATENCY.transcribe);
  return {
    text: '',
    language,
    confidence: 0,
  };
}

export type SpeakHandle = { stop: () => void };

export async function speak(
  _text: string,
  _opts?: { language?: Language; speed?: number }
): Promise<SpeakHandle> {
  if (isLiveBackend) {
    // PHASE 2: synthesize via config.ttsApiUrl and play the audio.
  }
  // No-op in Phase 1. Returns a handle so callers can wire stop controls now.
  return { stop: () => {} };
}

/** Whether voice features are available on this build (always false in Phase 1). */
export const voiceAvailable = false;
