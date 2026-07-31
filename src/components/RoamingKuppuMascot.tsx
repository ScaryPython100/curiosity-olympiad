"use client";

import React, { useState, useEffect } from "react";

export type KuppuMood = "aah" | "aha" | "haha";

interface RoamingKuppuProps {
  initialMood?: KuppuMood;
  userName?: string;
}

interface Position {
  id: number;
  style: React.CSSProperties;
  facing: "left" | "right";
  pose: "climbing-right" | "climbing-left" | "crawling-bottom" | "perching-top";
}

// 6 organic positions around the edges of the viewport so Kuppu moves like a playful climbing creature
const POSITIONS: Position[] = [
  {
    id: 0,
    style: { bottom: "24px", right: "32px" },
    facing: "left",
    pose: "crawling-bottom"
  },
  {
    id: 1,
    style: { bottom: "35%", right: "12px" },
    facing: "left",
    pose: "climbing-right"
  },
  {
    id: 2,
    style: { top: "95px", right: "40px" },
    facing: "left",
    pose: "perching-top"
  },
  {
    id: 3,
    style: { top: "115px", left: "28px" },
    facing: "right",
    pose: "perching-top"
  },
  {
    id: 4,
    style: { bottom: "40%", left: "12px" },
    facing: "right",
    pose: "climbing-left"
  },
  {
    id: 5,
    style: { bottom: "24px", left: "36px" },
    facing: "right",
    pose: "crawling-bottom"
  }
];

const DODGE_MESSAGES = [
  "Whoops! Let me scamper out of your way! 🐵💨",
  "Aha! Moving over so you can click! 🌿",
  "Ha-ha! Jumping to another branch! 🦘",
  "Don't mind me—just exploring the campus! 🔬",
  "Out of your way, Explorer! Keep going! 🚀"
];

export default function RoamingKuppuMascot({
  userName = "Explorer"
}: RoamingKuppuProps) {
  const [posIdx, setPosIdx] = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [isScampering, setIsScampering] = useState(false);

  // Smoothly crawl/climb to a new spot periodically
  useEffect(() => {
    const timer = setInterval(() => {
      handleMoveToRandomSpot(false);
    }, 12000);
    return () => clearInterval(timer);
  }, [posIdx]);

  const playSqueak = (freq1 = 640, freq2 = 880) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.setValueAtTime(freq2, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio fallback
    }
  };

  // When student clicks Kuppu, he immediately scampers out of their way if he was blocking anything!
  const handleDodgeAndSecret = () => {
    playSqueak(700, 960);
    setIsScampering(true);
    setShowSpeech(true);
    setMsgIdx((prev) => (prev + 1) % DODGE_MESSAGES.length);

    // Pick a position far away from the current spot
    setPosIdx((prev) => {
      const candidates = POSITIONS.map((_, i) => i).filter((i) => i !== prev);
      return candidates[Math.floor(Math.random() * candidates.length)];
    });

    setTimeout(() => {
      setIsScampering(false);
    }, 900);

    // Auto-hide the dodge speech bubble after 4 seconds
    setTimeout(() => {
      setShowSpeech(false);
    }, 4000);
  };

  const handleMoveToRandomSpot = (playAudio = true) => {
    if (playAudio) playSqueak(520, 740);
    setIsScampering(true);
    setPosIdx((prev) => {
      let next = Math.floor(Math.random() * POSITIONS.length);
      if (next === prev) next = (prev + 1) % POSITIONS.length;
      return next;
    });
    setTimeout(() => {
      setIsScampering(false);
    }, 900);
  };

  const currentPos = POSITIONS[posIdx];

  return (
    <div
      style={currentPos.style}
      className={`fixed z-50 pointer-events-auto transition-all duration-1000 ease-in-out ${
        isScampering ? "scale-110 -translate-y-6 rotate-6" : "scale-100 translate-y-0 rotate-0"
      }`}
    >
      {/* Speech Bubble when dodging out of the student's way */}
      {showSpeech && (
        <div
          className={`absolute bottom-full mb-3 w-56 bg-white/95 backdrop-blur-xs rounded-2xl p-3 shadow-xl border-2 border-[#143867] animate-in fade-in zoom-in-95 duration-200 z-50 text-left ${
            currentPos.facing === "left" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="px-2 py-0.5 bg-amber-100 text-[#143867] text-[9px] font-black rounded-full uppercase">
              Kuppu Dodging! 💨
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeech(false);
              }}
              className="text-gray-400 hover:text-gray-600 font-bold px-1 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-gray-800 font-bold leading-snug">
            {DODGE_MESSAGES[msgIdx]}
          </p>
        </div>
      )}

      {/* 
          PURE TRANSPARENT MONKEY CHARACTER (NO BACKGROUND, NO BOX, NO SHAPE!)
          Expressive vector SVG langur that crawls/climbs and moves out of the way on click.
      */}
      <div
        onClick={handleDodgeAndSecret}
        className="cursor-pointer group flex flex-col items-center select-none"
        title="Click me and I'll scamper out of your way!"
      >
        <div
          style={{
            transform: currentPos.facing === "left" ? "scaleX(1)" : "scaleX(-1)"
          }}
          className={`relative w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-300 group-hover:scale-110 ${
            isScampering ? "animate-bounce" : ""
          }`}
        >
          {/* Adorable SVG Cartoon Grey Langur from Andhra Pradesh with Orange Agastya Scarf */}
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

            {/* Cute expressive eyes */}
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

        {/* Tiny subtle text prompt when hovering so kids know he moves out of the way */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-0.5 bg-[#143867]/90 text-white text-[9px] font-black rounded-full shadow-md mt-1 whitespace-nowrap">
          Click me to move over! 🐵💨
        </span>
      </div>
    </div>
  );
}
