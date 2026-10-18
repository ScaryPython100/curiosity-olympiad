"use client";

import React, { useState, useEffect } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';

type RecordAction = (actionType: string, actionDetails?: any) => void;

function MatkaSunShade({ recordAction }: { recordAction: RecordAction }) {
  const [container, setContainer] = useState<"Matka" | "Steel" | "Plastic">("Matka");
  const [placement, setPlacement] = useState<"Sun" | "Shade">("Sun");
  const [wetCloth, setWetCloth] = useState(false);

  const base = placement === "Sun" ? 40 : 30;
  let temp = base;
  if (container === "Matka") {
    temp = base - (wetCloth ? 15 : 5);
  }

  const isAnomaly = container === "Matka" && wetCloth && placement === "Sun";
  useAnomalySignal(isAnomaly, recordAction);
  if (isAnomaly) temp = 22;

  const inSun = placement === "Sun";
  const isMatka = container === "Matka";
  const evaporating = isMatka; // only clay lets water seep out and dry
  const strongEvaporation = isMatka && wetCloth;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-2 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-teal-300">Pot:</span>
          <div className="flex gap-1.5">
            {(["Matka", "Steel", "Plastic"] as const).map(c => (
              <button
                key={c}
                onClick={() => { setContainer(c); recordAction('changed_container', { val: c }); }}
                className={`px-3 rounded-lg text-xs font-bold ${container === c ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >{c === "Matka" ? "🏺 Matka" : c === "Steel" ? "🥘 Steel" : "🧴 Plastic"}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {(["Sun", "Shade"] as const).map(p => (
              <button
                key={p}
                onClick={() => { setPlacement(p); recordAction('changed_placement', { val: p }); }}
                className={`px-3 rounded-lg text-xs font-bold ${placement === p ? 'bg-amber-500 text-amber-950' : 'bg-gray-800 text-gray-300'}`}
              >{p === "Sun" ? "☀️ Sun" : "🌳 Shade"}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-sky-300 min-h-[40px]">
            <input
              type="checkbox"
              checked={wetCloth}
              onChange={e => { setWetCloth(e.target.checked); recordAction('toggled_wet_cloth', { val: e.target.checked }); }}
              className="accent-sky-500 w-5 h-5"
            />
            <span>Wet cloth</span>
          </label>
        </div>
      </div>

      <div className={`relative flex-1 min-h-[220px] flex items-end ${inSun ? 'bg-gradient-to-b from-amber-200 to-amber-50' : 'bg-gradient-to-b from-emerald-900 to-emerald-700'}`}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Water is ${temp} degrees`}>
          {inSun ? (
            <g>
              <circle cx="46" cy="40" r="22" fill="#facc15" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line key={a} x1={46 + Math.cos((a * Math.PI) / 180) * 28} y1={40 + Math.sin((a * Math.PI) / 180) * 28} x2={46 + Math.cos((a * Math.PI) / 180) * 36} y2={40 + Math.sin((a * Math.PI) / 180) * 36} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
              ))}
            </g>
          ) : (
            <g>
              {/* Tree canopy making shade */}
              <rect x="20" y="40" width="12" height="156" fill="#78350f" />
              <ellipse cx="90" cy="34" rx="110" ry="40" fill="#166534" />
              <ellipse cx="40" cy="50" rx="50" ry="26" fill="#15803d" />
            </g>
          )}

          <rect x="0" y="196" width="340" height="24" fill={inSun ? "#d6b98c" : "#365314"} />

          {/* Vessel */}
          {container === "Matka" && (
            <path d="M 148 76 Q 140 84 148 92 Q 112 112 120 158 Q 130 196 170 196 Q 210 196 220 158 Q 228 112 192 92 Q 200 84 192 76 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
          )}
          {container === "Steel" && (
            <g>
              <path d="M 126 92 L 214 92 L 208 186 Q 206 196 196 196 L 144 196 Q 134 196 132 186 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
              <rect x="120" y="86" width="100" height="10" rx="4" fill="#94a3b8" />
            </g>
          )}
          {container === "Plastic" && (
            <g>
              <rect x="146" y="70" width="48" height="16" rx="3" fill="#2563eb" />
              <path d="M 140 92 Q 140 84 150 84 L 190 84 Q 200 84 200 92 L 204 186 Q 204 196 194 196 L 146 196 Q 136 196 136 186 Z" fill="#93c5fd" fillOpacity="0.8" stroke="#2563eb" strokeWidth="3" />
            </g>
          )}

          {/* Wet cloth wrapped around */}
          {wetCloth && (
            <g opacity="0.85">
              <rect x="124" y="118" width="92" height="44" rx="10" fill="#bae6fd" fillOpacity="0.7" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />
              <text x="170" y="144" textAnchor="middle" fontSize="10" fontWeight="700" fill="#075985">wet cloth</text>
            </g>
          )}

          {/* Water drying off the surface (evaporation) */}
          {evaporating && [0, 1, 2].map((i) => (
            <path key={i} d={`M ${140 + i * 30} 112 q -8 -8 0 -16 q 8 -8 0 -16`} stroke="#0284c7" strokeWidth={strongEvaporation ? 3 : 2} fill="none" strokeLinecap="round" opacity={strongEvaporation && inSun ? 0.95 : 0.55}>
              <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur={strongEvaporation && inSun ? "1.2s" : "2.4s"} begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </path>
          ))}

          {/* Temperature badge */}
          <rect x="244" y="96" width="82" height="44" rx="12" fill="#111827" />
          <text x="285" y="114" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1d5db">Water</text>
          <text x="285" y="132" textAnchor="middle" fontSize="17" fontWeight="800" fill={temp <= 25 ? "#38bdf8" : "#f87171"}>{temp}°C</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-teal-300 block">
          {isAnomaly ? "🤯 Colder in the hot sun?!" : `${container} in the ${placement.toLowerCase()}: ${temp}°C`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The wet cloth dries super fast in hot sun. Drying pulls heat away, so the water gets very cold."
            : isMatka
              ? "Water seeps out of the clay and dries. Drying takes heat away from the water."
              : `${container} has no tiny holes, so no water dries on the outside to cool it.`}
        </p>
      </div>
    </div>
  );
}

