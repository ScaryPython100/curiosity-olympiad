"use client";

import React, { useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { ObservationSpeaker } from "@/components/ReadAloud";
import { FitText, useSceneText } from '../SceneText';

const OBJECT_KEY = { Nail: "magnet_nail", Coin: "magnet_coin", Wood: "magnet_wood" } as const;

type RecordAction = (actionType: string, actionDetails?: any) => void;

function CombHair({ recordAction }: { recordAction: RecordAction }) {
  const { s, en } = useSceneText("electricity");
  const [rubCount, setRubCount] = useState(0);
  const [humidity, setHumidity] = useState(20);
  const [testing, setTesting] = useState(false);
  const [rubbing, setRubbing] = useState(false);

  const isAnomaly = humidity > 70 && rubCount >= 10;
  useAnomalySignal(isAnomaly, recordAction);

  let bitsPickedUp = Math.min(10, Math.floor(rubCount / 2));
  if (humidity > 70) bitsPickedUp = Math.min(1, bitsPickedUp);

  // Charge you can actually keep: wet air lets it leak away
  const charge = Math.min(1, rubCount / 20) * (humidity > 70 ? 0.15 : 1 - humidity / 200);

  const rub = () => {
    setRubbing(true);
    setTimeout(() => setRubbing(false), 250);
    setRubCount(r => r + 1);
    recordAction('rubbed_comb', { val: rubCount + 1 });
  };

  const handleTest = () => {
    setTesting(true);
    recordAction('tested_comb', { rubCount, humidity, bitsPickedUp });
    setTimeout(() => {
      setTesting(false);
      setRubCount(0);
    }, 2200);
  };

  const combX = testing ? 196 : 92;
  const combY = testing ? 120 : 58;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sky-300">{s("comb_humidity")}</span>
            <span className="text-xs font-mono text-gray-300">{humidity}% {humidity > 70 ? "🌧️" : "☀️"}</span>
          </div>
          <input
            type="range" min="10" max="90" step="20" value={humidity}
            aria-label={s("comb_humidity_slider")}
            onChange={e => { setHumidity(parseInt(e.target.value)); recordAction('changed_humidity', { val: parseInt(e.target.value) }); }}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={rub}
            disabled={testing}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 active:scale-95 text-white font-black px-4 rounded-xl shadow text-sm transition-transform"
          >
            {s("comb_rub", { n: rubCount })}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || rubCount === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 active:scale-95 text-white font-black px-4 rounded-xl shadow text-sm transition-transform"
          >
            {s("comb_test")}
          </button>
        </div>
      </div>

      <div className={`relative flex-1 min-h-[220px] flex items-end ${humidity > 70 ? "bg-gradient-to-b from-slate-600 to-slate-400" : "bg-gradient-to-b from-amber-200 to-amber-50"}`}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={s("comb_pic", { n: testing ? bitsPickedUp : 0 })}>
          {humidity > 70 && [...Array(10)].map((_, i) => (
            <line key={i} x1={20 + i * 34} y1={10 + (i % 3) * 8} x2={16 + i * 34} y2={22 + (i % 3) * 8} stroke="#1d4ed8" strokeWidth="2" opacity="0.6" />
          ))}

          {/* Child's head with hair */}
          <circle cx="70" cy="86" r="30" fill="#fcd34d" />
          <path d="M 40 80 Q 42 46 70 46 Q 98 46 100 80 Q 90 62 70 62 Q 50 62 40 80 Z" fill="#1f2937" />
          <circle cx="60" cy="92" r="3" fill="#1f2937" />
          <circle cx="80" cy="92" r="3" fill="#1f2937" />
          <path d="M 62 104 Q 70 110 78 104" stroke="#1f2937" strokeWidth="2" fill="none" />
          <rect x="52" y="116" width="36" height="60" rx="10" fill="#f97316" />

          {/* Table with paper bits */}
          <rect x="150" y="176" width="180" height="10" rx="3" fill="#92400e" />
          {[...Array(10)].map((_, i) => {
            const lifted = testing && i < bitsPickedUp;
            return (
              <rect
                key={i}
                x={162 + i * 16}
                y={lifted ? combY + 18 + (i % 3) * 4 : 168}
                width="8" height="8"
                fill="#ffffff" stroke="#9ca3af"
                transform={`rotate(${i * 25} ${166 + i * 16} ${lifted ? combY + 22 : 172})`}
                style={{ transition: 'y 0.5s ease-out, transform 0.5s' }}
              />
            );
          })}

          {/* Comb */}
          <g style={{ transform: `translate(${combX}px, ${combY + (rubbing ? -6 : 0)}px)`, transition: 'transform 0.5s ease-in-out' }}>
            <rect x="-40" y="0" width="80" height="10" rx="2" fill="#0f172a" />
            {[...Array(14)].map((_, i) => <rect key={i} x={-38 + i * 5.7} y="10" width="3" height="10" fill="#1e293b" />)}
            {/* Charge sparks */}
            {charge > 0.15 && [...Array(Math.ceil(charge * 6))].map((_, i) => (
              <text key={i} x={-36 + i * 14} y="-4" fontSize="10" fill="#facc15">⚡</text>
            ))}
          </g>

          {/* Charge meter */}
          <FitText en={en("comb_charge")} x="236" y="30" fontSize="10" fontWeight="700" fill="#374151">{s("comb_charge")}</FitText>
          <rect x="236" y="36" width="92" height="12" rx="6" fill="#1f2937" />
          <rect x="236" y="36" width={92 * charge} height="12" rx="6" fill="#facc15" />
          {humidity > 70 && rubCount > 0 && <FitText en={en("comb_leaking")} x="236" y="62" fontSize="10" fontWeight="700" fill="#1e3a8a">{s("comb_leaking")}</FitText>}
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-yellow-300 block">
          {isAnomaly && testing ? s("comb_no_jump") : testing ? s("comb_lifted", { n: bitsPickedUp }) : s("comb_how")}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s(isAnomaly && testing ? "comb_wet_why" : "comb_why")}
        </p>
      </div>
    </div>
  );
}

