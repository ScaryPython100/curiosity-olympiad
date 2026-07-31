"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProfileStats } from "@/app/actions/profile";
import RoamingKuppuMascot from "@/components/RoamingKuppuMascot";

export interface CampusLandmark {
  id: number;
  name: string;
  xpRequired: number;
  icon: string;
  category: string;
  description: string;
  funFact: string;
  x: number; // percentage width on SVG map (0-100)
  y: number; // percentage height on SVG map (0-100)
}

// Exactly matching the 11 official landmarks from Image 1 with +500 XP increments up to 5,000 XP!
const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 1,
    name: "Entrance",
    xpRequired: 0,
    icon: "gate",
    category: "Campus Gateway",
    description: "Welcome to the 172-acre Agastya Kuppam Creative Campus—where curiosity begins!",
    funFact: "Agastya's Kuppam Campus welcomes over 500 children every day from surrounding rural villages!",
    x: 10,
    y: 80
  },
  {
    id: 2,
    name: "Art Center",
    xpRequired: 500,
    icon: "palette",
    category: "Creative Expression",
    description: "Where painting, sculpture, and visual arts intersect with natural sciences.",
    funFact: "Students make natural organic paints using rocks, leaves, and soil from the Kuppam hills!",
    x: 26,
    y: 74
  },
  {
    id: 3,
    name: "Innovation Center",
    xpRequired: 1000,
    icon: "lightbulb",
    category: "Invention Lab",
    description: "Hands-on prototype building, electronics, and creative mechanical design.",
    funFact: "Rural students build low-cost water filters and solar lamps in this hands-on workshop!",
    x: 45,
    y: 78
  },
  {
    id: 4,
    name: "Jhunjhunwala Discovery Center",
    xpRequired: 1500,
    icon: "science",
    category: "Core Science Experience",
    description: "The flagship center housing 200+ interactive physics & chemistry exhibits!",
    funFact: "Named after pioneer patrons, this center lets children touch, play, and experiment with real scientific laws!",
    x: 65,
    y: 72
  },
  {
    id: 5,
    name: "BioDiversity Center",
    xpRequired: 2000,
    icon: "forest",
    category: "Ecology & Nature",
    description: "A sprawling botanical reserve dedicated to native flora, fauna, and medicinal plants.",
    funFact: "Over 200 species of birds and indigenous trees thrive on this restored ecosystem!",
    x: 86,
    y: 60
  },
  {
    id: 6,
    name: "Ramanujan Math Park",
    xpRequired: 2500,
    icon: "calculate",
    category: "Mathematics in Nature",
    description: "An open-air interactive park filled with geometric puzzles and number theory sculptures.",
    funFact: "Dedicated to Srinivasa Ramanujan, children learn calculus and geometry through giant outdoor playgrounds!",
    x: 75,
    y: 44
  },
  {
    id: 7,
    name: "Chemistry Lab",
    xpRequired: 3000,
    icon: "biotech",
    category: "Molecular Wonders",
    description: "Colorful reactions, titration experiments, and everyday household chemistry.",
    funFact: "Students learn why turmeric turns red in soap water and how natural indicators work!",
    x: 52,
    y: 44
  },
  {
    id: 8,
    name: "Butterfly Park",
    xpRequired: 3500,
    icon: "flutter_dash",
    category: "Living Habitat",
    description: "A lush garden sanctuary attracting dozens of native butterfly species.",
    funFact: "Children observe the complete metamorphosis from caterpillar to chrysalis to beautiful butterfly!",
    x: 32,
    y: 48
  },
  {
    id: 9,
    name: "Computer & IT Center",
    xpRequired: 4000,
    icon: "terminal",
    category: "Digital World",
    description: "Robotics, introductory coding, and digital literacy for future innovators.",
    funFact: "Students program autonomous line-following robots and build digital sensors here!",
    x: 16,
    y: 32
  },
  {
    id: 10,
    name: "Gurugruha Astronomy Center",
    xpRequired: 4500,
    icon: "rocket_launch",
    category: "Space & Cosmos",
    description: "Telescopes, planetarium dome shows, and stargazing across the universe.",
    funFact: "The Kuppam night sky is so clear that children can see Jupiter's four largest moons through the campus telescopes!",
    x: 42,
    y: 18
  },
  {
    id: 11,
    name: "VisionWorks",
    xpRequired: 5000,
    icon: "visibility",
    category: "Advanced Optics & Future",
    description: "Where light, lenses, lasers, and perception create futuristic scientific breakthroughs!",
    funFact: "The ultimate milestone on the Agastya campus—celebrating vision, confidence, and lifelong curiosity!",
    x: 85,
    y: 16
  }
];

