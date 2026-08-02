"use client";

import { useState, useRef } from 'react';

interface ChemistryLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function ChemistryLevel({ recordAction, experimentSubIndex = 0 }: ChemistryLevelProps) {
  const [temperature, setTemperature] = useState(25);
  const [stirSpeed, setStirSpeed] = useState(2);

  // State for Experiment 1 (Soup Conduction)
  const [spoonType, setSpoonType] = useState<"Wooden" | "Steel">("Wooden");

  // State for Experiment 2 (Matka vs Pressure Cooker)
  const [isMatkaMode, setIsMatkaMode] = useState(true);

  // State for Experiment 3 (Candle Oxygen Depletion)
  const [candleLit, setCandleLit] = useState(true);
  const [oxygenLevel, setOxygenLevel] = useState(21); // 21% normal air
  const [showEffervescence, setShowEffervescence] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);

  const expInfo = [
    {
      title: "Everyday Kitchen Science & Heat Lab",
      objective: "Adjust Soup Temperature (°C) and Stirring Speed to discover how heat transfers in your kitchen.",
      slider1Label: "Soup Temperature",
      slider1Val: `${temperature}°C`,
      slider2Label: "Stirring Speed",
      slider2Val: stirSpeed === 1 ? "Gentle" : stirSpeed === 2 ? "Moderate" : "Rapid"
    },
    {
      title: "Earthenware Matka Evaporative Cooling Lab",
      objective: "Adjust Clay Porosity and Ambient Humidity to observe natural evaporative cooling without electricity.",
      slider1Label: "Clay Porosity",
      slider1Val: `${Math.round(temperature * 0.9)}%`,
      slider2Label: "Ambient Humidity",
      slider2Val: `${Math.round(stirSpeed * 25)}%`
    },
    {
      title: "Candle Flame Oxygen Depletion & Reaction Lab",
      objective: "Adjust Glass Jar Volume and Oxygen Concentration to observe combustion kinetics and flame extinction.",
      slider1Label: "Glass Jar Volume",
      slider1Val: `${Math.round(temperature * 10)} mL`,
      slider2Label: "Oxygen Concentration",
      slider2Val: `${oxygenLevel}%`
    }
  ][experimentSubIndex] || {
    title: "Everyday Kitchen Science & Heat Lab",
    objective: "Adjust Soup Temperature (°C) and Stirring Speed to discover how heat transfers in your kitchen.",
    slider1Label: "Soup Temperature",
    slider1Val: `${temperature}°C`,
    slider2Label: "Stirring Speed",
    slider2Val: stirSpeed === 1 ? "Gentle" : stirSpeed === 2 ? "Moderate" : "Rapid"
  };

  const handleTempChange = (val: number) => {
    setTemperature(val);
    recordAction('changed_temperature', { val });
  };

  const handleStirChange = (val: number) => {
    setStirSpeed(val);
    recordAction('changed_stir_speed', { val });
  };

  const triggerChemicalEffervescence = () => {
    recordAction('triggered_baking_soda_vinegar_reaction');
    setShowEffervescence(true);
    setTimeout(() => setShowEffervescence(false), 3000);
  };

  const renderCanvas = () => {
    if (experimentSubIndex === 0) {
      // --- EXPERIMENT 1: KITCHEN UTENSILS THERMAL CONDUCTION LAB ---
      const steamOpacity = Math.min(1, temperature / 80);
      const isConductorHot = spoonType === "Steel" && temperature > 50;

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-950 flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Responsive Control Toolbar at Top */}
          <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs shrink-0 z-30 shadow-md">
            <span className="text-gray-300 font-bold mr-1">Utensil Material:</span>
            {(["Wooden", "Steel"] as const).map((mat) => (
              <button
                key={mat}
                onClick={() => {
                  setSpoonType(mat);
                  recordAction('changed_spoon_material', { mat });
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${spoonType === mat ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {mat === "Wooden" ? "Wooden (Insulator)" : "Stainless Steel (Conductor)"}
              </button>
            ))}
          </div>

          {/* Centered Cooking Pot & Burner Assembly */}
          <div className="relative flex-1 w-full flex flex-col items-center justify-center my-auto">
            {/* Gas Stove Burner with Glowing Coils */}
            <div className="relative z-10 -mb-3 flex flex-col items-center">
              <div className="w-40 sm:w-48 h-5 sm:h-6 bg-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center shadow-lg">
                <div 
                  className="w-32 sm:w-40 h-2.5 sm:h-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: temperature > 40 ? '#ef4444' : '#475569',
                    boxShadow: temperature > 40 ? `0 0 ${temperature / 2}px #ef4444` : 'none'
                  }}
                />
              </div>
            </div>

            {/* Cooking Pot & Soup */}
            <div className="relative z-20 w-52 sm:w-64 h-44 sm:h-52 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 border-4 border-slate-200 rounded-b-3xl shadow-2xl flex flex-col items-center justify-start pt-3">
              {/* Pot Handles */}
              <div className="absolute -left-5 top-5 w-5 h-8 sm:w-6 sm:h-10 bg-slate-800 rounded-l-lg border-y-2 border-l-2 border-slate-600" />
              <div className="absolute -right-5 top-5 w-5 h-8 sm:w-6 sm:h-10 bg-slate-800 rounded-r-lg border-y-2 border-r-2 border-slate-600" />

              {/* Rising Steam Vapor */}
              <div 
                className="absolute -top-14 sm:-top-16 w-full flex justify-around pointer-events-none transition-opacity duration-300"
                style={{ opacity: steamOpacity }}
              >
                {[1, 2, 3].map((s) => (
                  <div key={s} className="w-5 sm:w-6 h-12 sm:h-16 bg-white/20 blur-md rounded-full animate-bounce" style={{ animationDuration: `${1 + s * 0.3}s` }} />
                ))}
              </div>

              {/* Hot Soup Surface */}
              <div className="w-44 sm:w-56 h-28 sm:h-36 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-b-2xl border-t-2 border-amber-300 relative overflow-hidden flex items-center justify-center">
                
                {/* Whirlpool Convection Motion */}
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-dashed border-amber-200/40"
                  style={{ animation: `spin ${Math.max(0.3, 4 - stirSpeed * 1.2)}s linear infinite` }}
                />

                {/* Spoon inside Pot */}
                <div 
                  className={`absolute top-0 right-10 sm:right-12 w-3.5 sm:w-4 h-36 sm:h-44 rounded-t-sm shadow-md transition-all duration-300 origin-bottom ${
                    spoonType === "Steel" ? "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-300 border border-slate-400" : "bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 border border-amber-600"
                  }`}
                  style={{ transform: 'rotate(-15deg)' }}
                >
                  {/* Thermal Dots on Conductor Handle */}
                  {isConductorHot && (
                    <div className="absolute inset-0 bg-red-500/60 animate-pulse rounded-t-sm flex flex-col items-center justify-around py-2">
                      <span className="text-[8px] font-black text-white">HOT!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Bottom Thermal Info Card */}
          <div className="w-full max-w-lg mx-auto bg-gray-900/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-700 text-center shadow-lg shrink-0 z-30">
            <span className="text-xs sm:text-sm font-bold text-amber-400 block">
              🌡️ Temperature: {temperature}°C • 🥄 Material: {spoonType} Spoon
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {spoonType === "Steel" ? "Free Electrons Conduct Heat rapidly to Handle!" : "Wood Traps Air Pockets (Insulator prevent heat flow)"}
            </p>
          </div>
        </div>
      );
    } else if (experimentSubIndex === 1) {
      // --- EXPERIMENT 2: EARTHENWARE MATKA EVAPORATIVE COOLING LAB ---
      const porosityPct = Math.round(temperature * 0.9);
      const humidityPct = Math.round(stirSpeed * 25);
      const coolingDegree = isMatkaMode ? Math.max(12, 30 - (porosityPct * 0.15) + (humidityPct * 0.05)) : 120;

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Mode Switch Button Toolbar at Top */}
          <div className="w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-1.5 bg-gray-900/95 p-2 rounded-xl border border-gray-700 text-xs shrink-0 z-30 shadow-md">
            <button
              onClick={() => setIsMatkaMode(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isMatkaMode ? 'bg-amber-600 text-white shadow' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            >
              {isMatkaMode ? 'Switch to Pressure Cooker Lab' : 'Switch to Matka Evaporative Lab'}
            </button>
          </div>

          {/* Centered Matka or Pressure Cooker */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            {isMatkaMode ? (
              <div className="relative z-10 w-56 h-64 sm:w-64 sm:h-72 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-full border-4 border-amber-600 shadow-2xl flex flex-col items-center justify-center">
                
                {/* Clay Neck Rim */}
                <div className="w-28 sm:w-32 h-7 sm:h-8 bg-amber-600 border-2 border-amber-400 rounded-full absolute -top-4 shadow-md flex items-center justify-center">
                  <span className="text-[9px] sm:text-[10px] font-black text-amber-950">CLAY MATKA NECK</span>
                </div>

                {/* Microscopic Pores Seepage Particles */}
                <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-[radial-gradient(#38bdf8_2px,transparent_2px)] bg-[size:12px_12px] opacity-40 animate-pulse" />
                </div>

                {/* Water Content Level */}
                <div className="w-44 sm:w-48 h-36 sm:h-40 bg-gradient-to-b from-cyan-400/60 to-blue-600/80 rounded-b-full border-t border-cyan-200 shadow-inner flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-xs sm:text-sm font-black text-white shadow-md">
                    Cool Water: {coolingDegree.toFixed(1)}°C
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-cyan-100 font-bold mt-1">
                    (Seepage: {porosityPct}% • Humidity: {humidityPct}%)
                  </span>
                </div>
              </div>
            ) : (
              /* Pressure Cooker Mode Visual */
              <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 rounded-b-3xl border-4 border-slate-200 shadow-2xl flex flex-col items-center justify-center p-4 text-center">
                {/* Lid & Safety Valve */}
                <div className="w-64 sm:w-72 h-8 sm:h-10 bg-slate-800 border-2 border-slate-500 rounded-t-xl absolute -top-8 flex items-center justify-center shadow-lg">
                  <div className="w-5 sm:w-6 h-6 sm:h-8 bg-amber-500 rounded-t-sm animate-bounce flex items-center justify-center">
                    <span className="text-[7px] sm:text-[8px] font-black text-amber-950">VALVE</span>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-black text-slate-900 uppercase">Pressure Cooker</span>
                <span className="text-[10px] sm:text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full mt-2">
                  High Temp Cooking: 120°C (Elevated Boiling Point!)
                </span>
              </div>
            )}
          </div>

          {/* Bottom Responsive Evaporative Info Card */}
          <div className="w-full max-w-lg mx-auto bg-gray-900/95 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-700 text-center shadow-lg shrink-0 z-30">
            <span className="text-xs sm:text-sm font-bold text-cyan-300 block">
              {isMatkaMode ? `🏺 Evaporative Cooling: ${coolingDegree.toFixed(1)}°C` : '♨️ Pressure Trapping: 120°C Boiling Point'}
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
              {isMatkaMode ? "Water seeps out of clay pores and absorbs latent heat as it evaporates." : "High pressure prevents vapor release, allowing superheated water."}
            </p>
          </div>
        </div>
      );
    } else {
      // --- EXPERIMENT 3: CANDLE FLAME OXYGEN DEPLETION & REACTION CHAMBER ---
      const jarVolumeMl = Math.round(temperature * 10);

      return (
        <div 
          ref={workspaceRef}
          className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-3 sm:p-4 overflow-hidden gap-2"
        >
          {/* Centered Inverted Glass Jar & Candle Assembly */}
          <div className="relative flex-1 w-full flex items-center justify-center my-auto">
            <div 
              className="relative z-10 border-4 border-cyan-200/50 bg-cyan-400/10 backdrop-blur-xs rounded-t-3xl shadow-2xl flex flex-col items-center justify-end pb-4 transition-all duration-300"
              style={{
                width: `${Math.min(280, Math.max(160, jarVolumeMl / 3))}px`,
                height: `${Math.min(280, Math.max(180, jarVolumeMl / 2.5))}px`
              }}
            >
              {/* Effervescence Gas Bubbles Overlay */}
              {showEffervescence && (
                <div className="absolute inset-0 bg-white/20 rounded-t-3xl overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-[radial-gradient(#ffffff_4px,transparent_4px)] bg-[size:16px_16px] animate-ping" />
                  <span className="absolute text-xs font-black text-emerald-950 bg-emerald-300 px-3 py-1 rounded-full shadow-lg">
                    CO₂ Gas Eruption!
                  </span>
                </div>
              )}

              {/* Candle Base & Wax */}
              <div className="w-14 sm:w-16 h-24 sm:h-28 bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-300 rounded-t-md shadow-md relative flex flex-col items-center">
                
                {/* Wick */}
                <div className="w-1 h-4 bg-gray-900 absolute -top-4" />

                {/* Candle Flame */}
                {candleLit && oxygenLevel > 10 ? (
                  <div 
                    className="w-8 h-12 bg-gradient-to-t from-orange-500 via-yellow-400 to-amber-100 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.9)] absolute -top-14 animate-pulse flex items-center justify-center"
                  >
                    <div className="w-3 h-5 bg-blue-500 rounded-full" />
                  </div>
                ) : (
                  <div className="absolute -top-10 text-xs font-bold text-gray-400 animate-fade-out whitespace-nowrap">
                    💨 Snuffed Out (No O₂)
                  </div>
                )}
              </div>

              <span className="text-[10px] font-bold text-cyan-200 mt-3 bg-gray-900/80 px-2.5 py-0.5 rounded shadow">
                Glass Jar Volume: {jarVolumeMl} mL
              </span>
            </div>
          </div>

          {/* Responsive Bottom Controls Toolbar (Wraps cleanly on mobile!) */}
          <div className="w-full max-w-lg mx-auto bg-gray-900/95 p-2.5 sm:p-3 rounded-xl border border-gray-700 text-xs text-gray-200 flex flex-wrap items-center justify-center sm:justify-between gap-2 shrink-0 z-30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-400">O₂ Level ({oxygenLevel}%):</span>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={oxygenLevel}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setOxygenLevel(val);
                  if (val <= 10) setCandleLit(false);
                }}
                className="w-20 sm:w-24 accent-emerald-500 cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCandleLit(true);
                  setOxygenLevel(21);
                }}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition-all"
              >
                Relight Flame
              </button>

              <button
                onClick={triggerChemicalEffervescence}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow transition-all"
              >
                + Baking Soda (CO₂)
              </button>
            </div>
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
            min="10"
            max="100"
            step="1"
            value={temperature}
            onChange={(e) => handleTempChange(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider2Label}: {expInfo.slider2Val}</span>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={stirSpeed}
            onChange={(e) => handleStirChange(parseInt(e.target.value))}
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
