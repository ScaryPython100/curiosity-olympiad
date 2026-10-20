"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { SpeakButton } from "@/components/ReadAloud";

/** Kuppu's face (4.6 KB). `mood` only changes the little animation. */
export function KuppuAvatar({
  size = 48,
  mood = "calm",
  className = "",
}: {
  size?: number;
  mood?: "calm" | "happy" | "think";
  className?: string;
}) {
  const motion = mood === "happy" ? "kuppu-hop" : mood === "think" ? "kuppu-tilt" : "";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static image; next/image would add weight
    <img
      src="/kuppu/face-128.webp"
      width={size}
      height={size}
      alt=""
      aria-hidden
      draggable={false}
      style={{ width: size, height: size }}
      className={`shrink-0 max-w-none rounded-full bg-[#143867] ring-2 ring-[#ea580c] object-cover select-none ${motion} ${className}`}
    />
  );
}

/**
 * Kuppu with a speech bubble. The text is in the student's language, so the
 * speaker reads it in that language (it hides if the phone has no voice for it).
 */
export function KuppuBubble({
  children,
  speech,
  mood = "calm",
  size = 48,
  action,
  className = "",
}: {
  children: ReactNode;
  /** Text for the speaker button. */
  speech?: string;
  mood?: "calm" | "happy" | "think";
  size?: number;
  action?: ReactNode;
  className?: string;
}) {
  const { language } = useLanguage();
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <KuppuAvatar size={size} mood={mood} />
      <div className="kuppu-bubble relative flex-1 min-w-0 bg-white border-2 border-[#143867]/15 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 text-sm font-bold text-[#143867] leading-snug">{children}</div>
          {speech && <SpeakButton getText={() => speech} lang={language} className="!w-9 !h-9 -mr-1 -mt-0.5" />}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

const noSubscribe = () => () => {};

/**
 * A one-time tip from Kuppu. Once the student taps "Got it" it stays hidden
 * on this phone (remembered under `storageKey`).
 */
export function KuppuTip({ storageKey, text }: { storageKey: string; text: string }) {
  const { t } = useLanguage();
  // Hidden on the server; on the phone, hidden once it was dismissed before.
  const seenBefore = useSyncExternalStore(
    noSubscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) === "done";
      } catch {
        return false;
      }
    },
    () => true
  );
  const [hidden, setHidden] = useState(false);
  if (seenBefore || hidden) return null;
  return (
    <KuppuBubble
      speech={text}
      mood="happy"
      className="feedback-in"
      action={
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(storageKey, "done");
            } catch {}
            setHidden(true);
          }}
          className="min-h-[40px] px-4 rounded-xl bg-[#143867] text-white text-xs font-black active:scale-95 transition-transform"
        >
          {t.kuppu.got_it}
        </button>
      }
    >
      {text}
    </KuppuBubble>
  );
}