export default function CampusMapPage() {
  const [userXp, setUserXp] = useState(0);
  const [userName, setUserName] = useState("Explorer");
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark | null>(null);
  const [vanHonking, setVanHonking] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getProfileStats();
      if (res.data) {
        setUserXp(res.data.xp || 0);
        setUserName(res.data.username || "Explorer");
      }
    }
    loadData();
  }, []);

  // Determine which landmark the user is currently at or traveling towards
  const currentLandmarkIndex = CAMPUS_LANDMARKS.reduce((acc, landmark, idx) => {
    return userXp >= landmark.xpRequired ? idx : acc;
  }, 0);

  const currentLandmark = CAMPUS_LANDMARKS[currentLandmarkIndex];
  const nextLandmark = CAMPUS_LANDMARKS[Math.min(currentLandmarkIndex + 1, CAMPUS_LANDMARKS.length - 1)];

  // Calculate Van position along the 11 landmarks
  let vanX = currentLandmark.x;
  let vanY = currentLandmark.y;
  if (nextLandmark.id !== currentLandmark.id && nextLandmark.xpRequired > currentLandmark.xpRequired) {
    const progress = Math.min(
      1,
      Math.max(0, (userXp - currentLandmark.xpRequired) / (nextLandmark.xpRequired - currentLandmark.xpRequired))
    );
    vanX = currentLandmark.x + (nextLandmark.x - currentLandmark.x) * progress;
    vanY = currentLandmark.y + (nextLandmark.y - currentLandmark.y) * progress;
  }

  const handleHonk = () => {
    setVanHonking(true);
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio fallback
    }
    setTimeout(() => setVanHonking(false), 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#14532d] via-[#15803d] to-[#166534] text-white selection:bg-[#ffe16d] selection:text-[#143867] pb-24 relative overflow-x-hidden">
      
      {/* 🐵 Free-Floating, Crawling Kuppu Mascot that moves out of the way when clicked! */}
      <RoamingKuppuMascot initialMood="aah" userName={userName} />

      {/* Top Header Nav */}
      <header className="sticky top-0 z-40 bg-[#14532d]/90 backdrop-blur-md border-b border-emerald-400/20 px-4 sm:px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-full bg-[#1e7e34] hover:bg-[#28a745] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 border border-emerald-300/30"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#f37021] text-white text-[10px] font-black uppercase tracking-widest mb-0.5">
                Official Interactive Highway
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                The Winding Road of Kuppam Hills
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleHonk}
              className="px-4 py-2 rounded-full bg-[#ffe16d] hover:bg-yellow-300 text-[#143867] font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              title="Honk the Mobile Science Van!"
            >
              <span>{vanHonking ? "BEEP BEEP! 🎺" : "Honk Van! 🎺"}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#166534] border border-emerald-400/30 shadow-inner">
              <span className="text-xs font-black uppercase text-emerald-200">Your XP:</span>
              <span className="text-sm font-extrabold text-[#ffe16d]">{userXp} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Highway Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        
        {/* Helper subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-sm sm:text-base text-emerald-100 font-medium">
            Click any milestone circle along the highway to explore Agastya&apos;s real-world labs, like the{" "}
            <strong className="text-[#ffe16d]">Jhunjhunwala Discovery Center</strong> and{" "}
            <strong className="text-[#ffe16d]">Ramanujan Math Park</strong>!
          </p>
        </div>

        {/* ========================================================
            THE WINDING HIGHWAY (SVG PATH & INTERACTIVE NODES)
            ======================================================== */}
        <div className="relative w-full h-[680px] sm:h-[750px] bg-[#1b4332]/95 backdrop-blur-sm rounded-3xl border-2 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-4 sm:p-8">
          
          {/* Smooth Winding Road Curve connecting all 11 nodes without sharp edges */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Outer Highway Shoulder */}
            <path
              d="M 10 80 C 18 80, 36 68, 45 78 C 55 88, 75 80, 86 60 C 92 48, 85 44, 75 44 C 65 44, 42 54, 32 48 C 22 42, 12 38, 16 32 C 22 22, 58 18, 85 16"
              fill="none"
              stroke="#0f291e"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Dark asphalt highway base */}
            <path
              d="M 10 80 C 18 80, 36 68, 45 78 C 55 88, 75 80, 86 60 C 92 48, 85 44, 75 44 C 65 44, 42 54, 32 48 C 22 42, 12 38, 16 32 C 22 22, 58 18, 85 16"
              fill="none"
              stroke="#334155"
              strokeWidth="5.2"
              strokeLinecap="round"
            />
            {/* Dashed orange/yellow center line of the Agastya Highway */}
            <path
              d="M 10 80 C 18 80, 36 68, 45 78 C 55 88, 75 80, 86 60 C 92 48, 85 44, 75 44 C 65 44, 42 54, 32 48 C 22 42, 12 38, 16 32 C 22 22, 58 18, 85 16"
              fill="none"
              stroke="#ffe16d"
              strokeWidth="0.7"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
          </svg>

          {/* Render All 11 Landmark Milestones */}
          {CAMPUS_LANDMARKS.map((landmark) => {
            const isUnlocked = userXp >= landmark.xpRequired;
            const isCurrent = currentLandmark.id === landmark.id;
            const isSelected = selectedLandmark?.id === landmark.id;

            return (
              <div
                key={landmark.id}
                style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
              >
                {/* Milestone Node Circle */}
                <button
                  onClick={() => setSelectedLandmark(landmark)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isUnlocked
                      ? "bg-[#143867] border-[#ffe16d] text-[#ffe16d] shadow-[0_0_20px_rgba(255,225,109,0.4)]"
                      : "bg-[#1e293b] border-gray-600 text-gray-400 opacity-80"
                  } ${isCurrent ? "ring-4 ring-amber-400 animate-pulse" : ""} ${
                    isSelected ? "scale-110 ring-4 ring-white" : ""
                  }`}
                  title={`${landmark.name} (${landmark.xpRequired} XP required)`}
                >
                  <span className="material-symbols-outlined text-2xl sm:text-3xl font-black">
                    {landmark.icon}
                  </span>
                </button>

                {/* Milestone Badge Text */}
                <div
                  className={`mt-2 px-3 py-1 rounded-xl text-center shadow-lg transition-all border ${
                    isUnlocked
                      ? "bg-white text-[#143867] border-amber-300"
                      : "bg-[#0f172a]/90 text-gray-300 border-gray-700"
                  }`}
                >
                  <p className="text-[10px] sm:text-xs font-black tracking-tight whitespace-nowrap">
                    {landmark.name}
                  </p>
                  <p className="text-[9px] font-bold text-[#f37021]">{landmark.xpRequired} XP</p>
                </div>
              </div>
            );
          })}

          {/* ========================================================
              THE AGASTYA MOBILE SCIENCE VAN ON THE ROAD
              ======================================================== */}
          <div
            style={{ left: `${vanX}%`, top: `${vanY}%` }}
            className={`absolute -translate-x-1/2 -translate-y-full pb-4 z-20 pointer-events-none transition-all duration-700 ease-out ${
              vanHonking ? "animate-bounce scale-110" : ""
            }`}
          >
            <div className="relative flex flex-col items-center">
              {/* Van Bubble */}
              <div className="w-16 h-12 sm:w-20 sm:h-14 bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-2 border-[#f37021] overflow-hidden flex items-center justify-center p-1">
                <img
                  src="/agastya-science-van.jpg"
                  alt="Agastya Mobile Science Van"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="text-2xl sm:text-3xl absolute">🚌</span>
              </div>
              <span className="px-2 py-0.5 bg-[#f37021] text-white text-[9px] font-black rounded-full shadow-md mt-1 whitespace-nowrap">
                You are here! 🚌
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL / DRAWER FOR SELECTED LANDMARK
            ======================================================== */}
        {selectedLandmark && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1b4332] text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-emerald-400/40 shadow-2xl relative animate-in zoom-in-95 duration-200">
              
              <button
                onClick={() => setSelectedLandmark(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-emerald-700 flex items-center justify-center text-white font-bold transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#143867] border-2 border-[#ffe16d] flex items-center justify-center text-[#ffe16d]">
                  <span className="material-symbols-outlined text-3xl font-black">
                    {selectedLandmark.icon}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ffe16d]">
                    {selectedLandmark.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {selectedLandmark.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-medium">
                  {selectedLandmark.description}
                </p>

                <div className="bg-emerald-950/60 rounded-2xl p-4 border border-emerald-500/30">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
                    <span>💡 Agastya Kuppam Campus Secret</span>
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-100 italic leading-snug">
                    &ldquo;{selectedLandmark.funFact}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-emerald-500/30 pt-4">
                <div>
                  <span className="text-xs font-bold text-emerald-300">Requirement:</span>
                  <p className="text-lg font-black text-white">
                    {selectedLandmark.xpRequired} XP
                  </p>
                </div>

                {userXp >= selectedLandmark.xpRequired ? (
                  <span className="px-4 py-2 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1">
                    <span>Unlocked</span>
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  </span>
                ) : (
                  <Link
                    href="/practice"
                    onClick={() => setSelectedLandmark(null)}
                    className="px-5 py-2.5 rounded-full bg-[#f37021] hover:bg-[#d95d18] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    Earn XP in Practice Lab ➔
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