function KiteString({ recordAction }: { recordAction: RecordAction }) {
  const [stringLen, setStringLen] = useState(50);
  const [windSpeed, setWindSpeed] = useState(50);
  const [kiteAngle, setKiteAngle] = useState(30);

  const isAnomaly = windSpeed >= 80 && kiteAngle >= 60;
  useAnomalySignal(isAnomaly, recordAction);

  // Lift is best at a moderate angle (~35°) and grows with the wind.
  const angleEfficiency = Math.max(0, 1 - Math.abs(kiteAngle - 35) / 55);
  const lift = (windSpeed / 100) * angleEfficiency; // 0..1
  const tooLittleLift = lift < 0.14;

  // Scene geometry: child's hand, string elevation, kite position
  const HAND_X = 52;
  const HAND_Y = 168;
  const stringPx = 50 + stringLen * 1.5; // 30m -> 95px, 100m -> 200px
  const elevationDeg = isAnomaly ? 12 : tooLittleLift ? 6 : 18 + lift * 62;
  const el = (elevationDeg * Math.PI) / 180;
  const kiteX = Math.min(316, HAND_X + Math.cos(el) * stringPx);
  const kiteY = Math.max(22, HAND_Y - Math.sin(el) * stringPx);
  const sag = 18 - lift * 12;
  const heightMeters = Math.round(Math.sin(el) * stringLen);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-300 shrink-0 z-20 w-full">
        {[
          { label: "💨 Wind", value: windSpeed, set: setWindSpeed, min: 20, max: 100, step: 10, unit: "", act: 'changed_wind' },
          { label: "📐 Pull Angle", value: kiteAngle, set: setKiteAngle, min: 10, max: 80, step: 10, unit: "°", act: 'changed_angle' },
          { label: "🧵 String", value: stringLen, set: setStringLen, min: 30, max: 100, step: 10, unit: " m", act: 'changed_string_length' },
        ].map((c) => (
          <div key={c.label} className="flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sky-300">{c.label}</span>
              <span className="text-xs font-mono text-gray-300">{c.value}{c.unit}</span>
            </div>
            <input
              type="range" min={c.min} max={c.max} step={c.step} value={c.value}
              aria-label={c.label}
              onChange={e => { const v = parseInt(e.target.value); c.set(v); recordAction(c.act, { val: v }); }}
            />
          </div>
        ))}
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-400 to-sky-200 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={isAnomaly ? "The kite is diving" : `Kite flying ${heightMeters} metres high`}>
          {/* Wind arrows: more wind, more arrows */}
          {[...Array(Math.round(windSpeed / 20))].map((_, i) => (
            <g key={i} opacity="0.7">
              <line x1={110 + (i % 2) * 40} y1={40 + i * 26} x2={150 + (i % 2) * 40} y2={40 + i * 26} stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points={`${150 + (i % 2) * 40},${36 + i * 26} ${158 + (i % 2) * 40},${40 + i * 26} ${150 + (i % 2) * 40},${44 + i * 26}`} fill="#ffffff" />
            </g>
          ))}

          <rect x="0" y="190" width="340" height="30" fill="#16a34a" />

          {/* Child holding the string */}
          <circle cx="40" cy="146" r="9" fill="#fcd34d" />
          <rect x="34" y="155" width="12" height="22" rx="4" fill="#f97316" />
          <line x1="37" y1="177" x2="34" y2="190" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
          <line x1="43" y1="177" x2="46" y2="190" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
          <line x1="44" y1="160" x2={HAND_X} y2={HAND_Y} stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />

          {/* String (sags more when lift is weak) */}
          <path d={`M ${HAND_X} ${HAND_Y} Q ${(HAND_X + kiteX) / 2} ${(HAND_Y + kiteY) / 2 + sag} ${kiteX} ${kiteY}`} stroke="#f8fafc" strokeWidth="1.5" fill="none" />

          {/* Kite: tilts with the pull angle; flips when it dives */}
          <g transform={`translate(${kiteX} ${kiteY}) rotate(${isAnomaly ? 160 : -kiteAngle + 20})`}>
            <polygon points="0,-18 13,0 0,22 -13,0" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
            <line x1="0" y1="-18" x2="0" y2="22" stroke="#fde047" strokeWidth="1.5" />
            <line x1="-13" y1="0" x2="13" y2="0" stroke="#fde047" strokeWidth="1.5" />
            <path d="M 0 22 q 6 8 0 14 q -6 8 0 14" stroke="#fde047" strokeWidth="2" fill="none" />
          </g>

          {!isAnomaly && !tooLittleLift && (
            <g>
              <rect x="226" y="198" width="104" height="18" rx="9" fill="#14532d" />
              <text x="278" y="211" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">Kite height: {heightMeters} m</text>
            </g>
          )}
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "😱 The kite dived down!" : tooLittleLift ? "🪁 The kite can't stay up" : "🪁 The kite is flying!"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "Pulling too tight in strong wind makes the wind spill off the kite, so it dives."
            : tooLittleLift
              ? "Not enough wind push. Try a middle pull angle or more wind."
              : "Wind pushes the kite up, the string pulls it back. Let out more string to fly higher."}
        </p>
      </div>
    </div>
  );
}

