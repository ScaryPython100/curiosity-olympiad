"use client";

import { useState, useRef } from 'react';

interface GravityLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function GravityLevel({ recordAction, experimentSubIndex = 0 }: GravityLevelProps) {
  const [attractorMass, setAttractorMass] = useState(1.0);
  const [launchSpeed, setLaunchSpeed] = useState(250);
  
  // State for Experiment 1 (Ceiling Fan)
  const [bladeCount, setBladeCount] = useState<3 | 4 | 5>(3);
  const [showBreezeLines, setShowBreezeLines] = useState(true);

  // State for Experiment 2 (Orbital Gravity)
  const [showVelocityVectors, setShowVelocityVectors] = useState(true);

  // State for Experiment 3 (Galileo Vacuum Drop)
  const [isVacuumActive, setIsVacuumActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [ballProgress, setBallProgress] = useState(0); // 0 to 100%
  const [featherProgress, setFeatherProgress] = useState(0); // 0 to 100%

  const workspaceRef = useRef<HTMLDivElement>(null);

  const expInfo = [
    {
      title: "Everyday Air & Fan Blades Lab",
      objective: "Adjust Ceiling Fan Speed Regulator and Airflow Speed to discover how fan blades create cooling breezes in daily life.",
      slider1Label: "Fan Speed Regulator",
      slider1Val: `${Math.round(attractorMass * 2)}`,
      slider2Label: "Airflow Speed",
      slider2Val: `${Math.round(launchSpeed / 10)} km/h`
    },
    {
      title: "Planetary Gravity & Orbital Velocity Lab",
      objective: "Adjust Planet Mass and Orbital Velocity to observe how satellite trajectories curve into stable free-fall orbits.",
      slider1Label: "Planet Mass Factor",
      slider1Val: `${attractorMass.toFixed(1)} M⊕`,
      slider2Label: "Orbital Velocity",
      slider2Val: `${(launchSpeed / 30).toFixed(1)} km/s`
    },
    {
      title: "Freefall Gravity & Terminal Air Resistance Lab",
      objective: "Adjust Object Mass and Drop Altitude to observe atmospheric drag, Galileo's equivalence principle, and terminal velocity.",
      slider1Label: "Object Mass",
      slider1Val: `${(attractorMass * 5).toFixed(1)} kg`,
      slider2Label: "Drop Altitude",
      slider2Val: `${Math.round(launchSpeed * 2)} m`
    }
  ][experimentSubIndex] || {
    title: "Everyday Air & Fan Blades Lab",
    objective: "Adjust Ceiling Fan Speed Regulator and Airflow Speed to discover how fan blades create cooling breezes in daily life.",
    slider1Label: "Fan Speed Regulator",
    slider1Val: `${Math.round(attractorMass * 2)}`,
    slider2Label: "Airflow Speed",
    slider2Val: `${Math.round(launchSpeed / 10)} km/h`
  };

  const handleMassChange = (val: number) => {
    setAttractorMass(val);
    recordAction('changed_attractor_mass', { val });
  };

  const handleSpeedChange = (val: number) => {
    setLaunchSpeed(val);
    recordAction('changed_launch_speed', { val });
  };

  const triggerDropAnimation = () => {
    if (isDropping) return;
    recordAction('triggered_freefall_drop', { isVacuumActive });
    setIsDropping(true);
    setBallProgress(0);
    setFeatherProgress(0);

    // Ball falls fast regardless
    let ballP = 0;
    let featherP = 0;

    const interval = setInterval(() => {
      ballP += 5;
      featherP += isVacuumActive ? 5 : 2; // In vacuum, feather matches ball speed!

      setBallProgress(Math.min(100, ballP));
      setFeatherProgress(Math.min(100, featherP));

      if (ballP >= 100 && featherP >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsDropping(false), 1000);
      }
    }, 50);
  };

