"use client";

import { useState, useRef, useEffect } from 'react';

interface OpticsLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function OpticsLevel({ recordAction, experimentSubIndex = 0 }: OpticsLevelProps) {
  const [useRedPrism, setUseRedPrism] = useState(false);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [beamIntensity, setBeamIntensity] = useState(100);

  // State for Experiment 1 (Water Bowl Magnification)
  const [lemonBaseSize, setLemonBaseSize] = useState<"Small" | "Medium" | "Large">("Medium");

  // State for Experiment 2 (Prism Refraction)
  const [laserColor, setLaserColor] = useState<"White" | "Red" | "Green" | "Blue">("White");

  // State for Experiment 3 (Shadow Tracker)
  const [shadowSourceType, setShadowSourceType] = useState<"Tubelight" | "LED">("Tubelight");

  const workspaceRef = useRef<HTMLDivElement>(null);

  const expInfo = [
    {
      title: "Everyday Light & Water Bowl Magnification Lab",
      objective: "Adjust Water Bowl Curvature and Daylight Brightness to discover how curved water bends light to magnify objects in daily life.",
      slider1Label: "Water Bowl Curvature",
      slider1Val: `${Math.round((refractiveIndex - 1) * 100)}%`,
      slider2Label: "Daylight Brightness",
      slider2Val: `${beamIntensity}%`
    },
    {
      title: "Prism Daylight Refraction & Color Dispersion Lab",
      objective: "Adjust Glass Prism Angle and Light Wavelength to discover how white light disperses into a rainbow spectrum.",
      slider1Label: "Glass Prism Angle",
      slider1Val: `${Math.round(refractiveIndex * 30)}°`,
      slider2Label: "Light Wavelength",
      slider2Val: `${Math.round(beamIntensity * 4 + 350)} nm`
    },
    {
      title: "Shadow Angle & Solar Tracker Lab",
      objective: "Adjust Sun Elevation Angle and Object Height to observe shadow length, penumbra softness, and solar tracking.",
      slider1Label: "Sun Elevation Angle",
      slider1Val: `${Math.round(refractiveIndex * 45)}°`,
      slider2Label: "Object Height",
      slider2Val: `${beamIntensity} cm`
    }
  ][experimentSubIndex] || {
    title: "Everyday Light & Magnification Lab",
    objective: "Adjust Water Bowl Curvature and Daylight Brightness to discover how curved water bends light to magnify objects in daily life.",
    slider1Label: "Water Bowl Curvature",
    slider1Val: `${Math.round((refractiveIndex - 1) * 100)}%`,
    slider2Label: "Daylight Brightness",
    slider2Val: `${beamIntensity}%`
  };

  const toggleOptionalTool = () => {
    recordAction('optional_tool_used');
    setUseRedPrism(prev => !prev);
  };

  const handleRefractiveChange = (val: number) => {
    setRefractiveIndex(val);
    recordAction('changed_refractive_index', { val });
  };

  const handleIntensityChange = (val: number) => {
    setBeamIntensity(val);
    recordAction('changed_beam_intensity', { val });
  };

