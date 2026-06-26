import { Platform } from 'react-native';

import { config, fetchWithTimeout, has, authHeaders } from './config';
import type { Language, TranscriptionResult } from './types';

/**
 * voiceService — real ASR (voice in) and TTS (voice out), bilingual.
 *
 *   ASR: web  → Web Speech API (live SpeechRecognition), Taglish/Cebuano via fil-PH.
 *        native→ record (expo-audio) then POST to EXPO_PUBLIC_ASR_API_URL.
 *   TTS: web  → window.speechSynthesis; native → expo-speech.
 *
 * Everything degrades gracefully and reports availability so the UI can adapt
 * without changing its controls.
 */

const BCP47: Record<Language, string> = {
  EN: 'en-US',
  FIL: 'fil-PH',
  CEB: 'fil-PH', // Cebuano voices are scarce; fil-PH is the closest fallback.
};

/**
 * Language-tag prefixes to try, in order, when picking a voice. Cebuano has
 * almost no dedicated TTS voice anywhere, so we fall back to Filipino/Tagalog
 * (phonetically close) and then to whatever the system offers.
 */
const VOICE_PREFIXES: Record<Language, string[]> = {
  EN: ['en'],
  FIL: ['fil', 'tl'],
  CEB: ['ceb', 'fil', 'tl'],
};

/* --------------------------------- TTS --------------------------------- */

export type SpeakHandle = { stop: () => void };

let webUtterance: SpeechSynthesisUtterance | null = null;

/** Resolve the system voice list (it can load asynchronously on web). */
function getWebVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = finish;
    setTimeout(finish, 600); // fallback if the event never fires
  });
}

function normalize(tag: string): string {
  return tag.toLowerCase().replace('_', '-');
}

/** Best available voice for a language (prefers exact region, else prefix). */
function pickWebVoice(voices: SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice | undefined {
  for (const prefix of VOICE_PREFIXES[language]) {
    const match = voices.find((v) => normalize(v.lang).startsWith(prefix));
    if (match) return match;
  }
  return undefined;
}

/** Which of EN/FIL/CEB have a real (or near, for CEB) voice on this device. */
export async function availableSpeechLanguages(): Promise<Language[]> {
  if (Platform.OS !== 'web') return ['EN', 'FIL', 'CEB'];
  const voices = await getWebVoices();
  return (['EN', 'FIL', 'CEB'] as Language[]).filter((l) => pickWebVoice(voices, l) != null);
}

export async function speak(
  text: string,
  opts?: { language?: Language; speed?: number }
): Promise<SpeakHandle> {
  const language = opts?.language ?? 'EN';
  const rate = Math.max(0.5, Math.min(2, opts?.speed ?? 1));

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { stop: () => {} };
    }
    const voices = await getWebVoices();
    const voice = pickWebVoice(voices, language);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Use the matched voice's exact tag; otherwise hint with the target locale.
    u.lang = voice?.lang ?? BCP47[language];
    if (voice) u.voice = voice;
    u.rate = rate;
    webUtterance = u;
    window.speechSynthesis.speak(u);
    return { stop: () => window.speechSynthesis.cancel() };
  }

  // Native — expo-speech. Pick a matching installed voice when available.
  const Speech = await import('expo-speech');
  let voiceId: string | undefined;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    for (const prefix of VOICE_PREFIXES[language]) {
      const m = voices.find((v) => normalize(v.language).startsWith(prefix));
      if (m) {
        voiceId = m.identifier;
        break;
      }
    }
  } catch {
    // getAvailableVoicesAsync may be unsupported — fall back to language tag.
  }
  Speech.speak(text, { language: BCP47[language], rate, voice: voiceId });
  return { stop: () => Speech.stop() };
}

export function stopSpeaking(): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    webUtterance = null;
  } else {
    import('expo-speech').then((S) => S.stop()).catch(() => {});
  }
}

/** True when text-to-speech can actually play on this platform. */
export function ttsAvailable(): boolean {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
  return true; // expo-speech
}

/* --------------------------------- ASR --------------------------------- */

type SpeechRecognitionType = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getWebRecognition(): SpeechRecognitionType | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionType;
    webkitSpeechRecognition?: new () => SpeechRecognitionType;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/** True when live, on-device voice input is available (web Speech API). */
export function liveAsrAvailable(): boolean {
  return getWebRecognition() != null;
}

export type ListenController = { stop: () => void };

/**
 * Live web speech recognition. Streams interim text via onPartial and resolves
 * the final transcript via onFinal. Returns a controller to stop early.
 */
export function startListening(opts: {
  language?: Language;
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (message: string) => void;
}): ListenController {
  const rec = getWebRecognition();
  if (!rec) {
    opts.onError?.('Live voice input is not available on this browser.');
    return { stop: () => {} };
  }
  rec.lang = BCP47[opts.language ?? 'EN'];
  rec.continuous = false;
  rec.interimResults = true;

  let finalText = '';
  rec.onresult = (e) => {
    let interim = '';
    for (let i = 0; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript;
      interim += transcript;
    }
    finalText = interim;
    opts.onPartial?.(interim);
  };
  rec.onerror = (e) => opts.onError?.(e.error || 'Voice input error.');
  rec.onend = () => {
    if (finalText.trim()) opts.onFinal?.(finalText.trim());
  };
  rec.start();
  return { stop: () => rec.stop() };
}

/* ---- Native recording → ASR endpoint (used when live ASR is absent) ---- */

export type AudioInput = { uri: string; mime?: string; durationMs?: number };

/** Record a short clip on native (expo-audio). Returns the file uri. */
export async function recordOnce(maxMs = 6000): Promise<AudioInput | null> {
  if (Platform.OS === 'web') return null;
  // expo-audio's imperative recorder. Typed loosely: this path only runs on a
  // native dev/build target, and the API surface is validated at runtime there.
  const Audio = (await import('expo-audio')) as unknown as {
    AudioModule: { requestRecordingPermissionsAsync: () => Promise<{ granted: boolean }> };
    AudioRecorder: new (preset: unknown) => {
      prepareToRecordAsync: () => Promise<void>;
      record: () => void;
      stop: () => Promise<void>;
      uri: string | null;
    };
    RecordingPresets: { HIGH_QUALITY: unknown };
  };
  await Audio.AudioModule.requestRecordingPermissionsAsync();
  const recorder = new Audio.AudioRecorder(Audio.RecordingPresets.HIGH_QUALITY);
  await recorder.prepareToRecordAsync();
  recorder.record();
  await new Promise((r) => setTimeout(r, maxMs));
  await recorder.stop();
  return recorder.uri ? { uri: recorder.uri, mime: 'audio/m4a' } : null;
}

/** POST recorded audio to the ASR endpoint. */
export async function transcribe(
  audio: AudioInput,
  language: Language = 'EN'
): Promise<TranscriptionResult> {
  if (!has.asrEndpoint) {
    return { text: '', language, confidence: 0 };
  }
  const form = new FormData();
  form.append('language', BCP47[language]);
  form.append('file', { uri: audio.uri, name: 'speech.m4a', type: audio.mime ?? 'audio/m4a' } as unknown as Blob);
  const res = await fetchWithTimeout(config.asrApiUrl, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(`ASR ${res.status}`);
  const data = await res.json();
  return {
    text: data.text ?? data.transcript ?? '',
    language,
    confidence: data.confidence ?? 1,
  };
}

/** Whether any voice-input path exists on this platform/config. */
export function voiceInputAvailable(): boolean {
  return liveAsrAvailable() || has.asrEndpoint;
}
