"use client";

import React, { useState } from "react";

interface AgastyaVanHighwayProps {
  currentXp?: number;
  targetXp?: number;
  title?: string;
  subtitle?: string;
}

interface Landmark {
  id: string;
  name: string;
  icon: string;
  xpThreshold: number;
  pct: number;
  factTitle: string;
  factDesc: string;
  color: string;
  tagline: string;
}

const LANDMARKS: Landmark[] = [
  {
    id: "ecology",
    name: "Art & Ecology Center",
    icon: "🎨🌿",
    xpThreshold: 250,
    pct: 10,
    factTitle: "172 Acres of Biodiverse Learning!",
    factDesc: "The Kuppam campus houses a sprawling 172-acre ecology park! Students explore local flora, fauna, sustainable living, and solar gardens.",
    color: "from-emerald-500 to-green-600",
    tagline: "Where Science meets Nature"
  },
  {
    id: "robotics",
    name: "Robotics & Innovation Lab",
    icon: "🤖⚙️",
    xpThreshold: 500,
    pct: 38,
    factTitle: "Hands-On STEM for Millions!",
    factDesc: "Students design real autonomous robots and sensors here! Agastya's labs bring practical STEM education to over 15 million children across India.",
    color: "from-blue-500 to-indigo-600",
    tagline: "Invent, Build & Code"
  },
  {
    id: "discovery",
    name: "The Discovery Center",
    icon: "🔬🔭",
    xpThreshold: 750,
    pct: 68,
    factTitle: "200+ Interactive Exhibits!",
    factDesc: "Home to 200+ interactive physics & chemistry models, this is where curious minds turn 'Why?' into 'Aha!' moments every single day.",
    color: "from-amber-500 to-orange-600",
    tagline: "Touch, Try & Discover"
  },
  {
    id: "planetarium",
    name: "Planetarium & Space Dome",
    icon: "🪐🚀",
    xpThreshold: 1000,
    pct: 94,
    factTitle: "Journey Through the Cosmos!",
    factDesc: "Our dome theater takes students on virtual journeys through stars, planets, and galaxies—inspiring future Indian astronauts and astrophysicists!",
    color: "from-purple-500 to-indigo-700",
    tagline: "Reach for the Stars"
  }
];

