"use client";

import React, { useState, useEffect } from 'react';

// ============================================================================
// EXPERIMENT 1: KITCHEN UTENSILS THERMAL CONDUCTION LAB
// ============================================================================
function ExperimentOne({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [stoveHeat, setStoveHeat] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const dalTemp = Math.min(100, 20 + stoveHeat * (timeElapsed / 10)); 
  const steelSpoonTemp = Math.min(100, 20 + stoveHeat * (timeElapsed / 2));
  const woodSpoonTemp = 20 + (stoveHeat * timeElapsed * 0.05);

  const isAnomaly = steelSpoonTemp > 60 && dalTemp < 40;

  useEffect(() => {
    if (stoveHeat > 0) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stoveHeat]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-orange-400">Stove Heat</span>
          <input
            type="range" min="0" max="10" step="1" value={stoveHeat}
            onChange={(e) => {
              setStoveHeat(parseInt(e.target.value));
              recordAction('changed_stove_heat', { val: parseInt(e.target.value) });
            }}
            className="w-20 sm:w-28 accent-orange-500 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">{stoveHeat}</span>
        </div>
        <button 
          onClick={() => { setTimeElapsed(0); recordAction('reset_time'); }} 
          className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-0.5 rounded text-xs"
        >
          Reset
        </button>
      </div>

      {/* Temperature Indicators Bar */}
      <div className="bg-gray-900/80 border-b border-gray-800 px-3 py-1.5 flex flex-wrap items-center justify-around gap-2 text-[11px] shrink-0">
        <span className="text-gray-300">🍲 Dal: <strong className="text-orange-400">{Math.round(dalTemp)}°C</strong></span>
        <span className="text-gray-300">🥄 Steel: <strong className="text-red-400">{Math.round(steelSpoonTemp)}°C</strong></span>
        <span className="text-gray-300">🥄 Wood: <strong className="text-amber-400">{Math.round(woodSpoonTemp)}°C</strong></span>
      </div>

      {/* Visual Canvas */}
      <div className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center p-3 overflow-hidden bg-slate-900">
        {/* Stove and Pot */}
        <div className="relative w-40 sm:w-48 h-32 flex flex-col items-center justify-center">
          {/* Steam */}
          <div className="absolute -top-6 w-full flex justify-center gap-3 opacity-60">
            {dalTemp > 50 && <div className="w-1.5 h-8 bg-white rounded-full animate-bounce blur-sm" />}
            {dalTemp > 80 && <div className="w-2 h-10 bg-white rounded-full animate-bounce blur-sm delay-100" />}
          </div>

          {/* Pot */}
          <div className="w-36 sm:w-40 h-16 bg-gray-800 rounded-b-3xl border-t-4 border-gray-600 relative flex justify-center shadow-lg">
            {/* Spoons */}
            <div className="absolute -top-12 flex gap-8">
              <div className="flex flex-col items-center">
                <div 
                  className="w-2 h-12 rounded-t-full transition-colors duration-500 shadow" 
                  style={{ backgroundColor: steelSpoonTemp > 60 ? '#ef4444' : '#9ca3af' }} 
                />
                <span className="text-[8px] font-bold text-gray-400 uppercase">Steel</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-12 bg-amber-800 rounded-t-full shadow" />
                <span className="text-[8px] font-bold text-amber-500 uppercase">Wood</span>
              </div>
            </div>
            {/* Dal liquid surface */}
            <div className="absolute top-0 w-[92%] h-3 bg-orange-600/80 rounded-full mt-0.5" />
          </div>

          {/* Flame */}
          <div className="w-28 h-5 flex justify-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-3 bg-orange-500 rounded-t-full origin-bottom transition-all duration-300" 
                style={{ height: `${stoveHeat * 10}%` }} 
              />
            ))}
          </div>
          {/* Stove Base */}
          <div className="w-40 h-3 bg-gray-950 rounded shadow" />
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-orange-400 block">
          {isAnomaly ? "Ouch! The steel spoon is burning hot!" : "Heating the Soup"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "The steel spoon handle got scalding hot before the soup even came to a boil! Metal conducts heat directly up to your fingers." 
            : "Turn up the heat and compare the steel spoon vs. the wooden spoon."}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPERIMENT 2: EARTHEN MATKA EVAPORATIVE COOLING
