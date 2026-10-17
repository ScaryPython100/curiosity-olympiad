"use client";

import React, { useState } from "react";

// ==========================================
// EXPERIMENT 1: THE FLASHLIGHT & SPINNING GLOBE (DAY & NIGHT)
// ==========================================
function SpinningGlobe({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Earth rotation in hours: 0 to 24 (local time in India)
  const [hour, setHour] = useState(12);
  const [viewMode, setViewMode] = useState<"side" | "pole">("side");

  // Rotation angle in degrees
  const rotationDeg = (hour / 24) * 360;

  // India is at ~80°E longitude. When hour is 12 (noon), India faces the sun directly.
  const isIndiaDay = hour >= 6 && hour < 18;
  // New York is ~74°W longitude (10.5 hours behind India).
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

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Spin Earth:</span>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={hour}
            onChange={(e) => handleHourChange(parseInt(e.target.value))}
            className="w-28 sm:w-40 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Earth Rotation Hour Slider"
          />
          <span className="text-xs font-mono font-bold text-amber-300">
            {String(hour).padStart(2, "0")}:00 hrs
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setViewMode("side")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
              viewMode === "side" ? "bg-amber-500 text-gray-950" : "text-gray-400 hover:text-white"
            }`}
          >
            Side View
          </button>
          <button
            onClick={() => setViewMode("pole")}
            className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
              viewMode === "pole" ? "bg-amber-500 text-gray-950" : "text-gray-400 hover:text-white"
            }`}
          >
            North Pole View
          </button>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3 select-none">
        {/* Flashlight Sun Beams on Left */}
        <div className="absolute left-0 top-0 bottom-0 w-36 sm:w-48 bg-gradient-to-r from-amber-400/35 via-yellow-200/15 to-transparent pointer-events-none" />

        {/* Torch Fixture */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          <div className="w-8 sm:w-10 h-14 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-l-md border-r-4 border-amber-300 shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">flashlight_on</span>
          </div>
          <div className="hidden sm:block text-[10px] font-mono text-amber-300 uppercase tracking-widest rotate-90 origin-left">
            Sun Rays
          </div>
        </div>

        {/* The Earth Globe */}
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full border-2 border-sky-400/30 shadow-2xl overflow-hidden flex items-center justify-center bg-sky-900">
          {/* Day / Night Terminator Shading */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/85 transition-opacity"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Continents & Rotation Disc */}
          <div
            className="w-full h-full relative transition-transform duration-300 flex items-center justify-center"
            style={{ transform: `rotate(${rotationDeg}deg)` }}
          >
            {/* Equator & Axis Lines */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 border-t border-dashed border-white/20" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 border-l border-dashed border-white/20" />

            {/* India Marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{ top: "35%", left: "55%" }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center animate-pulse shadow-md">
                <span className="text-[7px] text-white font-black">IN</span>
              </div>
              <span className="text-[8px] font-bold text-emerald-300 bg-black/60 px-1 rounded mt-0.5">
                Kuppam
              </span>
            </div>

            {/* New York Marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{ top: "30%", left: "15%" }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white flex items-center justify-center shadow-md">
                <span className="text-[7px] text-white font-black">US</span>
              </div>
              <span className="text-[8px] font-bold text-blue-300 bg-black/60 px-1 rounded mt-0.5">
                New York
              </span>
            </div>
          </div>

          {/* Central Axis Pin */}
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white z-20 pointer-events-none" />
        </div>

        {/* Dual City Local Status Badges */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 z-10">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              isIndiaDay
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <span>🇮🇳 India:</span>
            <span>{isIndiaDay ? "☀️ Daylight" : "🌙 Night"}</span>
            <span className="font-mono text-[10px]">({hour}:00)</span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              isNyDay
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <span>🇺🇸 New York:</span>
            <span>{isNyDay ? "☀️ Daylight" : "🌙 Night"}</span>
            <span className="font-mono text-[10px]">({nyHour}:00)</span>
          </div>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {hour === 12
            ? "Solar Noon in India! Meanwhile, the opposite side of Earth is in midnight darkness."
            : isIndiaDay
            ? "Daylight: India is tilted into the steady beam of the Sun."
            : "Nighttime: India has spun into Earth's shadow. The Sun hasn't moved!"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          Earth rotates from West to East every 24 hours. The Sun stays still while we spin through its light.
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
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
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
          <span className="text-[11px] text-gray-400">Axial Tilt:</span>
          <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
            <button
              onClick={() => toggleTilt(0)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                tiltDeg === 0 ? "bg-red-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              0° (No Tilt)
            </button>
            <button
              onClick={() => toggleTilt(23.5)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                tiltDeg === 23.5 ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              23.5° (Natural Tilt)
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
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {tiltDeg === 0
            ? "Notice: With 0° tilt, seasons completely disappear! Both hemispheres get identical warmth."
            : isIndiaSummer
            ? "June: Earth's North tilts toward the Sun! Direct vertical beams create blistering summer heat."
            : isIndiaWinter
            ? "December: Earth's North tilts away from the Sun! Angled, spread-out rays bring cool winter."
            : "Equinox (March/September): Sun strikes the equator directly, creating equal 12-hour days everywhere."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          Earth is actually 5 million km closer to the Sun in January than July. Distance does not cause our seasons—tilt does!
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

  // Shadow direction: morning Sun is East (left), shadow points West (right); evening opposite
  const shadowDirectionDeg = (timeProgress - 0.5) * 160;

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
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Time of Day:</span>
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
          <span className="text-[11px] text-gray-400">Season:</span>
          <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
            <button
              onClick={() => toggleSeason("june")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                season === "june" ? "bg-amber-500 text-gray-950" : "text-gray-400 hover:text-white"
              }`}
            >
              June (High Sun)
            </button>
            <button
              onClick={() => toggleSeason("december")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold min-h-[32px] transition-colors ${
                season === "december" ? "bg-cyan-500 text-gray-950" : "text-gray-400 hover:text-white"
              }`}
            >
              December (Low Sun)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 overflow-hidden flex flex-col items-center justify-between p-3 select-none">
        {/* Sky Arc & Moving Sun */}
        <div className="relative w-full max-w-md h-24 border-b border-dashed border-amber-300/30 flex items-end justify-between px-4">
          <span className="text-[10px] text-amber-400 font-bold">East (Sunrise)</span>

          {/* Animated Sun along Arc */}
          <div
            className="absolute transition-all duration-300 flex flex-col items-center"
            style={{
              left: `${timeProgress * 85 + 5}%`,
              bottom: `${(sunElevation / 90) * 60 + 5}px`,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-amber-950 text-sm">wb_sunny</span>
            </div>
            <span className="text-[9px] font-mono text-amber-300 font-bold">
              {Math.round(sunElevation)}° Alt
            </span>
          </div>

          <span className="text-[10px] text-amber-400 font-bold">West (Sunset)</span>
        </div>

        {/* Courtyard Ground Plate & Sundial Gnomon */}
        <div className="relative w-56 sm:w-64 h-28 bg-stone-800 rounded-full border-4 border-stone-600 shadow-2xl flex items-center justify-center overflow-hidden">
          {/* Compass / Hour markings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 text-[9px] font-mono font-bold text-white">
            <span className="absolute top-1 font-bold text-amber-400">N (12 PM)</span>
            <span className="absolute left-2">W (8 AM)</span>
            <span className="absolute right-2">E (4 PM)</span>
          </div>

          {/* Cast Shadow */}
          <div
            className="absolute bg-black/80 rounded-full origin-bottom blur-[0.8px] transition-all duration-200"
            style={{
              width: "6px",
              height: `${shadowLength}px`,
              bottom: "50%",
              transform: `rotate(${shadowDirectionDeg}deg)`,
            }}
          />

          {/* Center Vertical Brass Gnomon (Stick) */}
          <div className="relative z-10 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-stone-900" />
          </div>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono z-10">
          <span className="text-gray-300">
            Sun Elevation: <strong className="text-amber-300">{Math.round(sunElevation)}°</strong>
          </span>
          <span className="text-gray-300">
            Shadow Length: <strong className="text-cyan-300">{shadowLength} cm</strong>
          </span>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {timeHour === 12
            ? `Solar Noon! The shadow reaches its shortest point (${shadowLength} cm), pointing directly North.`
            : timeHour < 12
            ? "Morning: The East sun casts a long shadow stretching Westward."
            : "Late Afternoon: The West sun casts an elongated shadow pointing Eastward."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {season === "june"
            ? "June Noon Shadow: Extremely short because the high summer sun shines from 84° overhead."
            : "December Noon Shadow: Noticeably longer! Even at midday, the winter sun only climbs to 44°."}
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
