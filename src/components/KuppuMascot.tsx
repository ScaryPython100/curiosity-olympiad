"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export type KuppuState = "idle" | "climbing" | "bounding" | "scampering";

export interface KuppuMascotProps {
  userName?: string;
  aiSpeech?: string;
  onStateChange?: (state: KuppuState) => void;
}

interface QuadrantPosition {
  id: number;
  style: React.CSSProperties;
  facing: "left" | "right";
  label: string;
}

// 6 non-obstructive quadrants around viewport edges and major grid cards
const QUADRANTS: QuadrantPosition[] = [
  {
    id: 0,
    style: { bottom: "28px", right: "32px" },
    facing: "left",
    label: "Bottom-Right Edge"
  },
  {
    id: 1,
    style: { top: "115px", right: "36px" },
    facing: "left",
    label: "Top-Right Card Edge"
  },
  {
    id: 2,
    style: { bottom: "28px", left: "28px" },
    facing: "right",
    label: "Bottom-Left Edge"
  },
  {
    id: 3,
    style: { top: "115px", left: "28px" },
    facing: "right",
    label: "Top-Left Card Edge"
  },
  {
    id: 4,
    style: { top: "45%", right: "20px" },
    facing: "left",
    label: "Mid-Right Edge"
  },
  {
    id: 5,
    style: { top: "45%", left: "20px" },
    facing: "right",
    label: "Mid-Left Edge"
  }
];

const SCAMPER_DIALOGS = [
  "Whoops! Let me scamper out of your way! 🐵💨",
  "Aha! Bounding to an empty corner! 🌿",
  "Ha-ha! Swinging out so you can click! 🦘",
  "Out of your way, Explorer! Keep going! 🚀",
  "Dodging over! Curiosity never stops! 🔬"
];

