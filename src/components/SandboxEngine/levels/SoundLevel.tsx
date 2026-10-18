"use client";

import React, { useState } from 'react';
import { playMatkaTap, playStringTelephone, playShoutWithEcho } from '@/utils/webAudio';

type RecordAction = (actionType: string, actionDetails?: any) => void;

function MatkaPitch({ recordAction }: { recordAction: RecordAction }) {
  const [waterLevel, setWaterLevel] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Pitch maps directly to air column height: less air (more water) = higher frequency
  const pitch = 200 + (waterLevel * 5);
  const isAnomaly = waterLevel > 80;
  const pitchWord = waterLevel > 70 ? "High" : waterLevel < 30 ? "Deep" : "Middle";

  const handleTap = () => {
    setPlaying(true);
    setTapCount((c) => c + 1);
    playMatkaTap(pitch);
    recordAction('tapped_matka', { waterLevel, pitch });
    setTimeout(() => setPlaying(false), 600);
  };

  // Matka geometry: inside spans y=70..190
  const INNER_TOP = 70;
  const INNER_BOTTOM = 190;
  const waterY = INNER_BOTTOM - ((INNER_BOTTOM - INNER_TOP) * waterLevel) / 100;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sky-300">💧 Water in matka</span>
            <span className="text-xs font-mono text-gray-300">{waterLevel}%</span>
          </div>
          <input
            type="range" min="10" max="90" step="10" value={waterLevel}
            aria-label="Water in matka"
            onChange={e => {
              const val = parseInt(e.target.value);
              setWaterLevel(val);
              recordAction('changed_water_level', { val });
            }}
          />
        </div>
        <button
          onClick={handleTap}
          className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-black px-5 rounded-xl shadow text-sm transition-transform flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          aria-label="Tap the matka to hear its sound"
        >
          👆 TAP MATKA
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block cursor-pointer" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`${pitchWord} sound`} onClick={handleTap}>
          <defs>
            <clipPath id="matka-inside">
              <path d="M 136 62 Q 128 70 136 78 Q 100 100 108 148 Q 118 194 170 194 Q 222 194 232 148 Q 240 100 204 78 Q 212 70 204 62 Z" />
            </clipPath>
          </defs>

          {/* Sound rings on tap */}
          {playing && [0, 1, 2].map((i) => (
            <circle key={`${tapCount}-${i}`} cx="170" cy="130" r="70" fill="none" stroke="#38bdf8" strokeWidth="2">
              <animate attributeName="r" values="70;120" dur="0.6s" begin={`${i * 0.15}s`} fill="freeze" />
              <animate attributeName="opacity" values="0.8;0" dur="0.6s" begin={`${i * 0.15}s`} fill="freeze" />
            </circle>
          ))}

          {/* Matka body */}
          <path d="M 136 62 Q 128 70 136 78 Q 100 100 108 148 Q 118 194 170 194 Q 222 194 232 148 Q 240 100 204 78 Q 212 70 204 62 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
          <g clipPath="url(#matka-inside)">
            {/* Air column (the part that vibrates) */}
            <rect x="100" y="56" width="140" height={waterY - 56} fill={playing ? "#7dd3fc" : "#fde68a"} opacity={playing ? 0.55 : 0.28} />
            {/* Water */}
            <rect x="100" y={waterY} width="140" height={200 - waterY} fill="#2563eb" opacity="0.8" />
          </g>
          <text x="170" y={Math.max(84, (56 + waterY) / 2 + 4)} textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff7ed">AIR</text>
          {waterLevel >= 20 && <text x="170" y={(waterY + 194) / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#dbeafe">WATER</text>}

          {/* Air column height marker */}
          <line x1="250" y1="66" x2="250" y2={waterY} stroke="#fcd34d" strokeWidth="2" />
          <line x1="244" y1="66" x2="256" y2="66" stroke="#fcd34d" strokeWidth="2" />
          <line x1="244" y1={waterY} x2="256" y2={waterY} stroke="#fcd34d" strokeWidth="2" />
          <text x="262" y={(66 + waterY) / 2 + 4} fontSize="10" fontWeight="700" fill="#fcd34d">air height</text>

          {/* Pitch meter: Deep -> High */}
          <text x="30" y="40" fontSize="10" fontWeight="700" fill="#d1d5db">Sound</text>
          <rect x="30" y="48" width="14" height="140" rx="7" fill="#1f2937" stroke="#4b5563" />
          <rect x="33" y={185 - (waterLevel / 100) * 134} width="8" height={(waterLevel / 100) * 134} rx="4" fill="#38bdf8" />
          <text x="50" y="58" fontSize="9" fill="#9ca3af">High</text>
          <text x="50" y="188" fontSize="9" fill="#9ca3af">Deep</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "🤯 More water makes a HIGHER sound!" : `🎵 ${pitchWord} sound (${pitch} Hz)`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "More water leaves a shorter space of air. A short air space shakes faster, so the sound is higher."
            : "The air inside the pot shakes when you tap. Add water and tap again: does the sound change?"}
        </p>
      </div>
    </div>
  );
}

