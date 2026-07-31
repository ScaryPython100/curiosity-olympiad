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

// Exactly matching the 11 official landmarks from Image 1 and Agastya Kuppam Campus!
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
    y: 75
  },
  {
    id: 2,
    name: "Art Center",
    xpRequired: 100,
    icon: "palette",
    category: "Creative Expression",
    description: "Where painting, sculpture, and visual arts intersect with natural sciences.",
    funFact: "Students make natural organic paints using rocks, leaves, and soil from the Kuppam hills!",
    x: 20,
    y: 45
  },
  {
    id: 3,
    name: "Innovation Center",
    xpRequired: 200,
    icon: "lightbulb",
    category: "Invention Lab",
    description: "Hands-on prototype building, electronics, and creative mechanical design.",
    funFact: "Rural students build low-cost water filters and solar lamps in this hands-on workshop!",
    x: 28,
    y: 18
  },
  {
    id: 4,
    name: "Jhunjhunwala Discovery Center",
    xpRequired: 300,
    icon: "science",
    category: "Core Science Experience",
    description: "The flagship center housing 200+ interactive physics & chemistry exhibits!",
    funFact: "Named after pioneer patrons, this center lets children touch, play, and experiment with real scientific laws!",
    x: 42,
    y: 35
  },
  {
    id: 5,
    name: "BioDiversity Center",
    xpRequired: 400,
    icon: "forest",
    category: "Ecology & Nature",
    description: "A sprawling botanical reserve dedicated to native flora, fauna, and medicinal plants.",
    funFact: "Over 200 species of birds and indigenous trees thrive on this restored ecosystem!",
    x: 35,
    y: 78
  },
  {
    id: 6,
    name: "Ramanujan Math Park",
    xpRequired: 500,
    icon: "calculate",
    category: "Mathematics in Nature",
    description: "An open-air interactive park filled with geometric puzzles and number theory sculptures.",
    funFact: "Dedicated to Srinivasa Ramanujan, children learn calculus and geometry through giant outdoor playgrounds!",
    x: 55,
    y: 55
  },
  {
    id: 7,
    name: "Chemistry Lab",
    xpRequired: 600,
    icon: "biotech",
    category: "Molecular Wonders",
    description: "Colorful reactions, titration experiments, and everyday household chemistry.",
    funFact: "Students learn why turmeric turns red in soap water and how natural indicators work!",
    x: 62,
    y: 18
  },
  {
    id: 8,
    name: "Butterfly Park",
    xpRequired: 700,
    icon: "flutter_dash",
    category: "Living Habitat",
    description: "A lush garden sanctuary attracting dozens of native butterfly species.",
    funFact: "Children observe the complete metamorphosis from caterpillar to chrysalis to beautiful butterfly!",
    x: 75,
    y: 45
  },
  {
    id: 9,
    name: "Computer & IT Center",
    xpRequired: 800,
    icon: "terminal",
    category: "Digital World",
    description: "Robotics, introductory coding, and digital literacy for future innovators.",
    funFact: "Students program autonomous line-following robots and build digital sensors here!",
    x: 68,
    y: 80
  },
  {
    id: 10,
    name: "Gurugruha Astronomy Center",
    xpRequired: 900,
    icon: "rocket_launch",
    category: "Space & Cosmos",
    description: "Telescopes, planetarium dome shows, and stargazing across the universe.",
    funFact: "The Kuppam night sky is so clear that children can see Jupiter's four largest moons through the campus telescopes!",
    x: 88,
    y: 52
  },
  {
    id: 11,
    name: "VisionWorks",
    xpRequired: 1000,
    icon: "visibility",
    category: "Advanced Optics & Future",
    description: "Where light, lenses, lasers, and perception create futuristic scientific breakthroughs!",
    funFact: "The ultimate milestone on the Agastya campus—celebrating vision, confidence, and lifelong curiosity!",
    x: 88,
    y: 15
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

  const playHonk = () => {
    setVanHonking(true);
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch {
      // fallback
    }
    setTimeout(() => setVanHonking(false), 800);
  };

  // Calculate which landmark the van is currently at or between
  const currentLandmarkIdx = CAMPUS_LANDMARKS.reduce((acc, landmark, index) => {
    if (userXp >= landmark.xpRequired) return index;
    return acc;
  }, 0);

  const activeLandmark = CAMPUS_LANDMARKS[currentLandmarkIdx];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf6ff] via-[#f7fbff] to-[#e8f7ec] text-[#143867] font-['Montserrat'] antialiased relative overflow-x-hidden">
      
      {/* Free roaming jumping Kuppu mascot */}
      <RoamingKuppuMascot initialMood="aha" userName={userName} />

      {/* Playful Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-xs font-bold text-[#143867] shadow-xs transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#143867] leading-tight">
                Agastya Kuppam Creative Campus Map
              </h1>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                172 Acres of Experiential Science • Winding Highway of Discovery
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Honk Van Button */}
          <button
            onClick={playHonk}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f37021] hover:bg-[#d9621a] text-white text-xs font-black shadow-md transition-all active:scale-95 ${
              vanHonking ? "animate-bounce" : ""
            }`}
          >
            <span>Honk Van! 🎺</span>
          </button>

          {/* XP Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#143867] text-[#ffe16d] text-xs font-black shadow-xs">
            <span>⭐</span>
            <span>{userXp.toLocaleString()} XP</span>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Winding Map Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative">
        
        {/* Playful Intro Banner */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-[#143867] text-xs font-black uppercase tracking-wider mb-2">
            🚌 Official Interactive Highway
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#143867] tracking-tight mb-2">
            The Winding Road of Kuppam Hills
          </h2>
          <p className="text-sm text-gray-600">
            Click any milestone circle along the highway to explore Agastya&apos;s real-world labs, like the <strong className="text-[#143867]">Jhunjhunwala Discovery Center</strong> and <strong className="text-[#143867]">Ramanujan Math Park</strong>!
          </p>
        </div>

        {/* ========================================================
            THE WINDING HIGHWAY (SVG PATH & INTERACTIVE NODES)
            ======================================================== */}
        <div className="relative w-full h-[680px] sm:h-[750px] bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-[#143867]/15 shadow-xl overflow-hidden p-4 sm:p-8">
          
          {/* Decorative Outdoor Background Elements */}
          <div className="absolute top-4 left-6 text-4xl opacity-80 select-none animate-pulse">☀️</div>
          <div className="absolute top-8 right-12 text-3xl opacity-60 select-none animate-bounce">☁️</div>
          <div className="absolute bottom-6 left-10 text-3xl opacity-70 select-none">🌳</div>
          <div className="absolute bottom-6 right-16 text-3xl opacity-70 select-none">🌿</div>

          {/* SVG Winding Road Curve connecting all 11 nodes */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Dark asphalt highway base */}
            <path
              d="M 10 75 Q 15 45 20 45 T 28 18 Q 35 15 42 35 T 35 78 Q 45 75 55 55 T 62 18 Q 70 25 75 45 T 68 80 Q 78 75 88 52 T 88 15"
              fill="none"
              stroke="#334155"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Dashed orange/yellow center line of the Agastya Highway */}
            <path
              d="M 10 75 Q 15 45 20 45 T 28 18 Q 35 15 42 35 T 35 78 Q 45 75 55 55 T 62 18 Q 70 25 75 45 T 68 80 Q 78 75 88 52 T 88 15"
              fill="none"
              stroke="#ffe16d"
              strokeWidth="0.8"
              strokeDasharray="2.5 1.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Render all 11 Landmark Circular Nodes */}
          {CAMPUS_LANDMARKS.map((landmark) => {
            const isUnlocked = userXp >= landmark.xpRequired;
            const isCurrent = landmark.id === activeLandmark.id;

            return (
              <div
                key={landmark.id}
                style={{
                  left: `${landmark.x}%`,
                  top: `${landmark.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
                onClick={() => setSelectedLandmark(landmark)}
                className="absolute z-10 cursor-pointer group flex flex-col items-center"
              >
                {/* Mobile Science Van indicator if this is the student's active checkpoint! */}
                {isCurrent && (
                  <div
                    className={`absolute -top-12 sm:-top-14 transition-transform duration-300 ${
                      vanHonking ? "animate-bounce scale-125" : "animate-pulse"
                    }`}
                  >
                    <img
                      src="/agastya-science-van.jpg"
                      alt="Agastya Science Van"
                      className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded-xl shadow-lg border-2 border-amber-400"
                    />
                    <div className="text-[9px] font-black bg-[#f37021] text-white px-1.5 py-0.5 rounded-full text-center mt-0.5 shadow-xs whitespace-nowrap">
                      You are here! 🚌
                    </div>
                  </div>
                )}

                {/* Circular Node Button */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 group-hover:scale-110 active:scale-95 ${
                    isUnlocked
                      ? "bg-[#143867] text-[#ffe16d] border-amber-400 shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                      : "bg-gray-200 text-gray-500 border-gray-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">
                    {landmark.icon}
                  </span>
                </div>

                {/* Organic Landmark Label (matching Jhunjhunwala Discovery Center, Ramanujan Math Park, etc.) */}
                <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-white/95 shadow-md border border-gray-200 text-center max-w-[130px] sm:max-w-[150px] group-hover:border-[#143867] transition-colors">
                  <p className="text-[10px] sm:text-xs font-black text-[#143867] leading-tight">
                    {landmark.name}
                  </p>
                  <p className="text-[9px] font-bold text-gray-500">
                    {landmark.xpRequired} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="mt-8 text-center text-xs text-gray-500 font-bold">
          💡 Kuppu Tip: Complete daily labs and tournaments to earn XP and drive the Agastya Science Van all the way to VisionWorks!
        </div>
      </main>

      {/* ========================================================
          INTERACTIVE LANDMARK POPUP MODAL
          ======================================================== */}
      {selectedLandmark && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border-4 border-[#143867] text-left animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedLandmark(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#143867] text-[#ffe16d] flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-3xl">
                  {selectedLandmark.icon}
                </span>
              </div>
              <div>
                <span className="text-xs font-black text-[#f37021] uppercase tracking-wider">
                  {selectedLandmark.category}
                </span>
                <h3 className="text-xl font-black text-[#143867] leading-tight">
                  {selectedLandmark.name}
                </h3>
              </div>
            </div>

            <div className="mb-4">
              {userXp >= selectedLandmark.xpRequired ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                  <span>✅ Unlocked by your XP!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  <span>🔒 Requires {selectedLandmark.xpRequired} XP (You have {userXp})</span>
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
              {selectedLandmark.description}
            </p>

            <div className="bg-[#f7fbff] border-2 border-blue-200 rounded-2xl p-4 mb-6">
              <p className="text-xs font-black text-[#143867] mb-1 flex items-center gap-1">
                <span>💡 Agastya Kuppam Secret:</span>
              </p>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                {selectedLandmark.funFact}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLandmark(null)}
                className="px-6 py-2.5 rounded-full bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-xs shadow-md transition-colors"
              >
                Awesome! Continue Exploring 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
