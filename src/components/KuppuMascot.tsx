"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export type KuppuState = "idle" | "crawling" | "climbing" | "scampering";

export interface KuppuMascotProps {
  userName?: string;
  aiSpeech?: string;
  onStateChange?: (state: KuppuState) => void;
}

interface MascotPosition {
  x: number; // viewport percentage (10 to 88)
  y: number; // viewport percentage (15 to 85)
  facing: "left" | "right";
}

// Open, safe zones around the dashboard viewport where Kuppu can explore freely
const SAFE_EXPLORATION_ZONES = [
  { x: 82, y: 75, label: "Bottom Right" },
  { x: 15, y: 78, label: "Bottom Left" },
  { x: 82, y: 28, label: "Top Right" },
  { x: 15, y: 28, label: "Top Left" },
  { x: 85, y: 50, label: "Mid Right" },
  { x: 12, y: 50, label: "Mid Left" },
  { x: 65, y: 80, label: "Bottom Center Right" },
  { x: 35, y: 80, label: "Bottom Center Left" },
  { x: 70, y: 22, label: "Top Center Right" },
  { x: 30, y: 22, label: "Top Center Left" },
];

const SCAMPER_DIALOGS = [
  "Whoops! Scampering out of your way! 🐵💨",
  "Aha! Leaping to a free branch! 🌿",
  "Ha-ha! Swinging over so you can click! 🦘",
  "Curiosity never stops! Exploring over here! 🔭",
  "Ooh-ooh! Making room for you, Explorer! ✨"
];

