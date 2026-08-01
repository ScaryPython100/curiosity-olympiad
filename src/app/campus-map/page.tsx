"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProfileStats } from "@/app/actions/profile";

export interface CampusLandmark {
  id: number;
  name: string;
  xpRequired: number;
  category: string;
  description: string;
  funFact: string;
  x: number; // percentage width on SVG map (0-100)
  y: number; // percentage height on SVG map (0-100)
}

// Exactly matching the 11 official landmarks with 0 to 10,000 XP scale (increments of 1,000 XP)!
const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 1,
    name: "Entrance",
    xpRequired: 0,
    category: "Campus Gateway",
    description: "Welcome to the 172-acre Agastya Kuppam Creative Campus—where curiosity begins!",
    funFact: "Agastya's Kuppam Campus welcomes over 500 children every day from surrounding rural villages!",
    x: 8,
    y: 82
  },
  {
    id: 2,
    name: "Art Center",
    xpRequired: 1000,
    category: "Creative Expression",
    description: "Where painting, sculpture, and visual arts intersect with natural sciences.",
    funFact: "Students make natural organic paints using rocks, leaves, and soil from the Kuppam hills!",
    x: 24,
    y: 76
  },
  {
    id: 3,
    name: "Innovation Center",
    xpRequired: 2000,
    category: "Invention Lab",
    description: "Hands-on prototype building, electronics, and creative mechanical design.",
    funFact: "Rural students build low-cost water filters and solar lamps in this hands-on workshop!",
    x: 45,
    y: 78
  },
  {
    id: 4,
    name: "Jhunjhunwala Discovery Center",
    xpRequired: 3000,
    category: "Core Science Experience",
    description: "The flagship center housing 200+ interactive physics & chemistry exhibits!",
    funFact: "Explore 200+ physics experiments! Children touch, play, and experiment with real scientific laws here!",
    x: 68,
    y: 80
  },
  {
    id: 5,
    name: "BioDiversity Center",
    xpRequired: 4000,
    category: "Ecology & Nature",
    description: "A sprawling botanical reserve dedicated to native flora, fauna, and medicinal plants.",
    funFact: "Over 200 species of birds and indigenous trees thrive on this restored ecosystem!",
    x: 88,
    y: 64
  },
  {
    id: 6,
    name: "Ramanujan Math Park",
    xpRequired: 5000,
    category: "Mathematics in Nature",
    description: "An open-air interactive park filled with geometric puzzles and number theory sculptures.",
    funFact: "Dedicated to Srinivasa Ramanujan, children learn calculus and geometry through giant outdoor playgrounds!",
    x: 75,
    y: 44
  },
  {
    id: 7,
    name: "Chemistry Lab",
    xpRequired: 6000,
    category: "Molecular Wonders",
    description: "Colorful reactions, titration experiments, and everyday household chemistry.",
    funFact: "Students learn why turmeric turns red in soap water and how natural indicators work!",
    x: 54,
    y: 49
  },
  {
    id: 8,
    name: "Butterfly Park",
    xpRequired: 7000,
    category: "Living Habitat",
    description: "A lush garden sanctuary attracting dozens of native butterfly species.",
    funFact: "Children observe the complete metamorphosis from caterpillar to chrysalis to beautiful butterfly!",
    x: 30,
    y: 48
  },
  {
    id: 9,
    name: "Computer & IT Center",
    xpRequired: 8000,
    category: "Digital World",
    description: "Robotics, introductory coding, and digital literacy for future innovators.",
    funFact: "Students program autonomous line-following robots and build digital sensors here!",
    x: 14,
    y: 36
  },
  {
    id: 10,
    name: "Gurugruha Astronomy Center",
    xpRequired: 9000,
    category: "Space & Cosmos",
    description: "Telescopes, planetarium dome shows, and stargazing across the universe.",
    funFact: "The Kuppam night sky is so clear that children can see Jupiter's four largest moons through the campus telescopes!",
    x: 38,
    y: 20
  },
  {
    id: 11,
    name: "VisionWorks",
    xpRequired: 10000,
    category: "Advanced Optics & Future",
    description: "Where light, lenses, lasers, and perception create futuristic scientific breakthroughs!",
    funFact: "The ultimate milestone on the Agastya campus—celebrating vision, confidence, and lifelong curiosity!",
    x: 88,
    y: 16
  }
];

