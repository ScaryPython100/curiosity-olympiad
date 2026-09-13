"use client";

import React, { useState, useEffect } from 'react';

function MatkaSunShade({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [container, setContainer] = useState<"Matka" | "Steel" | "Plastic">("Matka");
  const [placement, setPlacement] = useState<"Sun" | "Shade">("Sun");
  const [wetCloth, setWetCloth] = useState(false);

  const base = placement === "Sun" ? 40 : 30;
  let temp = base;
  if (container === "Matka") {
    temp = base - (wetCloth ? 15 : 5);
  }
  
  const isAnomaly = container === "Matka" && wetCloth && placement === "Sun";
  if (isAnomaly) temp = 22;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-teal-400">Vessel:</span>
          <div className="flex gap-1">
            {(["Matka", "Steel", "Plastic"] as const).map(c => (
              <button 
                key={c}
                onClick={() => { setContainer(c); recordAction('changed_container', { val: c }); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${container === c ? 'bg-teal-500 text-white' : 'bg-gray-700 text-gray-300'}`}
              >{c}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Place:</span>
          <div className="flex gap-1">
            {(["Sun", "Shade"] as const).map(p => (
              <button 
                key={p}
                onClick={() => { setPlacement(p); recordAction('changed_placement', { val: p }); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${placement === p ? 'bg-amber-500 text-amber-950' : 'bg-gray-700 text-gray-300'}`}
              >{p}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-sky-300">
          <input 
            type="checkbox" 
            checked={wetCloth} 
            onChange={e => { setWetCloth(e.target.checked); recordAction('toggled_wet_cloth', { val: e.target.checked }); }}
            className="accent-sky-500"
          />
          <span>Wet Cloth Wrap</span>
        </label>
      </div>

      <div className={`relative flex-1 min-h-[220px] flex flex-col items-center justify-center p-3 overflow-hidden ${placement === 'Sun' ? 'bg-amber-100' : 'bg-slate-900'}`}>
        <div className="bg-white/95 px-3 py-1 rounded-full shadow text-xs font-bold text-gray-800 mb-3 border border-gray-200">
          Water Temp: <span className="text-teal-600 text-sm font-black">{temp}°C</span>
        </div>

        <div className="relative">
          <div className={`w-28 sm:w-32 h-36 rounded-b-3xl rounded-t flex items-center justify-center shadow-lg relative ${
            container === 'Matka' ? 'bg-amber-700 border-t-8 border-amber-900' : container === 'Steel' ? 'bg-slate-400 border-t-8 border-slate-500' : 'bg-blue-400 border-t-8 border-blue-500'
          }`}>
            <span className="font-bold text-white uppercase text-xs z-10">{container}</span>
            {wetCloth && container === 'Matka' && (
              <div className="absolute inset-0 bg-blue-200/50 border-4 border-blue-300/60 rounded-b-3xl rounded-t pointer-events-none" />
            )}
          </div>
          <div className="w-36 h-2 bg-black/20 rounded-full mt-2 mx-auto" />
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-teal-300 block">
          {isAnomaly ? "Wait... it's cooler in the hot Sun?!" : "Matka Cooling Effect"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Rapid evaporation in the dry sun pulls away huge amounts of latent heat, making it cooler than shade!" 
            : "Observe how container type and location impact the water temperature inside."}
        </p>
      </div>
    </div>
  );
}

function KiteString({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [stringLen, setStringLen] = useState(50);
  const [windSpeed, setWindSpeed] = useState(50);
  const [kiteAngle, setKiteAngle] = useState(30);

  const isAnomaly = windSpeed === 80 && kiteAngle >= 60;
  
  let kiteY = (stringLen * windSpeed * (90 - kiteAngle)) / 10000; 
  if (isAnomaly) kiteY = -20;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400">Wind</span>
          <input 
            type="range" min="20" max="100" step="10" value={windSpeed} 
            onChange={e => { setWindSpeed(parseInt(e.target.value)); recordAction('changed_wind', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-sky-500 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{windSpeed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-400">Pull Angle</span>
          <input 
            type="range" min="10" max="80" step="10" value={kiteAngle} 
            onChange={e => { setKiteAngle(parseInt(e.target.value)); recordAction('changed_angle', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-red-500 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{kiteAngle}°</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-sky-300 overflow-hidden flex flex-col justify-end">
        <div className="absolute bottom-0 w-full h-8 bg-green-600 border-t-2 border-green-700" />
        
        <div 
          className="absolute transition-all duration-500" 
          style={{ 
            left: '50%', 
            bottom: `${Math.max(12, Math.min(80, kiteY * 100 + 15))}%`, 
            transform: `translateX(-50%) rotate(${isAnomaly ? 180 : kiteAngle}deg)` 
          }}
        >
          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-500 rotate-45 shadow-lg flex items-center justify-center relative">
            <div className="w-full h-[2px] bg-yellow-400 absolute" />
            <div className="h-full w-[2px] bg-yellow-400 absolute" />
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">
          {isAnomaly ? "The kite nosedived suddenly!" : "Flying the Kite"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "In high wind, pulling the bridle angle too steep spills the aerodynamic lift, forcing the nose downward into a dive." 
            : "Balance wind velocity and line pull angle to keep the kite soaring stably."}
        </p>
      </div>
    </div>
  );
}

function ChapatiPuff({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [heat, setHeat] = useState(50);
  const [thickness, setThickness] = useState(5);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (time < 100) {
      const t = setTimeout(() => setTime(prev => prev + 10), 400);
      return () => clearTimeout(t);
    }
  }, [time]);

  const isAnomaly = thickness <= 3 && heat <= 40;
  const puffAmount = isAnomaly ? 0 : Math.min(100, (time * heat) / 100);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Tawa Heat</span>
          <input 
            type="range" min="10" max="100" step="10" value={heat} 
            onChange={e => { setHeat(parseInt(e.target.value)); recordAction('changed_heat', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-amber-500 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{heat}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-300">Dough</span>
          <input 
            type="range" min="1" max="10" step="1" value={thickness} 
            onChange={e => { setThickness(parseInt(e.target.value)); recordAction('changed_thickness', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-yellow-400 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{thickness}mm</span>
        </div>
        <button 
          onClick={() => { setTime(0); recordAction('reset_chapati'); }} 
          className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
        >
          New Dough
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Tawa Plate */}
        <div className="w-44 sm:w-56 h-12 bg-gray-800 rounded-b-[100%] border-t-4 border-gray-700 flex items-center justify-center relative shadow-2xl">
          {/* Chapati */}
          <div 
            className="bg-amber-100 rounded-full transition-all duration-300 border border-amber-300 shadow flex items-center justify-center"
            style={{ 
              width: `${120 + thickness * 2}px`, 
              height: `${14 + (puffAmount / 100) * 45}px`,
              backgroundColor: time > 80 ? '#fde68a' : '#fef3c7'
            }}
          >
            {puffAmount > 50 && (
              <span className="text-[9px] font-bold text-amber-800/80 uppercase tracking-widest animate-pulse">
                Steam Pocket
              </span>
            )}
          </div>
        </div>
        {/* Heat Glow */}
        <div 
          className="w-32 h-2 rounded-full blur-sm mt-1 transition-colors duration-500" 
          style={{ backgroundColor: heat > 60 ? '#ef4444' : heat > 30 ? '#f59e0b' : '#6b7280' }} 
        />
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly ? "Too thin on low heat — dried out without puffing!" : "Chapati Steam Expansion"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Steam escaped through dry micro-cracks before building enough pressure to lift the dough layers." 
            : "High heat rapidly turns trapped moisture into steam, inflating the chapati like a balloon!"}
        </p>
      </div>
    </div>
  );
}

export function Grades68Level({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <MatkaSunShade recordAction={recordAction} />}
      {experimentSubIndex === 1 && <KiteString recordAction={recordAction} />}
      {experimentSubIndex === 2 && <ChapatiPuff recordAction={recordAction} />}
    </div>
  );
}