function TorchCircuit({ recordAction }: { recordAction: RecordAction }) {
  const { s, en } = useSceneText("electricity");
  const [batteries, setBatteries] = useState(1);
  const [wireGap, setWireGap] = useState(false);

  const isLit = !wireGap;
  const isAnomaly = wireGap && batteries === 2;
  useAnomalySignal(isAnomaly, recordAction);

  // Circuit loop (clockwise): battery left side, bulb at top, gap on the right wire
  const loop = "M 90 150 L 90 60 L 250 60 L 250 150 L 90 150";

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-yellow-300">{s("torch_batteries")}</span>
          <div className="flex gap-1.5">
            {[1, 2].map(b => (
              <button
                key={b}
                onClick={() => { setBatteries(b); recordAction('changed_batteries', { val: b }); }}
                className={`px-4 rounded-lg text-xs font-bold ${batteries === b ? 'bg-yellow-500 text-yellow-950' : 'bg-gray-800 text-gray-300'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-300 min-h-[40px]">
          <input
            type="checkbox"
            checked={wireGap}
            onChange={e => { setWireGap(e.target.checked); recordAction('toggled_gap', { val: e.target.checked }); }}
            className="accent-red-500 w-5 h-5"
          />
          <span>{s("torch_gap")}</span>
        </label>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={s(isLit ? "torch_pic_on" : "torch_pic_off")}>
          {/* Bulb glow */}
          {isLit && <circle cx="170" cy="48" r={40 + batteries * 18} fill="#fde047" opacity={0.12 + batteries * 0.08} />}

          {/* Wires */}
          <path d="M 90 150 L 90 60 L 156 60" stroke="#ef4444" strokeWidth="5" fill="none" strokeLinejoin="round" />
          <path d="M 184 60 L 250 60 L 250 100" stroke="#e5e7eb" strokeWidth="5" fill="none" strokeLinejoin="round" />
          {wireGap ? (
            <g>
              <path d="M 250 128 L 250 150 L 90 150" stroke="#e5e7eb" strokeWidth="5" fill="none" strokeLinejoin="round" />
              <circle cx="250" cy="100" r="4" fill="#9ca3af" />
              <circle cx="250" cy="128" r="4" fill="#9ca3af" />
              <FitText en={en("torch_gap_on_pic")} x="262" y="118" fontSize="11" fontWeight="800" fill="#f87171">{s("torch_gap_on_pic")}</FitText>
            </g>
          ) : (
            <path d="M 250 100 L 250 150 L 90 150" stroke="#e5e7eb" strokeWidth="5" fill="none" strokeLinejoin="round" />
          )}

          {/* Current flowing round the loop (only when it's complete) */}
          {isLit && [...Array(8)].map((_, i) => (
            <circle key={i} r="3.5" fill="#facc15">
              <animateMotion dur={`${batteries === 2 ? 2 : 3.2}s`} begin={`${-i * (batteries === 2 ? 0.25 : 0.4)}s`} repeatCount="indefinite" path={loop} />
            </circle>
          ))}

          {/* Bulb */}
          <circle cx="170" cy="44" r="16" fill={isLit ? "#fef08a" : "#374151"} stroke="#9ca3af" strokeWidth="2" />
          <path d="M 164 48 q 3 -8 6 0 q 3 -8 6 0" stroke={isLit ? "#f59e0b" : "#6b7280"} strokeWidth="1.5" fill="none" />
          <rect x="160" y="58" width="20" height="10" rx="2" fill="#6b7280" />

          {/* Batteries on the left wire */}
          {[...Array(batteries)].map((_, i) => (
            <g key={i}>
              <rect x="74" y={88 + i * 34} width="32" height="28" rx="4" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
              <rect x="84" y={84 + i * 34} width="12" height="5" rx="1" fill="#d1d5db" />
              <text x="90" y={106 + i * 34} textAnchor="middle" fontSize="11" fontWeight="800" fill="#f0fdf4">+</text>
            </g>
          ))}

          <FitText en={en(isLit ? "torch_loop_done" : "torch_loop_broken")} x="170" y="190" textAnchor="middle" fontSize="11" fontWeight="700" fill="#9ca3af">
            {s(isLit ? "torch_loop_done" : "torch_loop_broken")}
          </FitText>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-yellow-300 block">
          {s(isAnomaly ? "torch_still_dark" : isLit ? "torch_on" : "torch_off")}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s(isAnomaly ? "torch_gap_why" : isLit ? "torch_on_why" : "torch_off_why")}
        </p>
      </div>
    </div>
  );
}

function MagnetTest({ recordAction }: { recordAction: RecordAction }) {
  const { s, en } = useSceneText("electricity");
  const [distance, setDistance] = useState(100);
  const [testObject, setTestObject] = useState<"Nail" | "Coin" | "Wood">("Nail");

  const isMagnetic = testObject === "Nail";
  const isAttracted = isMagnetic && distance < 40;
  const isAnomaly = testObject === "Coin" && distance < 20;
  useAnomalySignal(isAnomaly, recordAction);

  // Slider shows "closeness" so moving it right brings the magnet closer
  const closeness = 110 - distance; // 10..100
  const OBJ_X = 70;
  const magnetX = 300 - (closeness / 100) * 190; // 110..281
  const objX = isAttracted ? magnetX - 40 : OBJ_X;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-fuchsia-300">{s("magnet_test")}</span>
          <div className="flex gap-1.5">
            {(["Nail", "Coin", "Wood"] as const).map(obj => (
              <button
                key={obj}
                onClick={() => { setTestObject(obj); setDistance(100); recordAction('changed_object', { val: obj }); }}
                className={`px-3 rounded-lg text-xs font-bold ${testObject === obj ? 'bg-fuchsia-500 text-white' : 'bg-gray-800 text-gray-300'}`}
              >
                {s(OBJECT_KEY[obj])}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-fuchsia-300">{s("magnet_closer")}</span>
            <span className="text-xs font-mono text-gray-300">{s("magnet_away", { n: distance })}</span>
          </div>
          <input
            type="range" min="10" max="100" step="10" value={closeness}
            aria-label={s("magnet_closer_slider")}
            onChange={e => { const d = 110 - parseInt(e.target.value); setDistance(d); recordAction('changed_distance', { val: d }); }}
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-800 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={s(isAttracted ? "magnet_pic_pulled" : "magnet_pic_nothing")}>
          <rect x="0" y="150" width="340" height="70" fill="#78350f" />
          <rect x="0" y="146" width="340" height="6" fill="#a16207" />

          {/* Magnetic field lines (weak when far) */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${magnetX - 6} ${118 - i * 8} Q ${magnetX - 40 - i * 14} 130 ${magnetX - 6} ${142 + i * 8}`} stroke="#f0abfc" strokeWidth="1.5" fill="none" strokeDasharray="3 3" opacity={0.25 + closeness / 200} />
          ))}

          {/* Object */}
          <g style={{ transform: `translateX(${objX}px)`, transition: 'transform 0.35s ease-in' }}>
            {testObject === "Nail" && (
              <g>
                <rect x="-24" y="128" width="44" height="6" rx="2" fill="#9ca3af" />
                <rect x="-28" y="124" width="6" height="14" rx="1" fill="#6b7280" />
                <polygon points="20,128 28,131 20,134" fill="#9ca3af" />
              </g>
            )}
            {testObject === "Coin" && (
              <g>
                <circle cx="0" cy="130" r="15" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
                <text x="0" y="134" textAnchor="middle" fontSize="10" fontWeight="800" fill="#78350f">₹5</text>
              </g>
            )}
            {testObject === "Wood" && <rect x="-22" y="122" width="44" height="22" rx="3" fill="#a16207" stroke="#713f12" strokeWidth="2" />}
          </g>

          {/* Horseshoe magnet, open side facing the object */}
          <g transform={`translate(${magnetX} 130)`}>
            <path d="M 0 -20 L -8 -20 A 20 20 0 0 0 -8 20 L 0 20" fill="none" stroke="#dc2626" strokeWidth="12" transform="scale(-1 1)" />
            <rect x="-14" y="-26" width="12" height="12" fill="#e5e7eb" />
            <rect x="-14" y="14" width="12" height="12" fill="#e5e7eb" />
            <FitText en={en("magnet_label")} x="10" y="-30" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fca5a5">{s("magnet_label")}</FitText>
          </g>

          <FitText en={en(isAttracted ? "magnet_snap" : distance < 40 ? "magnet_nothing" : "magnet_bring")} x="170" y="190" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fef3c7">
            {s(isAttracted ? "magnet_snap" : distance < 40 ? "magnet_nothing" : "magnet_bring")}
          </FitText>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-fuchsia-300 block">
          {s(isAnomaly ? "magnet_coin_odd" : isAttracted ? "magnet_nail_stuck" : "magnet_question")}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s(isAnomaly ? "magnet_coin_why" : "magnet_why")}
        </p>
      </div>
    </div>
  );
}

export function ElectricityLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <CombHair recordAction={recordAction} />}
      {experimentSubIndex === 1 && <TorchCircuit recordAction={recordAction} />}
      {experimentSubIndex === 2 && <MagnetTest recordAction={recordAction} />}
    </div>
  );
}
