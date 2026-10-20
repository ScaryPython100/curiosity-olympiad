"use client";

import React, { useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { ObservationSpeaker } from "@/components/ReadAloud";

type RecordAction = (actionType: string, actionDetails?: any) => void;

function PaperBoat({ recordAction }: { recordAction: RecordAction }) {
  const [stones, setStones] = useState(0);
  const [boatShape, setBoatShape] = useState<"Flat" | "Narrow">("Flat");

  const capacity = boatShape === "Flat" ? 8 : 3;
  const isSunk = stones > capacity;
  const isAnomaly = boatShape === "Narrow" && stones === 4;
  useAnomalySignal(isAnomaly, recordAction);

  // Boat geometry: the more stones, the lower it sits; a wide boat spreads the load
  const WATER_Y = 120;
  const boatW = boatShape === "Flat" ? 150 : 80;
  const boatH = boatShape === "Flat" ? 26 : 34;
  const load = Math.min(1, stones / (capacity + 1));
  const boatTop = isSunk ? 168 : WATER_Y - boatH + 6 + load * (boatH - 8);
  const cx = 170;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sky-300">⛵ Boat shape:</span>
          <div className="flex gap-1.5">
            {(["Flat", "Narrow"] as const).map(shape => (
              <button
                key={shape}
                onClick={() => { setBoatShape(shape); setStones(0); recordAction('changed_shape', { val: shape }); }}
                className={`px-4 rounded-lg text-xs font-bold ${boatShape === shape ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                {shape === "Flat" ? "Wide & flat" : "Narrow"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setStones(s => s + 1); recordAction('added_stone', { val: stones + 1 }); }}
            disabled={isSunk || stones >= 10}
            className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-black px-4 rounded-xl shadow text-sm"
          >
            🪨 Add stone ({stones})
          </button>
          <button
            onClick={() => { setStones(0); recordAction('reset_stones', {}); }}
            className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 rounded-xl shadow text-xs"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-sky-200 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={isSunk ? "The boat sank" : `The boat floats with ${stones} stones`}>
          {/* Boat (drawn before water so the part under water looks submerged) */}
          <g style={{ transform: `translateY(${boatTop}px) rotate(${isSunk ? 14 : 0}deg)`, transformOrigin: `${cx}px 0px`, transition: 'transform 0.5s ease-out' }}>
            <path
              d={`M ${cx - boatW / 2} 0 L ${cx + boatW / 2} 0 L ${cx + boatW / 2 - 16} ${boatH} L ${cx - boatW / 2 + 16} ${boatH} Z`}
              fill="#ffffff" stroke="#94a3b8" strokeWidth="2"
            />
            <line x1={cx} y1="0" x2={cx} y2={boatH} stroke="#cbd5e1" strokeWidth="1" />
            {/* Stones inside */}
            {[...Array(stones)].map((_, i) => (
              <circle key={i} cx={cx - (Math.min(stones, 5) - 1) * 7 + (i % 5) * 14} cy={-6 - Math.floor(i / 5) * 11} r="6" fill="#4b5563" stroke="#1f2937" strokeWidth="1.5" />
            ))}
          </g>

          {/* Water */}
          <rect x="0" y={WATER_Y} width="340" height={220 - WATER_Y} fill="#2563eb" opacity="0.72" />
          <rect x="0" y={WATER_Y} width="340" height="4" fill="#93c5fd" />

          {/* Load meter */}
          <text x="16" y="24" fontSize="10" fontWeight="700" fill="#1e3a8a">How full?</text>
          <rect x="16" y="30" width="100" height="12" rx="6" fill="#ffffff" stroke="#93c5fd" />
          <rect x="16" y="30" width={100 * Math.min(1, stones / (capacity + 1))} height="12" rx="6" fill={isSunk ? "#ef4444" : load > 0.7 ? "#f59e0b" : "#22c55e"} />

          {isSunk && <text x={cx} y="208" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fee2e2">SUNK!</text>}
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "😮 The narrow boat sank with only 4 stones!" : isSunk ? "💦 Too heavy: the boat sank" : `⛵ Floating with ${stones} stone${stones === 1 ? "" : "s"}`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly || boatShape === "Flat"
            ? "A wide boat pushes aside more water, so the water pushes it up harder."
            : "Each stone pushes the boat lower. When it is too heavy, the water cannot hold it up."}
        </p>
      </div>
    </div>
  );
}

function EggSaltWater({ recordAction }: { recordAction: RecordAction }) {
  const [salt, setSalt] = useState(0);

  const isFloating = salt >= 60;
  const isAnomaly = salt === 50 && !isFloating;
  useAnomalySignal(isAnomaly, recordAction);

  const eggY = isFloating ? 74 : 166;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-1 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-100">🧂 Salt mixed in</span>
          <span className="text-xs font-mono text-gray-300">{salt / 10} spoons</span>
        </div>
        <input
          type="range" min="0" max="100" step="10" value={salt}
          aria-label="Salt mixed in"
          onChange={e => { setSalt(parseInt(e.target.value)); recordAction('changed_salt', { val: parseInt(e.target.value) }); }}
        />
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={isFloating ? "The egg floats" : "The egg sinks"}>
          {/* Glass */}
          <path d="M 110 30 L 120 196 Q 121 204 130 204 L 210 204 Q 219 204 220 196 L 230 30" fill="#ffffff" fillOpacity="0.06" stroke="#e2e8f0" strokeWidth="3" />
          {/* Water gets cloudier with salt */}
          <path d="M 113 56 L 120 196 Q 121 202 130 202 L 210 202 Q 219 202 220 196 L 227 56 Z" fill="#38bdf8" opacity={0.3 + salt / 400} />
          {[...Array(Math.round(salt / 5))].map((_, i) => (
            <circle key={i} cx={128 + ((i * 37) % 84)} cy={70 + ((i * 53) % 126)} r="1.6" fill="#ffffff" opacity="0.7" />
          ))}

          {/* Egg */}
          <g style={{ transform: `translateY(${eggY}px)`, transition: 'transform 0.8s ease-in-out' }}>
            <ellipse cx="170" cy="0" rx="17" ry="22" fill="#fef3c7" stroke="#d6a74f" strokeWidth="2" />
            <ellipse cx="163" cy="-8" rx="4" ry="6" fill="#ffffff" opacity="0.7" />
          </g>

          {/* Salt meter with the "float line" */}
          <text x="262" y="40" fontSize="10" fontWeight="700" fill="#d1d5db">Saltiness</text>
          <rect x="268" y="48" width="16" height="140" rx="8" fill="#1f2937" stroke="#4b5563" />
          <rect x="271" y={185 - (salt / 100) * 134} width="10" height={(salt / 100) * 134} rx="5" fill="#e5e7eb" />
          <line x1="262" y1={185 - 0.6 * 134} x2="292" y2={185 - 0.6 * 134} stroke="#22c55e" strokeWidth="2" strokeDasharray="4 3" />
          <text x="294" y={189 - 0.6 * 134} fontSize="9" fontWeight="700" fill="#4ade80">floats</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "🤔 5 spoons of salt, and it still sinks!" : isFloating ? "🥚 The egg floats up!" : "🥚 The egg sinks to the bottom"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "A little salt is not enough. The water must get heavier than the egg before it floats."
            : isFloating
              ? "Salty water is heavier for its size, so it pushes the egg up."
              : "Plain water is lighter than the egg. Add salt and watch."}
        </p>
      </div>
    </div>
  );
}

function OilAndWater({ recordAction }: { recordAction: RecordAction }) {
  const [pourOrder, setPourOrder] = useState<"Water First" | "Oil First">("Water First");
  const [mixed, setMixed] = useState(false);

  const isAnomaly = pourOrder === "Oil First" && !mixed;
  useAnomalySignal(isAnomaly, recordAction);

  const handleStir = () => {
    setMixed(true);
    recordAction('stirred_liquids', { pourOrder });
    setTimeout(() => {
      setMixed(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-amber-300">Pour first:</span>
          <div className="flex gap-1.5">
            {(["Water First", "Oil First"] as const).map(order => (
              <button
                key={order}
                onClick={() => { setPourOrder(order); setMixed(false); recordAction('changed_order', { val: order }); }}
                className={`px-4 rounded-lg text-xs font-bold ${pourOrder === order ? 'bg-amber-500 text-amber-950' : 'bg-gray-800 text-gray-300'}`}
              >
                {order === "Water First" ? "💧 Water" : "🛢️ Oil"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleStir}
          disabled={mixed}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 active:scale-95 text-white font-black px-5 rounded-xl shadow text-sm transition-transform"
        >
          🥄 STIR HARD
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={mixed ? "Oil droplets mixed in water" : "Oil floats on top of water"}>
          {/* Glass */}
          <path d="M 116 30 L 124 196 Q 125 204 134 204 L 206 204 Q 215 204 216 196 L 224 30" fill="#ffffff" fillOpacity="0.06" stroke="#e2e8f0" strokeWidth="3" />
          {mixed ? (
            <g>
              <path d="M 118 60 L 124 196 Q 125 202 134 202 L 206 202 Q 215 202 216 196 L 222 60 Z" fill="#60a5fa" opacity="0.7" />
              {[...Array(26)].map((_, i) => (
                <circle key={i} cx={132 + ((i * 29) % 78)} cy={70 + ((i * 41) % 126)} r={3 + (i % 3)} fill="#facc15" opacity="0.9">
                  <animate attributeName="cy" values={`${70 + ((i * 41) % 126)};${66 + (i % 6) * 4}`} dur="2.4s" fill="freeze" />
                </circle>
              ))}
            </g>
          ) : (
            <g>
              {/* Water always ends up at the bottom, oil on top */}
              <path d="M 121 130 L 124 196 Q 125 202 134 202 L 206 202 Q 215 202 216 196 L 219 130 Z" fill="#3b82f6" opacity="0.8" />
              <path d="M 118 60 L 121 130 L 219 130 L 222 60 Z" fill="#facc15" opacity="0.85" />
              <text x="170" y="100" textAnchor="middle" fontSize="12" fontWeight="800" fill="#713f12">OIL</text>
              <text x="170" y="170" textAnchor="middle" fontSize="12" fontWeight="800" fill="#dbeafe">WATER</text>
            </g>
          )}
          <text x="250" y="80" fontSize="10" fontWeight="700" fill="#9ca3af">lighter ↑</text>
          <text x="250" y="180" fontSize="10" fontWeight="700" fill="#9ca3af">heavier ↓</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {isAnomaly ? "🤔 Oil went in first, but it is on top!" : mixed ? "🥄 Mixed… now watch" : "Oil sits on top of water"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {mixed
            ? "Stirring breaks the oil into drops, but the drops float back up again."
            : "Oil is lighter than water for its size, so it always floats to the top, whatever you pour first."}
        </p>
      </div>
    </div>
  );
}

export function BuoyancyLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <PaperBoat recordAction={recordAction} />}
      {experimentSubIndex === 1 && <EggSaltWater recordAction={recordAction} />}
      {experimentSubIndex === 2 && <OilAndWater recordAction={recordAction} />}
    </div>
  );
}
