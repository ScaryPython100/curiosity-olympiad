"use client";

import React, { useState } from 'react';

// ==========================================
// EXPERIMENT 1: OXYGEN BUBBLES (PHOTOSYNTHESIS)
// ==========================================
function OxygenBubbles({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Light intensity: 10% (Dim room) to 100% (High-power grow lamp)
  const [lightIntensity, setLightIntensity] = useState(40);

  // Photosynthetic bubble rate: from 3 bubbles/min at 10% to 42 bubbles/min at 100%
  const bubbleRate = Math.round(3 + (lightIntensity / 100) * 39);
  const isAnomaly = lightIntensity >= 90;

  const handleSlider = (val: number) => {
    setLightIntensity(val);
    recordAction('changed_lamp_intensity', { lightIntensity: val, bubbleRate });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">Lamp Intensity:</span>
          <input
            type="range" min="10" max="100" step="10" value={lightIntensity}
            onChange={e => handleSlider(parseInt(e.target.value))}
            className="w-24 sm:w-36 accent-emerald-500 cursor-pointer min-h-[44px]"
            aria-label="Grow Lamp Light Intensity Slider"
          />
          <span className="text-xs font-mono text-gray-200">{lightIntensity}%</span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-gray-400">Photosynthesis Rate:</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
            {bubbleRate} O₂ Bubbles/min
          </span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-end p-3">
        {/* Lamp Light Glow Effect */}
        <div
          className="absolute -top-6 w-72 h-36 bg-gradient-to-b from-yellow-300/40 via-yellow-200/10 to-transparent blur-xl pointer-events-none transition-opacity duration-300"
          style={{ opacity: lightIntensity / 100 }}
        />

        {/* Lamp Fixture Graphic */}
        <div className="absolute top-1 flex flex-col items-center z-10 select-none">
          <div className="w-16 h-4 bg-amber-600 rounded-t-lg shadow" />
          <div
            className="w-12 h-6 bg-yellow-200 rounded-b-xl shadow-lg transition-all duration-300 flex items-center justify-center"
            style={{
              boxShadow: `0 0 ${lightIntensity * 0.4}px rgba(253, 224, 71, 0.9)`
            }}
          >
            <span className="material-symbols-outlined text-xs text-amber-700">lightbulb</span>
          </div>
        </div>

        {/* Water Beaker with Inverted Funnel & Elodea */}
        <div className="relative w-40 sm:w-48 h-44 border-4 border-slate-400/80 border-t-0 rounded-b-3xl bg-blue-950/40 backdrop-blur-xs flex flex-col justify-end items-center p-2 shadow-2xl overflow-hidden">
          {/* Water Surface Line */}
          <div className="absolute inset-x-0 top-3 h-1 bg-sky-400/40" />

          {/* Test Tube on top of Funnel collecting O2 */}
          <div className="absolute top-1 w-6 h-20 border-2 border-slate-300/80 rounded-t-md bg-sky-200/20 flex flex-col justify-end items-center overflow-hidden">
            {/* O2 Gas Pocket */}
            <div
              className="w-full bg-emerald-400/30 border-b border-emerald-300 transition-all duration-500"
              style={{ height: `${Math.min(35, Math.round((lightIntensity / 100) * 32))}px` }}
            />
          </div>

          {/* Inverted Glass Funnel */}
          <div className="w-24 h-16 border-2 border-slate-400/70 border-b-0 rounded-t-full bg-slate-400/10 flex items-end justify-center pb-1 relative">
            {/* Elodea Water Plant sprig */}
            <div className="flex flex-col items-center select-none">
              <span className="material-symbols-outlined text-emerald-500 text-3xl">psychiatry</span>
              <span className="text-[9px] font-bold text-emerald-400 -mt-1">Elodea Sprig</span>
            </div>

            {/* Rising O2 Bubbles */}
            <div className="absolute inset-x-0 bottom-4 top-0 flex justify-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce" />
              {lightIntensity >= 30 && <span className="w-2 h-2 rounded-full bg-white/80 animate-ping delay-100" />}
              {lightIntensity >= 60 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-200" />}
              {lightIntensity >= 80 && <span className="w-2.5 h-2.5 rounded-full bg-white/90 animate-ping delay-300" />}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-emerald-300 block">
          {isAnomaly
            ? "Photochemical Surge: Intense light maximizes photosynthetic splitting of water into Oxygen gas!"
            : "Light energy drives photosynthesis: Chlorophyll uses light to produce glucose and release Oxygen bubbles."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Formula: $6CO_2 + 6H_2O + \\text{Light} \\rightarrow C_6H_{12}O_6 + 6O_2$. More light photons hit photosystems, accelerating bubble production."
            : "Adjust the lamp slider to observe the direct link between sunlight intensity and oxygen release."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: LEAF TRANSPIRATION
// ==========================================
function LeafTranspiration({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  type Weather = "Direct Sunlight" | "Deep Shade";
  const [weather, setWeather] = useState<Weather>("Direct Sunlight");
  const [hoursElapsed, setHoursElapsed] = useState(2);

  const isSun = weather === "Direct Sunlight";
  // Transpiration rate: Sun produces rapid evaporation and droplet condensation
  const condensationLevel = isSun ? Math.min(100, hoursElapsed * 28) : Math.min(25, hoursElapsed * 5);
  const isAnomaly = isSun && hoursElapsed >= 3;

  const handleSetWeather = (w: Weather) => {
    setWeather(w);
    recordAction('changed_weather_exposure', { weather: w, hoursElapsed });
  };

  const handleHours = (val: number) => {
    setHoursElapsed(val);
    recordAction('advanced_hours', { hours: val, weather });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-bold text-sky-400">Environment:</span>
          {(["Direct Sunlight", "Deep Shade"] as Weather[]).map(w => (
            <button
              key={w}
              onClick={() => handleSetWeather(w)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                weather === w
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-label={`Select ${w}`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold">Time:</span>
          <input
            type="range" min="1" max="4" step="1" value={hoursElapsed}
            onChange={e => handleHours(parseInt(e.target.value))}
            className="w-20 sm:w-28 accent-sky-500 cursor-pointer min-h-[44px]"
            aria-label="Elapsed Time Slider"
          />
          <span className="text-xs font-mono text-gray-200">{hoursElapsed} Hours</span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Sun / Shade Indicator */}
        <div className="absolute top-2 left-3 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs font-bold text-amber-300">
          <span className="material-symbols-outlined text-sm">{isSun ? "wb_sunny" : "cloud"}</span>
          <span>{isSun ? "32°C • High Stomatal Evaporation" : "22°C • Stomata Constricted"}</span>
        </div>

        {/* Potted Plant Graphic with Plastic Bag on Branch */}
        <div className="relative flex flex-col items-center select-none mt-4">
          {/* Clear Plastic Bag tied over leafy branch */}
          <div
            className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl border-2 border-slate-300/80 transition-all duration-500 flex flex-col items-center justify-center p-2 relative shadow-lg"
            style={{
              backgroundColor: isSun
                ? `rgba(224, 242, 254, ${0.15 + (condensationLevel / 100) * 0.45})`
                : 'rgba(224, 242, 254, 0.1)',
              backdropFilter: `blur(${condensationLevel * 0.04}px)`
            }}
          >
            {/* Bag Neck String Tie */}
            <div className="absolute -bottom-2 w-6 h-2 bg-amber-500 rounded-full shadow" />

            {/* Enclosed Leaf */}
            <span className="material-symbols-outlined text-emerald-400 text-4xl">eco</span>

            {/* Water Droplets Condensing on Bag Wall */}
            {condensationLevel > 20 && (
              <div className="absolute inset-2 flex flex-wrap justify-around items-center pointer-events-none">
                <span className="w-1.5 h-2 bg-sky-200 rounded-full shadow" />
                <span className="w-2 h-2.5 bg-sky-200 rounded-full shadow" />
                <span className="w-1 h-1.5 bg-sky-200 rounded-full shadow" />
                {condensationLevel > 50 && (
                  <>
                    <span className="w-2.5 h-3 bg-sky-200 rounded-full shadow animate-bounce" />
                    <span className="w-2 h-2.5 bg-sky-200 rounded-full shadow" />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Plant Stem & Pot */}
          <div className="w-2 h-10 bg-emerald-700" />
          <div className="w-20 h-14 bg-amber-800 rounded-b-xl border-t-4 border-amber-900 flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-bold text-amber-200 uppercase">Pot Soil</span>
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">
          {isAnomaly
            ? "Transpiration Stream: Direct sun opened leaf stomata, evaporating water vapor that condensed on the cool plastic bag!"
            : isSun
            ? "Transpiration is rapid in warm sunlight, releasing moisture through microscopic leaf pores."
            : "In shade, cooler temperatures and lower light cause leaf stomata to close, minimizing moisture loss."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Over 95% of water absorbed by plant roots evaporates into the atmosphere through transpiration, creating the suction force that pulls groundwater upward."
            : "Compare direct sunlight vs. deep shade to discover how plants regulate internal water loss."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: PHOTOTROPISM & STEM BENDING
// ==========================================
function Phototropism({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  type LightPos = "Left" | "Overhead" | "Right";
  const [lightPos, setLightPos] = useState<LightPos>("Left");

  const isLeft = lightPos === "Left";
  const isRight = lightPos === "Right";
  const isOverhead = lightPos === "Overhead";
  const isAnomaly = isLeft || isRight;

  const handleLightPos = (pos: LightPos) => {
    setLightPos(pos);
    recordAction('changed_light_direction', { direction: pos });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-bold text-amber-400">Light Slot:</span>
          {(["Left", "Overhead", "Right"] as LightPos[]).map(pos => (
            <button
              key={pos}
              onClick={() => handleLightPos(pos)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                lightPos === pos
                  ? 'bg-amber-500 text-gray-950 shadow'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-label={`Place Light on ${pos}`}
            >
              {pos}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-gray-400">Auxin Hormone:</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700">
            {isOverhead ? "Evenly Distributed" : isLeft ? "Accumulates on Right (Shade)" : "Accumulates on Left (Shade)"}
          </span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-end p-3">
        {/* Sunlight Beam Position Indicator */}
        <div
          className={`absolute top-2 transition-all duration-500 flex items-center gap-1 bg-yellow-400/20 border border-yellow-400/60 px-3 py-1 rounded-full text-xs font-bold text-yellow-300 ${
            isLeft ? 'left-4' : isRight ? 'right-4' : 'inset-x-auto'
          }`}
        >
          <span className="material-symbols-outlined text-sm">wb_sunny</span>
          <span>Light Direction ({lightPos})</span>
        </div>

        {/* Soil Chamber with Growing Seedling */}
        <div className="relative w-48 sm:w-56 h-40 flex flex-col items-center justify-end">
          {/* Bending Plant Stem (SVG Cubic Bezier Curve) */}
          <svg className="w-36 h-28 overflow-visible" viewBox="0 0 100 80">
            {/* Seedling Stem */}
            <path
              d={
                isLeft
                  ? "M 50 80 C 50 50, 20 40, 15 15"
                  : isRight
                  ? "M 50 80 C 50 50, 80 40, 85 15"
                  : "M 50 80 C 50 50, 50 40, 50 15"
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            {/* Top Leaves following stem tip */}
            <circle
              cx={isLeft ? 15 : isRight ? 85 : 50}
              cy={15}
              r="6"
              fill="#34d399"
              className="transition-all duration-700 ease-out"
            />
            <circle
              cx={isLeft ? 9 : isRight ? 91 : 44}
              cy={12}
              r="5"
              fill="#059669"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Soil Layer */}
          <div className="w-full h-12 bg-amber-950 border-t-4 border-amber-900 rounded-b-xl flex flex-col items-center justify-center shadow-2xl">
            <span className="text-[10px] font-mono text-amber-400/80">Roots (Positive Gravitropism ↓)</span>
            <div className="w-0.5 h-4 bg-amber-600/60" />
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly
            ? `Phototropism: Stem bended toward the ${lightPos} light source!`
            : "Light directly overhead causes symmetric vertical stem elongation."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Auxin plant hormones are light-sensitive: they migrate to the shaded side of the stem, causing shaded cells to grow longer and physically bending the tip towards sunlight."
            : "Shift the light slot to observe how plants navigate their growth without eyes or muscles."}
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