  const renderCanvas = () => {
    if (experimentSubIndex === 0) {
      // --- EXPERIMENT 1: CEILING FAN AIRFLOW & BREEZE VELOCITY LAB ---
      const fanSpeedRpm = Math.round(attractorMass * 2 * 60 + launchSpeed);
      const spinDurationSec = Math.max(0.15, 2.0 / (attractorMass * 1.2));
      const breezeDurationSec = Math.max(0.25, 2.5 - (launchSpeed / 200));

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Responsive Control Toolbar (No more absolute overlap on mobile!) */}
          <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/95 p-2 rounded-xl border border-slate-700 text-xs shrink-0 z-20 shadow-md">
            <span className="text-gray-300 font-bold mr-1">Fan Blades:</span>
            {([3, 4, 5] as const).map((count) => (
              <button
                key={count}
                onClick={() => setBladeCount(count)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${bladeCount === count ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {count} Blades
              </button>
            ))}
            <button
              onClick={() => setShowBreezeLines(prev => !prev)}
              className={`ml-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${showBreezeLines ? 'bg-cyan-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {showBreezeLines ? 'Hide Breeze' : 'Show Breeze'}
            </button>
          </div>

          {/* Centered Proper Indian Ceiling Fan Simulation Assembly (Top-Down SVG) */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto overflow-hidden">
            <svg
              viewBox="0 0 280 280"
              className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 overflow-visible z-10"
            >
              <defs>
                <radialGradient id="hubGold" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </radialGradient>
                <linearGradient id="bladeWood" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#92400e" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="bracketGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <filter id="fanShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Spinning Blades & Brackets Group - Symmetrically rotating around exact center (140, 140) */}
              <g
                style={{
                  transformOrigin: '140px 140px',
                  animation: `spin ${spinDurationSec}s linear infinite`,
                }}
              >
                {Array.from({ length: bladeCount }).map((_, bIdx) => {
                  const rotDeg = (360 / bladeCount) * bIdx;
                  return (
                    <g key={bIdx} transform={`rotate(${rotDeg}, 140, 140)`}>
                      {/* Metallic Gold Bracket from Hub (r=22) to Blade (r=42) */}
                      <rect
                        x="162"
                        y="136"
                        width="22"
                        height="8"
                        rx="3"
                        fill="url(#bracketGold)"
                        stroke="#fcd34d"
                        strokeWidth="1"
                      />
                      {/* Aerodynamic Indian Tropical Blade from r=40 to r=120 */}
                      <path
                        d="M 180,131 C 220,123 255,129 260,139 C 265,149 230,157 180,149 Z"
                        fill="url(#bladeWood)"
                        stroke="#fcd34d"
                        strokeWidth="1.5"
                        filter="url(#fanShadow)"
                      />
                      {/* Decorative balance rivets along the blade */}
                      <circle cx="192" cy="140" r="2.5" fill="#fef08a" />
                      <circle cx="245" cy="140" r="2.5" fill="#fef08a" opacity="0.8" />
                    </g>
                  );
                })}
              </g>

              {/* Central Stationary/Spinning Motor Canopy Hub - EXACTLY centered at (140, 140) */}
              <g filter="url(#fanShadow)">
                {/* Outer metallic brown bezel ring */}
                <circle cx="140" cy="140" r="32" fill="#451a03" stroke="#f59e0b" strokeWidth="3" />
                {/* Main metallic amber motor canopy */}
                <circle cx="140" cy="140" r="26" fill="url(#hubGold)" stroke="#fcd34d" strokeWidth="2" />
                {/* Inner bronze medallion */}
                <circle cx="140" cy="140" r="14" fill="#78350f" stroke="#fcd34d" strokeWidth="1.5" />
                {/* Center decorative gold cap */}
                <circle cx="140" cy="140" r="6" fill="#fef08a" />
                {/* 4 Symmetric Screw Rivets around the hub */}
                <circle cx="140" cy="116" r="2" fill="#fcd34d" />
                <circle cx="140" cy="164" r="2" fill="#fcd34d" />
                <circle cx="116" cy="140" r="2" fill="#fcd34d" />
                <circle cx="164" cy="140" r="2" fill="#fcd34d" />
              </g>
            </svg>

            {/* Dynamic Animated Airflow Breeze Waves in background */}
            {showBreezeLines && (
              <div className="absolute inset-0 flex justify-around pointer-events-none opacity-60 z-0 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((line) => (
                  <div key={line} className="w-1.5 h-full relative flex flex-col justify-around">
                    <div
                      className="w-full bg-gradient-to-b from-cyan-400 via-sky-300 to-transparent rounded-full shadow-[0_0_12px_#38bdf8] animate-bounce"
                      style={{
                        height: `${25 + (line % 3) * 15}%`,
                        animationDuration: `${breezeDurationSec / (0.8 + (line % 3) * 0.2)}s`,
                        animationIterationCount: 'infinite',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Responsive Velocity & RPM Display Card (Never cut off!) */}
          <div className="w-full max-w-lg mx-auto bg-slate-900/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-700 text-center shadow-lg shrink-0 z-20">
            <span className="text-xs sm:text-sm font-bold text-cyan-300 block">
              🌀 Fan Speed: {fanSpeedRpm} RPM • Breeze Velocity: {Math.round(launchSpeed / 10)} km/h
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {bladeCount === 3 ? "3-Blade Indian Tropical Fan: High RPM & Maximum Air Displacement" : `${bladeCount}-Blade Fan: Quiet Low-Speed Circulation`}
            </p>
          </div>
        </div>
      );
    } else if (experimentSubIndex === 1) {
      // --- EXPERIMENT 2: PLANETARY GRAVITY & SATELLITE ORBIT SIMULATOR ---
      // Responsive planet & orbit radius so it never exceeds mobile width!
      const planetRadiusPx = Math.min(38, Math.round(18 * attractorMass));
      const orbitSpeedSec = Math.max(1.2, 10 - launchSpeed / 40);

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-[#030712] flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Starfield Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />

          {/* Centered Planet & Orbital Simulation */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            {/* Gravitational Field Rings */}
            <div 
              className="absolute rounded-full border-2 border-dashed border-cyan-500/30 animate-spin opacity-50"
              style={{ 
                width: `${planetRadiusPx * 5}px`, 
                height: `${planetRadiusPx * 5}px`,
                animationDuration: '25s'
              }}
            />

            {/* Central Planet Earth / Jupiter */}
            <div 
              className="relative z-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 border-4 border-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center transition-all duration-300"
              style={{
                width: `${planetRadiusPx * 2.2}px`,
                height: `${planetRadiusPx * 2.2}px`
              }}
            >
              <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-400/40 via-transparent to-transparent" />
              <span className="absolute text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest shadow-md">
                {attractorMass > 1.8 ? "JUPITER" : "EARTH"} ({attractorMass.toFixed(1)} M⊕)
              </span>
            </div>

            {/* Orbiting Satellite Container */}
            <div 
              className="absolute z-20 flex items-center justify-center pointer-events-none"
              style={{
                width: `${planetRadiusPx * 5}px`,
                height: `${planetRadiusPx * 5}px`,
                animation: `spin ${orbitSpeedSec}s linear infinite`
              }}
            >
              <div className="absolute -top-3 w-7 h-7 bg-amber-400 border-2 border-amber-100 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs text-amber-950">satellite_alt</span>
              </div>

              {showVelocityVectors && (
                <div className="absolute -top-3 left-1/2 w-12 sm:w-16 h-0.5 bg-green-400 shadow-[0_0_8px_#22c55e]">
                  <div className="w-2 h-2 border-t-2 border-r-2 border-green-400 rotate-45 absolute -right-1 -top-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Responsive Bottom Banner (No absolute overlap on mobile!) */}
          <div className="w-full max-w-lg mx-auto bg-slate-900/95 p-2.5 sm:p-3 rounded-xl border border-slate-700 text-xs text-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 z-20 shadow-md">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="font-bold text-cyan-300">🪐 Gravity Force: F = G (M · m) / r²</p>
              <p className="font-bold text-amber-300">🛰️ Orbital Velocity: {(launchSpeed / 30).toFixed(1)} km/s</p>
            </div>
            <button
              onClick={() => setShowVelocityVectors(prev => !prev)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition-all shadow"
            >
              {showVelocityVectors ? 'Hide Vectors' : 'Show Velocity Vectors'}
            </button>
          </div>
        </div>
      );
    } else {
      // --- EXPERIMENT 3: FREEFALL GRAVITY & GALILEO DROP TOWER ---
      const altitudeMeters = Math.round(launchSpeed * 2);

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Responsive Drop Tower Top Frame */}
          <div className="w-full max-w-md h-10 bg-gray-800 border-2 border-gray-600 rounded-t-xl flex items-center justify-between px-3 sm:px-6 shadow-md z-10 shrink-0">
            <span className="text-xs font-bold text-yellow-300">Galileo Tower ({altitudeMeters}m)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-gray-400">Chamber:</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isVacuumActive ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                {isVacuumActive ? 'Vacuum (0 Air)' : 'Atmospheric Air'}
              </span>
            </div>
          </div>

          {/* Dual Drop Tracks with responsive width and padding */}
          <div className="relative w-full max-w-md flex-1 bg-gray-900/80 border-x-2 border-gray-700 flex justify-around px-2 sm:px-4 py-4 min-h-[220px]">
            
            {/* Track 1: Cricket Ball */}
            <div className="relative w-24 sm:w-28 h-full border-r border-dashed border-gray-700 flex flex-col items-center justify-between">
              <span className="text-[10px] font-bold text-red-400 bg-gray-950 px-2 py-0.5 rounded text-center">Heavy Cricket Ball</span>
              <div 
                className="w-10 h-10 rounded-full bg-red-600 border-2 border-red-200 shadow-lg flex items-center justify-center absolute transition-all duration-75"
                style={{ top: `${Math.min(85, ballProgress)}%`, transform: 'translateY(-50%)' }}
              >
                <span className="text-[9px] font-bold text-white">5.5 oz</span>
              </div>
              <span className="text-[10px] text-gray-500">Ground</span>
            </div>

            {/* Track 2: Feather */}
            <div className="relative w-24 sm:w-28 h-full flex flex-col items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 bg-gray-950 px-2 py-0.5 rounded text-center">Light Feather</span>
              <div 
                className="w-8 h-8 rounded-full bg-sky-200 border-2 border-cyan-400 shadow-lg flex items-center justify-center absolute transition-all duration-75"
                style={{ top: `${Math.min(85, featherProgress)}%`, transform: 'translateY(-50%)' }}
              >
                <span className="material-symbols-outlined text-xs text-cyan-900">feather</span>
              </div>
              <span className="text-[10px] text-gray-500">Ground</span>
            </div>
          </div>

          {/* Responsive Controls Bar (No clipping on mobile!) */}
          <div className="w-full max-w-md bg-gray-800 p-2.5 sm:p-3 border-2 border-gray-600 rounded-b-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-10 shrink-0">
            <button
              onClick={() => setIsVacuumActive(prev => !prev)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${isVacuumActive ? 'bg-emerald-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {isVacuumActive ? '💨 Open Air Valve' : '🧪 Pump Vacuum Chamber'}
            </button>

            <button
              onClick={triggerDropAnimation}
              disabled={isDropping}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase shadow-md active:scale-95 disabled:opacity-50 shrink-0"
            >
              {isDropping ? 'Falling...' : 'Drop Both'}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Level Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2 shrink-0">
        <div className="flex-1 pr-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded text-white uppercase tracking-wider">Experiment {experimentSubIndex + 1}</span>
             {expInfo.title}
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            <strong>Objective:</strong> {expInfo.objective}
          </p>
        </div>
      </div>

      {/* Interactive Simulation Variables Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider1Label}: {expInfo.slider1Val}</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={attractorMass}
            onChange={(e) => handleMassChange(parseFloat(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider2Label}: {expInfo.slider2Val}</span>
          <input
            type="range"
            min="100"
            max="500"
            step="20"
            value={launchSpeed}
            onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Dynamic Physics Visual Canvas Container */}
      <div className="flex-1 w-full relative overflow-hidden bg-gray-950">
        {renderCanvas()}
      </div>
    </div>
  );
}