// ============================================================================
function ExperimentTwo({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [material, setMaterial] = useState<"Metal" | "Clay">("Clay");
  const [humidity, setHumidity] = useState(20);
  
  const potTemp = material === "Metal" ? 35 : 35 - ((100 - humidity) / 5);
  const isAnomaly = material === "Clay" && humidity > 80;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-400">Material:</span>
          <div className="flex gap-1">
            {(["Metal", "Clay"] as const).map(mat => (
              <button 
                key={mat}
                onClick={() => {
                  setMaterial(mat);
                  recordAction('changed_pot_material', { val: mat });
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${material === mat ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-400">Humidity</span>
          <input
            type="range" min="10" max="90" step="10" value={humidity}
            onChange={e => {
              setHumidity(parseInt(e.target.value));
              recordAction('changed_humidity', { val: parseInt(e.target.value) });
            }}
            className="w-20 sm:w-28 accent-teal-500 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">{humidity}%</span>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center p-3 overflow-hidden bg-slate-900">
        <div className="flex flex-col items-center">
          {/* Matka or Metal Pot */}
          <div 
            className={`w-28 sm:w-32 h-32 rounded-b-[45px] rounded-t-xl border-t-8 flex flex-col justify-end items-center overflow-hidden shadow-2xl transition-colors duration-500 relative ${
              material === "Clay" ? 'bg-amber-700 border-amber-900' : 'bg-slate-400 border-slate-600'
            }`}
          >
            {material === "Clay" && (
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]" />
            )}
            <div className="w-full h-16 bg-blue-500/60 transition-all duration-300" />
            <div className="absolute top-8 bg-black/60 px-2 py-0.5 rounded text-white font-mono text-xs font-bold shadow">
              {Math.round(potTemp)}°C
            </div>
          </div>
          <div className="w-36 h-2 bg-slate-800 rounded-full mt-2" />
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-teal-300 block">
          Water Temp: {Math.round(potTemp)}°C {material === "Clay" ? "(Clay Matka)" : "(Steel Pot)"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "On very humid/rainy days, the clay pot can barely cool down! Evaporation needs dry air to draw out heat." 
            : material === "Clay" 
              ? "Clay pot pores let water seep through and evaporate, naturally drawing away heat and chilling the water." 
              : "Metal pots have no pores for evaporation, so water stays at room temperature."}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPERIMENT 3: CANDLE IN GLASS (AIR VOLUME)
// ============================================================================
function ExperimentThree({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [glassSize, setGlassSize] = useState(50);
  const [airAmount, setAirAmount] = useState(20);
  const [candleLit, setCandleLit] = useState(true);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Jar Size</span>
          <input
            type="range" min="30" max="100" step="10" value={glassSize}
            onChange={(e) => {
              setGlassSize(parseInt(e.target.value));
              recordAction('changed_glass_size', { val: parseInt(e.target.value) });
            }}
            className="w-16 sm:w-24 accent-indigo-500 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">Air</span>
          <input
            type="range" min="0" max="30" step="1" value={airAmount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setAirAmount(val);
              recordAction('changed_air_amount', { val });
              if (val <= 5) setCandleLit(false);
            }}
            className="w-16 sm:w-24 accent-indigo-500 cursor-pointer"
          />
        </div>
        <button
          onClick={() => {
            setCandleLit(true);
            setAirAmount(20);
            recordAction('relit_candle');
          }}
          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs shadow"
        >
          Relight Diya
        </button>
      </div>

      {/* Visual Canvas */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex flex-col items-center justify-center p-3 overflow-hidden">
        {/* Jar */}
        <div 
          className="border-2 border-cyan-200/40 bg-cyan-400/5 rounded-t-2xl shadow-xl flex flex-col items-center justify-end pb-3 transition-all duration-300"
          style={{
            width: `${Math.min(220, Math.max(130, glassSize * 2.2))}px`,
            height: `${Math.min(200, Math.max(140, glassSize * 2))}px`
          }}
        >
          {/* Diya */}
          <div className="w-14 h-7 bg-orange-700 border-2 border-orange-900 rounded-b-full shadow-md relative flex flex-col items-center">
            <div className="w-12 h-1.5 bg-yellow-500 rounded-full absolute -top-1 opacity-80" />
            <div className="w-1 h-2 bg-gray-900 absolute -top-2" />

            {candleLit && airAmount > 5 ? (
              <div className="w-6 h-10 bg-gradient-to-t from-orange-500 via-yellow-400 to-amber-100 rounded-full shadow-[0_0_25px_rgba(251,191,36,0.9)] absolute -top-11 animate-pulse flex items-center justify-center">
                <div className="w-2 h-4 bg-blue-500 rounded-full" />
              </div>
            ) : (
              <div className="absolute -top-7 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                💨 Flame Out
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {candleLit ? "🔥 Diya Burning Steadily" : "💨 Flame Extinguished"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {candleLit 
            ? "Fire needs oxygen from fresh air to keep burning. Trapping it under a jar limits oxygen!" 
            : "The flame burned through all the available oxygen inside the glass jar and went out."}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LEVEL COMPONENT
// ============================================================================
export function ChemistryLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <ExperimentOne recordAction={recordAction} />}
      {experimentSubIndex === 1 && <ExperimentTwo recordAction={recordAction} />}
      {experimentSubIndex === 2 && <ExperimentThree recordAction={recordAction} />}
    </div>
  );
}