export default function KuppuMascot({
  userName = "Explorer",
  aiSpeech,
  onStateChange
}: KuppuMascotProps) {
  const [state, setState] = useState<KuppuState>("idle");
  const [quadIndex, setQuadIndex] = useState<number>(0);
  const [dialog, setDialog] = useState<string | null>(null);
  const [scrollDelta, setScrollDelta] = useState<number>(0);
  const lastScrollY = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scamperTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notifyStateChange = useCallback(
    (newState: KuppuState) => {
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Play subtle web audio sound effects for interaction
  const playInteractionAudio = useCallback((freq1: number, freq2: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.setValueAtTime(freq2, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Ignore audio context errors
    }
  }, []);

  // 1. Scroll Listener: Trigger Climbing / Bounding State when scrolling up or down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      if (Math.abs(delta) > 15 && state === "idle") {
        lastScrollY.current = currentScrollY;
        setScrollDelta(delta);

        // Shift into climbing or bounding state
        const nextState: KuppuState = Math.abs(delta) > 60 ? "bounding" : "climbing";
        notifyStateChange(nextState);

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          notifyStateChange("idle");
          setScrollDelta(0);
        }, 850);
      } else {
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [state, notifyStateChange]);

  // 2. Scamper (Click-to-Move) Handler: Evasive animation to an empty quadrant
  const handleScamperMove = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (e) {
        e.stopPropagation();
      }
      playInteractionAudio(680, 960);
      notifyStateChange("scampering");

      // Pick a random empty quadrant different from current position
      setQuadIndex((prev) => {
        const candidates = QUADRANTS.map((_, idx) => idx).filter((idx) => idx !== prev);
        return candidates[Math.floor(Math.random() * candidates.length)];
      });

      // Display short evasive dialogue
      const randomMsg =
        SCAMPER_DIALOGS[Math.floor(Math.random() * SCAMPER_DIALOGS.length)];
      setDialog(randomMsg);

      if (scamperTimeoutRef.current) clearTimeout(scamperTimeoutRef.current);
      scamperTimeoutRef.current = setTimeout(() => {
        notifyStateChange("idle");
      }, 900);

      // Auto-clear dialogue bubble after 3.5s
      setTimeout(() => {
        setDialog(null);
      }, 3500);
    },
    [notifyStateChange, playInteractionAudio]
  );

  // 3. Periodic idle roaming if inactive for 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === "idle") {
        handleScamperMove();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [state, handleScamperMove]);

  const currentQuad = QUADRANTS[quadIndex];

  // Dynamic CSS transformations for active physical states
  const getAnimationClasses = () => {
    switch (state) {
      case "scampering":
        return "scale-110 -translate-y-8 rotate-12 transition-all duration-700 ease-in-out";
      case "bounding":
        return "scale-105 -translate-y-5 rotate-6 transition-all duration-500 ease-out";
      case "climbing":
        return "scale-100 -translate-y-3 -rotate-3 transition-all duration-300 ease-out";
      case "idle":
      default:
        return "scale-100 translate-y-0 rotate-0 transition-all duration-700 ease-in-out";
    }
  };

  // Adjust Y offset slightly based on scroll delta during climbing
  const scrollOffsetStyle: React.CSSProperties =
    state === "climbing" || state === "bounding"
      ? {
          transform: `translateY(${Math.max(-20, Math.min(20, scrollDelta * 0.2))}px)`
        }
      : {};

  return (
    /* 
      1. COMPONENT ARCHITECTURE & ISOLATION:
      Fixed, screen-spanning overlay with pointer-events: none globally.
      Only Kuppu's character wrapper has pointer-events: auto explicitly.
    */
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      <div
        style={{
          ...currentQuad.style,
          ...scrollOffsetStyle
        }}
        className={`absolute pointer-events-auto cursor-pointer group flex flex-col items-center ${getAnimationClasses()}`}
        onClick={handleScamperMove}
        onTouchStart={handleScamperMove}
        role="button"
        tabIndex={0}
        aria-label="Kuppu Mascot - Click to scamper to an empty screen quadrant"
        title="Click Kuppu to move him out of your way!"
      >
        {/* AI Assistant Overlay Bubble or Scamper Dialogue */}
        {(aiSpeech || dialog) && (
          <div
            className={`absolute bottom-full mb-3 w-60 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border-2 border-[#143867] animate-in fade-in zoom-in-95 duration-200 z-50 text-left ${
              currentQuad.facing === "left" ? "right-0" : "left-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="px-2 py-0.5 bg-amber-100 text-[#143867] text-[9px] font-black rounded-full uppercase tracking-wider">
                {aiSpeech ? "🐵 Kuppu AI Assistant" : "🐵 Kuppu Scampering! 💨"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDialog(null);
                }}
                className="text-gray-400 hover:text-gray-700 font-bold px-1 text-xs"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-gray-800 font-bold leading-snug">
              {aiSpeech || dialog}
            </p>
          </div>
        )}

        {/* 
          3. ASSET & RENDERING BASELINE:
          Pure transparent vector SVG character with zero background, zero box, and zero border.
          Responsive sizing: w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
        */}
        <div
          style={{
            transform: currentQuad.facing === "left" ? "scaleX(1)" : "scaleX(-1)"
          }}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 transition-transform duration-300 group-hover:scale-110 ${
            state === "idle" ? "animate-pulse" : ""
          }`}
        >
          {/* Adorable SVG Cartoon Grey Langur from Andhra Pradesh with Orange Scarf & Blue Vest */}
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-xl overflow-visible"
          >
            {/* Curved climbing monkey tail */}
            <path
              d="M30 85 C10 85 5 60 20 50 C30 42 40 55 35 68"
              stroke="#64748B"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M30 85 C10 85 5 60 20 50 C30 42 40 55 35 68"
              stroke="#475569"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Back climbing leg & foot */}
            <path
              d="M45 78 L35 95 L28 95"
              stroke="#475569"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="27" cy="95" r="4" fill="#1E293B" />

            {/* Monkey Torso (Grey fur) */}
            <ellipse cx="60" cy="72" rx="20" ry="24" fill="#94A3B8" />
            {/* Lighter belly patch */}
            <ellipse cx="64" cy="74" rx="13" ry="17" fill="#E2E8F0" />

            {/* Blue Agastya Science Vest */}
            <path
              d="M44 58 C44 58 54 75 58 84 L74 84 C78 75 80 58 80 58 Z"
              fill="#1D4ED8"
            />
            {/* Vest pocket & collar detail */}
            <path d="M52 58 L52 82 M72 58 L72 82" stroke="#1E40AF" strokeWidth="2" />
            <circle cx="68" cy="72" r="3" fill="#ffe16d" />

            {/* Front climbing leg & foot */}
            <path
              d="M68 85 L76 102 L84 102"
              stroke="#475569"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="85" cy="102" r="4" fill="#1E293B" />

            {/* Orange Agastya Scarf around neck */}
            <path
              d="M46 52 Q60 58 78 52 L88 64 L75 58 Z"
              fill="#F97316"
            />
            <path
              d="M48 50 Q60 56 76 50"
              stroke="#EA580C"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Climbing Arms */}
            <path
              d="M48 62 C32 55 25 40 32 32"
              stroke="#64748B"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="32" cy="32" r="4.5" fill="#1E293B" />

            <path
              d="M74 62 C88 52 95 38 90 28"
              stroke="#64748B"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="90" cy="28" r="4.5" fill="#1E293B" />

            {/* Adorable Grey Langur Head */}
            <circle cx="62" cy="36" r="19" fill="#94A3B8" />
            {/* Fluffy white/grey cheek fur typical of Andhra grey langurs */}
            <path
              d="M42 36 Q38 46 48 50 Q62 55 76 50 Q86 46 82 36 Z"
              fill="#E2E8F0"
            />

            {/* Dark grey langur face mask */}
            <ellipse cx="62" cy="37" rx="12" ry="11" fill="#1E293B" />

            {/* Expressive eyes */}
            <circle cx="57" cy="34" r="3.2" fill="#FFFFFF" />
            <circle cx="67" cy="34" r="3.2" fill="#FFFFFF" />
            <circle cx="58" cy="34" r="1.6" fill="#000000" />
            <circle cx="68" cy="34" r="1.6" fill="#000000" />
            <circle cx="56.5" cy="33" r="0.7" fill="#FFFFFF" />
            <circle cx="66.5" cy="33" r="0.7" fill="#FFFFFF" />

            {/* Smiling mouth & nose */}
            <ellipse cx="62" cy="39.5" rx="2" ry="1.2" fill="#475569" />
            <path
              d="M58 43 Q62 46 66 43"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Round monkey ears */}
            <circle cx="43" cy="34" r="4.5" fill="#475569" />
            <circle cx="81" cy="34" r="4.5" fill="#475569" />
          </svg>
        </div>

        {/* Subtle hover prompt */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2.5 py-0.5 bg-[#143867]/95 text-white text-[9px] font-black rounded-full shadow-md mt-1 whitespace-nowrap pointer-events-none">
          Click me to scamper over! 🐵💨
        </span>
      </div>
    </div>
  );
}
