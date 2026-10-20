"use client";

import { useState } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { OptionalToolsDrawer } from '../OptionalToolsDrawer';
import { ObservationSpeaker } from "@/components/ReadAloud";

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [roomLight, setRoomLight] = useState(10);
  const [tvBrightness, setTvBrightness] = useState(80);
  const [tvShow, setTvShow] = useState<"Cartoon" | "Sports" | "News">("Cartoon");

  const isEyeStrain = roomLight < 30 && tvBrightness >= 40;
  const isGlare = roomLight > 70 && tvBrightness < 60;
  const isComfortable = !isEyeStrain && !isGlare;
  useAnomalySignal(!isComfortable, recordAction);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar: Stacks vertically on mobile (<768px), horizontal row on desktop */}
      <div id="sandbox-slider-row" className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        {/* Room Light Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-400">💡 Room Light</span>
            <span className="text-xs font-mono text-gray-300">{roomLight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={roomLight}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRoomLight(val);
              recordAction('changed_room_light', { val });
            }}
           
          />
        </div>

        {/* TV Brightness Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-cyan-300">📺 TV Brightness</span>
            <span className="text-xs font-mono text-gray-300">{tvBrightness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={tvBrightness}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTvBrightness(val);
              recordAction('changed_tv_brightness', { val });
            }}
           
          />
        </div>

        {/* Comfort indicator & Optional Tools Drawer Trigger */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-gray-700">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Comfort:</span>
            <span className="text-base">{isComfortable ? "😌" : "😖"}</span>
          </div>
          
          <OptionalToolsDrawer
            title="TV Channel & Room Settings"
            description="Switch channels to test contrast differences."
            triggerLabel="Channels"
            icon="tv"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300 block">Select TV Broadcast:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["Cartoon", "Sports", "News"] as const).map((show) => (
                  <button
                    key={show}
                    type="button"
                    onClick={() => {
                      setTvShow(show);
                      recordAction('changed_tv_show', { val: show });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      tvShow === show 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {show}
                  </button>
                ))}
              </div>
            </div>
          </OptionalToolsDrawer>
        </div>
      </div>

      {/* Show Selector Inline Bar for Desktop / Quick Access */}
      <div className="hidden md:flex bg-gray-900/80 border-b border-gray-800 px-3 py-1.5 items-center justify-center gap-2 text-xs shrink-0">
        <span className="text-gray-400 font-bold text-[11px]">Channel:</span>
        {(["Cartoon", "Sports", "News"] as const).map((show) => (
          <button
            key={show}
            onClick={() => {
              setTvShow(show);
              recordAction('changed_tv_show', { val: show });
            }}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
              tvShow === show ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {show}
          </button>
        ))}
      </div>

      {/* Visual Canvas */}
      <div 
        className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 p-2 sm:p-4"
        style={{ backgroundColor: `hsl(220, ${roomLight / 2}%, ${roomLight / 1.5 + 5}%)` }}
      >
        {/* Ceiling lamp: glows with the Room Light slider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
          <div className="w-0.5 h-3 bg-gray-500" />
          <div className="w-10 h-5 rounded-t-full bg-gray-600" />
          <div
            className="w-5 h-5 -mt-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: `rgba(253, 224, 71, ${0.15 + roomLight / 115})`, boxShadow: `0 0 ${roomLight / 2}px ${roomLight / 5}px rgba(253, 224, 71, ${roomLight / 160})` }}
          />
        </div>

        {/* TV Set */}
        <div className="relative w-full max-w-[220px] xs:max-w-[270px] sm:max-w-[340px] aspect-video bg-gray-900 border-4 border-gray-800 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 transition-opacity duration-300 flex items-center justify-center"
            style={{ 
              opacity: tvBrightness / 100,
              backgroundColor: tvShow === "Cartoon" ? "#3b82f6" : tvShow === "Sports" ? "#22c55e" : "#eab308"
            }}
          >
            <span className="text-white/90 font-black text-xl sm:text-2xl tracking-widest mix-blend-overlay">{tvShow.toUpperCase()}</span>
          </div>

          {isGlare && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <span className="text-gray-900 font-black text-xs bg-white/90 px-2 py-1 rounded shadow">✨ Glare</span>
            </div>
          )}

          {isEyeStrain && (
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(255,255,255,0.5)] flex items-end justify-center pb-2">
              <span className="text-white font-bold text-xs bg-red-600/90 px-2 py-0.5 rounded animate-pulse">😖 Too bright!</span>
            </div>
          )}
        </div>
        {/* TV Stand */}
        <div className="w-20 h-3 bg-gray-800 rounded-b shadow" />
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">
        <ObservationSpeaker />
        <span className="text-sm font-bold block" style={{ color: isComfortable ? '#67e8f9' : '#fca5a5' }}>
          {isComfortable ? "😌 Comfortable TV watching!" : isGlare ? "😖 Too much glare on the screen!" : "😖 Ouch! TV is too bright for a dark room!"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isComfortable ? "The TV brightness matches the room light nicely." : isGlare ? "When the room is very bright, the TV screen reflects the light." : "A super bright TV in a pitch black room causes eye strain."}
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [scaleAngle, setScaleAngle] = useState(45);
  const [laserColor, setLaserColor] = useState<"Sunlight" | "Red Laser">("Sunlight");

  const isRainbow = laserColor === "Sunlight" && scaleAngle > 20 && scaleAngle < 70;
  useAnomalySignal(laserColor === "Red Laser", recordAction);
  const spread = isRainbow ? 20 : 2; 

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar: Stacks vertically on mobile (<768px), horizontal row on desktop */}
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-fuchsia-300">📏 Ruler Tilt</span>
            <span className="text-xs text-gray-300 font-mono">{scaleAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={scaleAngle}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setScaleAngle(val);
              recordAction('changed_scale_angle', { val });
            }}
           
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <span className="font-bold text-fuchsia-400 text-[11px]">Light Source:</span>
          <div className="flex gap-1.5">
            {(["Sunlight", "Red Laser"] as const).map(color => (
              <button 
                key={color}
                type="button"
                onClick={() => {
                  setLaserColor(color);
                  recordAction('changed_light_source', { val: color });
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  laserColor === color ? (color === "Sunlight" ? 'bg-amber-500 text-amber-950 font-black shadow' : 'bg-red-600 text-white font-black shadow') : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Canvas: torch -> ruler -> wall */}
      <div className="relative flex-1 min-h-[220px] bg-gray-950 flex items-center">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMid meet" role="img" aria-label={isRainbow ? "Light splits into a rainbow" : "Light does not split"}>
          {/* Wall that catches the light */}
          <rect x="322" y="10" width="14" height="200" rx="3" fill="#374151" />
          <text x="329" y="205" textAnchor="middle" fontSize="8" fill="#9ca3af" transform="rotate(-90 329 205)">WALL</text>

          {/* Torch */}
          <rect x="6" y="98" width="34" height="24" rx="5" fill={laserColor === "Sunlight" ? "#fbbf24" : "#dc2626"} />
          <rect x="36" y="95" width="8" height="30" rx="2" fill="#e5e7eb" />
          <text x="23" y="140" textAnchor="middle" fontSize="9" fontWeight="700" fill="#d1d5db">{laserColor === "Sunlight" ? "SUNLIGHT" : "LASER"}</text>

          {/* Incoming beam */}
          <line x1="44" y1="110" x2="170" y2="110" stroke={laserColor === "Sunlight" ? "#ffffff" : "#ef4444"} strokeWidth="5" strokeLinecap="round" opacity="0.95" />

          {/* Outgoing rays */}
          {(() => {
            const bend = (scaleAngle - 45) * 0.4;
            const endY = (deg: number) => 110 + Math.tan((deg * Math.PI) / 180) * 152;
            if (isRainbow) {
              const strength = 1 - Math.abs(scaleAngle - 45) / 25;
              const total = 10 + strength * 26;
              const colors = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#6366f1", "#a855f7"];
              return colors.map((c, i) => {
                const deg = bend - total / 2 + (total * i) / (colors.length - 1);
                const y = endY(deg);
                return (
                  <g key={c}>
                    <line x1="170" y1="110" x2="322" y2={y} stroke={c} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
                    <circle cx="322" cy={y} r="5" fill={c} />
                  </g>
                );
              });
            }
            const y = endY(bend);
            const col = laserColor === "Sunlight" ? "#ffffff" : "#ef4444";
            return (
              <g>
                <line x1="170" y1="110" x2="322" y2={y} stroke={col} strokeWidth="5" strokeLinecap="round" opacity="0.95" />
                <circle cx="322" cy={y} r="6" fill={col} />
              </g>
            );
          })()}

          {/* Clear plastic ruler */}
          <g transform={`rotate(${scaleAngle} 170 110)`}>
            <rect x="110" y="101" width="120" height="18" rx="2" fill="#bfdbfe" fillOpacity="0.35" stroke="#e0f2fe" strokeWidth="1.5" />
            {[...Array(11)].map((_, i) => (
              <line key={i} x1={115 + i * 11} y1="101" x2={115 + i * 11} y2={i % 5 === 0 ? 111 : 107} stroke="#e0f2fe" strokeWidth="1" />
            ))}
          </g>
        </svg>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">
        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">{isRainbow ? "🌈 A rainbow on the wall!" : laserColor === "Sunlight" ? "No rainbow at this tilt" : "Only one red line"}</span>
        <p className="text-xs text-gray-300 mt-0.5">
          {laserColor === "Sunlight"
            ? isRainbow
              ? "White sunlight is made of many colours. The ruler bends each colour a little differently."
              : "Tilt the ruler between 25° and 65° to split the sunlight into colours."
            : "Laser light has only one colour (red), so there is nothing to split."}
        </p>
      </div>
    </div>
  );
}

function ExperimentThree({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [sunHeight, setSunHeight] = useState(45);
  const [treeHeight, setTreeHeight] = useState(30);

  // Scene geometry (SVG units). Everything is computed from the trunk base,
  // so the sun, the sun ray and the shadow always line up on any screen size.
  const GROUND_Y = 180;
  const BASE_X = 110;
  const sunRad = (sunHeight * Math.PI) / 180;
  const treePx = treeHeight * 2.3; // 20m -> 46px, 60m -> 138px
  const canopyR = Math.max(16, treePx * 0.3);
  const topY = GROUND_Y - treePx;
  const shadowMeters = sunHeight >= 90 ? 0 : treeHeight / Math.tan(sunRad);
  const shadowPx = sunHeight >= 90 ? 0 : treePx / Math.tan(sunRad);
  const tipX = BASE_X + shadowPx;
  const shadowRunsOff = tipX > 332;

  // Place the sun on the canvas edge, along the ray that grazes the treetop.
  const cosE = Math.cos(sunRad);
  const sinE = Math.sin(sunRad);
  const tX = cosE > 0.001 ? (BASE_X - 20) / cosE : Infinity;
  const tY = sinE > 0.001 ? (topY - 20) / sinE : Infinity;
  const t = Math.min(tX, tY);
  const sunX = BASE_X - t * cosE;
  const sunY = topY - t * sinE;

  const canopyShadowX = BASE_X + (sunHeight >= 90 ? 0 : (treePx - canopyR) / Math.tan(sunRad));
  const canopyShadowRx = Math.min(140, canopyR / Math.max(0.2, sinE));

  const isHigh = sunHeight >= 75;
  useAnomalySignal(sunHeight >= 90, recordAction);
  const isLow = sunHeight <= 30;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        {/* Sun Height Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-300">☀️ Sun Height</span>
            <span className="text-xs text-gray-300 font-mono">{sunHeight}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={sunHeight}
            aria-label="Sun height in degrees"
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSunHeight(val);
              recordAction('changed_sun_height', { val });
            }}
          />
        </div>

        {/* Tree Height Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-emerald-300">🌳 Tree Height</span>
            <span className="text-xs text-gray-300 font-mono">{treeHeight} m</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            step="5"
            value={treeHeight}
            aria-label="Tree height in metres"
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTreeHeight(val);
              recordAction('changed_tree_height', { val });
            }}
          />
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-400 to-sky-200 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Tree shadow is ${Math.round(shadowMeters)} metres long`}>
          <defs>
            <clipPath id="tree-shadow-clip"><rect x="0" y="0" width="340" height="220" /></clipPath>
            <radialGradient id="sun-glow">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ground */}
          <rect x="0" y={GROUND_Y} width="340" height={220 - GROUND_Y} fill="#a16207" />
          <rect x="0" y={GROUND_Y} width="340" height="6" fill="#65a30d" />

          <g clipPath="url(#tree-shadow-clip)">
            {/* Sun ray: sun -> treetop -> shadow tip */}
            {sunHeight < 90 && (
              <line x1={sunX} y1={sunY} x2={tipX} y2={GROUND_Y} stroke="#facc15" strokeWidth="2" strokeDasharray="6 5" opacity="0.9" />
            )}

            {/* Shadow on the ground, starting at the trunk */}
            {shadowPx > 0 && (
              <>
                <polygon
                  points={`${BASE_X - 4},${GROUND_Y + 3} ${BASE_X + 4},${GROUND_Y + 3} ${tipX},${GROUND_Y + 5} ${tipX},${GROUND_Y + 1}`}
                  fill="#1f2937"
                  opacity="0.55"
                />
                <ellipse cx={canopyShadowX} cy={GROUND_Y + 3} rx={canopyShadowRx} ry="6" fill="#1f2937" opacity="0.5" />
              </>
            )}
            {shadowPx === 0 && <ellipse cx={BASE_X} cy={GROUND_Y + 3} rx={canopyR * 0.9} ry="5" fill="#1f2937" opacity="0.5" />}
          </g>

          {/* Tree: canopy sits on top of the trunk */}
          <rect x={BASE_X - 5} y={topY + canopyR} width="10" height={treePx - canopyR} rx="2" fill="#78350f" />
          <circle cx={BASE_X} cy={topY + canopyR} r={canopyR} fill="#16a34a" stroke="#15803d" strokeWidth="2" />

          {/* Sun */}
          <circle cx={sunX} cy={sunY} r="26" fill="url(#sun-glow)" />
          <circle cx={sunX} cy={sunY} r="14" fill="#facc15" stroke="#f59e0b" strokeWidth="2" />

          {/* Shadow length label */}
          <g>
            <rect x={Math.min(242, Math.max(BASE_X + 8, (BASE_X + Math.min(tipX, 332)) / 2 - 46))} y={GROUND_Y + 12} width="92" height="20" rx="10" fill="#111827" opacity="0.85" />
            <text x={Math.min(288, Math.max(BASE_X + 54, (BASE_X + Math.min(tipX, 332)) / 2))} y={GROUND_Y + 26} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
              Shadow: {Math.round(shadowMeters)} m{shadowRunsOff ? " →" : ""}
            </text>
          </g>
        </svg>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">
        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {isHigh ? "☀️ Sun is high: short shadow!" : isLow ? "🌅 Sun is low: very long shadow!" : "Move the sun up and down"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isHigh
            ? "When the sun is right above, light falls straight down, so the shadow is tiny."
            : isLow
              ? "Low sunlight comes from the side, so the shadow stretches far across the ground."
              : "The higher the sun climbs, the shorter the shadow gets."}
        </p>
      </div>
    </div>
  );
}

export function OpticsLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <ExperimentOne recordAction={recordAction} />}
      {experimentSubIndex === 1 && <ExperimentTwo recordAction={recordAction} />}
      {experimentSubIndex === 2 && <ExperimentThree recordAction={recordAction} />}
    </div>
  );
}
