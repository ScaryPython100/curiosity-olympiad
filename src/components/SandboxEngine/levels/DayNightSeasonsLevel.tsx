"use client";

import React, { useState } from "react";

// ==========================================
// EXPERIMENT 1: THE FLASHLIGHT & SPINNING GLOBE (DAY & NIGHT)
// ==========================================
function SpinningGlobe({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Earth rotation in hours: 0 to 24 (local time in India)
  const [hour, setHour] = useState(12);

  const isIndiaDay = hour >= 6 && hour < 18;
  // New York is ~10 hours behind India.
  const nyHour = (hour - 10 + 24) % 24;
  const isNyDay = nyHour >= 6 && nyHour < 18;

  const handleHourChange = (val: number) => {
    setHour(val);
    recordAction("rotated_earth_globe", {
      hour: val,
      isIndiaDay,
      isNyDay,
      antipodeDarkness: isIndiaDay !== isNyDay,
    });
  };

  // Looking down on the North Pole, the Sun is on the left. Earth turns
  // counter-clockwise, so a place at local noon faces the Sun (left side).
  const CX = 200;
  const CY = 110;
  const R = 78;
  const placeAt = (localHour: number) => {
    const a = ((180 - (localHour - 12) * 15) * Math.PI) / 180;
    return { x: CX + Math.cos(a) * (R - 14), y: CY + Math.sin(a) * (R - 14) };
  };
  const india = placeAt(hour);
  const ny = placeAt(nyHour);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-1 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex justify-between items-center">
          <span className="font-bold text-amber-300">🌍 Spin the Earth</span>
          <span className="text-xs font-mono font-bold text-amber-300">India time {String(hour).padStart(2, "0")}:00</span>
        </div>
        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={hour}
          onChange={(e) => handleHourChange(parseInt(e.target.value))}
          aria-label="Spin the Earth (India time)"
        />
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex items-end select-none">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`India has ${isIndiaDay ? "day" : "night"}, New York has ${isNyDay ? "day" : "night"}`}>
          <defs>
            <clipPath id="earth-disc"><circle cx={CX} cy={CY} r={R} /></clipPath>
          </defs>
          {/* Sun and its light from the left */}
          <circle cx="26" cy={CY} r="20" fill="#facc15" />
          <text x="26" y={CY + 36} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fcd34d">SUN</text>
          {[-50, -20, 10, 40].map((dy) => (
            <line key={dy} x1="52" y1={CY + dy} x2={CX - R - 6} y2={CY + dy} stroke="#fde047" strokeWidth="2" strokeDasharray="6 5" opacity="0.6" />
          ))}

          {/* Earth seen from above the North Pole: day half faces the Sun */}
          <circle cx={CX} cy={CY} r={R} fill="#0ea5e9" />
          <g clipPath="url(#earth-disc)">
            <rect x={CX} y={CY - R} width={R} height={R * 2} fill="#020617" opacity="0.78" />
          </g>
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#7dd3fc" strokeWidth="2" />
          <circle cx={CX} cy={CY} r="4" fill="#fbbf24" />
          <text x={CX} y={CY - R - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8">North Pole view</text>
          <text x={CX - R / 2} y={CY + R - 10} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fef9c3">DAY</text>
          <text x={CX + R / 2} y={CY + R - 10} textAnchor="middle" fontSize="10" fontWeight="800" fill="#94a3b8">NIGHT</text>
          {/* Spin direction */}
          <path d={`M ${CX + R + 10} ${CY + 20} A ${R + 10} ${R + 10} 0 0 1 ${CX + R + 10} ${CY - 20}`} stroke="#fbbf24" strokeWidth="2" fill="none" />
          <polygon points={`${CX + R + 4},${CY - 18} ${CX + R + 16},${CY - 18} ${CX + R + 10},${CY - 28}`} fill="#fbbf24" />

          {/* Cities: markers move, labels stay upright */}
          <circle cx={india.x} cy={india.y} r="7" fill="#22c55e" stroke="#ffffff" strokeWidth="2" style={{ transition: 'all 0.3s' }} />
          <rect x={india.x - 26} y={india.y - 26} width="52" height="15" rx="7" fill="#052e16" opacity="0.9" style={{ transition: 'all 0.3s' }} />
          <text x={india.x} y={india.y - 15} textAnchor="middle" fontSize="9" fontWeight="800" fill="#86efac" style={{ transition: 'all 0.3s' }}>India</text>
          <circle cx={ny.x} cy={ny.y} r="7" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" style={{ transition: 'all 0.3s' }} />
          <rect x={ny.x - 30} y={ny.y + 10} width="60" height="15" rx="7" fill="#172554" opacity="0.9" style={{ transition: 'all 0.3s' }} />
          <text x={ny.x} y={ny.y + 21} textAnchor="middle" fontSize="9" fontWeight="800" fill="#93c5fd" style={{ transition: 'all 0.3s' }}>New York</text>

          {/* Status */}
          <text x="12" y="208" fontSize="10" fontWeight="800" fill={isIndiaDay ? "#fcd34d" : "#94a3b8"}>India: {isIndiaDay ? "☀️ day" : "🌙 night"}</text>
          <text x="328" y="208" textAnchor="end" fontSize="10" fontWeight="800" fill={isNyDay ? "#fcd34d" : "#94a3b8"}>New York: {isNyDay ? "☀️ day" : "🌙 night"}</text>
        </svg>
      </div>

      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-amber-300 block">
          {hour === 12
            ? "☀️ Noon in India, and night in New York!"
            : isIndiaDay
              ? "☀️ India is facing the Sun: daytime"
              : "🌙 India has turned away from the Sun: night"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          The Sun does not move. The Earth spins once a day, so each place turns into the light and then into the dark.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: THE 23.5° TILTED AXIS & SEASONS
// ==========================================
function TiltedSeasons({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [monthIndex, setMonthIndex] = useState(5); // Default June (Peak Summer in India)
  const [tiltDeg, setTiltDeg] = useState(23.5); // Natural tilt vs 0° upright

  // Season calculations
  const monthName = months[monthIndex];
  // June (idx 5) = max North tilt toward sun; December (idx 11) = max South tilt toward sun
  const orbitFactor = Math.sin(((monthIndex - 2) / 12) * 2 * Math.PI); // Peak at June, trough at Dec

  // Sunbeam concentration percentage
  const northConcentration =
    tiltDeg === 0
      ? 65
      : Math.round(65 + orbitFactor * 28);
  const southConcentration =
    tiltDeg === 0
      ? 65
      : Math.round(65 - orbitFactor * 28);

  const isIndiaSummer = monthIndex >= 4 && monthIndex <= 7;
  const isIndiaWinter = monthIndex === 11 || monthIndex === 0 || monthIndex === 1;

  const handleMonthChange = (idx: number) => {
    setMonthIndex(idx);
    recordAction("changed_orbit_month", {
      month: months[idx],
      tiltDeg,
      northConcentration,
      southConcentration,
    });
  };

  const toggleTilt = (deg: number) => {
    setTiltDeg(deg);
    recordAction("toggled_axial_tilt", { tiltDeg: deg, month: monthName });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Month:</span>
          <input
            type="range"
            min="0"
            max="11"
            step="1"
            value={monthIndex}
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            className="w-24 sm:w-36 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Earth Orbit Month Slider"
          />
          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
            {monthName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300">Earth's tilt:</span>
          <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
            <button
              onClick={() => toggleTilt(0)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                tiltDeg === 0 ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              No tilt
            </button>
            <button
              onClick={() => toggleTilt(23.5)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                tiltDeg === 23.5 ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Real tilt (23.5°)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3 select-none">
        <div className="flex items-center justify-around w-full max-w-lg">
          {/* Central Glowing Sun */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_35px_rgba(251,191,36,0.8)] flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-amber-900 text-2xl font-black">
                wb_sunny
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-wider">
              The Sun
            </span>
          </div>

          {/* Sunbeam Angle Path */}
          <div className="flex-1 max-w-[120px] sm:max-w-[180px] h-0.5 border-t-2 border-dashed border-amber-300/40 relative flex items-center justify-center">
            <div className="text-[10px] text-amber-200/80 bg-slate-900 px-1 font-mono">
              Sunlight
            </div>
          </div>

          {/* Tilted Earth Globe */}
          <div className="flex flex-col items-center">
            <div
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-sky-400/40 bg-sky-900 shadow-xl overflow-hidden transition-transform duration-500 flex items-center justify-center"
              style={{
                transform: `rotate(${tiltDeg * (orbitFactor >= 0 ? 1 : -1)}deg)`,
              }}
            >
              {/* Polar Axis Rod */}
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-red-400/80 z-20" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 z-30" title="North Pole" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 z-30" title="South Pole" />

              {/* Equator */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-yellow-400/60 z-20" />

              {/* Northern Hemisphere Zone */}
              <div className="absolute inset-x-0 top-0 bottom-1/2 flex items-center justify-center">
                <span className="text-[9px] font-bold text-amber-200 bg-black/50 px-1 rounded">
                  North (India)
                </span>
              </div>

              {/* Southern Hemisphere Zone */}
              <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center">
                <span className="text-[9px] font-bold text-cyan-200 bg-black/50 px-1 rounded">
                  South (Australia)
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-gray-400 mt-1">
              Axis Tilt: {tiltDeg}°
            </span>
          </div>
        </div>

        {/* Heat Energy Concentration Meters */}
        <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-sm z-10">
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-amber-300">🇮🇳 North (India):</span>
              <span className="text-white">{northConcentration}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${northConcentration}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              {tiltDeg === 0
                ? "Neutral Climate"
                : isIndiaSummer
                ? "🔥 Direct Rays (Summer)"
                : isIndiaWinter
                ? "❄️ Shallow Rays (Winter)"
                : "🌱 Moderate (Spring/Autumn)"}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-cyan-300">🇦🇺 South (Australia):</span>
              <span className="text-white">{southConcentration}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${southConcentration}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              {tiltDeg === 0
                ? "Neutral Climate"
                : isIndiaSummer
                ? "❄️ Slanted Rays (Winter)"
                : isIndiaWinter
                ? "🔥 Direct Rays (Summer)"
                : "🍂 Moderate"}
            </span>
          </div>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-amber-300 block">
          {tiltDeg === 0
            ? "🤯 No tilt: no summer and no winter anywhere!"
            : isIndiaSummer
              ? "🔥 June: India leans towards the Sun, so it is summer"
              : isIndiaWinter
                ? "❄️ December: India leans away from the Sun, so it is winter"
                : "🌱 March / September: both halves get the same sunlight"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          Seasons come from the Earth's tilt, not its distance. Straight sunlight is hot; slanted sunlight spreads out and is weaker.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: ANCIENT SUNDIAL & SHADOW LENGTHS
// ==========================================
function SundialShadows({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Time from 6 AM (6) to 6 PM (18)
  const [timeHour, setTimeHour] = useState(12);
  const [season, setSeason] = useState<"june" | "december">("june");

  // Sun altitude angle: June reaches 84° overhead at noon; December peaks at 44°
  const peakAngle = season === "june" ? 84 : 44;
  const timeProgress = (timeHour - 6) / 12; // 0 at 6am, 0.5 at 12pm, 1 at 6pm
  const sunElevation = Math.max(5, Math.sin(timeProgress * Math.PI) * peakAngle);

  // Shadow length inversely related to elevation angle (tan of angle)
  const gnomonHeight = 60; // pixels
  const shadowLength = Math.min(140, Math.round(gnomonHeight / Math.tan((sunElevation * Math.PI) / 180)));


  const handleTimeChange = (val: number) => {
    setTimeHour(val);
    recordAction("adjusted_sundial_time", {
      timeHour: val,
      season,
      sunElevation,
      shadowLength,
    });
  };

  const toggleSeason = (s: "june" | "december") => {
    setSeason(s);
    recordAction("toggled_sundial_season", { season: s, timeHour });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">🕑 Time of day</span>
          <input
            type="range"
            min="6"
            max="18"
            step="0.5"
            value={timeHour}
            onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
            className="w-28 sm:w-40 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Sundial Time of Day Slider"
          />
          <span className="text-xs font-mono font-bold text-amber-300">
            {Math.floor(timeHour)}:{timeHour % 1 === 0 ? "00" : "30"}{" "}
            {timeHour < 12 ? "AM" : "PM"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300">Month:</span>
          <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
            <button
              onClick={() => toggleSeason("june")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                season === "june" ? "bg-amber-500 text-gray-950" : "text-gray-400 hover:text-white"
              }`}
            >
              ☀️ June
            </button>
            <button
              onClick={() => toggleSeason("december")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                season === "december" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-white"
              }`}
            >
              ❄️ December
            </button>
          </div>
        </div>
      </div>

      {/* Side view: sun crosses from East (left) to West (right); the stick's shadow falls the other way */}
      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-sky-400 to-sky-200 flex items-end select-none">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Shadow is ${shadowLength} centimetres long`}>
          {(() => {
            const GROUND = 176;
            const BASE = 170;
            const STICK = 50;
            const elRad = (sunElevation * Math.PI) / 180;
            const fromEast = timeHour <= 12; // morning sun is in the East (left)
            const shadowPx = Math.min(150, STICK / Math.tan(elRad));
            const tipX = fromEast ? BASE + shadowPx : BASE - shadowPx;
            // Sun drawn along its sky arc
            const sunX = 30 + timeProgress * 280;
            const sunY = GROUND - 20 - Math.sin(elRad) * 130;
            return (
              <g>
                <path d={`M 30 ${GROUND - 20} Q 170 ${GROUND - 20 - peakAngle * 3.1} 310 ${GROUND - 20}`} stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 5" fill="none" opacity="0.8" />
                <line x1={sunX} y1={sunY} x2={tipX} y2={GROUND} stroke="#facc15" strokeWidth="1.5" strokeDasharray="5 4" />
                <circle cx={sunX} cy={sunY} r="14" fill="#facc15" stroke="#f59e0b" strokeWidth="2" />

                <rect x="0" y={GROUND} width="340" height={220 - GROUND} fill="#a8a29e" />
                <text x="14" y={GROUND + 18} fontSize="11" fontWeight="800" fill="#44403c">EAST</text>
                <text x="326" y={GROUND + 18} textAnchor="end" fontSize="11" fontWeight="800" fill="#44403c">WEST</text>

                {/* Shadow on the ground */}
                <polygon points={`${BASE},${GROUND} ${tipX},${GROUND + 2} ${tipX},${GROUND - 2}`} fill="#1f2937" opacity="0.7" stroke="#1f2937" strokeWidth="4" strokeLinejoin="round" />
                {/* Stick */}
                <rect x={BASE - 3} y={GROUND - STICK} width="6" height={STICK} rx="2" fill="#92400e" />
                <circle cx={BASE} cy={GROUND - STICK} r="4" fill="#b45309" />

                <rect x={BASE - 52} y={GROUND + 24} width="104" height="18" rx="9" fill="#111827" opacity="0.85" />
                <text x={BASE} y={GROUND + 37} textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">Shadow: {shadowLength} cm</text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-sm font-bold text-amber-300 block">
          {timeHour === 12
            ? `☀️ Noon: the shortest shadow (${shadowLength} cm)!`
            : timeHour < 12
              ? "🌅 Morning: the sun is in the East, so the shadow points West"
              : "🌇 Evening: the sun is in the West, so the shadow points East"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {season === "june"
            ? "In June the noon sun is almost straight above, so the shadow is tiny."
            : "In December the sun stays lower, so even the noon shadow is long."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPORT LEVEL CONTAINER
// ==========================================
export function DayNightSeasonsLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <SpinningGlobe recordAction={recordAction} />}
      {experimentSubIndex === 1 && <TiltedSeasons recordAction={recordAction} />}
      {experimentSubIndex === 2 && <SundialShadows recordAction={recordAction} />}
    </div>
  );
}
