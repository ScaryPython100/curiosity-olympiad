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
  label: string;
}

// 5 organic positions across the viewport so Kuppu can freely jump around!
const POSITIONS: Position[] = [
  {
    id: 0,
    style: { bottom: "28px", right: "28px" },
    facing: "left",
    label: "Bottom Right Corner"
  },
  {
    id: 1,
    style: { bottom: "28px", left: "28px" },
    facing: "right",
    label: "Bottom Left Corner"
  },
  {
    id: 2,
    style: { top: "110px", right: "36px" },
    facing: "left",
    label: "Top Right Hill"
  },
  {
    id: 3,
    style: { bottom: "180px", right: "36px" },
    facing: "left",
    label: "Mid Right Perch"
  },
  {
    id: 4,
    style: { top: "130px", left: "36px" },
    facing: "right",
    label: "Top Left Branch"
  }
];

const KUPPAM_SCIENCE_SECRETS = [
  "🍌 Kuppu says: Did you know grey langurs in the Kuppam hills can leap over 15 feet between branches?!",
  "🌿 The 172-acre Agastya campus in Kuppam was transformed from barren hills into a rich ecology park!",
  "🔬 'Aah!' is the wonder of asking a question, 'Aha!' is the discovery, and 'Ha-ha!' is the pure joy of science!",
  "🔭 You can see Saturn's rings from the Gurugruha Astronomy Center telescopes in Kuppam!",
  "💡 Never be afraid to make a mistake in an experiment—that is how real scientists invent!",
  "🪐 Light travels at 300,000 kilometers per second—that means sunlight takes 8 minutes to reach Earth!"
];

export default function RoamingKuppuMascot({
  initialMood = "aah",
  userName = "Explorer"
}: RoamingKuppuProps) {
  const [mood, setMood] = useState<KuppuMood>(initialMood);
  const [posIdx, setPosIdx] = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [secretIdx, setSecretIdx] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  // Jump smoothly to a random new position every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleJump();
    }, 15000);
    return () => clearInterval(timer);
  }, [posIdx]);

  const playSound = (freq1 = 520, freq2 = 740) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.setValueAtTime(freq2, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // fallback
    }
  };

  const handleJump = () => {
    setIsJumping(true);
    playSound(600, 850);
    setPosIdx((prev) => {
      let next = Math.floor(Math.random() * POSITIONS.length);
      if (next === prev) next = (prev + 1) % POSITIONS.length;
      return next;
    });
    setTimeout(() => {
      setIsJumping(false);
    }, 900);
  };

  const handleInteract = () => {
    setShowSpeech((prev) => !prev);
    setSecretIdx((prev) => (prev + 1) % KUPPAM_SCIENCE_SECRETS.length);
    playSound(540, 720);
  };

  const currentPos = POSITIONS[posIdx];

  const getMoodHeading = () => {
    if (mood === "aah") return "Aah! 🔍 (Wonder)";
    if (mood === "aha") return "Aha! 💡 (Discovery)";
    return "Ha-ha! 🎊 (Joy)";
  };

  return (
    <div
      style={currentPos.style}
      className={`fixed z-50 pointer-events-auto transition-all duration-1000 ease-in-out ${
        isJumping ? "scale-110 -translate-y-8" : "scale-100 translate-y-0"
      }`}
    >
      {/* Comic Thought Balloon / Speech Bubble */}
      {showSpeech && (
        <div
          className={`absolute bottom-full mb-3 w-64 sm:w-72 bg-white rounded-3xl p-4 shadow-2xl border-2 border-amber-400 animate-in fade-in zoom-in-95 duration-200 z-50 text-left ${
            currentPos.facing === "left" ? "right-0" : "left-0"
          }`}
        >
          {/* Decorative speech triangle tail */}
          <div
            className={`absolute top-full w-4 h-4 bg-white border-r-2 border-b-2 border-amber-400 transform rotate-45 -mt-2 ${
              currentPos.facing === "left" ? "right-10" : "left-10"
            }`}
          />

          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="px-2.5 py-0.5 bg-amber-100 text-[#143867] text-[10px] font-black rounded-full uppercase tracking-wider">
              {getMoodHeading()}
            </span>
            <button
              onClick={() => setShowSpeech(false)}
              className="text-gray-400 hover:text-gray-600 font-bold px-1.5 text-xs"
              title="Close speech bubble"
            >
              ✕
            </button>
          </div>

          <h4 className="text-xs font-black text-[#143867] mb-1">
            Hey {userName}! I&apos;m Kuppu 🐵
          </h4>

          <p className="text-[11px] text-gray-700 font-medium leading-relaxed mb-3">
            {KUPPAM_SCIENCE_SECRETS[secretIdx]}
          </p>

          {/* Playful action buttons inside speech bubble */}
          <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2 text-[10px] font-bold">
            <button
              onClick={handleJump}
              className="px-2.5 py-1 bg-[#143867] hover:bg-[#1e4a85] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <span>Jump to new spot! 🦘</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMood("aah")}
                className={`p-1 rounded-lg ${mood === "aah" ? "bg-amber-200" : "hover:bg-gray-100"}`}
                title="Wonder"
              >
                🔍
              </button>
              <button
                onClick={() => setMood("aha")}
                className={`p-1 rounded-lg ${mood === "aha" ? "bg-amber-200" : "hover:bg-gray-100"}`}
                title="Discovery"
              >
                💡
              </button>
              <button
                onClick={() => setMood("haha")}
                className={`p-1 rounded-lg ${mood === "haha" ? "bg-amber-200" : "hover:bg-gray-100"}`}
                title="Joy"
              >
                🎊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free-Floating, Organic Kuppu Character (NO corporate box, NO rectangle border!) */}
      <div
        onClick={handleInteract}
        className="cursor-pointer group flex flex-col items-center select-none"
        title="Click Kuppu to chat or make him jump!"
      >
        {/* Floating playful name tag badge above Kuppu when hovering */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2.5 py-0.5 bg-[#143867] text-white text-[10px] font-black rounded-full shadow-md mb-1 whitespace-nowrap">
          Kuppu 🐵 • Click me!
        </span>

        {/* The organic character sprite */}
        <div
          style={{
            transform: currentPos.facing === "left" ? "scaleX(1)" : "scaleX(-1)"
          }}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-110 active:scale-95 ${
            isJumping ? "animate-bounce" : ""
          }`}
        >
          {imageLoaded ? (
            <img
              src="/kuppu-mascot.jpg"
              alt="Kuppu the Curious Langur"
              className="w-full h-full object-cover"
              onError={() => setImageLoaded(false)}
            />
          ) : (
            <div className="w-full h-full bg-amber-100 flex items-center justify-center text-5xl">
              🐵
            </div>
          )}

          {/* Subtle glowing ring instead of a box border */}
          <div className="absolute inset-0 rounded-full border-4 border-white/80 pointer-events-none shadow-inner" />
        </div>

        {/* Jump sparkle trail when jumping */}
        {isJumping && (
          <span className="absolute -bottom-2 text-sm animate-ping">✨</span>
        )}
      </div>
    </div>
  );
}
