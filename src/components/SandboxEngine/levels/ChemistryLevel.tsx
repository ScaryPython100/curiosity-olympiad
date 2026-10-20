"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { ObservationSpeaker } from "@/components/ReadAloud";

type RecordAction = (actionType: string, actionDetails?: any) => void;

// Blue (cool) -> red (hot) for 20°C..100°C
function heatColor(tempC: number) {
  const t = Math.max(0, Math.min(1, (tempC - 20) / 80));
  const r = Math.round(148 + (239 - 148) * t);
  const g = Math.round(163 - (163 - 68) * t);
  const b = Math.round(184 - (184 - 68) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================================================
// EXPERIMENT 1: KITCHEN UTENSILS THERMAL CONDUCTION LAB
// ============================================================================
function ExperimentOne({ recordAction }: { recordAction: RecordAction }) {
  const [stoveHeat, setStoveHeat] = useState(0);
  const [temps, setTemps] = useState({ dal: 20, steel: 20, wood: 20 });

  // Every half second the dal moves toward the stove's temperature.
  // Steel carries that heat up to the handle quickly; wood barely does.
  useEffect(() => {
    const interval = setInterval(() => {
      setTemps((prev) => {
        const target = 20 + stoveHeat * 8; // heat 10 -> 100°C (boiling)
        const dal = prev.dal + (target - prev.dal) * 0.06;
        const steel = prev.steel + (dal - prev.steel) * 0.22;
        const wood = prev.wood + (20 + (dal - 20) * 0.2 - prev.wood) * 0.05;
        return { dal, steel, wood };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [stoveHeat]);

  const steelHot = temps.steel > 55;
  useAnomalySignal(steelHot, recordAction);
  const steamLevel = temps.dal > 85 ? 3 : temps.dal > 65 ? 2 : temps.dal > 45 ? 1 : 0;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-orange-300">🔥 Stove Heat</span>
            <span className="text-xs font-mono text-gray-300">{stoveHeat} / 10</span>
          </div>
          <input
            type="range" min="0" max="10" step="1" value={stoveHeat}
            aria-label="Stove heat"
            onChange={(e) => {
              setStoveHeat(parseInt(e.target.value));
              recordAction('changed_stove_heat', { val: parseInt(e.target.value) });
            }}
          />
        </div>
        <button
          onClick={() => { setTemps({ dal: 20, steel: 20, wood: 20 }); setStoveHeat(0); recordAction('reset_time'); }}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 rounded-xl text-xs shrink-0"
        >
          ↺ Start again
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Dal ${Math.round(temps.dal)} degrees, steel spoon ${Math.round(temps.steel)}, wood spoon ${Math.round(temps.wood)}`}>
          <defs>
            <linearGradient id="steel-heat" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={heatColor(temps.dal)} />
              <stop offset="100%" stopColor={heatColor(temps.steel)} />
            </linearGradient>
            <linearGradient id="wood-heat" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={heatColor(Math.max(temps.wood, (temps.dal + temps.wood) / 2))} />
              <stop offset="45%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          {/* Stove */}
          <rect x="90" y="196" width="160" height="16" rx="4" fill="#111827" />
          {[...Array(7)].map((_, i) => (
            <path
              key={i}
              d={`M ${120 + i * 17} 196 q -6 ${-6 - stoveHeat * 1.6} 0 ${-10 - stoveHeat * 2.4} q 6 ${4 + stoveHeat * 1.2} 0 ${10 + stoveHeat * 2.4} Z`}
              fill={stoveHeat > 0 ? "#f97316" : "transparent"}
              opacity={stoveHeat > 0 ? 0.9 : 0}
            />
          ))}

          {/* Pot with dal */}
          <path d="M 100 120 L 240 120 L 232 186 Q 230 194 220 194 L 120 194 Q 110 194 108 186 Z" fill="#374151" stroke="#6b7280" strokeWidth="3" />
          <rect x="102" y="124" width="136" height="12" rx="4" fill="#ea580c" opacity="0.9" />

          {/* Steam */}
          {[...Array(steamLevel)].map((_, i) => (
            <path key={i} d={`M ${140 + i * 30} 112 q -8 -12 0 -24 q 8 -12 0 -24`} stroke="#e5e7eb" strokeWidth="3" fill="none" opacity="0.6" strokeLinecap="round">
              <animate attributeName="opacity" values="0.1;0.7;0.1" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </path>
          ))}

          {/* Steel spoon: dipped in the dal, handle sticks out */}
          <rect x="136" y="40" width="9" height="104" rx="4" fill="url(#steel-heat)" transform="rotate(-14 140 140)" />
          {/* Wood spoon */}
          <rect x="196" y="40" width="11" height="104" rx="5" fill="url(#wood-heat)" transform="rotate(14 200 140)" />

          {/* Handle temperature labels */}
          <g>
            <rect x="36" y="34" width="86" height="34" rx="8" fill="#111827" stroke={steelHot ? "#ef4444" : "#374151"} strokeWidth="2" />
            <text x="79" y="48" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1d5db">Steel handle</text>
            <text x="79" y="62" textAnchor="middle" fontSize="12" fontWeight="800" fill={steelHot ? "#f87171" : "#e5e7eb"}>{Math.round(temps.steel)}°C {steelHot ? "🔥" : ""}</text>
          </g>
          <g>
            <rect x="218" y="34" width="86" height="34" rx="8" fill="#111827" stroke="#374151" strokeWidth="2" />
            <text x="261" y="48" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1d5db">Wood handle</text>
            <text x="261" y="62" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fcd34d">{Math.round(temps.wood)}°C</text>
          </g>
          <text x="170" y="160" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fed7aa">Dal {Math.round(temps.dal)}°C</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-orange-300 block">
          {steelHot ? "😣 Ouch! The steel handle is too hot!" : stoveHeat === 0 ? "Turn on the stove" : "Heating the dal…"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {steelHot
            ? "Heat travels quickly up through metal to your fingers. Wood stays cool."
            : "Watch the colour climb up each spoon. Which handle gets hot first?"}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPERIMENT 2: EARTHEN MATKA EVAPORATIVE COOLING
// ============================================================================
function ExperimentTwo({ recordAction }: { recordAction: RecordAction }) {
  const [material, setMaterial] = useState<"Metal" | "Clay">("Clay");
  const [humidity, setHumidity] = useState(20);

  const potTemp = material === "Metal" ? 35 : 35 - ((100 - humidity) / 5);
  const isAnomaly = material === "Clay" && humidity > 80;
  useAnomalySignal(isAnomaly, recordAction);
  const isClay = material === "Clay";
  const evaporation = isClay ? (100 - humidity) / 90 : 0; // 0..1

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-teal-300">Pot made of:</span>
          <div className="flex gap-1.5">
            {(["Clay", "Metal"] as const).map(mat => (
              <button
                key={mat}
                onClick={() => {
                  setMaterial(mat);
                  recordAction('changed_pot_material', { val: mat });
                }}
                className={`px-4 rounded-lg text-xs font-bold ${material === mat ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                {mat === "Clay" ? "🏺 Clay" : "🥘 Metal"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-teal-300">💧 Wet air (humidity)</span>
            <span className="text-xs font-mono text-gray-300">{humidity}%</span>
          </div>
          <input
            type="range" min="10" max="90" step="10" value={humidity}
            aria-label="Humidity"
            onChange={e => {
              setHumidity(parseInt(e.target.value));
              recordAction('changed_humidity', { val: parseInt(e.target.value) });
            }}
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-amber-200 to-amber-100 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Water is ${Math.round(potTemp)} degrees`}>
          {/* Weather */}
          {humidity >= 70 ? (
            <g>
              <ellipse cx="60" cy="34" rx="34" ry="16" fill="#94a3b8" />
              <ellipse cx="86" cy="28" rx="24" ry="14" fill="#94a3b8" />
              {[44, 60, 76, 92].map((x) => <line key={x} x1={x} y1="52" x2={x - 5} y2="66" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />)}
              <text x="66" y="84" textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">Rainy, wet air</text>
            </g>
          ) : (
            <g>
              <circle cx="60" cy="40" r="18" fill="#facc15" />
              <text x="60" y="76" textAnchor="middle" fontSize="10" fontWeight="700" fill="#92400e">Hot, dry air</text>
            </g>
          )}

          {/* Ground/shelf */}
          <rect x="0" y="196" width="340" height="24" fill="#a8a29e" />

          {/* Pot */}
          {isClay ? (
            <g>
              <path d="M 140 70 Q 132 80 140 88 Q 104 110 112 156 Q 122 196 170 196 Q 218 196 228 156 Q 236 110 200 88 Q 208 80 200 70 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
              {/* Tiny pores with water seeping out */}
              {[...Array(14)].map((_, i) => (
                <circle key={i} cx={128 + (i % 5) * 21} cy={110 + Math.floor(i / 5) * 24} r="2.2" fill="#7dd3fc" opacity={0.35 + evaporation * 0.6} />
              ))}
              {/* Evaporation: water vapour leaving the surface carries heat away */}
              {evaporation > 0.2 && [0, 1, 2, 3].map((i) => (
                <path key={i} d={`M ${120 + i * 33} ${102 + (i % 2) * 20} q -10 -8 0 -16 q 10 -8 0 -16`} stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={evaporation}>
                  <animateTransform attributeName="transform" type="translate" values="0 0; 0 -10; 0 0" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                </path>
              ))}
            </g>
          ) : (
            <g>
              <path d="M 118 84 L 222 84 L 216 186 Q 214 196 204 196 L 136 196 Q 126 196 124 186 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
              <rect x="112" y="78" width="116" height="10" rx="4" fill="#94a3b8" />
            </g>
          )}

          {/* Thermometer */}
          <g>
            <rect x="262" y="70" width="14" height="110" rx="7" fill="#ffffff" stroke="#475569" strokeWidth="2" />
            <rect x="266" y={176 - (potTemp - 10) * 3.4} width="6" height={(potTemp - 10) * 3.4} rx="3" fill={potTemp < 25 ? "#3b82f6" : "#ef4444"} />
            <circle cx="269" cy="184" r="10" fill={potTemp < 25 ? "#3b82f6" : "#ef4444"} stroke="#475569" strokeWidth="2" />
            <rect x="284" y="112" width="50" height="22" rx="11" fill="#111827" />
            <text x="309" y="127" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffffff">{Math.round(potTemp)}°C</text>
          </g>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-teal-300 block">
          {isAnomaly ? "🤔 The matka is not cooling!" : isClay ? `🏺 Matka water: ${Math.round(potTemp)}°C` : `🥘 Metal pot water: ${Math.round(potTemp)}°C`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "When the air is already wet, water on the pot cannot dry up, so it cannot take the heat away."
            : isClay
              ? "Water seeps through tiny holes in the clay and dries up. Drying takes heat away, so the water gets cold."
              : "Metal has no tiny holes, so no water dries on the outside. The water stays warm."}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPERIMENT 3: CANDLE IN GLASS (AIR VOLUME)
// ============================================================================
function ExperimentThree({ recordAction }: { recordAction: RecordAction }) {
  const [glassSize, setGlassSize] = useState(50);
  const [covered, setCovered] = useState(false);
  const [oxygen, setOxygen] = useState(1); // 1 = full jar of fresh air, 0 = used up
  const [burnedSeconds, setBurnedSeconds] = useState<number | null>(null);
  const startRef = useRef<number>(0);

  // A bigger jar holds more air, so the diya burns longer once covered.
  const burnSeconds = glassSize * 0.08; // 30 -> 2.4 s, 100 -> 8 s

  useEffect(() => {
    if (!covered || oxygen <= 0) return;
    const interval = setInterval(() => {
      setOxygen((o) => {
        const next = Math.max(0, o - 0.1 / burnSeconds);
        if (next <= 0) setBurnedSeconds((performance.now() - startRef.current) / 1000);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [covered, oxygen, burnSeconds]);

  const lit = oxygen > 0;
  useAnomalySignal(covered && !lit, recordAction);
  const flameScale = covered ? 0.35 + oxygen * 0.65 : 1;

  // Jar geometry grows with the Jar Size slider
  const jarW = 70 + glassSize * 1.3;
  const jarH = 70 + glassSize * 0.9;
  const jarX = 170 - jarW / 2;
  const jarY = 196 - jarH;

  const cover = () => {
    if (covered) return;
    startRef.current = performance.now();
    setBurnedSeconds(null);
    setCovered(true);
    recordAction('covered_jar', { glassSize });
  };
  const relight = () => {
    setCovered(false);
    setOxygen(1);
    setBurnedSeconds(null);
    recordAction('relit_candle');
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-indigo-300">🫙 Jar Size</span>
            <span className="text-xs font-mono text-gray-300">{glassSize < 50 ? "Small" : glassSize < 80 ? "Medium" : "Big"}</span>
          </div>
          <input
            type="range" min="30" max="100" step="10" value={glassSize} disabled={covered}
            aria-label="Jar size"
            onChange={(e) => {
              setGlassSize(parseInt(e.target.value));
              recordAction('changed_glass_size', { val: parseInt(e.target.value) });
            }}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={cover} disabled={covered} className="flex-1 md:flex-none px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white font-bold rounded-xl text-xs shadow">
            ⬇ Cover diya
          </button>
          <button onClick={relight} className="flex-1 md:flex-none px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow">
            🔥 Relight
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={lit ? "The diya is burning" : "The diya has gone out"}>
          <defs>
            <radialGradient id="diya-flame" cx="50%" cy="70%" r="60%">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f97316" />
            </radialGradient>
          </defs>

          <rect x="0" y="196" width="340" height="24" fill="#57534e" />

          {/* Diya */}
          <path d="M 146 186 Q 170 204 194 186 L 198 180 L 142 180 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="2" />
          <line x1="170" y1="180" x2="170" y2="172" stroke="#1f2937" strokeWidth="2" />
          {lit ? (
            <g transform={`translate(170 172) scale(${flameScale})`}>
              <circle r="22" cy="-14" fill="#facc15" opacity="0.18" />
              <path d="M 0 0 C -9 -8 -7 -22 0 -34 C 7 -22 9 -8 0 0 Z" fill="url(#diya-flame)">
                <animateTransform attributeName="transform" type="scale" values="1 1; 0.93 1.06; 1 1" dur="0.6s" repeatCount="indefinite" />
              </path>
            </g>
          ) : (
            <path d="M 170 170 q -6 -10 0 -20 q 6 -10 0 -20" stroke="#9ca3af" strokeWidth="2" fill="none" opacity="0.7" />
          )}

          {/* Glass jar (lifted until covered) */}
          <g style={{ transform: covered ? 'translateY(0px)' : `translateY(-${Math.max(0, jarY - 6)}px)`, transition: 'transform 0.6s ease-in-out' }}>
            <path
              d={`M ${jarX} 196 L ${jarX} ${jarY + 14} Q ${jarX} ${jarY} ${jarX + 14} ${jarY} L ${jarX + jarW - 14} ${jarY} Q ${jarX + jarW} ${jarY} ${jarX + jarW} ${jarY + 14} L ${jarX + jarW} 196`}
              fill="#a5f3fc" fillOpacity="0.12" stroke="#a5f3fc" strokeWidth="3"
            />
          </g>

          {/* Oxygen meter */}
          <g>
            <text x="300" y="58" textAnchor="middle" fontSize="10" fontWeight="700" fill="#d1d5db">Fresh air</text>
            <rect x="290" y="64" width="20" height="110" rx="6" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
            <rect x="293" y={67 + 104 * (1 - oxygen)} width="14" height={104 * oxygen} rx="4" fill={oxygen > 0.3 ? "#22c55e" : "#ef4444"} />
          </g>
          {burnedSeconds !== null && (
            <g>
              <rect x="18" y="20" width="118" height="24" rx="12" fill="#111827" stroke="#4b5563" />
              <text x="77" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fcd34d">Burned {burnedSeconds.toFixed(1)} s</text>
            </g>
          )}
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {!covered ? "🔥 The diya is burning in open air" : lit ? "⏳ The flame is getting smaller…" : "💨 The flame went out!"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {!covered
            ? "Fire needs oxygen from the air. Cover it with a jar and watch."
            : lit
              ? "The flame is using up the oxygen trapped inside the jar."
              : "All the oxygen in the jar was used up. Try a bigger jar: does it burn longer?"}
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
