"use client";

import React, { useState, useEffect } from "react";
import { useAnomalySignal } from '../useAnomalySignal';
import { ObservationSpeaker } from "@/components/ReadAloud";
import { FitText, useSceneText } from '../SceneText';

// ==========================================
// EXPERIMENT 1: CRICKET BALL SUN & MUSTARD SEED EARTH (SIZE SCALE)
// ==========================================
function SizeScale({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const { s } = useSceneText("solar");
  const PLANET_SIZES = [
    { name: "Mercury", label: "planet_mercury", mm: 0.35, everyday: "thing_dust", color: "bg-stone-400" },
    { name: "Venus", label: "planet_venus", mm: 0.87, everyday: "thing_tiny_mustard", color: "bg-amber-300" },
    { name: "Earth", label: "planet_earth", mm: 0.92, everyday: "thing_mustard", color: "bg-blue-400" },
    { name: "Mars", label: "planet_mars", mm: 0.49, everyday: "thing_poppy", color: "bg-red-400" },
    { name: "Jupiter", label: "planet_jupiter", mm: 10.3, everyday: "thing_marble", color: "bg-amber-600" },
    { name: "Saturn", label: "planet_saturn", mm: 8.6, everyday: "thing_chickpea", color: "bg-yellow-600" },
    { name: "Uranus", label: "planet_uranus", mm: 3.7, everyday: "thing_pepper", color: "bg-teal-400" },
    { name: "Neptune", label: "planet_neptune", mm: 3.5, everyday: "thing_pepper", color: "bg-sky-500" },
  ] as const;

  const [selectedIdx, setSelectedIdx] = useState(2); // Default Earth
  const [zoom, setZoom] = useState(10); // 1x to 30x zoom
  const [fillCounter, setFillCounter] = useState(false);
  const [earthCount, setEarthCount] = useState(1);
  useAnomalySignal(fillCounter, recordAction);

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
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">{s("size_select")}</span>
          <select
            value={selectedIdx}
            onChange={(e) => handleSelectPlanet(parseInt(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400 min-h-[44px]"
          >
            {PLANET_SIZES.map((p, idx) => (
              <option key={p.name} value={idx}>
                {s(p.label)} ({p.mm} mm)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-300">{s("size_zoom")}</span>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-20 sm:w-28 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label={s("size_zoom_slider")}
          />
          <span className="text-xs font-mono font-bold text-amber-300">{zoom}x</span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3 select-none">
        <div className="flex items-center justify-around w-full max-w-md gap-3">
          {/* Scaled Sun: 10 cm Cricket Ball */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 border-2 border-yellow-200 shadow-[0_0_40px_rgba(245,158,11,0.7)] flex flex-col items-center justify-center overflow-hidden">
              <span className="text-xs font-black text-amber-950 uppercase tracking-widest">
                {s("size_the_sun")}
              </span>
              <span className="text-[10px] font-mono text-amber-950/80 font-bold">
                100 mm (10 cm)
              </span>
              <span className="text-[9px] text-amber-900 bg-yellow-300/60 px-1.5 py-0.2 rounded mt-1 font-bold">
                {s("size_cricket_scale")}
              </span>

              {/* Capacity Counter Overlay */}
              {fillCounter && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-2 text-center animate-fade-in">
                  <span className="text-[10px] text-gray-300 uppercase font-bold">
                    {s("size_packed")}
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {earthCount.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-200 mt-0.5">
                    {s(earthCount >= 1300000 ? "size_full" : "size_packing")}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 font-mono">{s("size_real")}</span>
          </div>

          {/* Scaled Planet Specimen Display */}
          <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl min-w-[112px] sm:min-w-[160px] shadow-xl">
            <span className="text-xs font-bold text-white mb-2">{s(selectedPlanet.label)}</span>

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
                {s(selectedPlanet.everyday)}
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
            <span>{s("size_how_many")}</span>
          </button>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">
        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {selectedPlanet.name === "Earth"
            ? s("size_earth")
            : selectedPlanet.name === "Jupiter"
            ? s("size_jupiter")
            : s("size_measures", { planet: s(selectedPlanet.label), mm: selectedPlanet.mm, thing: s(selectedPlanet.everyday) })}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s("size_why")}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: THE SCHOOL FIELD PACING MODEL (DISTANCE SCALE)
// ==========================================
function DistanceScale({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const { s, en } = useSceneText("solar");
  const PLANET_DISTANCES = [
    { name: "Sun", label: "planet_sun", meters: 0, marker: "marker_sun" },
    { name: "Mercury", label: "planet_mercury", meters: 4, marker: "marker_dust" },
    { name: "Venus", label: "planet_venus", meters: 7, marker: "marker_mustard" },
    { name: "Earth", label: "planet_earth", meters: 11, marker: "marker_mustard" },
    { name: "Mars", label: "planet_mars", meters: 16, marker: "marker_poppy" },
    { name: "Jupiter", label: "planet_jupiter", meters: 56, marker: "marker_marble" },
    { name: "Saturn", label: "planet_saturn", meters: 103, marker: "marker_chickpea" },
    { name: "Uranus", label: "planet_uranus", meters: 207, marker: "marker_pepper" },
    { name: "Neptune", label: "planet_neptune", meters: 324, marker: "marker_pepper" },
  ] as const;
  const markerText = (p: (typeof PLANET_DISTANCES)[number], say: typeof s) => (p.meters ? `${say(p.marker)} (${p.meters}m)` : say(p.marker));

  const [fieldPace, setFieldPace] = useState(11); // Default at Earth (11 meters)
  const [photonActive, setPhotonActive] = useState(false);
  const [photonPos, setPhotonPos] = useState(0);

  // Find closest planet
  const closest = PLANET_DISTANCES.reduce((prev: (typeof PLANET_DISTANCES)[number], curr) =>
    Math.abs(curr.meters - fieldPace) < Math.abs(prev.meters - fieldPace) ? curr : prev
  );

  useAnomalySignal(fieldPace > 16 && fieldPace < 56, recordAction);
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
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">{s("walk_field")}</span>
          <input
            type="range"
            min="0"
            max="340"
            step="2"
            value={fieldPace}
            onChange={(e) => handlePaceChange(parseInt(e.target.value))}
            className="w-28 sm:w-44 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label={s("walk_slider")}
          />
          <span className="text-xs font-mono font-bold text-emerald-300">
            {s("walk_meters", { n: fieldPace })}
          </span>
        </div>

        <button
          onClick={firePhoton}
          disabled={photonActive}
          className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-gray-950 font-black text-xs px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 min-h-[32px]"
        >
          <span className="material-symbols-outlined text-sm">flash_on</span>
          <span>{photonActive ? s("walk_light_at", { n: photonPos }) : s("walk_send_light")}</span>
        </button>
      </div>

      {/* Visual: school field track 0..340 m, plus a zoom box for the crowded inner planets */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex items-end select-none">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={s("walk_pic", { n: fieldPace, planet: s(closest.label) })}>
          {(() => {
            const X0 = 16;
            const X1 = 324;
            const toX = (m: number) => X0 + (m / 340) * (X1 - X0);
            const TRACK_Y = 150;
            // Zoom box geometry for 0..16 m
            const ZX0 = 30;
            const ZX1 = 310;
            const toZ = (m: number) => ZX0 + (m / 16) * (ZX1 - ZX0);
            const inner = PLANET_DISTANCES.filter((p) => p.meters <= 16);
            const outer = PLANET_DISTANCES.filter((p) => p.meters > 16);
            return (
              <g>
                {/* Zoom box: first 16 metres */}
                <rect x="10" y="8" width="320" height="64" rx="10" fill="#0f172a" stroke="#334155" />
                <FitText en={en("walk_zoom")} x="20" y="22" fontSize="9" fontWeight="700" fill="#94a3b8">{s("walk_zoom")}</FitText>
                <line x1={ZX0} y1="46" x2={ZX1} y2="46" stroke="#475569" strokeWidth="2" />
                {inner.map((p, i) => (
                  <g key={p.name}>
                    <circle cx={toZ(p.meters)} cy="46" r={p.name === "Sun" ? 8 : 4} fill={p.name === "Sun" ? "#fbbf24" : p.name === "Earth" ? "#3b82f6" : "#94a3b8"} />
                    <FitText en={`${en(p.label)} ${p.meters > 0 ? `${p.meters}m` : ""}`} x={toZ(p.meters)} y={i % 2 === 0 ? 34 : 64} textAnchor="middle" fontSize="9" fontWeight="700" fill="#e2e8f0">{`${s(p.label)} ${p.meters > 0 ? `${p.meters}m` : ""}`}</FitText>
                  </g>
                ))}
                {fieldPace <= 16 && <circle cx={toZ(fieldPace)} cy="46" r="6" fill="none" stroke="#22c55e" strokeWidth="2.5" />}

                {/* Lines from the zoom box to the start of the field */}
                <line x1="10" y1="72" x2={toX(0)} y2={TRACK_Y - 10} stroke="#334155" strokeDasharray="3 3" />
                <line x1="330" y1="72" x2={toX(16)} y2={TRACK_Y - 10} stroke="#334155" strokeDasharray="3 3" />

                {/* Field track */}
                <rect x={X0 - 6} y={TRACK_Y - 10} width={X1 - X0 + 12} height="20" rx="10" fill="#14532d" />
                {[0, 100, 200, 300].map((m) => (
                  <g key={m}>
                    <line x1={toX(m)} y1={TRACK_Y + 10} x2={toX(m)} y2={TRACK_Y + 16} stroke="#64748b" />
                    <text x={toX(m)} y={TRACK_Y + 26} textAnchor="middle" fontSize="9" fill="#64748b">{m}m</text>
                  </g>
                ))}
                <rect x={toX(0) - 2} y={TRACK_Y - 10} width={toX(16) - toX(0) + 4} height="20" fill="#3b82f6" opacity="0.35" />
                <circle cx={toX(0)} cy={TRACK_Y} r="6" fill="#fbbf24" />

                {/* Outer planets with alternating labels */}
                {outer.map((p, i) => (
                  <g key={p.name}>
                    <circle cx={toX(p.meters)} cy={TRACK_Y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                    <line x1={toX(p.meters)} y1={i % 2 === 0 ? TRACK_Y - 12 : TRACK_Y + 12} x2={toX(p.meters)} y2={i % 2 === 0 ? TRACK_Y - 22 : TRACK_Y + 32} stroke="#475569" />
                    <FitText en={`${en(p.label)} ${p.meters}m`} x={Math.min(318, toX(p.meters))} y={i % 2 === 0 ? TRACK_Y - 26 : TRACK_Y + 44} textAnchor={toX(p.meters) > 300 ? "end" : "middle"} fontSize="9" fontWeight="700" fill="#e2e8f0">{`${s(p.label)} ${p.meters}m`}</FitText>
                  </g>
                ))}

                {/* Light beam */}
                {photonActive && <circle cx={toX(photonPos)} cy={TRACK_Y} r="5" fill="#fde047" />}

                {/* You */}
                <g style={{ transform: `translateX(${toX(fieldPace)}px)`, transition: 'transform 0.2s' }}>
                  <polygon points={`-6,${TRACK_Y - 30} 6,${TRACK_Y - 30} 0,${TRACK_Y - 16}`} fill="#22c55e" />
                  <FitText en={en("walk_you")} x="0" y={TRACK_Y - 34} textAnchor="middle" fontSize="9" fontWeight="800" fill="#86efac">{s("walk_you")}</FitText>
                </g>

                {(() => {
                  const time = fieldPace === 0 ? "0 s" : fieldPace <= 11 ? `${Math.round((fieldPace / 11) * 500)} s` : `${Math.round((fieldPace / 11) * 8.3)} min`;
                  return (
                    <FitText en={en("walk_near", { marker: markerText(closest, en), time })} x="170" y="212" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fcd34d">
                      {s("walk_near", { marker: markerText(closest, s), time })}
                    </FitText>
                  );
                })()}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Observation Banner */}
      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">
        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {fieldPace <= 16
            ? s("walk_inner")
            : fieldPace < 56
            ? s("walk_empty")
            : fieldPace >= 320
            ? s("walk_neptune")
            : s("walk_through", { n: fieldPace })}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s("walk_why")}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: THE ORBIT RACER (ORBIT SPEEDWAYS)
// ==========================================
function OrbitSpeedway({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const { s } = useSceneText("solar");
  // Planetary speeds and orbital periods
  // Mercury: 47 km/s, 88 days
  // Earth: 30 km/s, 365 days (1.0 yr)
  // Neptune: 5.4 km/s, 165 years (60,190 days)
  const [gravity, setGravity] = useState(1.0); // 0.5x to 1.5x
  const [isRacing, setIsRacing] = useState(false);
  const [raceDays, setRaceDays] = useState(0);
  useAnomalySignal(raceDays >= 365, recordAction);

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
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">{s("orbit_pull")}</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-20 sm:w-28 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label={s("orbit_slider")}
          />
          <span className="text-xs font-mono font-bold text-amber-300">{gravity.toFixed(1)}x</span>
        </div>

        <button
          onClick={handleStartRace}
          disabled={isRacing}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-md flex items-center gap-1.5 min-h-[32px]"
        >
          <span className="material-symbols-outlined text-sm">timer</span>
          <span>{isRacing ? s("orbit_day", { n: raceDays }) : s("orbit_race")}</span>
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
              title={s("planet_mercury")}
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
              title={s("planet_earth")}
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
              title={s("planet_neptune")}
            />
          </div>
        </div>

        {/* Lap Counter Cards */}
        <div className="mt-2 grid grid-cols-3 gap-2 w-full max-w-sm text-center z-10 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-stone-300 block">{s("planet_mercury")} (47 km/s)</span>
            <strong className="text-amber-300">{s("orbit_laps", { n: mercuryLaps.toFixed(1) })}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-blue-300 block">{s("planet_earth")} (30 km/s)</span>
            <strong className="text-blue-300">{s("orbit_earth_lap", { n: earthLaps.toFixed(1) })}</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
            <span className="text-[10px] text-sky-300 block">{s("planet_neptune")} (5.4 km/s)</span>
            <strong className="text-sky-300">{s("orbit_moved", { n: (neptuneLaps * 360).toFixed(1) })}</strong>
          </div>
        </div>
      </div>

      {/* Observation Banner */}
      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">
        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {s(raceDays >= 365 ? "orbit_done" : "orbit_try")}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s("orbit_why")}
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