export default function AgastyaVanHighway({
  currentXp = 450,
  targetXp = 1000,
  title = "🚌 Agastya Mobile Science Van Highway",
  subtitle = "Drive along the winding road of the Kuppam Creative Campus as you gain XP!"
}: AgastyaVanHighwayProps) {
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [honking, setHonking] = useState(false);

  // Calculate percentage along the 1000 XP milestone highway
  const xpInLevel = currentXp % targetXp;
  const progressPct = Math.min(Math.max((xpInLevel / targetXp) * 100, 5), 95);

  const handleHonk = () => {
    setHonking(true);
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Honk pitch
      osc.frequency.setValueAtTime(550, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio fallback
    }
    setTimeout(() => setHonking(false), 800);
  };

  return (
    <div className="bg-gradient-to-br from-[#eef7ff] via-[#fffbeb] to-[#f2fcf5] rounded-3xl p-5 sm:p-7 border-2 border-[#f37021]/30 shadow-xl overflow-hidden relative">
      {/* Background Cloud & Sun Decor */}
      <div className="absolute top-4 right-6 flex items-center gap-2 opacity-30 pointer-events-none">
        <span className="text-3xl">☀️</span>
        <span className="text-2xl">☁️</span>
        <span className="text-xl">☁️</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#f37021] text-white text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              <span>🚌 KUPPAM CAMPUS MAP</span>
            </span>
            <span className="text-xs font-bold text-[#143867] bg-white/80 px-2.5 py-1 rounded-full border border-gray-200">
              {currentXp.toLocaleString()} / {targetXp.toLocaleString()} XP
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#143867] mt-1.5 font-serif">
            {title}
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            {subtitle} <span className="text-[#f37021] font-bold">Click any landmark to unlock campus science trivia!</span>
          </p>
        </div>

        <button
          onClick={handleHonk}
          className="self-start sm:self-center px-4 py-2 bg-gradient-to-r from-[#f37021] to-[#ff8c42] hover:from-[#d95e16] hover:to-[#f37021] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          title="Honk the Agastya Science Van!"
        >
          <span className="text-base animate-bounce">🚌</span>
          <span>{honking ? "Honk Honk! 🔊" : "Honk Science Van! 🎺"}</span>
        </button>
      </div>

      {/* Winding Highway Map Container */}
      <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-[#86efac]/40 via-[#fde047]/20 to-[#93c5fd]/30 rounded-2xl border-2 border-emerald-500/20 shadow-inner overflow-hidden flex items-center px-6 sm:px-10">
        
        {/* Winding Asphalt Road Graphic */}
        <div className="absolute inset-x-0 h-16 sm:h-20 bg-[#334155] shadow-lg flex items-center justify-between px-4 sm:px-8 border-y-4 border-gray-400">
          {/* Dashed Yellow Center Line */}
          <div className="w-full border-t-4 border-dashed border-[#facc15]"></div>
        </div>

        {/* Milestone Landmarks along the Road */}
        <div className="absolute inset-x-6 sm:inset-x-12 h-full flex items-center justify-between pointer-events-none">
          {LANDMARKS.map((land) => {
            const isPassed = progressPct >= land.pct;
            return (
              <div
                key={land.id}
                style={{ left: `${land.pct}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-12 sm:-translate-y-14 flex flex-col items-center pointer-events-auto cursor-pointer group z-20"
                onClick={() => setActiveLandmark(land)}
              >
                {/* Glowing Landmark Flag Button */}
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 transition-all duration-300 ${
                    isPassed
                      ? "bg-gradient-to-br from-white to-emerald-50 border-emerald-500 scale-105 shadow-emerald-500/30"
                      : "bg-white/90 border-gray-300 opacity-80 hover:opacity-100"
                  } group-hover:scale-110 group-hover:shadow-xl`}
                >
                  {land.icon}
                </div>

                {/* Landmark Label Tag */}
                <span className="mt-1 px-2 py-0.5 bg-[#143867] text-white text-[9px] sm:text-[10px] font-bold rounded-md shadow-xs whitespace-nowrap group-hover:bg-[#f37021] transition-colors">
                  {land.name}
                </span>

                {/* Mini Unlocked Pin */}
                {isPassed && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated Mobile Science Van along the Road */}
        <div
          style={{ left: `${progressPct}%` }}
          className="absolute transform -translate-x-1/2 translate-y-1 sm:translate-y-2 z-30 transition-all duration-700 ease-out cursor-pointer group"
          onClick={handleHonk}
        >
          {/* Cheer Balloon / Speech Bubble */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#fff7ed] border-2 border-[#f37021] px-2.5 py-1 rounded-xl shadow-md text-[10px] font-black text-[#143867] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            🚌 Science on Wheels! {currentXp} XP
          </div>

          {/* Agastya Van Graphic */}
          <div className="relative flex items-center">
            {/* Van Image Icon with glowing aura */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-[#f37021] shadow-xl overflow-hidden flex items-center justify-center transform group-hover:scale-110 transition-transform ${honking ? "animate-bounce" : ""}`}>
              <img
                src="/agastya-science-van.jpg"
                alt="Agastya Van"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if illustration isn't loaded
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-3xl select-none absolute">🚌</span>
            </div>

            {/* Puff of smoke particles */}
            <div className="absolute -left-4 bottom-1 w-3 h-3 bg-gray-300 rounded-full opacity-60 animate-ping"></div>
          </div>
        </div>

      </div>

      {/* Interactive Landmark Trivia Pop-up Modal */}
      {activeLandmark && (
        <div className="mt-4 p-4 sm:p-5 bg-white rounded-2xl border-2 border-[#143867]/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeLandmark.color} text-white flex items-center justify-center text-2xl shrink-0 shadow-md`}>
              {activeLandmark.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-[#fff7ed] text-[#f37021] px-2 py-0.5 rounded-md uppercase border border-[#f37021]/30">
                  {activeLandmark.tagline}
                </span>
                <span className="text-xs text-emerald-700 font-bold">
                  Milestone at {activeLandmark.xpThreshold} XP
                </span>
              </div>
              <h4 className="text-base font-black text-[#143867] mt-1">
                {activeLandmark.name}: {activeLandmark.factTitle}
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed mt-1">
                {activeLandmark.factDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveLandmark(null)}
            className="self-end sm:self-center px-4 py-2 bg-[#143867] hover:bg-[#1e4a85] text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
          >
            Awesome! Got it 👍
          </button>
        </div>
      )}

      {/* Quick Campus Landmarks Legend Footer */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500 font-medium border-t border-gray-200/80 pt-3 flex-wrap gap-2">
        <span>📍 Kuppam Creative Campus Landmarks:</span>
        <div className="flex items-center gap-3">
          {LANDMARKS.map((land) => (
            <button
              key={land.id}
              onClick={() => setActiveLandmark(land)}
              className="hover:text-[#f37021] font-semibold transition-colors flex items-center gap-1"
            >
              <span>{land.icon}</span>
              <span className="underline decoration-dotted">{land.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
