"use client";

import { useEffect, useRef, useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';

type RecordAction = (actionType: string, actionDetails?: any) => void;

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ recordAction }: { recordAction: RecordAction }) {
  const [fanSpeed, setFanSpeed] = useState(1);
  const [bladeType, setBladeType] = useState<"Flat" | "Angled">("Angled");

  // Flat blades just slice the air; angled blades push it down.
  const windReach = bladeType === "Flat" ? fanSpeed * 5 : fanSpeed * 20;
  const isAnomaly = bladeType === "Flat" && fanSpeed === 5;
  useAnomalySignal(isAnomaly, recordAction);

  // Scene geometry (SVG units)
  const HUB_Y = 46;
  const reachPx = windReach * 1.15; // 0..115px below the blades
  const HEAD_Y = 150;
  const breezeReachesChild = HUB_Y + 10 + reachPx >= HEAD_Y - 12;
  const spinSeconds = 1.6 / fanSpeed;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sky-300">🌀 Fan Speed</span>
            <span className="text-xs font-mono text-gray-300">Speed {fanSpeed}</span>
          </div>
          <input
            type="range" min="1" max="5" step="1" value={fanSpeed}
            aria-label="Fan speed"
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFanSpeed(val);
              recordAction('changed_fan_speed', { val });
            }}
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <span className="font-bold text-sky-300 text-xs">Blades:</span>
          <div className="flex gap-1.5">
            {(["Flat", "Angled"] as const).map(bt => (
              <button
                key={bt}
                type="button"
                onClick={() => {
                  setBladeType(bt);
                  recordAction('changed_blade_type', { val: bt });
                }}
                className={`px-4 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${bladeType === bt ? 'bg-sky-500 text-white shadow' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-800 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={breezeReachesChild ? "The breeze reaches the child" : "The breeze does not reach the child"}>
          {/* Room */}
          <rect x="0" y="0" width="340" height="12" fill="#475569" />
          <rect x="0" y="196" width="340" height="24" fill="#78716c" />

          {/* Fan rod + motor */}
          <rect x="167" y="12" width="6" height="26" fill="#94a3b8" />
          <ellipse cx="170" cy={HUB_Y} rx="16" ry="9" fill="#cbd5e1" />

          {/* Blades, seen from the side: spinning makes them look like they shrink and grow */}
          <g>
            {[0, 1, 2].map((i) => (
              <ellipse
                key={i}
                cx="170"
                cy={HUB_Y}
                rx="78"
                ry={bladeType === "Angled" ? 5 : 2}
                fill={bladeType === "Angled" ? "#38bdf8" : "#94a3b8"}
                opacity="0.85"
                style={{
                  transformOrigin: `170px ${HUB_Y}px`,
                  animationName: 'fan-blade-spin',
                  animationDuration: `${spinSeconds}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  animationDelay: `${(-spinSeconds / 3) * i}s`,
                }}
              />
            ))}
          </g>

          {/* Air being pushed down */}
          {[110, 140, 170, 200, 230].map((x, i) => (
            <g key={x} opacity={reachPx > 8 ? 0.9 : 0.25}>
              <line
                x1={x} y1={HUB_Y + 12} x2={x} y2={HUB_Y + 12 + reachPx}
                stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 7"
                style={{
                  animationName: reachPx > 8 ? 'fan-air-flow' : 'none',
                  animationDuration: `${1.2 / fanSpeed}s`,
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  animationDelay: `${i * -0.15}s`,
                }}
              />
              {reachPx > 8 && (
                <polygon points={`${x - 5},${HUB_Y + 8 + reachPx} ${x + 5},${HUB_Y + 8 + reachPx} ${x},${HUB_Y + 18 + reachPx}`} fill="#bae6fd" />
              )}
            </g>
          ))}

          {/* Child sitting below the fan */}
          <rect x="140" y="178" width="60" height="18" rx="4" fill="#a16207" />
          <rect x="158" y="160" width="24" height="22" rx="6" fill="#f97316" />
          <circle cx="170" cy={HEAD_Y} r="13" fill="#fcd34d" />
          <text x="170" y={HEAD_Y + 5} textAnchor="middle" fontSize="15">{breezeReachesChild ? "😊" : "🥵"}</text>
          <text x="236" y="168" fontSize="11" fontWeight="700" fill={breezeReachesChild ? "#7dd3fc" : "#fca5a5"}>
            {breezeReachesChild ? "Cool breeze!" : "Too hot!"}
          </text>

          <style>{`
            @keyframes fan-blade-spin { 0% { transform: scaleX(1); } 50% { transform: scaleX(-1); } 100% { transform: scaleX(1); } }
            @keyframes fan-air-flow { to { stroke-dashoffset: -30; } }
          `}</style>
        </svg>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "🤔 Why is there no breeze?" : breezeReachesChild ? "💨 The breeze reaches you!" : "Can the air reach the child?"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The fan is at top speed, but flat blades cannot push air down. Blades must be tilted."
            : bladeType === "Flat"
              ? "Flat blades only slice through the air. Try angled blades."
              : "Faster spinning blades push more air down towards you."}
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ recordAction }: { recordAction: RecordAction }) {
  const [hitPower, setHitPower] = useState(50);
  const [batAngle, setBatAngle] = useState(45);
  const [distance, setDistance] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [flight, setFlight] = useState<{ angle: number; power: number } | null>(null);

  // Scaled projectile: 100% power at 45° flies ~100 m. Boundary rope at 70 m.
  const BOUNDARY_M = 70;
  const calculateHit = () => {
    const v = hitPower;
    const theta = (batAngle * Math.PI) / 180;
    const calcDist = (v * v * Math.sin(2 * theta)) / 98;
    setDistance(calcDist);
    setFlight({ angle: batAngle, power: hitPower });
    setHitCount((c) => c + 1);
    recordAction('triggered_cricket_hit', { power: hitPower, angle: batAngle, distance: calcDist });
  };

  // Field geometry (SVG units): 0 m at x=46, 110 m at x=330. Same scale up and down.
  const GROUND_Y = 186;
  const X0 = 46;
  const PX_PER_M = (330 - X0) / 110;
  const boundaryX = X0 + BOUNDARY_M * PX_PER_M;

  let pathD = "";
  if (flight) {
    const v = flight.power;
    const th = (flight.angle * Math.PI) / 180;
    const steps = 24;
    const totalT = (2 * v * Math.sin(th)) / 98 * 10; // scaled time
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (totalT * i) / steps;
      const xm = v * Math.cos(th) * t / 10;
      const ym = (v * Math.sin(th) * t - 0.5 * 98 / 10 * t * t) / 10;
      pts.push(`${(X0 + xm * PX_PER_M).toFixed(1)},${(GROUND_Y - 4 - Math.max(0, ym) * PX_PER_M).toFixed(1)}`);
    }
    if (flight.angle === 0) {
      // Ground shot: rolls along the grass
      pathD = `M ${X0} ${GROUND_Y - 4} L ${X0 + Math.min(40, v * 0.4) * PX_PER_M} ${GROUND_Y - 4}`;
    } else {
      pathD = `M ${pts.join(" L ")}`;
    }
  }

  const isSix = distance >= BOUNDARY_M;
  useAnomalySignal(!!flight && flight.power === 100 && flight.angle === 0, recordAction);
  const batRad = (batAngle * Math.PI) / 180;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-300">💪 Hit Power</span>
            <span className="text-xs font-mono text-gray-300">{hitPower}%</span>
          </div>
          <input
            type="range" min="10" max="100" step="10" value={hitPower}
            aria-label="Hit power"
            onChange={e => { const val = parseInt(e.target.value); setHitPower(val); recordAction('changed_hit_power', { val }); }}
          />
        </div>
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-300">📐 Hit Angle</span>
            <span className="text-xs font-mono text-gray-300">{batAngle}°</span>
          </div>
          <input
            type="range" min="0" max="90" step="15" value={batAngle}
            aria-label="Hit angle"
            onChange={e => { const val = parseInt(e.target.value); setBatAngle(val); recordAction('changed_bat_angle', { val }); }}
          />
        </div>
        <button onClick={calculateHit} className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-black py-2 px-5 rounded-xl shadow text-sm shrink-0 cursor-pointer active:scale-95">🏏 HIT!</button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-400 to-sky-200 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Ball travelled ${Math.round(distance)} metres`}>
          {/* Ground with distance marks */}
          <rect x="0" y={GROUND_Y} width="340" height={220 - GROUND_Y} fill="#16a34a" />
          {[20, 40, 60, 80, 100].map((m) => (
            <g key={m}>
              <line x1={X0 + m * PX_PER_M} y1={GROUND_Y} x2={X0 + m * PX_PER_M} y2={GROUND_Y + 6} stroke="#bbf7d0" strokeWidth="1.5" />
              <text x={X0 + m * PX_PER_M} y={GROUND_Y + 17} textAnchor="middle" fontSize="9" fill="#f0fdf4">{m}m</text>
            </g>
          ))}

          {/* Boundary rope */}
          <line x1={boundaryX} y1={GROUND_Y - 30} x2={boundaryX} y2={GROUND_Y} stroke="#ffffff" strokeWidth="2" strokeDasharray="4 3" />
          <rect x={boundaryX - 26} y={GROUND_Y - 44} width="52" height="14" rx="7" fill="#ffffff" opacity="0.9" />
          <text x={boundaryX} y={GROUND_Y - 34} textAnchor="middle" fontSize="9" fontWeight="700" fill="#166534">Boundary</text>

          {/* Batsman */}
          <circle cx="28" cy={GROUND_Y - 52} r="8" fill="#fcd34d" />
          <line x1="28" y1={GROUND_Y - 44} x2="28" y2={GROUND_Y - 20} stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
          <line x1="28" y1={GROUND_Y - 20} x2="20" y2={GROUND_Y} stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          <line x1="28" y1={GROUND_Y - 20} x2="36" y2={GROUND_Y} stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* Bat follows the chosen angle */}
          <line
            x1="30" y1={GROUND_Y - 34}
            x2={30 + Math.cos(batRad) * 26} y2={GROUND_Y - 34 - Math.sin(batRad) * 26}
            stroke="#d97706" strokeWidth="6" strokeLinecap="round"
          />

          {/* Flight path + ball */}
          {flight && (
            <g key={hitCount}>
              <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 4" opacity="0.8" />
              <circle r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5">
                <animateMotion dur="1.3s" fill="freeze" path={pathD} />
              </circle>
            </g>
          )}
          {!flight && <circle cx={X0} cy={GROUND_Y - 4} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />}
        </svg>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-gray-100 block">
          {flight ? (isSix ? `🎉 SIX! The ball flew ${Math.round(distance)} m` : `The ball flew ${Math.round(distance)} m`) : "Press HIT! to bat"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {flight && hitPower === 100 && batAngle === 0
            ? "Full power, but hit flat on the ground! Without an angle, the ball cannot fly."
            : flight && batAngle === 90
              ? "Straight up! Gravity pulls it back down right where it started."
              : "Gravity always pulls the ball back down. Change power and angle to hit further."}
        </p>
      </div>
    </div>
  );
}