function ChapatiPuff({ recordAction }: { recordAction: RecordAction }) {
  const [heat, setHeat] = useState(50);
  const [thickness, setThickness] = useState(5);
  const [time, setTime] = useState(0);

  // Cooking runs for ~4 seconds after each new dough
  useEffect(() => {
    if (time < 100) {
      const t = setTimeout(() => setTime(prev => prev + 10), 400);
      return () => clearTimeout(t);
    }
  }, [time]);

  const isAnomaly = thickness <= 3 && heat <= 40;
  useAnomalySignal(isAnomaly, recordAction);
  const puffAmount = isAnomaly ? 0 : Math.min(100, (time * heat) / 100);
  const doneCooking = time >= 100;

  // Scene geometry
  const width = 150 + thickness * 4;
  const doughH = 3 + thickness * 0.7;
  const domeH = (puffAmount / 100) * 46;
  const cx = 170;
  const baseY = 150;
  const brown = Math.min(1, (time / 100) * (heat / 100) * 1.4);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300">🔥 Tawa Heat</span>
            <span className="text-xs font-mono text-gray-300">{heat}</span>
          </div>
          <input
            type="range" min="10" max="100" step="10" value={heat}
            aria-label="Tawa heat"
            onChange={e => { setHeat(parseInt(e.target.value)); recordAction('changed_heat', { val: parseInt(e.target.value) }); }}
          />
        </div>
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-yellow-300">🫓 Dough thickness</span>
            <span className="text-xs font-mono text-gray-300">{thickness} mm</span>
          </div>
          <input
            type="range" min="1" max="10" step="1" value={thickness}
            aria-label="Dough thickness"
            onChange={e => { setThickness(parseInt(e.target.value)); recordAction('changed_thickness', { val: parseInt(e.target.value) }); }}
          />
        </div>
        <button
          onClick={() => { setTime(0); recordAction('reset_chapati'); }}
          className="px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shrink-0"
        >
          🫓 New dough
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={puffAmount > 50 ? "The chapati puffed up" : "The chapati is flat"}>
          {/* Flames under the tawa */}
          {[...Array(6)].map((_, i) => (
            <path key={i} d={`M ${120 + i * 20} 196 q -6 ${-4 - heat * 0.12} 0 ${-8 - heat * 0.2} q 6 ${3 + heat * 0.1} 0 ${8 + heat * 0.2} Z`} fill={heat > 60 ? "#f97316" : "#3b82f6"} opacity="0.9" />
          ))}
          <rect x="96" y="196" width="148" height="12" rx="3" fill="#111827" />

          {/* Tawa */}
          <path d="M 80 162 Q 170 182 260 162 L 256 170 Q 170 190 84 170 Z" fill="#374151" stroke="#4b5563" strokeWidth="2" />
          <rect x="258" y="160" width="40" height="6" rx="3" fill="#78350f" />

          {/* Chapati: flat disc that rises into a dome as steam builds */}
          <path
            d={`M ${cx - width / 2} ${baseY + 6} Q ${cx} ${baseY + 10} ${cx + width / 2} ${baseY + 6} L ${cx + width / 2 - 4} ${baseY + 6 - doughH} Q ${cx} ${baseY - doughH - domeH * 2} ${cx - width / 2 + 4} ${baseY + 6 - doughH} Z`}
            fill={`rgb(${253 - brown * 40}, ${230 - brown * 70}, ${138 - brown * 80})`}
            stroke="#d97706" strokeWidth="1.5"
          />
          {/* Brown cooking spots */}
          {brown > 0.35 && [-40, -10, 22, 46].map((dx, i) => (
            <ellipse key={i} cx={cx + dx} cy={baseY + 2 - domeH * (1 - Math.abs(dx) / (width / 2)) * 0.9} rx="5" ry="2.5" fill="#92400e" opacity={brown * 0.7} />
          ))}
          {/* Steam pocket label */}
          {puffAmount > 50 && (
            <g>
              <text x={cx} y={baseY - domeH * 0.6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#92400e">steam inside!</text>
              {[0, 1].map((i) => (
                <path key={i} d={`M ${cx - 20 + i * 40} ${baseY - domeH - 10} q -6 -8 0 -16 q 6 -8 0 -16`} stroke="#e5e7eb" strokeWidth="2.5" fill="none" opacity="0.6" />
              ))}
            </g>
          )}
          {isAnomaly && doneCooking && (
            <text x={cx} y={baseY - 18} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fca5a5">dry and cracked</text>
          )}

          {/* Cooking progress */}
          <rect x="20" y="20" width="120" height="10" rx="5" fill="#1f2937" />
          <rect x="20" y="20" width={1.2 * time} height="10" rx="5" fill="#f59e0b" />
          <text x="20" y="44" fontSize="10" fontWeight="700" fill="#d1d5db">{doneCooking ? "Done!" : "Cooking…"}</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-amber-300 block">
          {isAnomaly ? "😕 Too thin on low heat: no puff!" : puffAmount > 50 ? "🎈 The chapati puffed up!" : "Watch the chapati…"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The thin dough dried out before the water inside could turn into steam."
            : "High heat turns the water inside the dough into steam. The steam blows it up like a balloon."}
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
