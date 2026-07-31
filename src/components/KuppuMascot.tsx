"use client";

import React, { useState, useEffect } from "react";

export type KuppuState = "aah" | "aha" | "haha";

interface KuppuMascotProps {
  defaultState?: KuppuState;
  title?: string;
  subtitle?: string;
  showModeButtons?: boolean;
}

interface MascotModeInfo {
  id: KuppuState;
  label: string;
  emotionTitle: string;
  emoji: string;
  badgeText: string;
  dialogue: string;
  fact: string;
  bgGradient: string;
  borderAccent: string;
  buttonColor: string;
}

const MODES: Record<KuppuState, MascotModeInfo> = {
  aah: {
    id: "aah",
    label: "Aah! (Wonder)",
    emotionTitle: "Aah! Wonder & Curiosity!",
    emoji: "🔍👀",
    badgeText: "WONDER • SURPRISE",
    dialogue: "Kuppu looks through his magnifying glass with wide eyes! 'What scientific mystery will we investigate in the lab today?'",
    fact: "Did you know? Grey langurs in the Kuppam hills are natural acrobats! Their tails are longer than their bodies to keep balance in tall trees.",
    bgGradient: "from-[#fff7ed] via-[#ffedd5] to-[#fef3c7]",
    borderAccent: "border-[#f37021]",
    buttonColor: "bg-[#f37021] hover:bg-[#d95e16]"
  },
  aha: {
    id: "aha",
    label: "Aha! (Discovery)",
    emotionTitle: "Aha! Discovery & Insight!",
    emoji: "💡✨",
    badgeText: "DISCOVERY • INSIGHT",
    dialogue: "EUREKA! Kuppu jumps up with a glowing lightbulb over his head! 'You connected the dots and unlocked a real scientific law!'",
    fact: "Did you know? Agastya's Kuppam Creative Campus was built on barren hills that were transformed into a biodiverse ecological paradise!",
    bgGradient: "from-[#fef9c3] via-[#fef08a] to-[#e0f2fe]",
    borderAccent: "border-[#eab308]",
    buttonColor: "bg-[#eab308] hover:bg-[#ca8a04]"
  },
  haha: {
    id: "haha",
    label: "Ha-ha! (Joy & Celebration)",
    emotionTitle: "Ha-ha! Joy of Learning!",
    emoji: "🎊🎉🐵",
    badgeText: "JOY • FUN",
    dialogue: "Kuppu does a celebratory dance with confetti! 'Whether leveling up or climbing the Top 10 Leaderboard, science is pure joy!'",
    fact: "Did you know? Over 200 school buses visit Agastya Kuppam every day so thousands of rural students can experience the joy of science!",
    bgGradient: "from-[#ecfdf5] via-[#d1fae5] to-[#fef3c7]",
    borderAccent: "border-emerald-500",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700"
  }
};

const EXTRA_KUPPAM_FACTS = [
  "🍌 Kuppu loves bananas and physics! He knows gravity pulls falling fruits at 9.8 m/s²!",
  "🌿 The Kuppam hills are home to over 150 species of birds and butterflies!",
  "🔬 Agastya's motto is 'Aah! Aha! Ha-ha!'—representing Curiosity, Insight, and the Joy of learning!",
  "🔭 You can see the rings of Saturn from Agastya's Kuppam Planetarium telescopes!",
  "⚙️ Kuppu says: Never be afraid to make a mistake in an experiment—that's how discoveries happen!"
];