function StringTelephone({ recordAction }: { recordAction: RecordAction }) {
  const [tension, setTension] = useState(60);
  const [pinched, setPinched] = useState(false);
  const [talking, setTalking] = useState(false);
  const [talkCount, setTalkCount] = useState(0);

  const isAnomaly = pinched && tension > 50;
  const soundPasses = tension >= 40 && !pinched;
  const slack = tension < 40;

  const handleTalk = () => {
    setTalking(true);
    setTalkCount((c) => c + 1);
    playStringTelephone(tension, pinched);
    recordAction('used_phone', { tension, pinched, soundPasses });
    setTimeout(() => setTalking(false), 1500);
  };

  // String geometry from cup to cup
  const L = { x: 66, y: 112 };
  const R = { x: 274, y: 112 };
  const sag = slack ? 26 + (40 - tension) * 0.9 : 0;
  const stringPath = `M ${L.x} ${L.y} Q 170 ${L.y + sag * 2} ${R.x} ${R.y}`;
  const travelPath = pinched ? `M ${L.x} ${L.y} L 170 ${L.y}` : stringPath;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-0.5 w-full md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-300">🧵 String tightness</span>
            <span className="text-xs font-mono text-gray-300">{slack ? "Loose" : "Tight"} ({tension}%)</span>
          </div>
          <input
            type="range" min="10" max="100" step="10" value={tension}
            aria-label="String tightness"
            onChange={e => {
              const val = parseInt(e.target.value);
              setTension(val);
              recordAction('changed_tension', { val });
            }}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-yellow-300 bg-gray-800/80 px-3 rounded-xl border border-gray-700 min-h-[40px]">
            <input
              type="checkbox"
              checked={pinched}
              onChange={e => {
                setPinched(e.target.checked);
                recordAction('toggled_pinch', { val: e.target.checked });
              }}
              className="accent-yellow-400 cursor-pointer w-5 h-5"
            />
            <span>🤏 Pinch string</span>
          </label>
          <button
            onClick={handleTalk}
            disabled={talking}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 active:scale-95 text-white font-black px-5 rounded-xl shadow text-sm transition-transform cursor-pointer"
            aria-label="Speak into the cup"
          >
            🗣️ SPEAK
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-800 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={soundPasses ? "Sound travels along the string" : "Sound does not reach the other cup"}>
          <rect x="0" y="190" width="340" height="30" fill="#475569" />

          {/* Children */}
          {[{ x: 34, flip: 1 }, { x: 306, flip: -1 }].map((kid, i) => (
            <g key={i}>
              <circle cx={kid.x} cy="96" r="13" fill="#fcd34d" />
              <rect x={kid.x - 10} y="110" width="20" height="44" rx="6" fill={i === 0 ? "#f97316" : "#22c55e"} />
              <line x1={kid.x - 5} y1="154" x2={kid.x - 7} y2="190" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
              <line x1={kid.x + 5} y1="154" x2={kid.x + 7} y2="190" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            </g>
          ))}

          {/* Cups */}
          <path d={`M ${L.x - 18} 100 L ${L.x} 104 L ${L.x} 120 L ${L.x - 18} 124 Z`} fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
          <path d={`M ${R.x + 18} 100 L ${R.x} 104 L ${R.x} 120 L ${R.x + 18} 124 Z`} fill="#ef4444" stroke="#991b1b" strokeWidth="2" />

          {/* String */}
          <path d={stringPath} stroke={talking && soundPasses ? "#38bdf8" : "#e2e8f0"} strokeWidth="2.5" fill="none" />

          {/* Pinch */}
          {pinched && (
            <g>
              <circle cx="170" cy={L.y + sag} r="12" fill="#fcd34d" stroke="#a16207" strokeWidth="2" />
              <text x="170" y={L.y + sag + 30} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fde047">PINCH</text>
            </g>
          )}

          {/* Travelling vibration */}
          {talking && (
            <g key={talkCount}>
              {[0, 1, 2].map((i) => (
                <circle key={i} r="6" fill="#38bdf8" opacity={slack ? 0.35 : 0.9}>
                  <animateMotion dur={slack ? "1.6s" : "0.9s"} begin={`${i * 0.2}s`} fill="freeze" path={travelPath} />
                  {(slack || pinched) && <animate attributeName="opacity" values="0.9;0" dur={slack ? "1.6s" : "0.9s"} begin={`${i * 0.2}s`} fill="freeze" />}
                </circle>
              ))}
            </g>
          )}

          {/* Speech + result bubbles */}
          {talking && (
            <g>
              <rect x="8" y="50" width="70" height="22" rx="11" fill="#ffffff" />
              <text x="43" y="65" textAnchor="middle" fontSize="11" fontWeight="800" fill="#111827">"Hello!"</text>
              <rect x={soundPasses ? 250 : 236} y="50" width={soundPasses ? 84 : 98} height="22" rx="11" fill={soundPasses ? "#dcfce7" : "#450a0a"} />
              <text x={soundPasses ? 292 : 285} y="65" textAnchor="middle" fontSize="10" fontWeight="800" fill={soundPasses ? "#166534" : "#fca5a5"}>
                {soundPasses ? "👂 I hear you!" : "🔇 Nothing…"}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-red-300 block">
          {isAnomaly && talking ? "🤯 One pinch stopped the sound!" : soundPasses && talking ? "📞 The sound travelled along the string!" : "Press SPEAK"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {pinched
            ? "Your voice shakes the string. Pinching it stops the shaking, so the sound cannot pass."
            : slack
              ? "A loose string cannot carry the shaking well. Pull it tight."
              : "Your voice makes the tight string shake. The shaking travels to the other cup."}
        </p>
      </div>
    </div>
  );
}

function Echoes({ recordAction }: { recordAction: RecordAction }) {
  const [location, setLocation] = useState<"Well" | "Field">("Well");
  const [depth, setDepth] = useState(50);
  const [shouting, setShouting] = useState(false);
  const [echoStatus, setEchoStatus] = useState<"none" | "waiting" | "echo">("none");
  const [shoutCount, setShoutCount] = useState(0);

  const isAnomaly = location === "Field" || (location === "Well" && depth < 30);
  const delaySec = Math.max(0.25, Math.min(0.8, (depth / 100) * 0.7));

  const handleShout = () => {
    setShouting(true);
    setShoutCount((c) => c + 1);
    setEchoStatus("waiting");
    const hasEcho = location === "Well" && depth >= 30;
    playShoutWithEcho(hasEcho, delaySec);
    recordAction('shouted', { location, depth });

    setTimeout(() => {
      setShouting(false);
      if (hasEcho) {
        setEchoStatus("echo");
        setTimeout(() => setEchoStatus("none"), 1400);
      } else {
        setEchoStatus("none");
      }
    }, delaySec * 1000);
  };

  // Well geometry
  const GROUND_Y = 92;
  const shaftPx = 30 + depth * 1.1; // 10m -> 41px, 90m -> 129px
  const WATER_Y = GROUND_Y + shaftPx;
  const travelSec = Math.max(0.5, delaySec * 1.6);
  const isWell = location === "Well";

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-emerald-300">Place:</span>
          <div className="flex gap-1.5">
            {(["Well", "Field"] as const).map(loc => (
              <button
                key={loc}
                onClick={() => { setLocation(loc); recordAction('changed_location', { val: loc }); }}
                className={`px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${location === loc ? 'bg-emerald-500 text-white shadow' : 'bg-gray-800 text-gray-300'}`}
              >
                {loc === "Well" ? "🕳️ Well" : "🌾 Open field"}
              </button>
            ))}
          </div>
        </div>
        {isWell && (
          <div className="flex flex-col gap-0.5 w-full md:flex-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-300">Well depth</span>
              <span className="text-xs font-mono text-gray-300">{depth} m</span>
            </div>
            <input
              type="range" min="10" max="90" step="20" value={depth}
              aria-label="Well depth in metres"
              onChange={e => {
                const val = parseInt(e.target.value);
                setDepth(val);
                recordAction('changed_depth', { val });
              }}
            />
          </div>
        )}
        <button
          onClick={handleShout}
          disabled={shouting}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-95 text-white font-black px-5 rounded-xl shadow text-sm transition-transform cursor-pointer shrink-0"
          aria-label="Shout"
        >
          📣 SHOUT
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-300 to-sky-100 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={isWell && depth >= 30 ? "An echo comes back" : "No clear echo"}>
          {isWell ? (
            <g>
              {/* Ground cut-away with well shaft */}
              <rect x="0" y={GROUND_Y} width="340" height={220 - GROUND_Y} fill="#a16207" />
              <rect x="0" y={GROUND_Y} width="340" height="6" fill="#16a34a" />
              <rect x="150" y={GROUND_Y} width="60" height={shaftPx} fill="#1f2937" />
              <rect x="146" y={GROUND_Y} width="4" height={shaftPx} fill="#78716c" />
              <rect x="210" y={GROUND_Y} width="4" height={shaftPx} fill="#78716c" />
              <rect x="150" y={WATER_Y - 6} width="60" height="6" fill="#2563eb" />
              <rect x="140" y={GROUND_Y - 14} width="80" height="14" fill="#9ca3af" stroke="#6b7280" />
              <text x="232" y={WATER_Y - 2} fontSize="10" fontWeight="700" fill="#fef3c7">{depth} m deep</text>

              {/* Sound going down and coming back up */}
              {shouting && (
                <g key={`down-${shoutCount}`}>
                  {[0, 1].map((i) => (
                    <path key={i} d="M 160 0 Q 180 8 200 0" transform={`translate(0 ${GROUND_Y})`} stroke="#fde047" strokeWidth="3" fill="none">
                      <animateTransform attributeName="transform" type="translate" values={`0 ${GROUND_Y}; 0 ${WATER_Y - 10}`} dur={`${travelSec / 2}s`} begin={`${i * 0.12}s`} fill="freeze" />
                    </path>
                  ))}
                </g>
              )}
              {echoStatus === "echo" && (
                <g key={`up-${shoutCount}`}>
                  {[0, 1].map((i) => (
                    <path key={i} d="M 160 0 Q 180 -8 200 0" stroke="#4ade80" strokeWidth="3" fill="none">
                      <animateTransform attributeName="transform" type="translate" values={`0 ${WATER_Y - 10}; 0 ${GROUND_Y - 30}`} dur={`${travelSec / 2}s`} begin={`${i * 0.12}s`} fill="freeze" />
                    </path>
                  ))}
                </g>
              )}
            </g>
          ) : (
            <g>
              <rect x="0" y={GROUND_Y + 40} width="340" height={220 - GROUND_Y - 40} fill="#65a30d" />
              {[40, 90, 250, 300].map((x) => (
                <path key={x} d={`M ${x} ${GROUND_Y + 40} q 3 -14 0 -22 M ${x + 6} ${GROUND_Y + 40} q 3 -16 0 -26`} stroke="#3f6212" strokeWidth="2" fill="none" />
              ))}
              {/* Sound spreads out and fades away: nothing to bounce off */}
              {shouting && (
                <g key={`field-${shoutCount}`}>
                  {[0, 1, 2].map((i) => (
                    <circle key={i} cx="120" cy="104" r="20" fill="none" stroke="#fde047" strokeWidth="3">
                      <animate attributeName="r" values="20;170" dur="1s" begin={`${i * 0.15}s`} fill="freeze" />
                      <animate attributeName="opacity" values="0.9;0" dur="1s" begin={`${i * 0.15}s`} fill="freeze" />
                    </circle>
                  ))}
                </g>
              )}
            </g>
          )}

          {/* Child shouting */}
          <g transform={`translate(${isWell ? 112 : 120} ${isWell ? GROUND_Y - 44 : GROUND_Y})`}>
            <circle cx="0" cy="0" r="11" fill="#fcd34d" />
            <rect x="-9" y="11" width="18" height="24" rx="5" fill="#f97316" />
            {shouting && <text x="16" y="-8" fontSize="11" fontWeight="800" fill="#111827">"HELLO!"</text>}
            {echoStatus === "echo" && <text x="16" y="-8" fontSize="11" fontWeight="800" fill="#15803d">"…hello!" 👂</text>}
          </g>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-emerald-300 block">
          {!isWell ? "🌾 No echo in an open field" : depth < 30 ? "Shallow well: the echo mixes with your shout" : `🕳️ Deep well (${depth} m): a clear echo!`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {!isWell
            ? "There are no hard walls, so the sound spreads out and never comes back."
            : depth < 30
              ? "The sound comes back too fast, so you cannot hear it separately."
              : "Your shout goes down, bounces off the water and stone, and comes back up to your ears."}
        </p>
      </div>
    </div>
  );
}

export function SoundLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <MatkaPitch recordAction={recordAction} />}
      {experimentSubIndex === 1 && <StringTelephone recordAction={recordAction} />}
      {experimentSubIndex === 2 && <Echoes recordAction={recordAction} />}
    </div>
  );
}