export default function KuppuMascot({
  userName = "Explorer",
  aiSpeech,
  onStateChange
}: KuppuMascotProps) {
  const [state, setState] = useState<KuppuState>("idle");
  const [pos, setPos] = useState<MascotPosition>({
    x: 82,
    y: 75,
    facing: "left"
  });
  const [dialog, setDialog] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const lastScrollY = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notifyStateChange = useCallback(
    (newState: KuppuState) => {
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // Play subtle audio squeak on interaction
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
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio context fallback
    }
  }, []);

  // 1. Move Kuppu to a new random safe coordinate across the screen
  const moveToRandomCoordinate = useCallback(
    (reason: "click" | "roam" | "scroll" = "roam") => {
      setPos((prev) => {
        // Pick a coordinate that is sufficiently different from current position
        const candidates = SAFE_EXPLORATION_ZONES.filter(
          (z) => Math.abs(z.x - prev.x) > 15 || Math.abs(z.y - prev.y) > 15
        );
        const nextZone =
          candidates[Math.floor(Math.random() * candidates.length)] ||
          SAFE_EXPLORATION_ZONES[0];

        const nextFacing: "left" | "right" =
          nextZone.x > prev.x ? "right" : "left";

        return {
          x: nextZone.x,
          y: nextZone.y,
          facing: nextFacing
        };
      });

      if (reason === "click") {
        playInteractionAudio(640, 920);
        notifyStateChange("scampering");
        const msg =
          SCAMPER_DIALOGS[Math.floor(Math.random() * SCAMPER_DIALOGS.length)];
        setDialog(msg);
        setTimeout(() => setDialog(null), 3500);
      } else {
        notifyStateChange("crawling");
      }

      setTimeout(() => {
        notifyStateChange("idle");
      }, 1400);
    },
    [notifyStateChange, playInteractionAudio]
  );

  // 2. Click / Touch scamper evasion
  const handleScamper = useCallback(
    (e?: React.MouseEvent | React.TouchEvent) => {
      if (e) e.stopPropagation();
      moveToRandomCoordinate("click");
    },
    [moveToRandomCoordinate]
  );

  // 3. Scroll Listener: When user scrolls, Kuppu climbs smoothly
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      if (Math.abs(delta) > 25 && state === "idle") {
        lastScrollY.current = currentScrollY;
        notifyStateChange("climbing");

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          notifyStateChange("idle");
        }, 800);
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

  // 4. Free-roaming interval: Kuppu crawls to a new spot every 12 seconds so he feels truly alive!
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === "idle") {
        moveToRandomCoordinate("roam");
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [state, moveToRandomCoordinate]);

  // 5. Authentic monkey blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Determine dynamic animation classes based on current state
  const getContainerAnimation = () => {
    switch (state) {
      case "scampering":
        return "scale-110 -translate-y-6 rotate-12 transition-all duration-1000 ease-in-out";
      case "crawling":
        return "scale-100 -translate-y-2 rotate-3 transition-all duration-[1400ms] ease-in-out";
      case "climbing":
        return "scale-105 -translate-y-4 -rotate-6 transition-all duration-500 ease-out";
      case "idle":
      default:
        return "scale-100 translate-y-0 rotate-0 transition-all duration-700 ease-in-out";
    }
  };

  return (
    /*
      FULL-SCREEN FREE OVERLAY
      pointer-events: none globally so clicks fall through to dashboard cards & buttons.
      pointer-events: auto explicitly on Kuppu so he can be clicked to scamper away!
    */
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden select-none">
      <div
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: "translate(-50%, -50%)"
        }}
        className={`absolute pointer-events-auto cursor-pointer group flex flex-col items-center ${getContainerAnimation()}`}
        onClick={handleScamper}
        onTouchStart={handleScamper}
        role="button"
        tabIndex={0}
        aria-label="Kuppu the Monkey Mascot - Click to make him scamper freely around the screen"
        title="Click Kuppu to make him scamper out of your way!"
      >
        {/* Floating AI Assistant Speech or Scamper Dialogue Bubble */}
        {(aiSpeech || dialog) && (
          <div
            className={`absolute bottom-full mb-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border-2 border-[#143867] animate-in fade-in zoom-in-95 duration-200 z-50 text-left ${
              pos.x > 50 ? "right-0" : "left-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="px-2 py-0.5 bg-amber-100 text-[#143867] text-[10px] font-black rounded-full uppercase tracking-wider">
                {aiSpeech ? "🐵 Kuppu AI Guide" : "🐵 Kuppu Scampering! 💨"}
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
            <p className="text-xs text-gray-800 font-bold leading-snug">
              {aiSpeech || dialog}
            </p>
          </div>
        )}

        {/* 
          AUTHENTIC, CUTE CARTOON MONKEY / LANGUR ILLUSTRATION (SVG)
          Zero square boxes, zero circle borders, zero geometric robot parts.
          Smooth, organic curves, fluffy ears, expressive face, hands with fingers, and curling tail!
        */}
        <div
          style={{
            transform: pos.facing === "left" ? "scaleX(1)" : "scaleX(-1)"
          }}
          className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 transition-transform duration-300 group-hover:scale-110 ${
            state === "idle" ? "animate-pulse" : ""
          }`}
        >
          <svg
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] overflow-visible"
          >
            {/* ==================== 1. LONG SWISHING CARTOON MONKEY TAIL ==================== */}
            <path
              d="M 50 115 C 20 125, 5 95, 22 75 C 38 58, 55 75, 45 95"
              stroke="#5D4037"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
              className={state === "crawling" || state === "scampering" ? "animate-spin" : ""}
            />
            <path
              d="M 50 115 C 20 125, 5 95, 22 75 C 38 58, 55 75, 45 95"
              stroke="#8D6E63"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* ==================== 2. BACK FOOT WITH CLIMBING TOES ==================== */}
            <path
              d="M 58 115 C 50 130, 35 135, 30 132 C 28 130, 32 125, 40 120"
              fill="#795548"
            />
            <circle cx="28" cy="131" r="3.5" fill="#4E342E" />
            <circle cx="33" cy="135" r="3.5" fill="#4E342E" />
            <circle cx="39" cy="136" r="3.5" fill="#4E342E" />

            {/* ==================== 3. CUTE FURRY MONKEY BODY (TORSO) ==================== */}
            <path
              d="M 60 75 C 48 85, 48 115, 65 125 C 82 135, 105 125, 108 105 C 112 85, 95 75, 60 75 Z"
              fill="#8D6E63"
            />
            {/* Lighter cream/peach monkey belly patch */}
            <path
              d="M 68 85 C 60 92, 60 112, 72 118 C 85 124, 98 116, 98 102 C 98 90, 85 82, 68 85 Z"
              fill="#FFE0B2"
            />

            {/* ==================== 4. FRONT FOOT WITH CLIMBING TOES ==================== */}
            <path
              d="M 92 120 C 98 135, 112 138, 118 136 C 120 134, 116 128, 108 122"
              fill="#795548"
            />
            <circle cx="119" cy="135" r="3.5" fill="#4E342E" />
            <circle cx="114" cy="139" r="3.5" fill="#4E342E" />
            <circle cx="108" cy="140" r="3.5" fill="#4E342E" />

            {/* ==================== 5. DAPPER AGASTYA ORANGE SCARF ==================== */}
            <path
              d="M 62 76 Q 80 84, 104 76 L 115 92 L 95 84 Z"
              fill="#F97316"
            />
            <path
              d="M 64 74 Q 82 82, 102 74"
              stroke="#EA580C"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* ==================== 6. CLIMBING ARMS & REAL MONKEY HANDS (WITH FINGERS!) ==================== */}
            {/* Left Arm & Hand */}
            <path
              d="M 64 85 C 48 78, 38 60, 44 48"
              stroke="#8D6E63"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Cute palm and 4 little fingers */}
            <circle cx="44" cy="46" r="6" fill="#FFE0B2" />
            <circle cx="38" cy="44" r="3" fill="#8D6E63" />
            <circle cx="42" cy="40" r="3" fill="#8D6E63" />
            <circle cx="47" cy="40" r="3" fill="#8D6E63" />
            <circle cx="51" cy="43" r="3" fill="#8D6E63" />

            {/* Right Arm & Hand */}
            <path
              d="M 98 84 C 112 74, 122 58, 116 46"
              stroke="#8D6E63"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Cute palm and 4 little fingers */}
            <circle cx="116" cy="44" r="6" fill="#FFE0B2" />
            <circle cx="110" cy="40" r="3" fill="#8D6E63" />
            <circle cx="115" cy="38" r="3" fill="#8D6E63" />
            <circle cx="120" cy="39" r="3" fill="#8D6E63" />
            <circle cx="123" cy="43" r="3" fill="#8D6E63" />

            {/* ==================== 7. ADORABLE CARTOON MONKEY HEAD & EARS ==================== */}
            {/* Left Ear */}
            <circle cx="52" cy="48" r="13" fill="#8D6E63" />
            <circle cx="52" cy="48" r="7.5" fill="#FFAB91" />

            {/* Right Ear */}
            <circle cx="108" cy="48" r="13" fill="#8D6E63" />
            <circle cx="108" cy="48" r="7.5" fill="#FFAB91" />

            {/* Warm Brownish-Grey Furry Monkey Head */}
            <path
              d="M 56 46 C 52 28, 72 18, 80 18 C 88 18, 108 28, 104 46 C 108 62, 98 76, 80 76 C 62 76, 52 62, 56 46 Z"
              fill="#8D6E63"
            />

            {/* Cute Tuft of Monkey Hair on top of head */}
            <path
              d="M 76 20 C 74 10, 78 6, 80 5 C 82 8, 84 14, 82 20"
              fill="#6D4C41"
            />
            <path
              d="M 80 19 C 83 11, 88 8, 90 7 C 89 11, 86 16, 84 20"
              fill="#6D4C41"
            />

            {/* Heart-Shaped Light Peach/Cream Monkey Face Mask (Authentic Cartoon Look) */}
            <path
              d="M 63 42 C 63 32, 75 30, 80 37 C 85 30, 97 32, 97 42 C 100 55, 94 68, 80 68 C 66 68, 60 55, 63 42 Z"
              fill="#FFE0B2"
            />

            {/* ==================== 8. EXPRESSIVE CARTOON EYES & EYEBROWS ==================== */}
            {/* Left Eye */}
            <circle
              cx="71"
              cy="46"
              r={isBlinking ? "1" : "5.5"}
              fill="#3E2723"
              className="transition-all duration-100"
            />
            {!isBlinking && (
              <>
                <circle cx="69.5" cy="44.5" r="1.8" fill="#FFFFFF" />
                <circle cx="72.5" cy="47.5" r="0.8" fill="#FFFFFF" />
              </>
            )}
            {/* Cute Curved Eyebrow */}
            <path
              d="M 66 39 Q 71 36, 76 39"
              stroke="#5D4037"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Right Eye */}
            <circle
              cx="89"
              cy="46"
              r={isBlinking ? "1" : "5.5"}
              fill="#3E2723"
              className="transition-all duration-100"
            />
            {!isBlinking && (
              <>
                <circle cx="87.5" cy="44.5" r="1.8" fill="#FFFFFF" />
                <circle cx="90.5" cy="47.5" r="0.8" fill="#FFFFFF" />
              </>
            )}
            {/* Cute Curved Eyebrow */}
            <path
              d="M 84 39 Q 89 36, 94 39"
              stroke="#5D4037"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* ==================== 9. BUTTON NOSE & HAPPY SMILING MOUTH WITH TONGUE ==================== */}
            {/* Adorable little oval monkey nose */}
            <ellipse cx="80" cy="53" rx="3.5" ry="2.2" fill="#6D4C41" />
            <circle cx="79" cy="52.2" r="0.8" fill="#FFE0B2" opacity="0.6" />

            {/* Cheerful wide cartoon smile */}
            <path
              d="M 72 58 Q 80 65, 88 58"
              stroke="#5D4037"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cute pink tongue peeking out */}
            <path
              d="M 77 61 Q 80 65, 83 61 Z"
              fill="#FF8A80"
            />

            {/* Rosy cheek blush */}
            <ellipse cx="64" cy="54" rx="4" ry="2.5" fill="#FFAB91" opacity="0.5" />
            <ellipse cx="96" cy="54" rx="4" ry="2.5" fill="#FFAB91" opacity="0.5" />
          </svg>
        </div>

        {/* Floating playful helper badge on hover */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-1 bg-[#143867]/95 text-[#ffe16d] text-[10px] font-black rounded-full shadow-lg mt-1 whitespace-nowrap pointer-events-none">
          Click me to scamper over! 🐵💨
        </span>
      </div>
    </div>
  );
}
