"use client";

import React, { useState } from 'react';

function SoilRain({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [soil, setSoil] = useState<"Sandy" | "Clay" | "Loamy">("Loamy");
  const [rain, setRain] = useState(50);

  let status = "Ready to sow in 2 days";
  let isAnomaly = false;

  if (soil === "Clay" && rain >= 30) {
    status = "Flooded! Cannot sow for 10+ days.";
    isAnomaly = true;
  } else if (soil === "Sandy") {
    status = "Dried out! Water drained immediately.";
    isAnomaly = true;
  } else if (soil === "Loamy") {
    status = "Perfect moisture balance. Ready to sow in 2 days.";
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Soil:</span>
          <div className="flex gap-1">
            {(["Sandy", "Clay", "Loamy"] as const).map(s => (
              <button 
                key={s} 
                onClick={() => { setSoil(s); recordAction('changed_soil', {val: s}); }} 
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${soil === s ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400">Rainfall</span>
          <input 
            type="range" min="10" max="100" step="10" value={rain} 
            onChange={e => { setRain(parseInt(e.target.value)); recordAction('changed_rain', {val: parseInt(e.target.value)}); }} 
            className="w-20 sm:w-28 accent-sky-500 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">{rain}mm</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-sky-100 flex flex-col justify-end overflow-hidden p-3">
        <div className="absolute top-4 w-full flex justify-center opacity-40">
          {rain > 0 && <div className="text-blue-500 font-black tracking-[1em] text-sm animate-pulse">| | | | | | |</div>}
        </div>

        <div className={`w-full h-36 rounded-t-xl transition-colors duration-500 flex flex-col items-center justify-center p-4 shadow-inner ${
          soil === 'Clay' ? 'bg-amber-950' : soil === 'Sandy' ? 'bg-yellow-600' : 'bg-amber-800'
        }`}>
          <div className="bg-white/95 px-3 py-1.5 rounded-lg text-center shadow border border-gray-200">
            <span className="font-bold text-gray-600 text-[11px] uppercase tracking-wider block">Field Status</span>
            <span className={`text-xs font-black ${isAnomaly ? 'text-red-600' : 'text-emerald-700'}`}>{status}</span>
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly ? "Why isn't more water retention always better?" : "First Rain Soil Moisture"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Clay retains too much water (suffocating seed roots), while sand drains instantly. Loam provides the vital balance." 
            : "Observe how soil texture governs seedling germination after the first monsoon rain."}
        </p>
      </div>
    </div>
  );
}

function SolarCooker({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [angle, setAngle] = useState(45);
  const [timeOfDay, setTimeOfDay] = useState<"Morning" | "Noon" | "Late Afternoon">("Noon");
  
  let temp = 30;
  if (timeOfDay === "Noon" && Math.abs(angle - 90) <= 15) temp = 120;
  else if (timeOfDay === "Late Afternoon" && Math.abs(angle - 30) <= 15) temp = 110;
  else if (timeOfDay === "Morning" && Math.abs(angle - 30) <= 15) temp = 100;
  else temp = 40;

  const isAnomaly = timeOfDay === "Late Afternoon" && angle === 90;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400">Time:</span>
          {(["Morning", "Noon", "Late Afternoon"] as const).map(t => (
            <button 
              key={t} 
              onClick={() => { setTimeOfDay(t); recordAction('changed_time', {val: t}); }} 
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${timeOfDay === t ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400">Angle</span>
          <input 
            type="range" min="0" max="90" step="15" value={angle} 
            onChange={e => { setAngle(parseInt(e.target.value)); recordAction('changed_angle', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-yellow-500 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">{angle}°</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-400 to-amber-100 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="bg-white/95 px-4 py-1.5 rounded-full shadow border border-gray-200 text-xs font-bold text-gray-800 mb-6">
          Cooker Temp: <span className={`text-sm font-black ${temp > 80 ? 'text-red-600' : 'text-gray-600'}`}>{temp}°C</span>
        </div>

        {/* Cooker box and mirror */}
        <div className="w-36 sm:w-44 h-12 bg-gray-800 rounded-b-xl border-t-4 border-gray-700 relative flex justify-center shadow-2xl">
          {/* Reflective Lid */}
          <div 
            className="absolute bottom-12 w-36 sm:w-44 h-2 bg-blue-300/80 border border-white shadow origin-bottom transition-all duration-300" 
            style={{ transform: `rotate(${angle - 90}deg)` }} 
          />
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-yellow-300 block">
          {isAnomaly ? "The noon angle completely fails in late afternoon!" : "Tracking Solar Focus"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Because the sun's altitude drops in the sky, mirrors set at 90° bounce sunlight away from the cooking pot!" 
            : "Rotate the reflector mirror to align with the sun's shifting angle across the day."}
        </p>
      </div>
    </div>
  );
}

function BiogasPlant({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [dungRatio, setDungRatio] = useState(20);
  const [temp, setTemp] = useState(15);

  const gas = temp < 20 ? (dungRatio * 0.2) : (dungRatio * (temp / 20));
  const isAnomaly = dungRatio > 60 && temp < 20;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Dung Load</span>
          <input 
            type="range" min="20" max="100" step="20" value={dungRatio} 
            onChange={e => { setDungRatio(parseInt(e.target.value)); recordAction('changed_dung', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-amber-500 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">{dungRatio}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-400">Digester Temp</span>
          <input 
            type="range" min="10" max="40" step="5" value={temp} 
            onChange={e => { setTemp(parseInt(e.target.value)); recordAction('changed_temp', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-cyan-400 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-gray-400">{temp}°C</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="bg-white/95 px-4 py-1.5 rounded-full shadow border border-gray-200 text-xs font-bold text-gray-800 mb-4">
          Methane Output: <span className="text-emerald-700 text-sm font-black">{Math.round(gas)} m³/day</span>
        </div>

        {/* Biogas Dome */}
        <div className="w-40 sm:w-48 h-28 bg-gray-800 rounded-t-[40px] flex justify-center items-end border-b-4 border-amber-900 relative overflow-hidden shadow-2xl">
          <div className="w-full bg-amber-800/80 rounded-b transition-all duration-300" style={{ height: `${dungRatio}%` }} />
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-cyan-300 block">
          {isAnomaly ? "More dung produced almost no extra gas!" : "Biogas Output Dynamics"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Methanogenic bacteria go dormant below 20°C. In winter, biological activity is temperature-limited, not fuel-limited!" 
            : "Maintain optimal fermenter temperature to maximize microbial decomposition and gas yield."}
        </p>
      </div>
    </div>
  );
}

export function Grades910Level({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <SoilRain recordAction={recordAction} />}
      {experimentSubIndex === 1 && <SolarCooker recordAction={recordAction} />}
      {experimentSubIndex === 2 && <BiogasPlant recordAction={recordAction} />}
    </div>
  );
}
