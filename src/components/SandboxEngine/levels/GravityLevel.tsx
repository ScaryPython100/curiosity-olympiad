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
      const animDurationSec = Math.max(0.2, 3 - attractorMass * 0.8);

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-between p-4 overflow-hidden"
        >
          {/* Ceiling Structure */}
          <div className="w-64 h-4 bg-gray-700 border-b-2 border-gray-600 rounded-b-md shadow-md flex justify-center">
            <div className="w-4 h-12 bg-gray-500 border-x-2 border-gray-400" />
          </div>

          {/* Spinning Ceiling Fan Assembly */}
          <div className="relative z-10 -mt-6 flex flex-col items-center">
            {/* Motor Housing */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 border-4 border-amber-300 shadow-2xl flex items-center justify-center relative">
              <span className="text-[10px] font-black text-amber-950 uppercase">{bladeCount} BLADES</span>

              {/* Rotating Blade Container */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-all"
                style={{
                  animation: `spin ${animDurationSec}s linear infinite`
                }}
              >
                {Array.from({ length: bladeCount }).map((_, bIdx) => {
                  const rotDeg = (360 / bladeCount) * bIdx;
                  return (
                    <div 
                      key={bIdx}
                      className="absolute w-32 h-6 bg-gradient-to-r from-amber-800 to-amber-600 border border-amber-400 rounded-r-full shadow-lg origin-left"
                      style={{ transform: `rotate(${rotDeg}deg)` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Downward Airflow Breeze Stream Lines */}
          {showBreezeLines && (
            <div className="absolute inset-0 flex justify-around pointer-events-none opacity-60">
              {[1, 2, 3, 4, 5].map((line) => (
                <div 
                  key={line}
                  className="w-1 bg-gradient-to-b from-cyan-400/80 via-sky-300/40 to-transparent rounded-full animate-pulse"
                  style={{ 
                    height: '60%', 
                    marginTop: '20%',
                    animationDuration: `${1.5 / (line % 2 + 1)}s` 
                  }}
                />
              ))}
            </div>
          )}

          {/* Living Room Seating Silhouette at Bottom */}
          <div className="relative z-10 w-full flex flex-col items-center mb-2">
            <div className="bg-gray-900/90 px-4 py-2 rounded-2xl border border-gray-700 text-center shadow-lg">
              <span className="text-xs font-bold text-cyan-300">
                🌀 Fan Speed: {fanSpeedRpm} RPM • Air Velocity: {Math.round(launchSpeed / 10)} km/h
              </span>
              <p className="text-[11px] text-gray-400">
                {bladeCount === 3 ? "3-Blade Indian Tropical Fan: High RPM & Maximum Air Displacement" : `${bladeCount}-Blade Fan: Quiet Low-Speed Circulation`}
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gray-900/90 p-2 rounded-xl border border-gray-700 text-xs">
            <span className="text-gray-300 font-bold">Fan Blades:</span>
            {([3, 4, 5] as const).map((count) => (
              <button
                key={count}
                onClick={() => setBladeCount(count)}
                className={`px-2.5 py-1 rounded text-xs font-bold ${bladeCount === count ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
              >
                {count} Blades
              </button>
            ))}
            <button
              onClick={() => setShowBreezeLines(prev => !prev)}
              className={`ml-2 px-2.5 py-1 rounded text-xs font-bold ${showBreezeLines ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {showBreezeLines ? 'Hide Breeze Lines' : 'Show Breeze Lines'}
            </button>
          </div>
        </div>
      );
    } else if (experimentSubIndex === 1) {
      // --- EXPERIMENT 2: PLANETARY GRAVITY & SATELLITE ORBIT SIMULATOR ---
      const planetRadiusPx = Math.round(50 * attractorMass);
      const orbitSpeedSec = Math.max(1, 10 - launchSpeed / 40);

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-[#030712] flex items-center justify-center overflow-hidden"
        >
          {/* Starfield Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />

          {/* Gravitational Field Rings */}
          <div 
            className="absolute rounded-full border-2 border-dashed border-cyan-500/30 animate-spin opacity-50"
            style={{ 
              width: `${planetRadiusPx * 4}px`, 
              height: `${planetRadiusPx * 4}px`,
              animationDuration: '20s'
            }}
          />

          {/* Central Planet Earth / Jupiter */}
          <div 
            className="relative z-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-900 border-4 border-cyan-300 shadow-[0_0_50px_rgba(56,189,248,0.5)] flex items-center justify-center transition-all duration-300"
            style={{
              width: `${planetRadiusPx * 2}px`,
              height: `${planetRadiusPx * 2}px`
            }}
          >
            <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-400/40 via-transparent to-transparent" />
            <span className="absolute text-[10px] font-black text-white uppercase tracking-widest shadow-md">
              {attractorMass > 1.8 ? "JUPITER" : "EARTH"} ({attractorMass.toFixed(1)} M⊕)
            </span>
          </div>

          {/* Orbiting Satellite Container */}
          <div 
            className="absolute z-20 flex items-center justify-center pointer-events-none"
            style={{
              width: `${planetRadiusPx * 4}px`,
              height: `${planetRadiusPx * 4}px`,
              animation: `spin ${orbitSpeedSec}s linear infinite`
            }}
          >
            {/* Satellite Orb on Top Orbit Line */}
            <div className="absolute -top-3 w-8 h-8 bg-amber-400 border-2 border-amber-100 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center">
              <span className="material-symbols-outlined text-xs text-amber-950">satellite_alt</span>
            </div>

            {/* Velocity Vector Arrow */}
            {showVelocityVectors && (
              <div className="absolute -top-3 left-1/2 w-16 h-0.5 bg-green-400 shadow-[0_0_8px_#22c55e]">
                <div className="w-2 h-2 border-t-2 border-r-2 border-green-400 rotate-45 absolute -right-1 -top-0.5" />
              </div>
            )}
          </div>

          {/* Control Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-gray-900/90 p-3 rounded-xl border border-gray-700 text-xs text-gray-200 space-y-1">
            <p className="font-bold text-cyan-300">🪐 Gravity Force: F = G (M · m) / r²</p>
            <p className="font-bold text-amber-300">🛰️ Orbital Velocity: {(launchSpeed / 30).toFixed(1)} km/s</p>
            <button
              onClick={() => setShowVelocityVectors(prev => !prev)}
              className="mt-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
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
          className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-4 overflow-hidden"
        >
          {/* Drop Tower Top Frame */}
          <div className="w-80 h-10 bg-gray-800 border-2 border-gray-600 rounded-t-xl flex items-center justify-between px-6 shadow-md z-10">
            <span className="text-xs font-bold text-yellow-300">Galileo Drop Tower ({altitudeMeters}m)</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Chamber:</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isVacuumActive ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                {isVacuumActive ? 'Vacuum (0 Air)' : 'Atmospheric Air'}
              </span>
            </div>
          </div>

          {/* Dual Drop Tracks */}
          <div className="relative w-80 flex-1 bg-gray-900/80 border-x-2 border-gray-700 flex justify-around p-4">
            
            {/* Track 1: Cricket Ball */}
            <div className="relative w-24 h-full border-r border-dashed border-gray-700 flex flex-col items-center justify-between">
              <span className="text-[10px] font-bold text-red-400 bg-gray-950 px-2 py-0.5 rounded">Heavy Cricket Ball</span>
              <div 
                className="w-10 h-10 rounded-full bg-red-600 border-2 border-red-200 shadow-lg flex items-center justify-center absolute transition-all duration-75"
                style={{ top: `${ballProgress}%`, transform: 'translateY(-100%)' }}
              >
                <span className="text-[9px] font-bold text-white">5.5 oz</span>
              </div>
              <span className="text-[10px] text-gray-500">Ground</span>
            </div>

            {/* Track 2: Feather */}
            <div className="relative w-24 h-full flex flex-col items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 bg-gray-950 px-2 py-0.5 rounded">Light Feather</span>
              <div 
                className="w-8 h-8 rounded-full bg-sky-200 border-2 border-cyan-400 shadow-lg flex items-center justify-center absolute transition-all duration-75"
                style={{ top: `${featherProgress}%`, transform: 'translateY(-100%)' }}
              >
                <span className="material-symbols-outlined text-xs text-cyan-900">feather</span>
              </div>
              <span className="text-[10px] text-gray-500">Ground</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-80 bg-gray-800 p-3 border-2 border-gray-600 rounded-b-xl flex items-center justify-between gap-3 z-10">
            <button
              onClick={() => setIsVacuumActive(prev => !prev)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isVacuumActive ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {isVacuumActive ? '💨 Open Air Valve' : '🧪 Pump Vacuum Chamber'}
            </button>

            <button
              onClick={triggerDropAnimation}
              disabled={isDropping}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase shadow-md active:scale-95 disabled:opacity-50"
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