export default function KuppuMascot({
  defaultState = "aah",
  title = "🐵 Kuppu the Curious Langur",
  subtitle = "Official Mascot of Agastya Kuppam Creative Campus",
  showModeButtons = true
}: KuppuMascotProps) {
  const [mode, setMode] = useState<KuppuState>(defaultState);
  const [tickleCount, setTickleCount] = useState(0);
  const [randomFact, setRandomFact] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(defaultState === "haha");

  const info = MODES[mode];

  useEffect(() => {
    setShowConfetti(mode === "haha");
  }, [mode]);

  const playSound = (freq1 = 520, freq2 = 660) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.setValueAtTime(freq2, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio fallback
    }
  };

  const handleModeChange = (newMode: KuppuState) => {
    setMode(newMode);
    if (newMode === "aah") playSound(440, 550);
    if (newMode === "aha") playSound(580, 880);
    if (newMode === "haha") playSound(660, 990);
  };

  const handleTickleKuppu = () => {
    setTickleCount((prev) => prev + 1);
    const fact = EXTRA_KUPPAM_FACTS[Math.floor(Math.random() * EXTRA_KUPPAM_FACTS.length)];
    setRandomFact(fact);
    playSound(700, 950);
  };

  return (
    <div className={`bg-gradient-to-r ${info.bgGradient} rounded-3xl p-5 sm:p-7 border-2 ${info.borderAccent} shadow-xl relative overflow-hidden transition-all duration-500`}>
      {/* Confetti Particles for Ha-ha Mode */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-2 left-10 text-xl animate-bounce">🎊</div>
          <div className="absolute top-4 right-16 text-2xl animate-pulse">🎉</div>
          <div className="absolute top-10 left-1/3 text-lg animate-ping">✨</div>
          <div className="absolute bottom-4 right-1/4 text-xl animate-bounce">🌟</div>
          <div className="absolute top-1/2 left-12 text-lg animate-pulse">🎉</div>
        </div>
      )}

      {/* Top Agastya Banner Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#143867] text-white text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
            <span>🐵 AGASTYA MASCOT BANNER</span>
          </span>
          <span className="px-3 py-1 bg-[#f37021] text-white text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wider shadow-xs">
            {info.badgeText}
          </span>
        </div>

        {showModeButtons && (
          <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-2xl border border-gray-200 shadow-xs">
            <button
              onClick={() => handleModeChange("aah")}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                mode === "aah" ? "bg-[#f37021] text-white shadow-xs scale-105" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Aah! 🔍
            </button>
            <button
              onClick={() => handleModeChange("aha")}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                mode === "aha" ? "bg-[#eab308] text-white shadow-xs scale-105" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Aha! 💡
            </button>
            <button
              onClick={() => handleModeChange("haha")}
              className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                mode === "haha" ? "bg-emerald-600 text-white shadow-xs scale-105" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Ha-ha! 🎊
            </button>
          </div>
        )}
      </div>

      {/* Main Mascot Display Area */}
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 relative z-10">
        
        {/* Interactive Kuppu Mascot Avatar Card */}
        <div
          onClick={handleTickleKuppu}
          className="relative cursor-pointer group shrink-0 transform transition-transform duration-300 hover:scale-105 active:scale-95"
          title="Click to tickle Kuppu for a surprise science fact!"
        >
          {/* Animated Glow Aura */}
          <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${info.bgGradient} blur-md opacity-75 group-hover:opacity-100 transition duration-300`}></div>

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white border-4 border-[#143867] shadow-xl overflow-hidden flex flex-col items-center justify-center p-2">
            <img
              src="/kuppu-mascot.jpg"
              alt="Kuppu the Langur"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {/* Fallback emoji if illustration not rendered */}
            <span className="text-5xl select-none absolute">🐵</span>

            {/* Mode specific floating badge */}
            <div className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow-md text-base">
              {info.emoji}
            </div>

            {/* Tickle count bubble */}
            {tickleCount > 0 && (
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#f37021] text-white text-[9px] font-black rounded-full shadow-xs">
                ⭐ {tickleCount}
              </span>
            )}
          </div>

          <p className="text-center text-[10px] font-black text-[#143867] mt-1.5 underline decoration-dotted group-hover:text-[#f37021]">
            Click Kuppu for a fact!
          </p>
        </div>

        {/* Mascot Dialogue & Campus Info */}
        <div className="flex-1 space-y-2.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h3 className="text-lg sm:text-2xl font-black text-[#143867] font-serif">
              {info.emotionTitle}
            </h3>
            <span className="px-2.5 py-0.5 bg-white/90 text-[#143867] text-xs font-bold rounded-lg border border-gray-200">
              {title}
            </span>
          </div>

          {/* Dialogue Box */}
          <div className="p-3.5 bg-white/90 rounded-2xl border border-gray-200/80 shadow-sm relative">
            <p className="text-xs sm:text-sm text-[#143867] font-semibold leading-relaxed">
              &ldquo;{info.dialogue}&rdquo;
            </p>
          </div>

          {/* Kuppam Hills Campus Trivia or Random Fact */}
          <div className="flex items-start gap-2 bg-white/70 p-3 rounded-2xl border border-gray-200">
            <span className="text-lg shrink-0 mt-0.5">🌄</span>
            <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed font-medium">
              <strong className="text-[#143867]">Kuppam Hills Science Note:</strong>{" "}
              {randomFact || info.fact}
            </p>
          </div>
        </div>

      </div>

      {/* Footer Banner Tagline */}
      <div className="mt-4 pt-3 border-t border-gray-300/60 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#143867] flex-wrap gap-2 relative z-10">
        <span>✨ Agastya International Foundation • Aah! Aha! Ha-ha! Creative Learning</span>
        <div className="flex items-center gap-2">
          <span>Explore:</span>
          <button
            onClick={() => handleModeChange("aah")}
            className="hover:text-[#f37021] underline"
          >
            Aah! (Wonder)
          </button>
          <span>•</span>
          <button
            onClick={() => handleModeChange("aha")}
            className="hover:text-amber-600 underline"
          >
            Aha! (Discovery)
          </button>
          <span>•</span>
          <button
            onClick={() => handleModeChange("haha")}
            className="hover:text-emerald-700 underline"
          >
            Ha-ha! (Joy)
          </button>
        </div>
      </div>
    </div>
  );
}
