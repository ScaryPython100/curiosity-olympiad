"use client";

import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  canSpeak,
  getActiveSpeechId,
  speak,
  stopSpeaking,
  subscribeSpeech,
  watchVoices,
  type SpeechLang,
} from "@/utils/speech";

/** True while this button's text is being read. */
function useIsSpeaking(id: string) {
  return useSyncExternalStore(subscribeSpeech, () => getActiveSpeechId() === id, () => false);
}

/** Whether the phone has a voice for `lang` (false on the server and until the page loads). */
function useCanSpeak(lang: SpeechLang) {
  return useSyncExternalStore(watchVoices, () => canSpeak(lang), () => false);
}

/**
 * Small 🔊 button. Tap to hear `getText()`, tap again to stop. Hidden when the
 * phone cannot read the language.
 */
export function SpeakButton({
  getText,
  lang = "en",
  tone = "light",
  className = "",
  speechId,
}: {
  getText: () => string;
  lang?: SpeechLang;
  tone?: "light" | "dark";
  className?: string;
  /** Lets a wrapper share the id, to highlight its text while speaking. */
  speechId?: string;
}) {
  const { t } = useLanguage();
  const ownId = useId();
  const id = speechId ?? ownId;
  const speaking = useIsSpeaking(id);
  const available = useCanSpeak(lang);
  if (!available) return null;

  const colors =
    tone === "dark"
      ? speaking
        ? "bg-amber-400 text-gray-950"
        : "bg-white/10 text-sky-200 hover:bg-white/20"
      : speaking
        ? "bg-amber-400 text-amber-950"
        : "bg-[#eef2f7] text-[#143867] hover:bg-[#dde6f1]";

  return (
    <button
      type="button"
      data-speak-button
      onClick={(e) => {
        e.stopPropagation();
        if (speaking) stopSpeaking();
        else speak(id, getText(), lang);
      }}
      aria-label={speaking ? t.learn.stop : t.learn.listen}
      aria-pressed={speaking}
      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 cursor-pointer ${colors} ${className}`}
    >
      <span className="material-symbols-outlined text-xl" aria-hidden>
        {speaking ? "stop_circle" : "volume_up"}
      </span>
    </button>
  );
}

/**
 * Wraps text with a speaker button; the text is highlighted while it is read.
 * `text` defaults to the wrapped text itself.
 */
export function ReadAloud({
  children,
  text,
  lang = "en",
  className = "",
}: {
  children: ReactNode;
  text?: string;
  lang?: SpeechLang;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const speaking = useIsSpeaking(`${id}-wrap`);
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div
        ref={ref}
        className={`flex-1 min-w-0 rounded-lg transition-colors ${speaking ? "bg-amber-100 ring-2 ring-amber-300" : ""}`}
      >
        {children}
      </div>
      <SpeakButton speechId={`${id}-wrap`} getText={() => text ?? ref.current?.innerText ?? ""} lang={lang} />
    </div>
  );
}

/**
 * Speaker for an experiment's hint strip. Reads the strip's text (everything
 * in its parent except speaker buttons) when tapped.
 */
export function ObservationSpeaker() {
  const anchor = useRef<HTMLSpanElement>(null);
  const readStrip = () => {
    const strip = anchor.current?.parentElement;
    if (!strip) return "";
    return Array.from(strip.children)
      .filter((el) => el !== anchor.current && !el.hasAttribute("data-speak-button"))
      .map((el) => (el as HTMLElement).innerText)
      .join(". ");
  };
  return (
    <span ref={anchor} className="absolute right-1.5 top-1/2 -translate-y-1/2">
      <SpeakButton getText={readStrip} tone="dark" className="!w-9 !h-9" />
    </span>
  );
}