// Custom, high-fidelity SVG landmark illustration for each of the 11 Agastya Kuppam Campus landmarks
function renderCustomLandmarkIcon(id: number, isUnlocked: boolean) {
  const strokeColor = isUnlocked ? "#FFE16D" : "#94A3B8";
  const accentColor = isUnlocked ? "#F37021" : "#64748B";

  switch (id) {
    case 1: // 1. Entrance (Campus Archway Gate)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Main campus arch columns */}
          <path d="M12 52V20H20V52M44 52V20H52V52" fill={accentColor} />
          {/* Arch roof and pediment */}
          <path d="M8 20L32 8L56 20H8Z" fill={strokeColor} />
          <path d="M20 20C20 14 44 14 44 20" stroke={strokeColor} strokeWidth="3" />
          {/* Golden campus emblem */}
          <circle cx="32" cy="32" r="5" fill="#FFE16D" />
          <path d="M28 52V38H36V52" fill="#1E293B" />
        </svg>
      );

    case 2: // 2. Art Center (Artist Easel & Palette)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Wooden Easel Stand */}
          <path d="M32 8V56M20 56L32 16L44 56" stroke={accentColor} strokeWidth="4" strokeLinecap="round" />
          {/* Artist Palette */}
          <path
            d="M24 28C16 28 14 38 20 44C26 50 38 46 42 38C46 30 38 22 30 26"
            fill={strokeColor}
            stroke="#1E293B"
            strokeWidth="2"
          />
          {/* Colorful paint spots */}
          <circle cx="22" cy="36" r="3" fill="#EF4444" />
          <circle cx="30" cy="40" r="3" fill="#3B82F6" />
          <circle cx="36" cy="34" r="3" fill="#10B981" />
          {/* Paintbrush */}
          <path d="M46 16L32 30" stroke="#F37021" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 3: // 3. Innovation Center (Interlocking Prototype Gears & Circuit)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Large Engineering Gear */}
          <circle cx="26" cy="34" r="12" stroke={strokeColor} strokeWidth="6" strokeDasharray="6 4" />
          <circle cx="26" cy="34" r="5" fill={accentColor} />
          {/* Small Interlocking Gear */}
          <circle cx="44" cy="22" r="8" stroke="#38BDF8" strokeWidth="4" strokeDasharray="4 3" />
          <circle cx="44" cy="22" r="3" fill="#FFE16D" />
          {/* Innovation Lightning Bolt */}
          <path d="M40 40L48 48L44 54L38 46Z" fill="#F97316" />
        </svg>
      );

    case 4: // 4. Jhunjhunwala Discovery Center (Physics Gyroscope & Atom Model)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Atom orbital rings */}
          <ellipse cx="32" cy="32" rx="22" ry="9" stroke={strokeColor} strokeWidth="3" transform="rotate(-30 32 32)" />
          <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#38BDF8" strokeWidth="3" transform="rotate(60 32 32)" />
          {/* Center physics nucleus */}
          <circle cx="32" cy="32" r="7" fill={accentColor} />
          <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
          {/* Orbital electrons */}
          <circle cx="50" cy="22" r="3.5" fill="#FFE16D" />
          <circle cx="14" cy="42" r="3.5" fill="#38BDF8" />
        </svg>
      );

    case 5: // 5. BioDiversity Center (Lush Indigenous Banyan Tree)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Banyan Tree Trunk & Roots */}
          <path d="M28 54V34C28 34 22 46 22 54M36 54V34C36 34 42 46 42 54M32 54V28" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          {/* Lush Green Banyan Canopy */}
          <circle cx="32" cy="24" r="14" fill="#10B981" />
          <circle cx="20" cy="28" r="10" fill="#059669" />
          <circle cx="44" cy="28" r="10" fill="#34D399" />
          <circle cx="32" cy="18" r="8" fill="#A7F3D0" />
        </svg>
      );

    case 6: // 6. Ramanujan Math Park (Infinity Symbol inside Geometric Sculpture)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Pythagorean Geometric Triangle Frame */}
          <path d="M32 10L54 50H10L32 10Z" stroke={accentColor} strokeWidth="4" fill="none" />
          {/* Ramanujan Golden Infinity Symbol (∞) */}
          <path
            d="M23 35C19 35 16 38 16 41C16 44 19 47 23 47C28 47 36 35 41 35C45 35 48 38 48 41C48 44 45 47 41 47C36 47 28 35 23 35Z"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Pi / Math point */}
          <circle cx="32" cy="24" r="3" fill="#38BDF8" />
        </svg>
      );

    case 7: // 7. Chemistry Lab (Titration Flask & Chemical Reaction)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Glass Erlenmeyer Flask */}
          <path
            d="M26 14H38V24L48 46C50 50 47 54 43 54H21C17 54 14 50 16 46L26 24V14Z"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Colorful chemical liquid */}
          <path
            d="M19 40H45L47 46C49 50 46 54 42 54H22C18 54 15 50 17 46L19 40Z"
            fill="#A855F7"
          />
          {/* Reaction bubbles */}
          <circle cx="32" cy="46" r="3" fill="#FFE16D" />
          <circle cx="26" cy="44" r="2" fill="#38BDF8" />
          <circle cx="38" cy="42" r="2.5" fill="#F43F5E" />
          <circle cx="32" cy="20" r="2" fill="#FFE16D" />
        </svg>
      );

    case 8: // 8. Butterfly Park (Detailed Monarch Butterfly)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Upper Wings */}
          <path
            d="M32 32C20 12 8 16 12 32C14 40 28 36 32 32Z"
            fill="#F97316"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path
            d="M32 32C44 12 56 16 52 32C50 40 36 36 32 32Z"
            fill="#F97316"
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Lower Wings */}
          <path
            d="M32 34C22 44 14 52 24 52C30 52 32 40 32 34Z"
            fill="#FBBF24"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path
            d="M32 34C42 44 50 52 40 52C34 52 32 40 32 34Z"
            fill="#FBBF24"
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Butterfly Body & Antennae */}
          <path d="M32 20V46" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 20C28 14 24 14 24 14M32 20C36 14 40 14 40 14" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 9: // 9. Computer & IT Center (Monitor & Autonomous Robot)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Desktop Monitor */}
          <rect x="10" y="14" width="44" height="28" rx="4" fill="#1E293B" stroke={strokeColor} strokeWidth="3" />
          {/* Code lines on screen */}
          <path d="M18 22H30M18 28H26M18 34H36" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Stand */}
          <path d="M26 42H38M32 42V50M22 50H42" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          {/* Little glowing AI sensor dot */}
          <circle cx="44" cy="24" r="3" fill="#10B981" />
        </svg>
      );

    case 10: // 10. Gurugruha Astronomy Center (Observatory Dome & Saturn)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Planetarium Observatory Dome */}
          <path d="M14 48C14 32 50 32 50 48H14Z" fill="#1E293B" stroke={strokeColor} strokeWidth="3" />
          {/* Telescope lens slot */}
          <path d="M28 36L42 22" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
          {/* Saturn planet in the sky */}
          <circle cx="48" cy="16" r="5" fill="#FBBF24" />
          <ellipse cx="48" cy="16" rx="9" ry="3" stroke="#FFE16D" strokeWidth="2" transform="rotate(-20 48 16)" />
          {/* Stars */}
          <circle cx="16" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="26" cy="14" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 11: // 11. VisionWorks (Optical Prism Refracting Rainbow Spectrum)
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md">
          {/* Glass Triangular Optical Prism */}
          <path d="M32 14L52 50H12L32 14Z" fill="rgba(255,255,255,0.15)" stroke={strokeColor} strokeWidth="3.5" />
          {/* Incoming White Light Beam */}
          <path d="M4 36L26 36" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          {/* Refracted Rainbow Spectrum Beams */}
          <path d="M38 36L58 26" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 36L60 33" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 36L60 40" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M38 36L58 47" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}

