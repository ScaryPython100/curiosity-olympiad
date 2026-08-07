"use client";

import { useState, useRef, useEffect } from 'react';

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ refractiveIndex, beamIntensity, useRedPrism, recordAction }: any) {
  const [lemonBaseSize, setLemonBaseSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const magnificationFactor = refractiveIndex;
  
  // Convert pixels to responsive percentages (relative to a 800x400 aspect ratio)
  const basePercent = lemonBaseSize === "Small" ? 15 : lemonBaseSize === "Medium" ? 22 : 30;
  const lemonSizePct = basePercent * (0.8 + (magnificationFactor - 1) * 1.5);
  const bgOpacity = beamIntensity / 100;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
         style={{ backgroundColor: useRedPrism ? '#2a1205' : `rgba(15, 23, 42, ${0.4 + bgOpacity * 0.6})` }}>
      {/* Table Surface */}
      <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-amber-950 to-amber-900 border-t-4 border-amber-700/50 flex items-center justify-center">
        <span className="text-amber-200/30 text-xs font-bold uppercase tracking-widest">Table</span>
      </div>

      {/* Light Rays Background (Responsive SVG) */}
      <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <line x1="12.5%" y1="12.5%" x2="50%" y2="62.5%" stroke={useRedPrism ? "#f97316" : "#fef08a"} strokeWidth="4" strokeDasharray="6 6" />
        <line x1="87.5%" y1="12.5%" x2="50%" y2="62.5%" stroke={useRedPrism ? "#f97316" : "#fef08a"} strokeWidth="4" strokeDasharray="6 6" />
      </svg>

      {/* Toolbar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs z-20 shadow-md">
        <span className="text-gray-300 font-bold mr-1">Lemon Size:</span>
        {(["Small", "Medium", "Large"] as const).map((sz) => (
          <button
            key={sz}
            onClick={() => setLemonBaseSize(sz)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${lemonBaseSize === sz ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {sz}
          </button>
        ))}
      </div>

      {/* Glass Water Bowl Container */}
      <div className="relative flex-1 flex items-center justify-center w-[50%] max-w-[300px] aspect-square rounded-full border-8 border-cyan-200/60 bg-gradient-to-b from-cyan-400/20 via-sky-300/30 to-blue-600/40 backdrop-blur-md shadow-2xl overflow-hidden ring-4 ring-cyan-400/20 my-auto z-10 mt-[15%]">
        <div className="absolute top-[10%] w-full h-[5%] bg-cyan-200/30 border-b border-cyan-100/40 animate-pulse" />
        {/* Magnified Lemon */}
        <div 
          className="transition-all duration-200 ease-out rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 shadow-inner flex items-center justify-center border-2 border-yellow-200 relative group cursor-pointer"
          style={{ width: `${Math.min(90, lemonSizePct)}%`, height: `${Math.min(90, lemonSizePct * 0.8)}%` }}
        >
          <span className="text-[10px] sm:text-xs font-black text-amber-950 uppercase tracking-wider opacity-80 select-none">
            Lemon
          </span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gray-900/95 px-3 py-2 rounded-xl border border-gray-700 text-center shadow-lg z-20">
        <span className="text-xs sm:text-sm font-bold text-cyan-200 block">
          Looks {(magnificationFactor * 1.5).toFixed(1)}x bigger!
        </span>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Water bends the light, making the lemon look much larger than it really is.
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ refractiveIndex, beamIntensity, useRedPrism, recordAction }: any) {
  const [laserColor, setLaserColor] = useState<"White" | "Red" | "Green" | "Blue">("White");
  const prismAngleDeg = Math.round(refractiveIndex * 30);

  return (
    <div className="relative w-full h-full bg-[#080d1a] flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs z-20 shadow-md">
        <span className="text-gray-300 font-bold mr-1">Light Color:</span>
        {(["White", "Red", "Green", "Blue"] as const).map((col) => (
          <button
            key={col}
            onClick={() => setLaserColor(col)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${laserColor === col ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {col}
          </button>
        ))}
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center my-auto">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:10%_10%] opacity-20" />
        
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <line x1="5" y1="50" x2="50" y2="50" stroke={laserColor === "White" ? "#ffffff" : laserColor.toLowerCase()} strokeWidth="1" strokeLinecap="round" />
          {laserColor === "White" ? (
            <>
              <line x1="50" y1="50" x2="95" y2="25" stroke="#ef4444" strokeWidth="1" opacity="0.9" />
              <line x1="50" y1="50" x2="95" y2="35" stroke="#f97316" strokeWidth="1" opacity="0.9" />
              <line x1="50" y1="50" x2="95" y2="45" stroke="#eab308" strokeWidth="1" opacity="0.9" />
              <line x1="50" y1="50" x2="95" y2="55" stroke="#22c55e" strokeWidth="1" opacity="0.9" />
              <line x1="50" y1="50" x2="95" y2="65" stroke="#06b6d4" strokeWidth="1" opacity="0.9" />
              <line x1="50" y1="50" x2="95" y2="75" stroke="#a855f7" strokeWidth="1" opacity="0.9" />
            </>
          ) : (
            <line x1="50" y1="50" x2="95" y2={50 + (refractiveIndex - 1) * 20} stroke={laserColor.toLowerCase()} strokeWidth="1" opacity="0.9" />
          )}
        </svg>

        <div className="absolute left-[5%] z-10 flex items-center gap-1">
          <div className="w-[10vw] max-w-[60px] h-8 bg-gray-700 border-2 border-gray-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-[10px] font-black text-gray-200">LIGHT</span>
          </div>
        </div>

        <div className="relative z-10 transition-transform duration-300 ease-out cursor-pointer w-[25%] max-w-[150px] aspect-square" style={{ transform: `rotate(${prismAngleDeg - 45}deg)` }}>
          <div className="w-full h-full bg-gradient-to-tr from-cyan-400/30 via-sky-200/40 to-white/60 border-4 border-cyan-200/80 backdrop-blur-md shadow-2xl flex items-center justify-center"
               style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
            <span className="text-[10px] font-bold text-gray-900 bg-white/80 px-1 rounded shadow-sm">Glass</span>
          </div>
        </div>

        <div className="absolute right-[5%] z-10 w-[3%] h-[60%] bg-gray-200 border-2 border-gray-400 rounded-sm shadow-xl flex flex-col justify-around">
          {laserColor === "White" && <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600 opacity-90 shadow-md" />}
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gray-900/95 px-3 py-2 rounded-xl border border-gray-700 text-center shadow-lg z-20">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          🌈 Prism Angle: {prismAngleDeg}°
        </span>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {laserColor === "White" ? "White light splits into a beautiful rainbow!" : `The ${laserColor} light does not split because it is only one color.`}
        </p>
      </div>
    </div>
  );
}

function ExperimentThree({ refractiveIndex, beamIntensity, useRedPrism, recordAction }: any) {
  const [shadowSourceType, setShadowSourceType] = useState<"Tubelight" | "LED">("Tubelight");
  
  const sunAngleDeg = Math.round(refractiveIndex * 45);
  // relative height from 10% to 50%
  const poleHeightPct = Math.max(10, Math.min(50, beamIntensity / 2)); 
  const sunRad = (sunAngleDeg * Math.PI) / 180;
  
  // Percentages for SVG positioning
  const sunXPct = 50 - Math.cos(sunRad) * 35;
  const sunYPct = 80 - Math.sin(sunRad) * 60;
  
  // Shadow length as percentage of width
  const shadowLengthPct = Math.min(45, Math.max(5, poleHeightPct / Math.tan(sunRad)));

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-900 via-sky-800 to-slate-900 flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs z-20 shadow-md">
        <span className="text-gray-300 font-bold mr-1">Light Type:</span>
        {(["Tubelight", "LED"] as const).map((src) => (
          <button
            key={src}
            onClick={() => setShadowSourceType(src)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${shadowSourceType === src ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {src === "Tubelight" ? "Soft Light" : "Hard Light"}
          </button>
        ))}
      </div>

      <div className="relative flex-1 w-full flex flex-col justify-end h-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <line x1={`${sunXPct}%`} y1={`${sunYPct}%`} x2="50%" y2={`${80 - poleHeightPct}%`} stroke="#fde047" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.8" />
          <line x1={`${sunXPct}%`} y1={`${sunYPct}%`} x2={`${50 + shadowLengthPct}%`} y2="80%" stroke="#fde047" strokeWidth="0.5" strokeDasharray="1 1" opacity="0.6" />
        </svg>

        <div 
          className="absolute z-10 w-[12%] max-w-[60px] aspect-square rounded-full bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.9)] border-2 border-yellow-100 flex items-center justify-center transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${sunXPct}%`, top: `${sunYPct}%` }}
        >
          <span className="text-[10px] font-black text-amber-950">{sunAngleDeg}°</span>
        </div>

        <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-full z-20 flex items-end">
          <div className="w-[10px] bg-gradient-to-t from-slate-400 to-slate-200 border border-slate-600 rounded-t-sm shadow-md"
               style={{ height: `${poleHeightPct}vh` }}>
             <div className="w-4 h-4 bg-red-600 absolute -top-1 -right-4 rounded shadow-sm" />
          </div>
        </div>

        {/* Shadow Div */}
        <div 
          className={`absolute top-[80%] left-1/2 h-2 bg-gray-950 rounded-r-full transition-all duration-200 origin-left ${shadowSourceType === "Tubelight" ? "opacity-60 blur-[2px]" : "opacity-90"}`}
          style={{ width: `${shadowLengthPct}%` }}
        />

        <div className="absolute top-[80%] w-full h-[20%] bg-gradient-to-t from-emerald-950 to-emerald-900 border-t-2 border-emerald-700/60 flex items-center justify-center z-10 shrink-0">
          <span className="text-emerald-300/30 text-xs font-bold uppercase tracking-widest">Ground</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-gray-900/95 px-3 py-2 rounded-xl border border-gray-700 text-center shadow-lg z-20">
        <span className="text-xs sm:text-sm font-bold text-yellow-300 block">
          ☀️ Sun Angle: {sunAngleDeg}° • 📏 Shadow: {Math.round(shadowLengthPct)} steps
        </span>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {shadowSourceType === "Tubelight" ? "Soft lights make shadows look fuzzy." : "Hard lights make shadows look very sharp."}
        </p>
      </div>
    </div>
  );
}

// --- MAIN EXPORT COMPONENT ---

interface OpticsLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function OpticsLevel({ recordAction, experimentSubIndex = 0 }: OpticsLevelProps) {
  const [useRedPrism, setUseRedPrism] = useState(false);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [beamIntensity, setBeamIntensity] = useState(100);

  const expInfo = [
    {
      title: "Water Bowl Game",
      objective: "Make the bowl bigger and light brighter to see how water makes things look bigger.",
      slider1Label: "Bowl Size",
      slider1Val: `${Math.round((refractiveIndex - 1) * 100)}%`,
      slider2Label: "Light Brightness",
      slider2Val: `${beamIntensity}%`
    },
    {
      title: "Rainbow Glass Game",
      objective: "Turn the glass and pick a color to make a rainbow.",
      slider1Label: "Glass Turn",
      slider1Val: `${Math.round(refractiveIndex * 30)}°`,
      slider2Label: "Light Color",
      slider2Val: `${Math.round(beamIntensity * 4 + 350)} nm`
    },
    {
      title: "Sun Shadow Game",
      objective: "Move the sun up and down to see how shadows change size.",
      slider1Label: "Sun Height",
      slider1Val: `${Math.round(refractiveIndex * 45)}°`,
      slider2Label: "Stick Height",
      slider2Val: `${beamIntensity} cm`
    }
  ][experimentSubIndex] || {
    title: "Water Bowl Game",
    objective: "Make the bowl bigger and light brighter to see how water makes things look bigger.",
    slider1Label: "Bowl Size",
    slider1Val: `${Math.round((refractiveIndex - 1) * 100)}%`,
    slider2Label: "Light Brightness",
    slider2Val: `${beamIntensity}%`
  };

  const toggleOptionalTool = () => {
    recordAction('optional_tool_used');
    setUseRedPrism(prev => !prev);
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
        <button 
          onClick={toggleOptionalTool}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${useRedPrism ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          {useRedPrism ? 'Normal Light' : 'Try Sunset Light!'}
        </button>
      </div>

      {/* Interactive Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0 z-30 relative">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider1Label}: {expInfo.slider1Val}</span>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.05"
            value={refractiveIndex}
            onChange={(e) => {
              setRefractiveIndex(parseFloat(e.target.value));
              recordAction('changed_refractive_index', { val: parseFloat(e.target.value) });
            }}
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
            onChange={(e) => {
              setBeamIntensity(parseInt(e.target.value));
              recordAction('changed_beam_intensity', { val: parseInt(e.target.value) });
            }}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Strict Conditional Rendering Container */}
      <div className="flex-1 w-full relative overflow-hidden bg-gray-950">
        {experimentSubIndex === 0 && (
          <ExperimentOne 
            refractiveIndex={refractiveIndex} 
            beamIntensity={beamIntensity} 
            useRedPrism={useRedPrism} 
            recordAction={recordAction} 
          />
        )}
        {experimentSubIndex === 1 && (
          <ExperimentTwo 
            refractiveIndex={refractiveIndex} 
            beamIntensity={beamIntensity} 
            useRedPrism={useRedPrism} 
            recordAction={recordAction} 
          />
        )}
        {experimentSubIndex === 2 && (
          <ExperimentThree 
            refractiveIndex={refractiveIndex} 
            beamIntensity={beamIntensity} 
            useRedPrism={useRedPrism} 
            recordAction={recordAction} 
          />
        )}
      </div>
    </div>
  );
}
