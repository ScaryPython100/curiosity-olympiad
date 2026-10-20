"use client";

import React, { useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { ObservationSpeaker } from "@/components/ReadAloud";

type RecordAction = (actionType: string, actionDetails?: any) => void;

// ==========================================
// EXPERIMENT 1: OXYGEN BUBBLES (PHOTOSYNTHESIS)
// ==========================================
function OxygenBubbles({ recordAction }: { recordAction: RecordAction }) {
  // Light intensity: 10% (lamp far away) to 100% (lamp very close)
  const [lightIntensity, setLightIntensity] = useState(40);

  const bubbleRate = Math.round(3 + (lightIntensity / 100) * 39);
  const isAnomaly = lightIntensity >= 90;
  useAnomalySignal(isAnomaly, recordAction);

  const handleSlider = (val: number) => {
    setLightIntensity(val);
    recordAction('changed_lamp_intensity', { lightIntensity: val, bubbleRate });
  };

  // Lamp moves closer as the light gets stronger
  const lampX = 300 - (lightIntensity / 100) * 70; // 293 .. 230
  const bubbleCount = Math.max(1, Math.round(bubbleRate / 5));
  const gasH = Math.round((lightIntensity / 100) * 30);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-1 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex justify-between items-center">
          <span className="font-bold text-emerald-300">💡 Lamp: far ↔ close</span>
          <span className="text-xs font-mono text-gray-300">{bubbleRate} bubbles / min</span>
        </div>
        <input
          type="range" min="10" max="100" step="10" value={lightIntensity}
          onChange={e => handleSlider(parseInt(e.target.value))}
          aria-label="Move the lamp closer"
        />
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`${bubbleRate} bubbles a minute`}>
          {/* Lamp and its light */}
          <polygon points={`${lampX - 6},70 120,60 120,200 ${lampX - 6},110`} fill="#fde047" opacity={lightIntensity / 260} />
          <g style={{ transform: `translateX(${lampX}px)`, transition: 'transform 0.4s' }}>
            <rect x="0" y="60" width="26" height="40" rx="6" fill="#f59e0b" />
            <circle cx="0" cy="80" r="12" fill="#fef08a" />
            <rect x="10" y="100" width="6" height="96" fill="#78716c" />
            <rect x="-4" y="194" width="34" height="8" rx="3" fill="#57534e" />
          </g>

          {/* Beaker of water */}
          <path d="M 70 40 L 76 196 Q 77 204 86 204 L 184 204 Q 193 204 194 196 L 200 40" fill="#ffffff" fillOpacity="0.05" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M 72 60 L 76 196 Q 77 202 86 202 L 184 202 Q 193 202 194 196 L 198 60 Z" fill="#1d4ed8" opacity="0.35" />

          {/* Upside-down funnel + test tube collecting the gas */}
          <path d="M 96 190 L 135 140 L 135 110 M 174 190 L 135 140" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
          <rect x="128" y="50" width="14" height="66" rx="4" fill="#ffffff" fillOpacity="0.08" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="130" y="52" width="10" height={gasH} rx="3" fill="#bbf7d0" opacity="0.6" style={{ transition: 'height 0.4s' }} />
          <text x="102" y="48" textAnchor="end" fontSize="10" fontWeight="700" fill="#86efac">oxygen</text>
          <line x1="104" y1="45" x2="128" y2="56" stroke="#86efac" strokeWidth="1" />

          {/* Waterweed */}
          {[-14, 0, 14].map((dx, i) => (
            <g key={i}>
              <path d={`M ${135 + dx} 200 Q ${131 + dx} 180 ${135 + dx} 160`} stroke="#15803d" strokeWidth="3" fill="none" />
              {[0, 1, 2, 3].map((j) => (
                <ellipse key={j} cx={135 + dx + (j % 2 ? 6 : -6)} cy={194 - j * 9} rx="6" ry="2.5" fill="#22c55e" />
              ))}
            </g>
          ))}

          {/* Rising bubbles: more light, more bubbles */}
          {[...Array(bubbleCount)].map((_, i) => (
            <circle key={i} cx={130 + (i % 3) * 5} cy="160" r={2 + (i % 2)} fill="#ffffff" opacity="0.9">
              <animate attributeName="cy" values="160;118" dur={`${2.6 - lightIntensity / 60}s`} begin={`${i * 0.25}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-emerald-300 block">
          {isAnomaly ? "🌿 Lamp very close: lots of bubbles!" : `🫧 ${bubbleRate} bubbles a minute`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The green part of the leaf (chlorophyll) uses light to make food. Oxygen comes out as bubbles."
            : "Plants make food from light and give out oxygen. Move the lamp: what happens to the bubbles?"}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: LEAF TRANSPIRATION
// ==========================================
function LeafTranspiration({ recordAction }: { recordAction: RecordAction }) {
  type Weather = "Direct Sunlight" | "Deep Shade";
  const [weather, setWeather] = useState<Weather>("Direct Sunlight");
  const [hoursElapsed, setHoursElapsed] = useState(2);

  const isSun = weather === "Direct Sunlight";
  const condensationLevel = isSun ? Math.min(100, hoursElapsed * 28) : Math.min(25, hoursElapsed * 5);
  const isAnomaly = isSun && hoursElapsed >= 3;
  useAnomalySignal(isAnomaly, recordAction);

  const handleSetWeather = (w: Weather) => {
    setWeather(w);
    recordAction('changed_weather_exposure', { weather: w, hoursElapsed });
  };

  const handleHours = (val: number) => {
    setHoursElapsed(val);
    recordAction('advanced_hours', { hours: val, weather });
  };

  const drops = Math.round(condensationLevel / 5);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex gap-1.5">
          {(["Direct Sunlight", "Deep Shade"] as Weather[]).map(w => (
            <button
              key={w}
              onClick={() => handleSetWeather(w)}
              className={`flex-1 px-3 rounded-xl font-bold transition-all text-xs cursor-pointer ${weather === w ? 'bg-sky-600 text-white shadow' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              aria-label={`Put the plant in ${w}`}
            >
              {w === "Direct Sunlight" ? "☀️ Sun" : "🌳 Shade"}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sky-300">⏱️ Time</span>
            <span className="text-xs font-mono text-gray-300">{hoursElapsed} hour{hoursElapsed > 1 ? "s" : ""}</span>
          </div>
          <input
            type="range" min="1" max="4" step="1" value={hoursElapsed}
            onChange={e => handleHours(parseInt(e.target.value))}
            aria-label="Hours"
          />
        </div>
      </div>

      <div className={`relative flex-1 min-h-[220px] flex items-end ${isSun ? "bg-gradient-to-b from-sky-400 to-amber-100" : "bg-gradient-to-b from-emerald-900 to-emerald-700"}`}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`${drops} water drops inside the bag`}>
          {isSun ? <circle cx="40" cy="36" r="20" fill="#facc15" /> : <ellipse cx="60" cy="30" rx="70" ry="24" fill="#14532d" />}

          {/* Pot */}
          <path d="M 140 200 L 132 160 L 208 160 L 200 200 Z" fill="#b45309" stroke="#78350f" strokeWidth="2" />
          {/* Stem and branch */}
          <path d="M 170 160 L 170 110 Q 172 90 196 76" stroke="#15803d" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="150" cy="120" rx="16" ry="7" fill="#22c55e" transform="rotate(-25 150 120)" />

          {/* Leaves inside the bag */}
          {[[200, 70], [218, 58], [214, 86], [234, 74]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="13" ry="6" fill="#16a34a" transform={`rotate(${i * 30 - 20} ${x} ${y})`} />
          ))}
          {/* Clear plastic bag */}
          <path d="M 188 88 Q 176 60 196 36 Q 222 18 252 34 Q 272 56 258 86 Q 240 104 200 96 Z" fill="#e0f2fe" fillOpacity={0.15 + condensationLevel / 260} stroke="#e0f2fe" strokeWidth="2" />
          <rect x="190" y="88" width="14" height="6" rx="2" fill="#f59e0b" transform="rotate(-30 197 91)" />
          {/* Water drops on the bag */}
          {[...Array(drops)].map((_, i) => (
            <ellipse key={i} cx={198 + ((i * 17) % 56)} cy={42 + ((i * 23) % 48)} rx="2" ry="2.8" fill="#0ea5e9" opacity="0.85" />
          ))}

          <rect x="20" y="186" width="96" height="20" rx="10" fill="#111827" opacity="0.85" />
          <text x="68" y="200" textAnchor="middle" fontSize="10" fontWeight="800" fill="#7dd3fc">{drops} drops</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "💧 The bag is full of water drops!" : isSun ? "☀️ Drops are forming in the bag" : "🌳 Only a few drops in the shade"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isSun
            ? "Leaves give out water through tiny holes. In warm sun this happens fast, and the water collects on the bag."
            : "In cool shade the tiny holes in the leaves close, so very little water comes out."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: PHOTOTROPISM & STEM BENDING
// ==========================================
function Phototropism({ recordAction }: { recordAction: RecordAction }) {
  type LightPos = "Left" | "Overhead" | "Right";
  const [lightPos, setLightPos] = useState<LightPos>("Left");

  const isLeft = lightPos === "Left";
  const isRight = lightPos === "Right";
  const isAnomaly = isLeft || isRight;
  useAnomalySignal(isAnomaly, recordAction);

  const handleLightPos = (pos: LightPos) => {
    setLightPos(pos);
    recordAction('changed_light_direction', { direction: pos });
  };

  const lamp = isLeft ? { x: 40, y: 70 } : isRight ? { x: 300, y: 70 } : { x: 170, y: 20 };
  const tip = isLeft ? { x: 120, y: 66 } : isRight ? { x: 220, y: 66 } : { x: 170, y: 52 };
  const stem = isLeft ? "M 170 160 C 170 120, 140 96, 120 66" : isRight ? "M 170 160 C 170 120, 200 96, 220 66" : "M 170 160 C 170 120, 170 90, 170 52";

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-1.5 text-xs text-gray-300 shrink-0 z-20 w-full">
        <span className="font-bold text-amber-300">💡 Where is the light?</span>
        <div className="grid grid-cols-3 gap-1.5">
          {(["Left", "Overhead", "Right"] as LightPos[]).map(pos => (
            <button
              key={pos}
              onClick={() => handleLightPos(pos)}
              className={`rounded-xl font-bold transition-all text-xs cursor-pointer ${lightPos === pos ? 'bg-amber-500 text-gray-950 shadow' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              aria-label={`Put the light on the ${pos}`}
            >
              {pos === "Left" ? "⬅ Left" : pos === "Overhead" ? "⬆ Top" : "Right ➡"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`The plant bends towards the ${lightPos.toLowerCase()} light`}>
          {/* Light rays from the lamp */}
          {[-1, 0, 1].map((k) => (
            <line key={k} x1={lamp.x} y1={lamp.y} x2={tip.x + k * 18} y2={tip.y + 20 + Math.abs(k) * 6} stroke="#fde047" strokeWidth="2" strokeDasharray="5 4" opacity="0.7" />
          ))}
          <circle cx={lamp.x} cy={lamp.y} r="16" fill="#facc15" stroke="#f59e0b" strokeWidth="3" />

          {/* Soil with roots growing down */}
          <rect x="70" y="160" width="200" height="60" fill="#78350f" />
          <rect x="70" y="160" width="200" height="5" fill="#92400e" />
          <path d="M 170 162 L 170 200 M 170 176 Q 156 186 150 204 M 170 182 Q 186 192 190 208" stroke="#fde68a" strokeWidth="2" fill="none" />
          <text x="200" y="196" fontSize="10" fontWeight="700" fill="#fde68a">roots grow down ⬇</text>

          {/* Stem bends toward the light */}
          <path d={stem} stroke="#10b981" strokeWidth="6" fill="none" strokeLinecap="round" style={{ transition: 'd 0.7s ease-out' }} />
          <ellipse cx={tip.x - 9} cy={tip.y - 2} rx="10" ry="5" fill="#34d399" transform={`rotate(-30 ${tip.x - 9} ${tip.y - 2})`} />
          <ellipse cx={tip.x + 9} cy={tip.y - 2} rx="10" ry="5" fill="#059669" transform={`rotate(30 ${tip.x + 9} ${tip.y - 2})`} />
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {isAnomaly ? `🌱 The stem bent towards the light!` : "🌱 Light from the top: the stem grows straight up"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The shady side of the stem grows longer, so the plant bends towards the light. This is called phototropism."
            : "Move the light to one side. Roots always grow down because they feel the pull of the Earth."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPORT LEVEL CONTAINER
// ==========================================
export function PlantsGrowthLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <OxygenBubbles recordAction={recordAction} />}
      {experimentSubIndex === 1 && <LeafTranspiration recordAction={recordAction} />}
      {experimentSubIndex === 2 && <Phototropism recordAction={recordAction} />}
    </div>
  );
}