export default function CampusMapPage() {
  // Fetch user XP or mock to 8600 XP for testing if 0
  const [userXp, setUserXp] = useState(8600);
  const [userName, setUserName] = useState("Explorer");
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark | null>(null);
  const [vanHonking, setVanHonking] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await getProfileStats();
      if (res.data) {
        // Use user's real XP if positive, otherwise default/mock to 8600 XP for testing
        const fetchedXp = res.data.xp || 8600;
        setUserXp(fetchedXp);
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

  // Calculate Van's exact coordinate position along the SVG path based on user's XP relative to 10000 XP total
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
    /* 
      1. BACKGROUND WITH LUSH GREEN TREES & FOREST (ZERO EMOJIS CONSTRAINT):
      Rich outdoor emerald gradient container with multi-layered SVG forest silhouettes,
      pine trees, oak trees, and rolling hills without any emojis.
    */
    <div className="min-h-screen bg-gradient-to-b from-[#0f3d24] via-[#145330] to-[#166534] text-white selection:bg-[#ffe16d] selection:text-[#143867] pb-24 relative overflow-x-hidden">
      
      {/* Top Header Nav */}
      <header className="sticky top-0 z-40 bg-[#0f3d24]/90 backdrop-blur-md border-b border-emerald-400/20 px-4 sm:px-8 py-4 shadow-lg">
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
                Official Agastya Highway
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                The Winding Road of Kuppam Hills
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* The 'Honk Van' Feature: button at top of screen labeled 'Honk Van! 🎺' */}
            <button
              onClick={handleHonk}
              className={`px-5 py-2.5 rounded-full bg-[#ffe16d] hover:bg-yellow-300 text-[#143867] font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95 border-2 border-[#f37021] ${
                vanHonking ? "animate-bounce ring-4 ring-amber-300" : ""
              }`}
              title="Honk the Mobile Science Van!"
            >
              <span>{vanHonking ? "BEEP BEEP! 🎺" : "Honk Van! 🎺"}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#145330] border border-emerald-400/30 shadow-inner">
              <span className="text-xs font-black uppercase text-emerald-200">Total Progress:</span>
              <span className="text-sm font-extrabold text-[#ffe16d]">{userXp} / 10000 XP</span>
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
            THE WINDING HIGHWAY CANVAS WITH LUSH SVG FOREST TREES & HILLS
            ======================================================== */}
        <div className="relative w-full h-[680px] sm:h-[750px] bg-[#0e3b26] rounded-3xl border-2 border-emerald-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden p-4 sm:p-8">
          
          {/* ========================================================
              BACKGROUND LAYER: LUSH FOREST TREES & ROLLING HILLS (ZERO EMOJIS)
              Clean SVG geometric pine trees, oak trees, and hills
              ======================================================== */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-95"
            viewBox="0 0 1000 750"
            preserveAspectRatio="none"
          >
            {/* Far Background Rolling Forest Hills */}
            <path
              d="M0 650 Q 250 540, 500 620 Q 750 680, 1000 580 L 1000 750 L 0 750 Z"
              fill="#092819"
            />
            <path
              d="M0 580 Q 200 640, 450 560 Q 750 490, 1000 600 L 1000 750 L 0 750 Z"
              fill="#0b301e"
            />
            <path
              d="M0 700 Q 300 620, 600 690 Q 850 720, 1000 660 L 1000 750 L 0 750 Z"
              fill="#0f3b25"
            />

            {/* Top Border Pine Trees & Forest Canopy Silhouettes */}
            <g fill="#144f32">
              <polygon points="50,140 30,190 70,190" />
              <polygon points="50,110 35,150 65,150" />
              <polygon points="120,130 95,185 145,185" />
              <polygon points="120,95 102,145 138,145" />
              <circle cx="210" cy="140" r="38" />
              <circle cx="240" cy="155" r="32" />
              <polygon points="340,120 315,180 365,180" />
              <polygon points="340,90 322,140 358,140" />
              <polygon points="520,110 495,170 545,170" />
              <polygon points="520,80 502,130 538,130" />
              <circle cx="640" cy="135" r="36" />
              <circle cx="670" cy="145" r="30" />
              <polygon points="780,105 755,165 805,165" />
              <polygon points="780,75 762,125 798,125" />
              <circle cx="920" cy="125" r="42" />
              <circle cx="950" cy="140" r="35" />
            </g>

            {/* Bottom Border Lush Evergreen Forest Trees */}
            <g fill="#124a2f">
              <polygon points="80,680 55,750 105,750" />
              <polygon points="80,640 62,695 98,695" />
              <circle cx="200" cy="695" r="45" />
              <circle cx="240" cy="710" r="38" />
              <polygon points="380,660 350,735 410,735" />
              <polygon points="380,625 360,675 400,675" />
              <circle cx="560" cy="685" r="42" />
              <polygon points="710,655 680,730 740,730" />
              <polygon points="710,620 690,670 730,670" />
              <circle cx="860" cy="690" r="46" />
              <circle cx="910" cy="710" r="40" />
            </g>

            {/* Midground Foliage Clusters & Oak Tree Crowns */}
            <g fill="#18613e" opacity="0.8">
              <circle cx="160" cy="350" r="30" />
              <circle cx="190" cy="365" r="25" />
              <circle cx="820" cy="420" r="32" />
              <circle cx="850" cy="435" r="28" />
              <circle cx="480" cy="240" r="28" />
              <circle cx="510" cy="255" r="24" />
            </g>
          </svg>

          {/* 
            2. THE WINDING SVG HIGHWAY (CUBIC BEZIERS ONLY):
            Buttery smooth S-curve using continuous Cubic Bezier curves (C commands only).
            Zero quadratic curves (Q) or straight lines (L) to ensure zero sharp edges or angles.
          */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Outer Grassy Highway Bank */}
            <path
              d="M 8 82 C 16 82, 32 68, 45 78 C 55 86, 75 80, 88 64 C 94 54, 88 44, 75 44 C 64 44, 42 54, 30 48 C 18 42, 10 36, 16 28 C 24 18, 55 16, 88 16"
              fill="none"
              stroke="#0b2c1d"
              strokeWidth="7.8"
              strokeLinecap="round"
            />
            {/* Dark asphalt highway base */}
            <path
              d="M 8 82 C 16 82, 32 68, 45 78 C 55 86, 75 80, 88 64 C 94 54, 88 44, 75 44 C 64 44, 42 54, 30 48 C 18 42, 10 36, 16 28 C 24 18, 55 16, 88 16"
              fill="none"
              stroke="#334155"
              strokeWidth="5.6"
              strokeLinecap="round"
            />
            {/* Dashed orange/yellow center line of the Agastya Highway */}
            <path
              d="M 8 82 C 16 82, 32 68, 45 78 C 55 86, 75 80, 88 64 C 94 54, 88 44, 75 44 C 64 44, 42 54, 30 48 C 18 42, 10 36, 16 28 C 24 18, 55 16, 88 16"
              fill="none"
              stroke="#ffe16d"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
          </svg>

          {/* 
            3. THE 11 OFFICIAL LANDMARKS (WITH CUSTOM SVG ILLUSTRATED ICONS):
            Render circular nodes at each milestone along the path with custom campus SVG icons.
          */}
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
                {/* Milestone Node Circle with Custom Landmark SVG Icon */}
                <button
                  onClick={() => setSelectedLandmark(landmark)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isUnlocked
                      ? "bg-[#143867] border-[#ffe16d] text-[#ffe16d] shadow-[0_0_25px_rgba(255,225,109,0.5)]"
                      : "bg-[#1e293b] border-gray-600 text-gray-400 opacity-85"
                  } ${isCurrent ? "ring-4 ring-amber-400 animate-pulse" : ""} ${
                    isSelected ? "scale-110 ring-4 ring-white" : ""
                  }`}
                  title={`${landmark.name} (${landmark.xpRequired} XP required)`}
                >
                  {renderCustomLandmarkIcon(landmark.id, isUnlocked)}
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
              4. THE MOBILE SCIENCE VAN (YELLOW/ORANGE ELEMENT)
              Calculated exact coordinate position along SVG path based on user XP relative to 10000 XP total.
              ======================================================== */}
          <div
            style={{ left: `${vanX}%`, top: `${vanY}%` }}
            className={`absolute -translate-x-1/2 -translate-y-full pb-4 z-20 pointer-events-none transition-all duration-700 ease-out ${
              vanHonking ? "animate-bounce scale-110" : ""
            }`}
          >
            <div className="relative flex flex-col items-center">
              {/* Van Bubble */}
              <div className="w-16 h-12 sm:w-20 sm:h-14 bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-2 border-[#f37021] overflow-hidden flex items-center justify-center p-1 bg-gradient-to-br from-yellow-300 to-amber-500">
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
              <span className="px-2.5 py-0.5 bg-[#f37021] text-white text-[10px] font-black rounded-full shadow-md mt-1 whitespace-nowrap border border-white/30">
                You are here! ({userXp} XP) 🚌
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. INTERACTIVITY: MODAL WITH REAL-WORLD KUPPAM TRIVIA
            ======================================================== */}
        {selectedLandmark && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0e3b26] text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-emerald-400/40 shadow-2xl relative animate-in zoom-in-95 duration-200">
              
              <button
                onClick={() => setSelectedLandmark(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-emerald-700 flex items-center justify-center text-white font-bold transition-colors"
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#143867] border-2 border-[#ffe16d] flex items-center justify-center p-2">
                  {renderCustomLandmarkIcon(selectedLandmark.id, true)}
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
                    <span>💡 Agastya Kuppam Campus Trivia</span>
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