  const renderCanvas = () => {
    if (experimentSubIndex === 0) {
      // --- EXPERIMENT 1: WATER BOWL MAGNIFICATION LAB ---
      const magnificationFactor = refractiveIndex;
      const lemonSizePx = (lemonBaseSize === "Small" ? 50 : lemonBaseSize === "Medium" ? 75 : 100) * (0.8 + (magnificationFactor - 1) * 1.5);
      const bgOpacity = beamIntensity / 100;

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
          style={{ backgroundColor: useRedPrism ? '#2a1205' : `rgba(15, 23, 42, ${0.4 + bgOpacity * 0.6})` }}
        >
          {/* Table Surface */}
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-amber-950 to-amber-900 border-t-4 border-amber-700/50 flex items-center justify-center">
            <span className="text-amber-200/30 text-xs font-bold uppercase tracking-widest">Polished Wooden Dining Table</span>
          </div>

          {/* Light Rays Background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <line x1="100" y1="50" x2="400" y2="250" stroke={useRedPrism ? "#f97316" : "#fef08a"} strokeWidth="4" strokeDasharray="6 6" />
            <line x1="700" y1="50" x2="400" y2="250" stroke={useRedPrism ? "#f97316" : "#fef08a"} strokeWidth="4" strokeDasharray="6 6" />
          </svg>

          {/* Responsive Control Toolbar at Top */}
          <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs shrink-0 z-20 shadow-md">
            <span className="text-gray-300 font-bold mr-1">Lemon Size:</span>
            {(["Small", "Medium", "Large"] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setLemonBaseSize(sz)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${lemonBaseSize === sz ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Glass Water Bowl Container (Responsive Size) */}
          <div className="relative flex-1 flex items-center justify-center my-auto">
            <div className="relative z-10 w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full border-8 border-cyan-200/60 bg-gradient-to-b from-cyan-400/20 via-sky-300/30 to-blue-600/40 backdrop-blur-md shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-cyan-400/20">
              
              {/* Water Surface Ripple */}
              <div className="absolute top-8 w-full h-4 bg-cyan-200/30 border-b border-cyan-100/40 animate-pulse" />

              {/* Magnified Lemon */}
              <div 
                className="transition-all duration-200 ease-out rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-inner flex items-center justify-center border-2 border-yellow-200 relative group cursor-pointer"
                style={{
                  width: `${Math.min(220, lemonSizePx)}px`,
                  height: `${Math.min(176, lemonSizePx * 0.8)}px`,
                  filter: `drop-shadow(0 10px 15px rgba(0,0,0,0.3))`
                }}
              >
                <div className="w-3 h-3 bg-green-600 rounded-full absolute -left-1 opacity-80" />
                <span className="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-wider opacity-80 select-none">
                  Submerged Lemon
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Responsive Refraction Indicator Card */}
          <div className="w-full max-w-lg mx-auto bg-gray-900/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-700 text-center shadow-lg shrink-0 z-20">
            <span className="text-xs sm:text-sm font-bold text-cyan-200 block">
              Magnification: {(magnificationFactor * 1.5).toFixed(1)}x • Refracted Ray Angle: {Math.round((refractiveIndex - 1) * 90)}°
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              Light bending from water (dense) to air (rare) causes virtual image enlargement.
            </p>
          </div>
        </div>
      );
    } else if (experimentSubIndex === 1) {
      // --- EXPERIMENT 2: PRISM DAYLIGHT REFRACTION & COLOR DISPERSION LAB ---
      const prismAngleDeg = Math.round(refractiveIndex * 30);

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-[#080d1a] flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Responsive Control Toolbar at Top */}
          <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs shrink-0 z-20 shadow-md">
            <span className="text-gray-300 font-bold mr-1">Light Source:</span>
            {(["White", "Red", "Green", "Blue"] as const).map((col) => (
              <button
                key={col}
                onClick={() => setLaserColor(col)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${laserColor === col ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Centered Optical Prism & Light Ray System */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            {/* Optical Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

            {/* Responsive SVG Light Paths with viewBox scaling */}
            <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              {/* Incident White Beam */}
              <line x1="40" y1="200" x2="400" y2="200" stroke={laserColor === "White" ? "#ffffff" : laserColor.toLowerCase()} strokeWidth="6" strokeLinecap="round" />

              {/* Dispersed Rainbow Spectrum inside and exiting the Prism */}
              {laserColor === "White" ? (
                <>
                  <line x1="400" y1="200" x2="760" y2="100" stroke="#ef4444" strokeWidth="5" opacity="0.9" />
                  <line x1="400" y1="200" x2="760" y2="130" stroke="#f97316" strokeWidth="5" opacity="0.9" />
                  <line x1="400" y1="200" x2="760" y2="160" stroke="#eab308" strokeWidth="5" opacity="0.9" />
                  <line x1="400" y1="200" x2="760" y2="190" stroke="#22c55e" strokeWidth="5" opacity="0.9" />
                  <line x1="400" y1="200" x2="760" y2="220" stroke="#06b6d4" strokeWidth="5" opacity="0.9" />
                  <line x1="400" y1="200" x2="760" y2="250" stroke="#3b82f6" strokeWidth="5" opacity="0.9" />
                  <line x1="400" y1="200" x2="760" y2="280" stroke="#a855f7" strokeWidth="5" opacity="0.9" />
                </>
              ) : (
                <line x1="400" y1="200" x2="760" y2={200 + (refractiveIndex - 1) * 75} stroke={laserColor.toLowerCase()} strokeWidth="6" opacity="0.9" />
              )}
            </svg>

            {/* Laser Emitter Box on Left */}
            <div className="absolute left-2 sm:left-6 z-10 flex items-center gap-1 sm:gap-2">
              <div className="w-12 sm:w-16 h-8 sm:h-10 bg-gray-700 border-2 border-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-[8px] sm:text-[10px] font-black text-gray-200 uppercase">RAY</span>
              </div>
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-ping" />
            </div>

            {/* Glass Prism Centered */}
            <div 
              className="relative z-10 transition-transform duration-300 ease-out cursor-pointer"
              style={{ transform: `rotate(${prismAngleDeg - 45}deg)` }}
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-tr from-cyan-400/30 via-sky-200/40 to-white/60 border-4 border-cyan-200/80 backdrop-blur-md shadow-2xl flex items-center justify-center"
                   style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
                <span className="text-[10px] font-bold text-gray-900 bg-white/80 px-2 py-0.5 rounded shadow-sm">
                  n = {refractiveIndex.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Projection Screen on Right */}
            <div className="absolute right-2 sm:right-6 z-10 w-3 sm:w-4 h-48 sm:h-64 bg-gray-200 border-2 border-gray-400 rounded-sm shadow-xl flex flex-col justify-around py-2">
              {laserColor === "White" && (
                <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600 rounded-xs opacity-90 shadow-md" />
              )}
            </div>
          </div>

          {/* Bottom Responsive Prism Dispersion Banner */}
          <div className="w-full max-w-lg mx-auto bg-gray-900/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-700 text-center shadow-lg shrink-0 z-20">
            <span className="text-xs sm:text-sm font-bold text-amber-300 block">
              🌈 Prism Refraction: n = {refractiveIndex.toFixed(2)} • Dispersion Angle: {prismAngleDeg}°
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {laserColor === "White" ? "White daylight separates into 7 component wavelengths (VIBGYOR)." : `Monochromatic ${laserColor} laser refracts cleanly without separating.`}
            </p>
          </div>
        </div>
      );
    } else {
      // --- EXPERIMENT 3: SHADOW ANGLE & SOLAR TRACKER LAB ---
      const sunAngleDeg = Math.round(refractiveIndex * 45);
      const poleHeightPx = Math.round(beamIntensity * 1.2 + 40);

      const sunRad = (sunAngleDeg * Math.PI) / 180;
      const sunX = 400 - Math.cos(sunRad) * 260;
      const sunY = 320 - Math.sin(sunRad) * 200;

      const shadowLengthPx = Math.min(320, Math.max(10, poleHeightPx / Math.tan(sunRad)));

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Responsive Control Toolbar at Top */}
          <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs shrink-0 z-20 shadow-md">
            <span className="text-gray-300 font-bold mr-1">Light Source:</span>
            {(["Tubelight", "LED"] as const).map((src) => (
              <button
                key={src}
                onClick={() => setShadowSourceType(src)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${shadowSourceType === src ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {src === "Tubelight" ? "Soft Penumbra (Tubelight)" : "Sharp Umbra (LED)"}
              </button>
            ))}
          </div>

          {/* Center Solar Tracking Simulation area */}
          <div className="relative flex-1 w-full flex flex-col justify-end">
            {/* SVG Sky Arc & Sun Light Rays with viewBox scaling */}
            <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              <line x1={sunX} y1={sunY} x2="400" y2={320 - poleHeightPx} stroke="#fde047" strokeWidth="3" strokeDasharray="5 5" opacity="0.8" />
              <line x1={sunX} y1={sunY} x2={400 + shadowLengthPx} y2="320" stroke="#fde047" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
            </svg>

            {/* Dynamic Sun Orb */}
            <div 
              className="absolute z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-300 shadow-[0_0_50px_rgba(253,224,71,0.9)] border-4 border-yellow-100 flex items-center justify-center transition-all duration-300"
              style={{ left: `${Math.max(10, Math.min(80, (sunX / 800) * 100))}%`, top: `${Math.max(10, Math.min(70, (sunY / 400) * 100))}%` }}
            >
              <span className="text-[10px] font-black text-amber-950">{sunAngleDeg}°</span>
            </div>

            {/* Flagpole & Cast Shadow Container */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-end">
              <div 
                className="w-4 bg-gradient-to-t from-slate-400 to-slate-200 border border-slate-600 rounded-t-sm shadow-md relative"
                style={{ height: `${poleHeightPx}px` }}
              >
                <div className="w-6 h-6 bg-red-600 rounded-xs absolute -top-2 -right-6 shadow-sm" />
              </div>

              <div 
                className={`absolute bottom-0 left-4 h-3 bg-gray-950 rounded-r-full transition-all duration-200 origin-left ${
                  shadowSourceType === "Tubelight" ? "opacity-60 blur-xs" : "opacity-90"
                }`}
                style={{ width: `${shadowLengthPx}px` }}
              />
            </div>

            {/* Ground Plane */}
            <div className="relative w-full h-16 bg-gradient-to-t from-emerald-950 to-emerald-900 border-t-4 border-emerald-700/60 flex items-center justify-center z-10 shrink-0">
              <span className="text-emerald-300/30 text-xs font-bold uppercase tracking-widest">Outdoor Ground Plane</span>
            </div>
          </div>

          {/* Responsive Bottom Solar Info Card */}
          <div className="w-full max-w-lg mx-auto bg-gray-900/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-700 text-center shadow-lg shrink-0 z-20">
            <span className="text-xs sm:text-sm font-bold text-yellow-300 block">
              ☀️ Solar Angle: {sunAngleDeg}° • 📏 Shadow Length: {Math.round(shadowLengthPx)} cm
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {shadowSourceType === "Tubelight" ? "Extended light sources produce soft penumbra edges." : "Point-source LED lights cast sharp umbra boundaries."}
            </p>
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
        <button 
          onClick={toggleOptionalTool}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${useRedPrism ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {useRedPrism ? 'Normal Daylight' : 'Toggle Sunset Orange Light'}
        </button>
      </div>

      {/* Interactive Simulation Variables Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider1Label}: {expInfo.slider1Val}</span>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={refractiveIndex}
            onChange={(e) => handleRefractiveChange(parseFloat(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider2Label}: {expInfo.slider2Val}</span>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={beamIntensity}
            onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
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
