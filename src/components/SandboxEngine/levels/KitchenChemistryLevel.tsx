"use client";

import React, { useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { ObservationSpeaker } from "@/components/ReadAloud";

type RecordAction = (actionType: string, actionDetails?: any) => void;

// ==========================================
// EXPERIMENT 1: TURMERIC INDICATOR (pH TEST)
// ==========================================
function TurmericIndicator({ recordAction }: { recordAction: RecordAction }) {
  // pH scale: 3 (strong lemon acid) -> 7 (neutral turmeric yellow) -> 11 (soap base deep red)
  const [ph, setPh] = useState(7.0);
  const [drops, setDrops] = useState<{ acid: number; base: number }>({ acid: 0, base: 0 });
  const [dropKey, setDropKey] = useState<{ n: number; kind: "lemon" | "soap" | null }>({ n: 0, kind: null });

  const isBasic = ph > 7.5;
  const isDeepRed = ph >= 9.0;
  const isAnomaly = drops.base > 0 && drops.acid > 0 && ph <= 7.0; // Reversal observed
  useAnomalySignal(isAnomaly, recordAction);

  const handleAddLemon = () => {
    const nextPh = Math.max(3.0, parseFloat((ph - 1.2).toFixed(1)));
    setPh(nextPh);
    setDrops(d => ({ ...d, acid: d.acid + 1 }));
    setDropKey((k) => ({ n: k.n + 1, kind: "lemon" }));
    recordAction('added_lemon_juice', { newPh: nextPh, totalAcidDrops: drops.acid + 1 });
  };

  const handleAddSoap = () => {
    const nextPh = Math.min(11.0, parseFloat((ph + 1.2).toFixed(1)));
    setPh(nextPh);
    setDrops(d => ({ ...d, base: d.base + 1 }));
    setDropKey((k) => ({ n: k.n + 1, kind: "soap" }));
    recordAction('added_soap_solution', { newPh: nextPh, totalBaseDrops: drops.base + 1 });
  };

  const handleReset = () => {
    setPh(7.0);
    setDrops({ acid: 0, base: 0 });
    recordAction('reset_turmeric', {});
  };

  const getLiquidColor = () => {
    if (ph >= 9.5) return 'rgb(153, 27, 27)'; // Deep red
    if (ph >= 8.5) return 'rgb(194, 65, 12)'; // Red-orange
    if (ph >= 7.8) return 'rgb(217, 119, 6)'; // Amber
    if (ph <= 4.5) return 'rgb(250, 204, 21)'; // Bright yellow
    return 'rgb(234, 179, 8)'; // Turmeric yellow
  };
  const colorName = isDeepRed ? "Deep red" : isBasic ? "Orange-red" : "Yellow";
  const meterX = 40 + ((ph - 3) / 8) * 260;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex gap-2 text-xs text-gray-300 shrink-0 z-20 w-full">
        <button
          onClick={handleAddLemon}
          className="flex-1 px-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-gray-950 font-black rounded-xl shadow transition-all cursor-pointer text-sm"
          aria-label="Add lemon juice"
        >
          🍋 + Lemon
        </button>
        <button
          onClick={handleAddSoap}
          className="flex-1 px-3 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black rounded-xl shadow transition-all cursor-pointer text-sm"
          aria-label="Add soap water"
        >
          🧼 + Soap
        </button>
        <button
          onClick={handleReset}
          className="px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl shadow text-xs cursor-pointer"
          aria-label="Start again"
        >
          ↺
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`The turmeric water is ${colorName.toLowerCase()}`}>
          {/* Falling drop */}
          {dropKey.kind && (
            <circle key={dropKey.n} cx="170" r="6" fill={dropKey.kind === "lemon" ? "#fde047" : "#f9a8d4"}>
              <animate attributeName="cy" values="6;70" dur="0.4s" fill="freeze" />
              <animate attributeName="opacity" values="1;1;0" dur="0.5s" fill="freeze" />
            </circle>
          )}

          {/* Glass with turmeric water */}
          <path d="M 120 30 L 128 160 Q 129 168 138 168 L 202 168 Q 211 168 212 160 L 220 30" fill="#ffffff" fillOpacity="0.05" stroke="#e2e8f0" strokeWidth="3" />
          <path d="M 123 70 L 128 160 Q 129 166 138 166 L 202 166 Q 211 166 212 160 L 217 70 Z" fill={getLiquidColor()} style={{ transition: 'fill 0.5s' }} />
          <text x="170" y="122" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffffff" opacity="0.9">{colorName}</text>

          {/* Colour scale: lemon side -> soap side */}
          <defs>
            <linearGradient id="turmeric-scale" x1="0" x2="1">
              <stop offset="0%" stopColor="rgb(250, 204, 21)" />
              <stop offset="55%" stopColor="rgb(234, 179, 8)" />
              <stop offset="75%" stopColor="rgb(217, 119, 6)" />
              <stop offset="100%" stopColor="rgb(153, 27, 27)" />
            </linearGradient>
          </defs>
          <rect x="40" y="186" width="260" height="12" rx="6" fill="url(#turmeric-scale)" />
          <polygon points={`${meterX - 6},180 ${meterX + 6},180 ${meterX},188`} fill="#ffffff" style={{ transition: 'all 0.4s' }} />
          <text x="40" y="212" fontSize="9" fontWeight="700" fill="#fde047">🍋 sour</text>
          <text x="170" y="212" textAnchor="middle" fontSize="9" fontWeight="700" fill="#d1d5db">plain</text>
          <text x="300" y="212" textAnchor="end" fontSize="9" fontWeight="700" fill="#fca5a5">soapy 🧼</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {isAnomaly ? "✨ Lemon turned it back to yellow!" : isDeepRed ? "🔴 Soap turned the turmeric red!" : "🟡 Turmeric water is yellow"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The sour lemon cancelled out the soap, so the colour came back. The change can go both ways."
            : "Turmeric is a natural test: it stays yellow with sour things and turns red with soapy things."}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// EXPERIMENT 2: SODA & VINEGAR BALLOON INFLATION
// ==================================================
function SodaVinegarBalloon({ recordAction }: { recordAction: RecordAction }) {
  const [sodaGrams, setSodaGrams] = useState(10);
  const [reacted, setReacted] = useState(false);
  const [fizzing, setFizzing] = useState(false);

  // Gas volume scales with baking soda up to vinegar limit (18g)
  const effectiveGrams = Math.min(sodaGrams, 18);
  const isAnomaly = reacted && sodaGrams > 18;
  useAnomalySignal(isAnomaly, recordAction);
  const balloonR = reacted ? 14 + (effectiveGrams / 18) * 36 : 9;

  const handleMix = () => {
    setReacted(true);
    setFizzing(true);
    recordAction('mixed_soda_and_vinegar', { sodaGrams, effectiveGrams });
    setTimeout(() => setFizzing(false), 2200);
  };

  const handleReset = () => {
    setReacted(false);
    setFizzing(false);
    recordAction('reset_flask', {});
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-emerald-300">🥄 Baking soda</span>
            <span className="text-xs font-mono text-gray-300">{sodaGrams} g</span>
          </div>
          <input
            type="range" min="3" max="25" step="1" value={sodaGrams}
            onChange={e => {
              const val = parseInt(e.target.value);
              setSodaGrams(val);
              recordAction('changed_soda_amount', { val });
            }}
            disabled={reacted}
            aria-label="Baking soda in grams"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleMix}
            disabled={reacted}
            className="flex-1 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl shadow active:scale-95 transition-all cursor-pointer text-sm"
            aria-label="Tip the baking soda into the vinegar"
          >
            ⬇ Tip it in
          </button>
          <button
            onClick={handleReset}
            className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl shadow text-xs cursor-pointer"
            aria-label="Start again"
          >
            ↺
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={reacted ? "The balloon blew up" : "The balloon is flat"}>
          {/* Balloon on top of the bottle neck */}
          <g style={{ transition: 'all 0.8s ease-out' }}>
            <ellipse cx="170" cy={100 - balloonR} rx={balloonR} ry={balloonR * 1.15} fill="#ef4444" style={{ transition: 'all 0.8s ease-out' }} />
            <ellipse cx={170 - balloonR * 0.35} cy={100 - balloonR * 1.4} rx={balloonR * 0.2} ry={balloonR * 0.3} fill="#fecaca" opacity="0.6" style={{ transition: 'all 0.8s ease-out' }} />
            {reacted && balloonR > 24 && <text x="170" y={104 - balloonR} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff1f2">gas</text>}
          </g>
          <rect x="162" y="96" width="16" height="12" fill="#b91c1c" />

          {/* Bottle */}
          <path d="M 162 108 L 162 126 Q 120 140 120 172 L 120 196 Q 120 204 128 204 L 212 204 Q 220 204 220 196 L 220 172 Q 220 140 178 126 L 178 108 Z" fill="#ffffff" fillOpacity="0.07" stroke="#e2e8f0" strokeWidth="3" />
          {/* Vinegar */}
          <path d="M 123 168 L 123 196 Q 123 201 128 201 L 212 201 Q 217 201 217 196 L 217 168 Z" fill="#bae6fd" opacity="0.45" />
          {/* Leftover soda at the bottom when there was too much */}
          {isAnomaly && <rect x="128" y="192" width="84" height="8" rx="3" fill="#f8fafc" opacity="0.9" />}
          {/* Fizz */}
          {fizzing && [...Array(14)].map((_, i) => (
            <circle key={i} cx={130 + ((i * 23) % 80)} cy="196" r={2 + (i % 3)} fill="#ffffff" opacity="0.85">
              <animate attributeName="cy" values="198;132" dur={`${0.6 + (i % 4) * 0.2}s`} begin={`${(i % 5) * 0.1}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <text x="236" y="186" fontSize="10" fontWeight="700" fill="#93c5fd">vinegar</text>
          {isAnomaly && <text x="236" y="200" fontSize="10" fontWeight="700" fill="#f8fafc">extra soda left</text>}
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-emerald-300 block">
          {isAnomaly ? "🤔 More soda, but the balloon got no bigger!" : reacted ? "🎈 The gas blew up the balloon!" : "Choose the soda, then tip it in"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "All the vinegar was used up. The extra soda has nothing left to fizz with."
            : reacted
              ? "Soda and vinegar fizz and make a gas (carbon dioxide). The gas pushes out and fills the balloon."
              : "Baking soda will mix with the vinegar in the bottle."}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// EXPERIMENT 3: SUGAR SATURATION & THERMAL SOLUBILITY
// ==================================================
function SugarSaturation({ recordAction }: { recordAction: RecordAction }) {
  const [temperature, setTemperature] = useState(25); // Celsius
  const [spoons, setSpoons] = useState(1);

  // Maximum spoons soluble at current temp:
  // At 10°C = 2 spoons, At 25°C = 3 spoons, At 50°C = 6 spoons, At 80°C = 9 spoons
  const maxSoluble = Math.max(2, Math.floor(1 + (temperature / 8.5)));
  const dissolved = Math.min(spoons, maxSoluble);
  const undissolved = Math.max(0, spoons - maxSoluble);
  const isSaturated = spoons >= maxSoluble;
  const isAnomaly = spoons >= 6 && temperature >= 70 && undissolved === 0; // High thermal dissolution
  useAnomalySignal(isAnomaly, recordAction);

  const handleAddSpoon = () => {
    if (spoons >= 12) return;
    const next = spoons + 1;
    setSpoons(next);
    recordAction('added_sugar_spoon', { spoons: next, temperature });
  };

  const handleReset = () => {
    setSpoons(1);
    setTemperature(25);
    recordAction('reset_sugar_cup', {});
  };

  const hot = temperature >= 55;
  const pileH = Math.min(30, undissolved * 6);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300">🌡️ Water heat</span>
            <span className="text-xs font-mono text-gray-300">{temperature}°C ({temperature >= 60 ? "Hot" : temperature <= 20 ? "Cold" : "Warm"})</span>
          </div>
          <input
            type="range" min="10" max="80" step="5" value={temperature}
            onChange={e => {
              const val = parseInt(e.target.value);
              setTemperature(val);
              recordAction('changed_water_temp', { temperature: val, spoons });
            }}
            aria-label="Water temperature"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAddSpoon}
            disabled={spoons >= 12}
            className="flex-1 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black rounded-xl shadow active:scale-95 transition-all cursor-pointer text-sm"
            aria-label="Add a spoon of sugar"
          >
            🥄 + Sugar ({spoons})
          </button>
          <button
            onClick={handleReset}
            className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl shadow text-xs cursor-pointer"
            aria-label="Start again"
          >
            ↺
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={undissolved > 0 ? `${undissolved} spoons of sugar left at the bottom` : "All the sugar disappeared into the water"}>
          {hot && [0, 1, 2].map((i) => (
            <path key={i} d={`M ${146 + i * 24} 40 q -8 -10 0 -20 q 8 -10 0 -20`} stroke="#e5e7eb" strokeWidth="2.5" fill="none" opacity="0.5" />
          ))}
          {/* Cup */}
          <path d="M 116 50 L 124 196 Q 125 204 134 204 L 206 204 Q 215 204 216 196 L 224 50" fill="#ffffff" fillOpacity="0.05" stroke="#e2e8f0" strokeWidth="3" />
          <path d="M 118 80 L 124 196 Q 125 202 134 202 L 206 202 Q 215 202 216 196 L 222 80 Z" fill={hot ? "#fdba74" : "#bae6fd"} opacity="0.4" />
          {/* Dissolved sugar (spread out, invisible-ish) */}
          {[...Array(Math.min(24, dissolved * 3))].map((_, i) => (
            <circle key={i} cx={130 + ((i * 31) % 80)} cy={90 + ((i * 47) % 96)} r="1.6" fill="#ffffff" opacity="0.6" />
          ))}
          {/* Undissolved pile at the bottom */}
          {undissolved > 0 && (
            <path d={`M 128 ${202} Q 170 ${202 - pileH * 2} 212 ${202} Z`} fill="#f8fafc" stroke="#e2e8f0" />
          )}

          {/* Capacity meter: how much this water can hold at this heat */}
          <text x="244" y="70" fontSize="10" fontWeight="700" fill="#d1d5db">Can hold</text>
          {[...Array(10)].map((_, i) => (
            <rect key={i} x="244" y={184 - i * 11} width="18" height="9" rx="2"
              fill={i < spoons ? (i < maxSoluble ? "#22c55e" : "#f59e0b") : i < maxSoluble ? "#14532d" : "#1f2937"} />
          ))}
          <text x="268" y={192 - Math.min(10, maxSoluble) * 11} fontSize="9" fontWeight="700" fill="#4ade80">← full</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {isAnomaly
            ? "🔥 Hot water melted all the leftover sugar!"
            : isSaturated && undissolved > 0
              ? `🍬 ${undissolved} spoon${undissolved > 1 ? "s" : ""} of sugar left at the bottom`
              : isSaturated
                ? "The water is now full of sugar"
                : "The sugar disappears into the water"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "Hot water can hold much more sugar than cold water."
            : isSaturated
              ? "This water cannot take any more sugar at this heat. Try making it hotter!"
              : "Keep adding spoons. When does the sugar stop disappearing?"}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// EXPORT LEVEL CONTAINER
// ==================================================
export function KitchenChemistryLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <TurmericIndicator recordAction={recordAction} />}
      {experimentSubIndex === 1 && <SodaVinegarBalloon recordAction={recordAction} />}
      {experimentSubIndex === 2 && <SugarSaturation recordAction={recordAction} />}
    </div>
  );
}
