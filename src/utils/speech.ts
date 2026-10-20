/**
 * Read-aloud using the phone's built-in voice (Web Speech API).
 * Nothing is downloaded and it costs nothing. If a phone has no voice for a
 * language, the speaker button is hidden instead of reading in the wrong accent.
 */

export type SpeechLang = "en" | "hi" | "te" | "ta" | "kn" | "ml" | "mr" | "bn" | "gu";

const LOCALE: Record<SpeechLang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
};

export interface VoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

const normLang = (l: string) => l.toLowerCase().replace("_", "-");

/**
 * Best installed voice for a language: the India locale first (so English is
 * read with an Indian accent), then any voice of that language. Voices stored
 * on the phone are preferred because they also work without internet.
 */
export function pickVoice<V extends VoiceLike>(voices: V[], lang: SpeechLang): V | null {
  const exact = voices.filter((v) => normLang(v.lang) === LOCALE[lang].toLowerCase());
  const pool = exact.length ? exact : voices.filter((v) => normLang(v.lang).split("-")[0] === lang);
  if (!pool.length) return null;
  return pool.find((v) => v.localService) ?? pool[0];
}

/**
 * Splits text into short pieces. Some Android browsers stop a long utterance
 * part-way, so each piece is spoken on its own.
 */
export function speechChunks(text: string, max = 180): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    let rest = sentence;
    while (rest.length > max) {
      const cut = Math.max(rest.lastIndexOf(", ", max), rest.lastIndexOf(" ", max));
      const at = cut > 0 ? cut + 1 : max;
      chunks.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (!rest) continue;
    const last = chunks[chunks.length - 1];
    if (last !== undefined && last.length + rest.length + 1 <= max && /[.!?।]$/.test(last)) {
      chunks[chunks.length - 1] = `${last} ${rest}`;
    } else {
      chunks.push(rest);
    }
  }
  return chunks;
}

// ---- Browser playback: one thing speaks at a time ----

let activeId: string | null = null;
let runToken = 0;
const listeners = new Set<() => void>();

function setActive(id: string | null) {
  activeId = id;
  listeners.forEach((l) => l());
}

export function subscribeSpeech(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getActiveSpeechId() {
  return activeId;
}

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

/** Voices load late on some phones; call `onChange` when the list arrives. */
export function watchVoices(onChange: () => void) {
  if (!speechSupported()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

/**
 * Whether this phone can read the language. While the voice list is still
 * empty, English is assumed to work (the browser's default voice) and other
 * languages are not.
 */
export function canSpeak(lang: SpeechLang) {
  if (!speechSupported()) return false;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return lang === "en";
  return pickVoice(voices, lang) !== null;
}

export function stopSpeaking() {
  if (!speechSupported()) return;
  runToken++;
  window.speechSynthesis.cancel();
  setActive(null);
}

/** Reads `text` aloud. Returns false if this phone cannot read that language. */
export function speak(id: string, text: string, lang: SpeechLang): boolean {
  if (!speechSupported() || !text.trim() || !canSpeak(lang)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const token = ++runToken;
  const voice = pickVoice(synth.getVoices(), lang);
  const chunks = speechChunks(text);
  const done = () => {
    if (token === runToken) setActive(null);
  };
  chunks.forEach((chunk, i) => {
    const u = new SpeechSynthesisUtterance(chunk);
    u.lang = voice?.lang ?? LOCALE[lang];
    if (voice) u.voice = voice as SpeechSynthesisVoice;
    u.rate = 0.9;
    u.onerror = done;
    if (i === chunks.length - 1) u.onend = done;
    synth.speak(u);
  });
  setActive(id);
  return true;
}
