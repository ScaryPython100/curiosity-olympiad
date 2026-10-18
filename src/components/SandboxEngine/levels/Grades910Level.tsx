"use client";

import React, { useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';

type RecordAction = (actionType: string, actionDetails?: any) => void;

function SoilRain({ recordAction }: { recordAction: RecordAction }) {
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

  useAnomalySignal(isAnomaly, recordAction);
  const SOIL_TOP = 110;
  const soilColor = soil === "Clay" ? "#7c2d12" : soil === "Sandy" ? "#d6a64f" : "#78350f";
  const flooded = soil === "Clay" && rain >= 30;
  const pondDepth = flooded ? 6 + rain * 0.12 : 0;
  const drainedToBottom = soil === "Sandy";
  // How deep the water soaks in (wet band)
  const soakDepth = soil === "Clay" ? 10 : soil === "Sandy" ? 0 : 20 + rain * 0.3;
  const sprout = soil === "Loamy" || (soil === "Clay" && rain < 30);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-amber-300">Soil:</span>
          <div className="flex gap-1.5">
            {(["Sandy", "Clay", "Loamy"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSoil(s); recordAction('changed_soil', { val: s }); }}
                className={`px-3 rounded-lg text-xs font-bold ${soil === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sky-300">🌧️ Rainfall</span>
            <span className="text-xs font-mono text-gray-300">{rain} mm</span>
          </div>
          <input
            type="range" min="10" max="100" step="10" value={rain}
            aria-label="Rainfall in millimetres"
            onChange={e => { setRain(parseInt(e.target.value)); recordAction('changed_rain', { val: parseInt(e.target.value) }); }}
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-slate-400 to-sky-200 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={status}>
          {/* Cloud + rain: more rain, more drops */}
          <ellipse cx="120" cy="24" rx="50" ry="16" fill="#64748b" />
          <ellipse cx="170" cy="18" rx="44" ry="16" fill="#64748b" />
          <ellipse cx="215" cy="26" rx="40" ry="14" fill="#64748b" />
          {[...Array(Math.round(rain / 7))].map((_, i) => (
            <line key={i} x1={80 + ((i * 37) % 180)} y1={44 + ((i * 13) % 20)} x2={76 + ((i * 37) % 180)} y2={56 + ((i * 13) % 20)} stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round">
              <animateTransform attributeName="transform" type="translate" values="0 0; -4 40" dur="0.9s" begin={`${(i % 5) * 0.18}s`} repeatCount="indefinite" />
            </line>
          ))}

          {/* Soil cross-section */}
          <rect x="0" y={SOIL_TOP} width="340" height={220 - SOIL_TOP} fill={soilColor} />
          {soil === "Sandy" && [...Array(40)].map((_, i) => <circle key={i} cx={(i * 47) % 340} cy={SOIL_TOP + 8 + ((i * 29) % 100)} r="2" fill="#fde68a" opacity="0.6" />)}
          {soil === "Clay" && [...Array(6)].map((_, i) => <line key={i} x1="0" y1={SOIL_TOP + 16 + i * 16} x2="340" y2={SOIL_TOP + 16 + i * 16} stroke="#451a03" strokeWidth="1" opacity="0.5" />)}
          {soil === "Loamy" && [...Array(24)].map((_, i) => <ellipse key={i} cx={(i * 59) % 340} cy={SOIL_TOP + 10 + ((i * 31) % 96)} rx="4" ry="2" fill="#451a03" opacity="0.5" />)}

          {/* Water soaking in */}
          {soakDepth > 0 && <rect x="0" y={SOIL_TOP} width="340" height={soakDepth} fill="#1d4ed8" opacity="0.28" />}
          {/* Sand: water ran straight to the bottom */}
          {drainedToBottom && (
            <g>
              <rect x="0" y="200" width="340" height="20" fill="#1d4ed8" opacity="0.35" />
              {[60, 150, 240].map((x) => (
                <path key={x} d={`M ${x} ${SOIL_TOP + 6} q 6 30 0 60 q -6 22 0 30`} stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 4" opacity="0.8" />
              ))}
            </g>
          )}
          {/* Clay: water sits on top in a pond */}
          {flooded && <rect x="0" y={SOIL_TOP - pondDepth} width="340" height={pondDepth} fill="#3b82f6" opacity="0.75" />}

          {/* Seed / sprout */}
          <g transform={`translate(170 ${SOIL_TOP + 12})`}>
            <ellipse cx="0" cy="0" rx="6" ry="4" fill="#fde047" stroke="#a16207" />
            {sprout && (
              <g>
                <line x1="0" y1="-2" x2="0" y2={-22 - (flooded ? 0 : 0)} stroke="#16a34a" strokeWidth="3" />
                <ellipse cx="-7" cy="-20" rx="7" ry="3.5" fill="#22c55e" transform="rotate(-25 -7 -20)" />
                <ellipse cx="7" cy="-24" rx="7" ry="3.5" fill="#22c55e" transform="rotate(25 7 -24)" />
              </g>
            )}
            {soil === "Sandy" && <text x="0" y="-12" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c2d12">dry 🥀</text>}
          </g>

          {/* Status */}
          <rect x="12" y="186" width="316" height="24" rx="12" fill="#ffffff" opacity="0.92" />
          <text x="170" y="202" textAnchor="middle" fontSize="11" fontWeight="800" fill={isAnomaly ? "#dc2626" : "#047857"}>{status}</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-amber-300 block">
          {flooded ? "🌊 Clay holds too much water!" : soil === "Sandy" ? "🏜️ Sand lets the water run away" : "🌱 Just right for sowing"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {flooded
            ? "Water cannot sink into tight clay, so it floods the top and the seed cannot breathe."
            : soil === "Sandy"
              ? "Sand has big gaps. Water drains down fast and the roots stay dry."
              : "Loamy soil keeps some water and drains the rest: a good balance for seeds."}
        </p>
      </div>
    </div>
  );
}

function SolarCooker({ recordAction }: { recordAction: RecordAction }) {
  const [angle, setAngle] = useState(45);
  const [timeOfDay, setTimeOfDay] = useState<"Morning" | "Noon" | "Late Afternoon">("Noon");

  let temp = 30;
  if (timeOfDay === "Noon" && Math.abs(angle - 90) <= 15) temp = 120;
  else if (timeOfDay === "Late Afternoon" && Math.abs(angle - 30) <= 15) temp = 110;
  else if (timeOfDay === "Morning" && Math.abs(angle - 30) <= 15) temp = 100;
  else temp = 40;

  const isAnomaly = timeOfDay === "Late Afternoon" && angle === 90;
  useAnomalySignal(isAnomaly, recordAction);
  const focused = temp >= 100;

  // Scene geometry: sun position follows the time of day
  const sun = timeOfDay === "Morning" ? { x: 40, y: 92 } : timeOfDay === "Noon" ? { x: 170, y: 26 } : { x: 300, y: 92 };
  const HINGE = { x: 196, y: 150 };
  const lidRad = (angle * Math.PI) / 180;
  const lidLen = 70;
  // Lid tilts back from the hinge; 90° = straight up
  const lidEnd = { x: HINGE.x + Math.cos(lidRad) * lidLen, y: HINGE.y - Math.sin(lidRad) * lidLen };
  const mirrorMid = { x: (HINGE.x + lidEnd.x) / 2, y: (HINGE.y + lidEnd.y) / 2 };
  const POT = { x: 150, y: 160 };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-yellow-300">Time:</span>
          <div className="flex gap-1.5">
            {(["Morning", "Noon", "Late Afternoon"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTimeOfDay(t); recordAction('changed_time', { val: t }); }}
                className={`px-2.5 rounded-lg text-xs font-bold ${timeOfDay === t ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                {t === "Late Afternoon" ? "Evening" : t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-yellow-300">🪞 Mirror Angle</span>
            <span className="text-xs font-mono text-gray-300">{angle}°</span>
          </div>
          <input
            type="range" min="0" max="90" step="15" value={angle}
            aria-label="Mirror angle"
            onChange={e => { setAngle(parseInt(e.target.value)); recordAction('changed_angle', { val: parseInt(e.target.value) }); }}
          />
        </div>
      </div>

      <div className={`relative flex-1 min-h-[220px] flex items-end ${timeOfDay === "Noon" ? "bg-gradient-to-b from-sky-400 to-sky-200" : "bg-gradient-to-b from-orange-300 to-amber-100"}`}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Cooker is ${temp} degrees`}>
          {/* Sky path of the sun */}
          <path d="M 30 100 Q 170 -20 310 100" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 5" fill="none" opacity="0.7" />
          <circle cx={sun.x} cy={sun.y} r="16" fill="#facc15" stroke="#f59e0b" strokeWidth="2" />

          <rect x="0" y="186" width="340" height="34" fill="#a3a3a3" />

          {/* Sunlight to the mirror */}
          <line x1={sun.x} y1={sun.y} x2={mirrorMid.x} y2={mirrorMid.y} stroke="#fde047" strokeWidth="3" strokeDasharray="6 4" />
          {/* Bounced light: into the pot when aligned, away when not */}
          {focused ? (
            <line x1={mirrorMid.x} y1={mirrorMid.y} x2={POT.x} y2={POT.y} stroke="#fde047" strokeWidth="4" />
          ) : (
            <line x1={mirrorMid.x} y1={mirrorMid.y} x2={mirrorMid.x + (mirrorMid.x - sun.x) * 0.5} y2={Math.max(4, mirrorMid.y - 60)} stroke="#fde047" strokeWidth="3" opacity="0.6" />
          )}

          {/* Cooker box */}
          <rect x="110" y="150" width="90" height="36" rx="4" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
          <rect x="116" y="146" width="78" height="6" fill="#93c5fd" opacity="0.6" />
          {/* Pot inside */}
          <ellipse cx={POT.x} cy={POT.y} rx="18" ry="7" fill={focused ? "#ef4444" : "#374151"} />
          {focused && (
            <path d={`M ${POT.x - 6} ${POT.y - 10} q -5 -8 0 -16 M ${POT.x + 6} ${POT.y - 10} q 5 -8 0 -16`} stroke="#e5e7eb" strokeWidth="2" fill="none" />
          )}

          {/* Reflector lid (mirror) */}
          <line x1={HINGE.x} y1={HINGE.y} x2={lidEnd.x} y2={lidEnd.y} stroke="#e0f2fe" strokeWidth="6" strokeLinecap="round" />
          <line x1={HINGE.x} y1={HINGE.y} x2={lidEnd.x} y2={lidEnd.y} stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

          {/* Thermometer badge */}
          <rect x="236" y="140" width="92" height="40" rx="12" fill="#111827" />
          <text x="282" y="157" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1d5db">Cooker</text>
          <text x="282" y="173" textAnchor="middle" fontSize="15" fontWeight="800" fill={focused ? "#f87171" : "#e5e7eb"}>{temp}°C</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-yellow-300 block">
          {isAnomaly ? "🤔 The noon angle does not work now!" : focused ? "🍲 Cooking hot!" : "Point the mirror at the sun"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The sun has moved low in the sky, so the mirror bounces light away from the pot."
            : focused
              ? "The mirror bounces extra sunlight into the pot."
              : "The sun moves across the sky. Change the mirror angle to follow it."}
        </p>
      </div>
    </div>
  );
}

function BiogasPlant({ recordAction }: { recordAction: RecordAction }) {
  const [dungRatio, setDungRatio] = useState(20);
  const [temp, setTemp] = useState(15);

  const gas = temp < 20 ? (dungRatio * 0.2) : (dungRatio * (temp / 20));
  const isAnomaly = dungRatio > 60 && temp < 20;
  useAnomalySignal(isAnomaly, recordAction);
  const isWinter = temp < 20;

  // Scene geometry
  const slurryTop = 190 - dungRatio * 0.7; // inside the digester dome
  const bubbles = Math.min(12, Math.round(gas / 4));
  const flame = Math.min(1, gas / 80); // 0..1

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300">🐄 Dung Load</span>
            <span className="text-xs font-mono text-gray-300">{dungRatio}%</span>
          </div>
          <input
            type="range" min="20" max="100" step="20" value={dungRatio}
            aria-label="Dung load"
            onChange={e => { setDungRatio(parseInt(e.target.value)); recordAction('changed_dung', { val: parseInt(e.target.value) }); }}
          />
        </div>
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-cyan-300">🌡️ Tank Temperature</span>
            <span className="text-xs font-mono text-gray-300">{temp}°C</span>
          </div>
          <input
            type="range" min="10" max="40" step="5" value={temp}
            aria-label="Tank temperature"
            onChange={e => { setTemp(parseInt(e.target.value)); recordAction('changed_temp', { val: parseInt(e.target.value) }); }}
          />
        </div>
      </div>

      <div className={`relative flex-1 min-h-[220px] flex items-end ${isWinter ? "bg-gradient-to-b from-slate-500 to-slate-300" : "bg-gradient-to-b from-sky-400 to-amber-100"}`}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Gas output ${Math.round(gas)} cubic metres per day`}>
          {/* Season marker */}
          {isWinter ? (
            <g>
              <text x="26" y="34" fontSize="22">❄️</text>
              <text x="54" y="30" fontSize="11" fontWeight="800" fill="#1e293b">Winter: cold</text>
            </g>
          ) : (
            <g>
              <circle cx="36" cy="28" r="13" fill="#facc15" />
              <text x="56" y="32" fontSize="11" fontWeight="800" fill="#78350f">Summer: warm</text>
            </g>
          )}

          <rect x="0" y="190" width="340" height="30" fill="#78716c" />

          {/* Digester dome */}
          <defs>
            <clipPath id="biogas-dome"><path d="M 60 190 L 60 120 Q 60 70 130 70 Q 200 70 200 120 L 200 190 Z" /></clipPath>
          </defs>
          <path d="M 60 190 L 60 120 Q 60 70 130 70 Q 200 70 200 120 L 200 190 Z" fill="#1f2937" stroke="#4b5563" strokeWidth="3" />
          <g clipPath="url(#biogas-dome)">
            <rect x="60" y={slurryTop} width="140" height={190 - slurryTop} fill="#92400e" />
            {/* Gas bubbles: bacteria make more gas when warm */}
            {[...Array(bubbles)].map((_, i) => (
              <circle key={i} cx={74 + ((i * 23) % 116)} cy={slurryTop + 10} r="3.5" fill="#bef264" opacity="0.8">
                <animate attributeName="cy" values={`${188};${slurryTop - 4}`} dur={`${1.2 + (i % 4) * 0.3}s`} begin={`${(i % 6) * 0.2}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
          <text x="130" y="105" textAnchor="middle" fontSize="10" fontWeight="700" fill="#bef264">gas</text>

          {/* Gas pipe to the stove */}
          <path d="M 130 70 L 130 52 L 262 52 L 262 150" stroke="#9ca3af" strokeWidth="5" fill="none" />
          <rect x="236" y="150" width="52" height="10" rx="3" fill="#374151" />
          {flame > 0.05 && (
            <path d={`M 262 150 C ${256 - flame * 6} ${144 - flame * 10} ${258} ${136 - flame * 22} 262 ${130 - flame * 30} C 266 ${136 - flame * 22} ${268 + flame * 6} ${144 - flame * 10} 262 150 Z`} fill="#3b82f6" />
          )}
          <rect x="236" y="170" width="92" height="18" rx="9" fill="#111827" />
          <text x="282" y="183" textAnchor="middle" fontSize="10" fontWeight="800" fill="#bef264">{Math.round(gas)} m³ gas/day</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-cyan-300 block">
          {isAnomaly ? "🤔 More dung, but almost no extra gas!" : isWinter ? "❄️ Cold tank: very little gas" : "🔥 Warm tank: lots of gas"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The tiny bacteria that make gas work very slowly in the cold. More food does not help: warmth does."
            : isWinter
              ? "Bacteria slow down below 20°C. Keeping the tank warm helps."
              : "Warm bacteria eat the dung quickly and make more gas for cooking."}
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
