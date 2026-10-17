"use client";

import React, { useState, useEffect } from "react";

// ==========================================
// EXPERIMENT 1: CRICKET BALL SUN & MUSTARD SEED EARTH (SIZE SCALE)
// ==========================================
function SizeScale({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const PLANET_SIZES = [
    { name: "Mercury", mm: 0.35, everyday: "Grain of dust / coarse sand", color: "bg-stone-400" },
    { name: "Venus", mm: 0.87, everyday: "Tiny mustard seed (Rai)", color: "bg-amber-300" },
    { name: "Earth", mm: 0.92, everyday: "Mustard seed (Rai)", color: "bg-blue-400" },
    { name: "Mars", mm: 0.49, everyday: "Poppy seed (Khas khas)", color: "bg-red-400" },
    { name: "Jupiter", mm: 10.3, everyday: "Small glass marble", color: "bg-amber-600" },
    { name: "Saturn", mm: 8.6, everyday: "Chickpea (Chana)", color: "bg-yellow-600" },
    { name: "Uranus", mm: 3.7, everyday: "Whole black peppercorn", color: "bg-teal-400" },
    { name: "Neptune", mm: 3.5, everyday: "Whole black peppercorn", color: "bg-sky-500" },
  ];

  const [selectedIdx, setSelectedIdx] = useState(2); // Default Earth
  const [zoom, setZoom] = useState(10); // 1x to 30x zoom
  const [fillCounter, setFillCounter] = useState(false);
  const [earthCount, setEarthCount] = useState(1);

  const selectedPlanet = PLANET_SIZES[selectedIdx];

  const handleSelectPlanet = (idx: number) => {
    setSelectedIdx(idx);
    recordAction("inspected_planet_scale_size", {
      planet: PLANET_SIZES[idx].name,
      diameterMm: PLANET_SIZES[idx].mm,
      zoom,
    });
  };

  const handlePourEarths = () => {
    setFillCounter(true);
    setEarthCount(1);
    recordAction("triggered_sun_capacity_fill", { maxEarths: 1300000 });
  };

  useEffect(() => {
    if (!fillCounter) return;
    const interval = setInterval(() => {
      setEarthCount((prev) => {
        if (prev >= 1300000) {
          clearInterval(interval);
          return 1300000;
        }
        return prev + 65000;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [fillCounter]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Select Planet:</span>
          <select
            value={selectedIdx}
            onChange={(e) => handleSelectPlanet(parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400 min-h-[44px]"
          >
            {PLANET_SIZES.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name} ({p.mm} mm)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">Microscope Zoom:</span>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-20 sm:w-28 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Planet Microscope Zoom Slider"
          />
          <span className="text-xs font-mono font-bold text-amber-300">{zoom}x</span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3 select-none">
        <div className="flex items-center justify-around w-full max-w-md gap-4">
          {/* Scaled Sun: 10 cm Cricket Ball */}
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 border-2 border-yellow-200 shadow-[0_0_40px_rgba(245,158,11,0.7)] flex flex-col items-center justify-center overflow-hidden">
              <span className="text-xs font-black text-amber-950 uppercase tracking-widest">
                The Sun
              </span>
              <span className="text-[10px] font-mono text-amber-950/80 font-bold">
                100 mm (10 cm)
              </span>
              <span className="text-[9px] text-amber-900 bg-yellow-300/60 px-1.5 py-0.2 rounded mt-1 font-bold">
                Cricket Ball Scale
              </span>

              {/* Capacity Counter Overlay */}
              {fillCounter && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-2 text-center animate-fade-in">
                  <span className="text-[10px] text-gray-300 uppercase font-bold">
                    Earths Packed Inside:
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {earthCount.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-200 mt-0.5">
                    {earthCount >= 1300000 ? "Full! (1.3 Million Earths)" : "Packing..."}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 font-mono">Real: 1,392,700 km</span>
          </div>

          {/* Scaled Planet Specimen Display */}
          <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 p-4 rounded-2xl min-w-[140px] sm:min-w-[160px] shadow-xl">
            <span className="text-xs font-bold text-white mb-2">{selectedPlanet.name}</span>

            {/* Specimen Inspection Ring */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-sky-400/40 bg-slate-950 flex items-center justify-center relative overflow-hidden">
              <div
                className={`rounded-full shadow-md transition-all duration-300 ${selectedPlanet.color}`}
                style={{
                  width: `${Math.max(3, selectedPlanet.mm * zoom)}px`,
                  height: `${Math.max(3, selectedPlanet.mm * zoom)}px`,
                }}
              />
            </div>

            <div className="mt-2 text-center">
              <span className="text-xs font-mono font-black text-amber-300 block">
                {selectedPlanet.mm} mm
              </span>
              <span className="text-[10px] text-gray-300 block mt-0.5 font-medium">
                {selectedPlanet.everyday}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Capacity Counter */}
        <div className="mt-3 z-10">
          <button
            onClick={handlePourEarths}
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs px-3.5 py-1.5 rounded-full transition-all active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">view_in_ar</span>
            <span>How Many Earths Fit in the Sun?</span>
          </button>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {selectedPlanet.name === "Earth"
            ? "Aha! If the Sun is a 10 cm cricket ball, Earth is just a tiny 0.9 mm mustard seed (rai)!"
            : selectedPlanet.name === "Jupiter"
            ? "Jupiter is a small 1 cm marble—more massive than all 7 other planets combined!"
            : `${selectedPlanet.name} measures just ${selectedPlanet.mm} mm: roughly the size of a ${selectedPlanet.everyday}.`}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          Over 1,300,000 Earths could fit inside the Sun! Textbooks draw Earth much too large to fit on a single page.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: THE SCHOOL FIELD PACING MODEL (DISTANCE SCALE)
// ==========================================
function DistanceScale({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const PLANET_DISTANCES = [
    { name: "Sun", meters: 0, marker: "🏏 Cricket Ball Sun" },
    { name: "Mercury", meters: 4, marker: "Dust grain (4m)" },
    { name: "Venus", meters: 7, marker: "Mustard seed (7m)" },
    { name: "Earth", meters: 11, marker: "Mustard seed (11m)" },
    { name: "Mars", meters: 16, marker: "Poppy seed (16m)" },
    { name: "Jupiter", meters: 56, marker: "Marble (56m)" },
    { name: "Saturn", meters: 103, marker: "Chickpea (103m)" },
    { name: "Uranus", meters: 207, marker: "Peppercorn (207m)" },
    { name: "Neptune", meters: 324, marker: "Peppercorn (324m)" },
  ];

  const [fieldPace, setFieldPace] = useState(11); // Default at Earth (11 meters)
  const [photonActive, setPhotonActive] = useState(false);
  const [photonPos, setPhotonPos] = useState(0);

  // Find closest planet
  const closest = PLANET_DISTANCES.reduce((prev, curr) =>
    Math.abs(curr.meters - fieldPace) < Math.abs(prev.meters - fieldPace) ? curr : prev
  );

  const handlePaceChange = (meters: number) => {
    setFieldPace(meters);
    recordAction("walked_school_field", {
      distanceMeters: meters,
      closestPlanet: closest.name,
      isOuterSpaceVoid: meters > 16 && meters < 56,
    });
  };

  const firePhoton = () => {
    setPhotonActive(true);
    setPhotonPos(0);
    recordAction("fired_scale_speed_of_light", { target: "Neptune", speedKmSec: 300000 });
  };

  useEffect(() => {
    if (!photonActive) return;
    const interval = setInterval(() => {
      setPhotonPos((prev) => {
        if (prev >= 324) {
          clearInterval(interval);
          setPhotonActive(false);
          return 324;
        }
        return prev + 12;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [photonActive]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Pace Field:</span>
          <input
            type="range"
            min="0"
            max="340"
            step="2"
            value={fieldPace}
            onChange={(e) => handlePaceChange(parseInt(e.target.value))}
            className="w-28 sm:w-44 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Playground Pacing Distance Slider"
          />
          <span className="text-xs font-mono font-bold text-emerald-300">
            {fieldPace} meters
          </span>
        </div>

        <button
          onClick={firePhoton}
          disabled={photonActive}
          className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-gray-950 font-black text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 min-h-[32px]"
        >
          <span className="material-symbols-outlined text-sm">flash_on</span>
          <span>{photonActive ? `Beam: ${photonPos}m...` : "Trace Speed of Light"}</span>
        </button>
      </div>

      {/* Visual Simulation Stage: The 350m Playground Field Track */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col justify-center p-3 select-none">
        {/* The Field Running Track Trackline */}
        <div className="relative w-full h-20 bg-stone-900/90 rounded-2xl border border-stone-700 flex items-center px-4 overflow-x-hidden">
          {/* Turf yard lines */}
          <div className="absolute inset-x-0 top-0 bottom-0 flex justify-between pointer-events-none opacity-20">
            {[0, 50, 100, 150, 200, 250, 300].map((m) => (
              <div key={m} className="border-l border-white h-full flex items-end pb-1 pl-1 text-[8px] font-mono">
                {m}m
              </div>
            ))}
          </div>

          {/* Planet Markers Placed Proportioned along Track */}
          {PLANET_DISTANCES.map((p) => {
            const pct = (p.meters / 340) * 100;
            return (
              <div
                key={p.name}
                className="absolute flex flex-col items-center top-2 -translate-x-1/2 z-10"
                style={{ left: `${pct}%` }}
              >
                <div
                  className={`w-2 h-2 rounded-full border border-white shadow-md ${
                    p.name === "Sun" ? "bg-amber-400 w-4 h-4 -top-1" : "bg-sky-400"
                  }`}
                />
                <span className="text-[8px] font-mono text-gray-300 bg-black/60 px-0.5 rounded mt-0.5">
                  {p.name}
                </span>
                <span className="text-[7px] text-gray-400 font-mono">{p.meters}m</span>
              </div>
            );
          })}

          {/* Student Walking Pacer Marker */}
          <div
            className="absolute bottom-2 -translate-x-1/2 flex flex-col items-center transition-all duration-200 z-20"
            style={{ left: `${(fieldPace / 340) * 100}%` }}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
              <span className="material-symbols-outlined text-[10px] text-white">directions_walk</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-300 bg-emerald-950 px-1 rounded border border-emerald-700">
              You ({fieldPace}m)
            </span>
          </div>

          {/* Speed of Light Photon Beam */}
          {photonActive && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_15px_rgba(253,224,71,1)] z-30"
              style={{ left: `${(photonPos / 340) * 100}%` }}
            />
          )}
        </div>

        {/* Current Location Distance Breakdown */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl z-10">
          <div className="text-xs">
            <span className="text-gray-400">Nearest Landmark: </span>
            <strong className="text-amber-300 font-bold">{closest.marker}</strong>
          </div>
          <div className="text-xs font-mono text-gray-300">
            Light Travel Time to Here:{" "}
            <strong className="text-sky-300">
              {fieldPace === 0
                ? "0s"
                : fieldPace <= 11
                ? `${Math.round((fieldPace / 11) * 500)} sec (~8 min)`
                : `${Math.round((fieldPace / 11) * 8.3)} minutes`}
            </strong>
          </div>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {fieldPace <= 16
            ? "The inner 4 rocky planets (Mercury, Venus, Earth, Mars) are huddled inside just 16 meters!"
            : fieldPace < 56
            ? "Vast Empty Void! You must walk 40 meters across empty space just to reach Jupiter."
            : fieldPace >= 320
            ? "Neptune at 324 meters! You have walked past more than 3 entire football fields."
            : `Walking through the outer solar system (${fieldPace}m). Space is overwhelmingly empty!`}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          Light takes 8 minutes 20 seconds to crawl the 11 meters from the cricket ball Sun to mustard seed Earth.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: THE ORBIT RACER (ORBIT SPEEDWAYS)
// ==========================================
function OrbitSpeedway({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Planetary speeds and orbital periods
  // Mercury: 47 km/s, 88 days
  // Earth: 30 km/s, 365 days (1.0 yr)
  // Neptune: 5.4 km/s, 165 years (60,190 days)
  const [gravity, setGravity] = useState(1.0); // 0.5x to 1.5x
  const [isRacing, setIsRacing] = useState(false);
  const [raceDays, setRaceDays] = useState(0);

  const handleStartRace = () => {
    setIsRacing(true);
    setRaceDays(0);
    recordAction("started_orbit_race", { gravityMultiplier: gravity });
  };

  useEffect(() => {
    if (!isRacing) return;
    const interval = setInterval(() => {
      setRaceDays((prev) => {
        if (prev >= 365) {
          clearInterval(interval);
          setIsRacing(false);
          return 365;
        }
        return prev + 15;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isRacing]);

  // Compute completed laps in 365 Earth days
  const mercuryLaps = (raceDays / 88) * Math.sqrt(gravity);
  const earthLaps = (raceDays / 365) * Math.sqrt(gravity);
  const neptuneLaps = (raceDays / (165 * 365)) * Math.sqrt(gravity);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Sun Gravity:</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-20 sm:w-28 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Sun Gravity Multiplier"
          />
          <span className="text-xs font-mono font-bold text-amber-300">{gravity.toFixed(1)}x</span>
        </div>

        <button
          onClick={handleStartRace}
          disabled={isRacing}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-md flex items-center gap-1.5 min-h-[32px]"
        >
          <span className="material-symbols-outlined text-sm">timer</span>
          <span>{isRacing ? `Day ${raceDays} of 365...` : "Race 1 Earth Year"}</span>
        </button>
      </div>

      {/* Visual Simulation Stage: Concentric Orbit Rings */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3 select-none">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-slate-800 flex items-center justify-center">
          {/* Sun in Center */}
          <div className="w-8 h-8 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] flex items-center justify-center z-10">
            <span className="material-symbols-outlined text-amber-950 text-xs">wb_sunny</span>
          </div>

          {/* Mercury Orbit Ring (Inner) */}
          <div className="absolute w-20 h-20 rounded-full border border-dashed border-stone-600 flex items-center justify-center">
            {/* Mercury Planet Dot */}
            <div
              className="absolute w-2 h-2 rounded-full bg-stone-300 shadow-sm"
              style={{
                transform: `rotate(${mercuryLaps * 360}deg) translateX(40px)`,
              }}
              title="Mercury"
            />
          </div>

          {/* Earth Orbit Ring (Middle) */}
          <div className="absolute w-36 h-36 rounded-full border border-dashed border-blue-500/40 flex items-center justify-center">
            {/* Earth Planet Dot */}
            <div
              className="absolute w-3 h-3 rounded-full bg-blue-400 border border-white shadow-sm"
              style={{
                transform: `rotate(${earthLaps * 360}deg) translateX(72px)`,
              }}
              title="Earth"
            />
          </div>

          {/* Neptune Orbit Ring (Outer) */}
          <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-dashed border-sky-400/20 flex items-center justify-center">
            {/* Neptune Planet Dot */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm"
              style={{
                transform: `rotate(${neptuneLaps * 360}deg) translateX(104px)`,
              }}
              title="Neptune"
            />
          </div>
        </div>

        {/* Lap Counter Cards */}
        <div className="mt-2 grid grid-cols-3 gap-2 w-full max-w-sm text-center z-10 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-stone-300 block">Mercury (47 km/s)</span>
            <strong className="text-amber-300">{mercuryLaps.toFixed(1)} Laps</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-blue-300 block">Earth (30 km/s)</span>
            <strong className="text-blue-300">{earthLaps.toFixed(1)} Lap (1 yr)</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-sky-300 block">Neptune (5.4 km/s)</span>
            <strong className="text-sky-300">{(neptuneLaps * 360).toFixed(1)}° moved</strong>
          </div>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {raceDays >= 365
            ? "1 Earth Year finished! Mercury zoomed through 4+ full years, while Neptune moved less than 2°!"
            : "Watch the speed contrast: inner planets whip fast, while distant outer planets glide slowly."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          Neptune takes 165 Earth years to complete one orbit! Because gravity weakens with distance, Neptune travels at just 5.4 km/s vs. Mercury's 47.4 km/s.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPORT LEVEL CONTAINER
// ==========================================
export function SolarSystemScaleLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <SizeScale recordAction={recordAction} />}
      {experimentSubIndex === 1 && <DistanceScale recordAction={recordAction} />}
      {experimentSubIndex === 2 && <OrbitSpeedway recordAction={recordAction} />}
    </div>
  );
}
