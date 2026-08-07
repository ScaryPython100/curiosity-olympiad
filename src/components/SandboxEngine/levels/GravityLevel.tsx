"use client";

import { useState } from 'react';

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ attractorMass, launchSpeed, recordAction }: any) {
  const [bladeCount, setBladeCount] = useState<3 | 4 | 5>(3);
  const [showBreezeLines, setShowBreezeLines] = useState(true);

  const fanSpeedRpm = Math.round(attractorMass * 2 * 60 + launchSpeed);
  const spinDurationSec = Math.max(0.15, 2.0 / (attractorMass * 1.2));
  const breezeDurationSec = Math.max(0.25, 2.5 - (launchSpeed / 200));

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/95 p-2 rounded-xl border border-slate-700 text-xs z-20 shadow-md">
        <span className="text-gray-300 font-bold mr-1">Fan Blades:</span>
        {([3, 4, 5] as const).map((count) => (
          <button
            key={count}
            onClick={() => setBladeCount(count)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${bladeCount === count ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {count}
          </button>
        ))}
        <button
          onClick={() => setShowBreezeLines(prev => !prev)}
          className={`ml-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${showBreezeLines ? 'bg-cyan-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {showBreezeLines ? 'Hide Air' : 'Show Air'}
        </button>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center my-auto overflow-hidden">
        <svg
          viewBox="0 0 280 280"
          className="w-[50%] max-w-[280px] aspect-square overflow-visible z-10"
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
                  <rect x="162" y="136" width="22" height="8" rx="3" fill="url(#bracketGold)" stroke="#fcd34d" strokeWidth="1" />
                  <path d="M 180,131 C 220,123 255,129 260,139 C 265,149 230,157 180,149 Z" fill="url(#bladeWood)" stroke="#fcd34d" strokeWidth="1.5" filter="url(#fanShadow)" />
                  <circle cx="192" cy="140" r="2.5" fill="#fef08a" />
                  <circle cx="245" cy="140" r="2.5" fill="#fef08a" opacity="0.8" />
                </g>
              );
            })}
          </g>

          <g filter="url(#fanShadow)">
            <circle cx="140" cy="140" r="32" fill="#451a03" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="140" cy="140" r="26" fill="url(#hubGold)" stroke="#fcd34d" strokeWidth="2" />
            <circle cx="140" cy="140" r="14" fill="#78350f" stroke="#fcd34d" strokeWidth="1.5" />
            <circle cx="140" cy="140" r="6" fill="#fef08a" />
            <circle cx="140" cy="116" r="2" fill="#fcd34d" />
            <circle cx="140" cy="164" r="2" fill="#fcd34d" />
            <circle cx="116" cy="140" r="2" fill="#fcd34d" />
            <circle cx="164" cy="140" r="2" fill="#fcd34d" />
          </g>
        </svg>

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

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/95 px-3 py-2 rounded-xl border border-slate-700 text-center shadow-lg z-20">
        <span className="text-xs sm:text-sm font-bold text-cyan-300 block">
          🌀 Spin: {fanSpeedRpm} RPM • Air: {Math.round(launchSpeed / 10)} km/h
        </span>
        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
          {bladeCount === 3 ? "3 blades spin very fast and push lots of air." : `${bladeCount} blades spin slower but push air quietly.`}
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ attractorMass, launchSpeed, recordAction }: any) {
  const [showVelocityVectors, setShowVelocityVectors] = useState(true);

  // Responsive planet & orbit radius using percentages instead of pixels
  const planetRadiusPct = Math.min(25, Math.max(10, 8 * attractorMass));
  const orbitSpeedSec = Math.max(1.2, 10 - launchSpeed / 40);

  return (
    <div className="relative w-full h-full bg-[#030712] flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />

      <div className="relative flex-1 w-full flex items-center justify-center my-auto aspect-square max-h-full">
        {/* Gravitational Field Rings */}
        <div 
          className="absolute rounded-full border-2 border-dashed border-cyan-500/30 animate-spin opacity-50"
          style={{ 
            width: `${planetRadiusPct * 3.5}%`, 
            height: `${planetRadiusPct * 3.5}%`,
            animationDuration: '25s'
          }}
        />

        {/* Central Planet Earth / Jupiter */}
        <div 
          className="relative z-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 border-4 border-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.5)] flex items-center justify-center transition-all duration-300"
          style={{
            width: `${planetRadiusPct}%`,
            height: `${planetRadiusPct}%`
          }}
        >
          <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-400/40 via-transparent to-transparent" />
          <span className="absolute text-[8px] font-black text-white uppercase tracking-widest shadow-md whitespace-nowrap">
            {attractorMass > 1.8 ? "BIG PLANET" : "EARTH"}
          </span>
        </div>

        {/* Orbiting Satellite Container */}
        <div 
          className="absolute z-20 flex items-center justify-center pointer-events-none"
          style={{
            width: `${planetRadiusPct * 3.5}%`,
            height: `${planetRadiusPct * 3.5}%`,
            animation: `spin ${orbitSpeedSec}s linear infinite`
          }}
        >
          <div className="absolute -top-3 w-6 h-6 bg-amber-400 border-2 border-amber-100 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center">
            <span className="material-symbols-outlined text-[10px] text-amber-950">satellite_alt</span>
          </div>

          {showVelocityVectors && (
            <div className="absolute -top-2 left-1/2 w-10 sm:w-16 h-0.5 bg-green-400 shadow-[0_0_8px_#22c55e]">
              <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-green-400 rotate-45 absolute -right-0.5 -top-[2px]" />
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/95 px-3 py-2 rounded-xl border border-slate-700 text-center shadow-lg z-20">
        <span className="text-xs sm:text-sm font-bold text-cyan-300 block">
          🛰️ Speed: {(launchSpeed / 30).toFixed(1)} km/s
        </span>
        <button
          onClick={() => setShowVelocityVectors(prev => !prev)}
          className="mt-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-all"
        >
          {showVelocityVectors ? 'Hide Arrow' : 'Show Arrow'}
        </button>
      </div>
    </div>
  );
}

function ExperimentThree({ attractorMass, launchSpeed, recordAction }: any) {
  const [isVacuumActive, setIsVacuumActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [ballProgress, setBallProgress] = useState(0); 
  const [featherProgress, setFeatherProgress] = useState(0); 

  const triggerDropAnimation = () => {
    if (isDropping) return;
    recordAction('triggered_freefall_drop', { isVacuumActive });
    setIsDropping(true);
    setBallProgress(0);
    setFeatherProgress(0);

    let ballP = 0;
    let featherP = 0;

    const interval = setInterval(() => {
      ballP += 5;
      featherP += isVacuumActive ? 5 : 2; 

      setBallProgress(Math.min(100, ballP));
      setFeatherProgress(Math.min(100, featherP));

      if (ballP >= 100 && featherP >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsDropping(false), 1000);
      }
    }, 50);
  };

  const altitudeMeters = Math.round(launchSpeed * 2);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      <div className="w-full max-w-md h-8 bg-gray-800 border-2 border-gray-600 rounded-t-xl flex items-center justify-between px-3 shadow-md z-10 shrink-0">
        <span className="text-[10px] font-bold text-yellow-300">Height: {altitudeMeters}m</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isVacuumActive ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
            {isVacuumActive ? 'No Air (Space)' : 'Normal Air'}
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-md flex-1 bg-gray-900/80 border-x-2 border-gray-700 flex justify-around px-2 py-4">
        <div className="relative w-20 sm:w-28 h-full border-r border-dashed border-gray-700 flex flex-col items-center justify-between">
          <span className="text-[10px] font-bold text-red-400 bg-gray-950 px-1 py-0.5 rounded text-center leading-none">Heavy Ball</span>
          <div 
            className="w-8 h-8 rounded-full bg-red-600 border-2 border-red-200 shadow-lg flex items-center justify-center absolute transition-all duration-75"
            style={{ top: `${Math.min(85, ballProgress)}%`, transform: 'translateY(-50%)' }}
          />
          <span className="text-[9px] text-gray-500">Floor</span>
        </div>

        <div className="relative w-20 sm:w-28 h-full flex flex-col items-center justify-between">
          <span className="text-[10px] font-bold text-cyan-400 bg-gray-950 px-1 py-0.5 rounded text-center leading-none">Light Feather</span>
          <div 
            className="w-6 h-6 rounded-full bg-sky-200 border-2 border-cyan-400 shadow-lg flex items-center justify-center absolute transition-all duration-75"
            style={{ top: `${Math.min(85, featherProgress)}%`, transform: 'translateY(-50%)' }}
          >
            <span className="material-symbols-outlined text-[10px] text-cyan-900">feather</span>
          </div>
          <span className="text-[9px] text-gray-500">Floor</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-gray-800 p-2 border-2 border-gray-600 rounded-b-xl flex items-center justify-between gap-2 z-10 shrink-0">
        <button
          onClick={() => setIsVacuumActive(prev => !prev)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all text-center ${isVacuumActive ? 'bg-emerald-600 text-white shadow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {isVacuumActive ? 'Add Air Back' : 'Remove Air'}
        </button>
        <button
          onClick={triggerDropAnimation}
          disabled={isDropping}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] sm:text-xs uppercase shadow-md active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isDropping ? 'Falling...' : 'Drop Both'}
        </button>
      </div>
    </div>
  );
}

// --- MAIN EXPORT COMPONENT ---

interface GravityLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function GravityLevel({ recordAction, experimentSubIndex = 0 }: GravityLevelProps) {
  const [attractorMass, setAttractorMass] = useState(1.0);
  const [launchSpeed, setLaunchSpeed] = useState(250);

  const expInfo = [
    {
      title: "Fan Blades Game",
      objective: "Change the fan speed and see how blades make a breeze.",
      slider1Label: "Fan Speed",
      slider1Val: `${Math.round(attractorMass * 2)}`,
      slider2Label: "Air Speed",
      slider2Val: `${Math.round(launchSpeed / 10)} km/h`
    },
    {
      title: "Planet Orbit Game",
      objective: "Change the planet size to see how things spin around it.",
      slider1Label: "Planet Size",
      slider1Val: `${attractorMass.toFixed(1)}x`,
      slider2Label: "Spin Speed",
      slider2Val: `${(launchSpeed / 30).toFixed(1)} km/s`
    },
    {
      title: "Falling Things Game",
      objective: "Drop a heavy ball and light feather to see which hits the ground first.",
      slider1Label: "Ball Weight",
      slider1Val: `${(attractorMass * 5).toFixed(1)} kg`,
      slider2Label: "Drop Height",
      slider2Val: `${Math.round(launchSpeed * 2)} m`
    }
  ][experimentSubIndex] || {
    title: "Fan Blades Game",
    objective: "Change the fan speed and see how blades make a breeze.",
    slider1Label: "Fan Speed",
    slider1Val: `${Math.round(attractorMass * 2)}`,
    slider2Label: "Air Speed",
    slider2Val: `${Math.round(launchSpeed / 10)} km/h`
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Level Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2 shrink-0 z-30 relative">
        <div className="flex-1 pr-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded text-white uppercase tracking-wider">Game {experimentSubIndex + 1}</span>
             {expInfo.title}
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            <strong>Goal:</strong> {expInfo.objective}
          </p>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0 z-30 relative">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider1Label}: {expInfo.slider1Val}</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={attractorMass}
            onChange={(e) => {
              setAttractorMass(parseFloat(e.target.value));
              recordAction('changed_attractor_mass', { val: parseFloat(e.target.value) });
            }}
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
            onChange={(e) => {
              setLaunchSpeed(parseInt(e.target.value));
              recordAction('changed_launch_speed', { val: parseInt(e.target.value) });
            }}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Strict Conditional Rendering Container */}
      <div className="flex-1 w-full relative overflow-hidden bg-gray-950">
        {experimentSubIndex === 0 && (
          <ExperimentOne 
            attractorMass={attractorMass} 
            launchSpeed={launchSpeed} 
            recordAction={recordAction} 
          />
        )}
        {experimentSubIndex === 1 && (
          <ExperimentTwo 
            attractorMass={attractorMass} 
            launchSpeed={launchSpeed} 
            recordAction={recordAction} 
          />
        )}
        {experimentSubIndex === 2 && (
          <ExperimentThree 
            attractorMass={attractorMass} 
            launchSpeed={launchSpeed} 
            recordAction={recordAction} 
          />
        )}
      </div>
    </div>
  );
}