function ExperimentThree({ recordAction }: { recordAction: RecordAction }) {
  const [roofHeight, setRoofHeight] = useState(50);
  const [isVacuum, setIsVacuum] = useState(false);
  const [falling, setFalling] = useState(false);
  const [progress, setProgress] = useState({ stone: 0, leaf: 0 }); // 0 = on roof, 1 = landed
  const [landedTimes, setLandedTimes] = useState<{ stone: number; leaf: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // Real fall time from the roof: t = sqrt(2h / g). In air, the wide leaf is slowed a lot.
  const stoneSeconds = Math.sqrt((2 * roofHeight) / 9.8);
  const leafSeconds = isVacuum ? stoneSeconds : stoneSeconds * 2.2;
  const PLAYBACK = 0.4; // screen seconds per real second, so drops feel quick

  const handleDrop = () => {
    if (falling) return;
    setFalling(true);
    setLandedTimes(null);
    setProgress({ stone: 0, leaf: 0 });
    recordAction('dropped_objects', { roofHeight, isVacuum });

    const start = performance.now();
    const tick = (now: number) => {
      const realT = ((now - start) / 1000) / PLAYBACK;
      // Stone speeds up (gravity); leaf in air drifts at a steady slow speed.
      const stone = Math.min(1, (realT / stoneSeconds) ** 2);
      const leaf = isVacuum ? stone : Math.min(1, realT / leafSeconds);
      setProgress({ stone, leaf });
      if (stone < 1 || leaf < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setFalling(false);
        setLandedTimes({ stone: stoneSeconds, leaf: leafSeconds });
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Scene geometry (SVG units)
  const GROUND_Y = 196;
  const roofPx = 40 + (roofHeight - 30) * 2.4; // 30m -> 40px, 80m -> 160px
  const ROOF_Y = GROUND_Y - roofPx;
  const stoneY = ROOF_Y - 8 + (GROUND_Y - 8 - (ROOF_Y - 8)) * progress.stone;
  const leafY = ROOF_Y - 6 + (GROUND_Y - 6 - (ROOF_Y - 6)) * progress.leaf;
  const leafSway = isVacuum ? 0 : Math.sin(progress.leaf * Math.PI * 6) * 10;
  useAnomalySignal(isVacuum && landedTimes !== null, recordAction);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-purple-300">🏫 Roof Height</span>
            <span className="text-xs font-mono text-gray-300">{roofHeight} m</span>
          </div>
          <input
            type="range" min="30" max="80" step="10" value={roofHeight} disabled={falling}
            aria-label="Roof height in metres"
            onChange={e => { const val = parseInt(e.target.value); setRoofHeight(val); setLandedTimes(null); setProgress({ stone: 0, leaf: 0 }); recordAction('changed_roof_height', { val }); }}
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors min-h-[40px]">
            <input
              type="checkbox"
              checked={isVacuum}
              disabled={falling}
              onChange={(e) => { setIsVacuum(e.target.checked); setLandedTimes(null); setProgress({ stone: 0, leaf: 0 }); recordAction('toggled_vacuum', { val: e.target.checked }); }}
              className="accent-purple-500 w-5 h-5 rounded cursor-pointer"
            />
            <span className="font-bold text-gray-200 text-xs">No air (vacuum)</span>
          </label>
          <button onClick={handleDrop} disabled={falling} className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-black py-1.5 px-5 rounded-xl shadow text-sm cursor-pointer active:scale-95">DROP</button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-300 to-sky-100 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Stone and leaf falling from a roof">
          {/* Ground */}
          <rect x="0" y={GROUND_Y} width="340" height={220 - GROUND_Y} fill="#15803d" />

          {/* School building */}
          <rect x="40" y={ROOF_Y} width="90" height={roofPx} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
          <rect x="34" y={ROOF_Y - 6} width="102" height="8" fill="#b91c1c" />
          {[...Array(Math.max(1, Math.floor(roofPx / 36)))].map((_, i) => (
            <g key={i}>
              <rect x="54" y={ROOF_Y + 14 + i * 36} width="18" height="14" fill="#7dd3fc" />
              <rect x="98" y={ROOF_Y + 14 + i * 36} width="18" height="14" fill="#7dd3fc" />
            </g>
          ))}
          <text x="85" y={GROUND_Y - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#475569">SCHOOL</text>

          {/* Height marker */}
          <line x1="20" y1={ROOF_Y} x2="20" y2={GROUND_Y} stroke="#334155" strokeWidth="1.5" />
          <text x="16" y={(ROOF_Y + GROUND_Y) / 2} textAnchor="end" fontSize="9" fontWeight="700" fill="#334155" transform={`rotate(-90 16 ${(ROOF_Y + GROUND_Y) / 2})`}>{roofHeight} m</text>

          {/* Vacuum chamber */}
          {isVacuum && (
            <g>
              <rect x="150" y="8" width="180" height={GROUND_Y - 8} rx="10" fill="#e0f2fe" fillOpacity="0.25" stroke="#0284c7" strokeWidth="2" strokeDasharray="6 4" />
              <text x="240" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0369a1">NO AIR INSIDE</text>
            </g>
          )}

          {/* Drop lines from the roof edge */}
          <line x1="130" y1={ROOF_Y - 2} x2="190" y2={ROOF_Y - 2} stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />

          {/* Stone */}
          <circle cx="205" cy={stoneY} r="8" fill="#6b7280" stroke="#374151" strokeWidth="2" />
          <text x="205" y={GROUND_Y + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="#f0fdf4">Stone</text>

          {/* Leaf */}
          <g transform={`translate(${275 + leafSway} ${leafY}) rotate(${leafSway * 2})`}>
            <path d="M -12 0 Q 0 -9 12 0 Q 0 9 -12 0 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
            <line x1="-12" y1="0" x2="12" y2="0" stroke="#15803d" strokeWidth="1" />
          </g>
          <text x="275" y={GROUND_Y + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="#f0fdf4">Leaf</text>

          {/* Landing times */}
          {landedTimes && (
            <g>
              <rect x="180" y={GROUND_Y - 34} width="50" height="18" rx="9" fill="#111827" opacity="0.85" />
              <text x="205" y={GROUND_Y - 21} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">{landedTimes.stone.toFixed(1)} s</text>
              <rect x="250" y={GROUND_Y - 34} width="50" height="18" rx="9" fill="#111827" opacity="0.85" />
              <text x="275" y={GROUND_Y - 21} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">{landedTimes.leaf.toFixed(1)} s</text>
            </g>
          )}
        </svg>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-purple-300 block">
          {landedTimes
            ? isVacuum ? "🤯 Both landed at the same time!" : "🪨 The stone landed first"
            : isVacuum ? "No air: drop them!" : "Normal air: drop them!"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isVacuum
            ? "With no air to push back, gravity pulls the heavy stone and the light leaf at the same speed."
            : "Air pushes up on the wide leaf and slows it down. Tick “No air” to remove the air."}
        </p>
      </div>
    </div>
  );
}

export function GravityLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <ExperimentOne recordAction={recordAction} />}
      {experimentSubIndex === 1 && <ExperimentTwo recordAction={recordAction} />}
      {experimentSubIndex === 2 && <ExperimentThree recordAction={recordAction} />}
    </div>
  );
}
