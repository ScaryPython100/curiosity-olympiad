"use client";

import React, { useState } from 'react';

// ==========================================
// EXPERIMENT 1: TURMERIC INDICATOR (pH TEST)
// ==========================================
function TurmericIndicator({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // pH scale: 3 (strong lemon acid) -> 7 (neutral turmeric yellow) -> 11 (soap base deep red)
  const [ph, setPh] = useState(7.0);
  const [drops, setDrops] = useState<{ acid: number; base: number }>({ acid: 0, base: 0 });

  const isAcidic = ph < 6.5;
  const isNeutral = ph >= 6.5 && ph <= 7.5;
  const isBasic = ph > 7.5;
  const isDeepRed = ph >= 9.0;
  const isAnomaly = drops.base > 0 && drops.acid > 0 && ph <= 7.0; // Reversal observed

  const handleAddLemon = () => {
    const nextPh = Math.max(3.0, parseFloat((ph - 1.2).toFixed(1)));
    setPh(nextPh);
    setDrops(d => ({ ...d, acid: d.acid + 1 }));
    recordAction('added_lemon_juice', { newPh: nextPh, totalAcidDrops: drops.acid + 1 });
  };

  const handleAddSoap = () => {
    const nextPh = Math.min(11.0, parseFloat((ph + 1.2).toFixed(1)));
    setPh(nextPh);
    setDrops(d => ({ ...d, base: d.base + 1 }));
    recordAction('added_soap_solution', { newPh: nextPh, totalBaseDrops: drops.base + 1 });
  };

  const handleReset = () => {
    setPh(7.0);
    setDrops({ acid: 0, base: 0 });
    recordAction('reset_turmeric', {});
  };

  // Compute color based on pH
  const getLiquidColor = () => {
    if (ph >= 9.5) return 'rgb(153, 27, 27)'; // Deep Crimson Red
    if (ph >= 8.5) return 'rgb(194, 65, 12)'; // Dark Amber/Red-Orange
    if (ph >= 7.8) return 'rgb(217, 119, 6)'; // Golden Amber
    if (ph <= 4.5) return 'rgb(250, 204, 21)'; // Vibrant Citrus Yellow
    return 'rgb(234, 179, 8)'; // Natural Turmeric Yellow
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={handleAddLemon}
            className="min-h-[44px] px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            aria-label="Add Lemon Drops (Acid)"
          >
            <span className="material-symbols-outlined text-base">water_drop</span>
            <span>+ Lemon (Acid)</span>
          </button>
          <button
            onClick={handleAddSoap}
            className="min-h-[44px] px-3 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            aria-label="Add Soap Drops (Base)"
          >
            <span className="material-symbols-outlined text-base">soap</span>
            <span>+ Soap (Base)</span>
          </button>
          <button
            onClick={handleReset}
            className="min-h-[44px] px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl shadow text-xs transition-colors cursor-pointer"
            aria-label="Reset Beaker"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-gray-400">pH:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            isDeepRed ? 'bg-rose-950 text-rose-300 border border-rose-700' :
            isBasic ? 'bg-orange-950 text-orange-300 border border-orange-700' :
            'bg-yellow-950 text-yellow-300 border border-yellow-700'
          }`}>
            {ph.toFixed(1)} ({isBasic ? 'Alkaline / Basic' : isAcidic ? 'Acidic' : 'Neutral'})
          </span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Color State Pill */}
        <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 transition-all duration-300"
             style={{ backgroundColor: `${getLiquidColor()}33`, color: ph >= 8 ? '#fca5a5' : '#fef08a' }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLiquidColor() }} />
          <span>{isDeepRed ? "Curcumin Complex: Deep Red" : isBasic ? "Turning Reddish-Orange" : "Natural Curcumin: Bright Yellow"}</span>
        </div>

        {/* Laboratory Glass Beaker */}
        <div className="relative w-36 sm:w-44 h-48 border-4 border-slate-400/80 border-t-0 rounded-b-3xl bg-slate-800/40 backdrop-blur-xs flex flex-col justify-end p-2 shadow-2xl overflow-hidden">
          {/* Beaker Measurement Ticks */}
          <div className="absolute left-1.5 top-6 bottom-4 w-3 flex flex-col justify-between text-[8px] font-mono text-slate-400 select-none pointer-events-none">
            <span>200ml</span>
            <span>150ml</span>
            <span>100ml</span>
            <span>50ml</span>
          </div>

          {/* Liquid Volume */}
          <div
            className="w-full rounded-b-2xl transition-all duration-500 relative flex items-center justify-center shadow-inner"
            style={{
              height: '75%',
              backgroundColor: getLiquidColor(),
              boxShadow: `0 0 30px ${getLiquidColor()}66 inset`
            }}
          >
            {/* Fluid Reflection Highlighting */}
            <div className="absolute inset-x-2 top-1 h-2 bg-white/30 rounded-full blur-[1px]" />
            <span className="text-[11px] font-black tracking-wide text-slate-900/80 drop-shadow select-none">
              Turmeric Solution
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly 
            ? "✨ Reversible Reaction: Adding acid to the red basic mixture turned it yellow again!"
            : isDeepRed 
            ? "Curcumin in turmeric acts as a natural pH indicator — alkaline soap turns it red!"
            : "Turmeric remains bright yellow in neutral and acidic solutions."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Neutralization reaction: The citric acid neutralizes the soap base, shifting the pH back below 7 and restoring curcumin's original yellow structure."
            : "Observe how kitchen substances change chemical color indicators without laboratory chemicals."}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// EXPERIMENT 2: SODA & VINEGAR BALLOON INFLATION
// ==================================================
function SodaVinegarBalloon({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [sodaGrams, setSodaGrams] = useState(10);
  const [reacted, setReacted] = useState(false);
  const [fizzing, setFizzing] = useState(false);

  // Gas volume scales with baking soda up to vinegar limit (18g)
  const effectiveGrams = Math.min(sodaGrams, 18);
  const balloonScale = reacted ? 0.4 + (effectiveGrams / 18) * 0.9 : 0.25;
  const isAnomaly = reacted && sodaGrams > 18;

  const handleMix = () => {
    setReacted(true);
    setFizzing(true);
    recordAction('mixed_soda_and_vinegar', { sodaGrams, effectiveGrams });
    setTimeout(() => setFizzing(false), 2200);
  };

  const handleReset = () => {
    setReacted(false);
    setFizzing(false);
    recordAction('reset_flask', {});
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">Baking Soda:</span>
          <input
            type="range" min="3" max="25" step="1" value={sodaGrams}
            onChange={e => {
              const val = parseInt(e.target.value);
              setSodaGrams(val);
              recordAction('changed_soda_amount', { val });
            }}
            disabled={reacted}
            className="w-24 sm:w-32 accent-emerald-500 cursor-pointer disabled:opacity-50 min-h-[44px]"
            aria-label="Baking Soda Slider"
          />
          <span className="text-xs font-mono text-gray-200">{sodaGrams}g</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMix}
            disabled={reacted}
            className="min-h-[44px] px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            aria-label="Mix Soda with Vinegar"
          >
            <span className="material-symbols-outlined text-sm">science</span>
            <span>Pour into Flask</span>
          </button>
          <button
            onClick={handleReset}
            className="min-h-[44px] px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl shadow text-xs transition-colors cursor-pointer"
            aria-label="Reset Flask"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-end p-4">
        {/* Gas readout pill */}
        {reacted && (
          <div className="absolute top-3 bg-emerald-950/90 border border-emerald-500/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined text-sm text-emerald-400 animate-spin">cyclone</span>
            <span>CO₂ Produced: ~{(effectiveGrams * 0.48).toFixed(1)} Liters {isAnomaly && "(Vinegar Expended!)"}</span>
          </div>
        )}

        {/* Balloon & Flask Assembly */}
        <div className="relative flex flex-col items-center">
          {/* The Rubber Balloon */}
          <div
            className="transition-all duration-700 ease-out origin-bottom flex items-center justify-center z-10 shadow-lg"
            style={{
              width: `${Math.round(80 * balloonScale * 1.7)}px`,
              height: `${Math.round(95 * balloonScale * 1.7)}px`,
              borderRadius: reacted ? '50% 50% 48% 48% / 60% 60% 40% 40%' : '30% 30% 50% 50%',
              backgroundColor: '#ef4444',
              boxShadow: 'inset -6px -6px 12px rgba(0,0,0,0.3), 0 0 15px rgba(239,68,68,0.4)',
              transform: reacted ? 'translateY(4px)' : 'translateY(8px) scaleY(0.6) scaleX(0.7)'
            }}
          >
            {reacted && (
              <span className="text-[10px] font-black text-white/90 uppercase tracking-tight select-none">
                CO₂
              </span>
            )}
          </div>

          {/* Flask Neck Tie */}
          <div className="w-8 h-4 bg-red-700 rounded-t-sm z-20 border-b border-red-900 shadow-xs" />

          {/* Conical Flask */}
          <div className="relative w-28 sm:w-36 h-36 border-4 border-slate-400/70 border-t-0 rounded-b-3xl bg-slate-800/40 backdrop-blur-xs flex flex-col justify-end p-2 overflow-hidden shadow-xl">
            {/* Liquid / Vinegar with Carbonation Bubbles */}
            <div className="w-full h-16 bg-sky-200/40 rounded-b-2xl relative overflow-hidden flex items-end justify-center shadow-inner">
              {fizzing && (
                <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/90 animate-bounce delay-100" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping delay-200" />
                  <div className="w-3 h-3 rounded-full bg-white/80 animate-bounce delay-300" />
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-300 mb-1 select-none">
                {fizzing ? "Effervescing..." : "Vinegar + Soda"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-emerald-300 block">
          {isAnomaly
            ? "Limiting Reactant Hit: Adding >18g baking soda produces no extra inflation!"
            : reacted
            ? "Baking soda (base) + Vinegar (acid) $\\rightarrow$ Carbon Dioxide gas ($CO_2$) inflates the balloon!"
            : "Adjust baking soda quantity, then pour into vinegar to observe gas expansion."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Once all the acetic acid in the vinegar is consumed, leftover baking soda sits unreacted at the bottom."
            : "Chemical reactions can produce invisible gases that exert real physical pressure."}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// EXPERIMENT 3: SUGAR SATURATION & THERMAL SOLUBILITY
// ==================================================
function SugarSaturation({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [temperature, setTemperature] = useState(25); // Celsius
  const [spoons, setSpoons] = useState(1);

  // Maximum spoons soluble at current temp:
  // At 10°C = 2 spoons, At 25°C = 3 spoons, At 50°C = 6 spoons, At 80°C = 9 spoons
  const maxSoluble = Math.max(2, Math.floor(1 + (temperature / 8.5)));
  const dissolved = Math.min(spoons, maxSoluble);
  const undissolved = Math.max(0, spoons - maxSoluble);
  const isSaturated = spoons >= maxSoluble;
  const isAnomaly = spoons >= 6 && temperature >= 70 && undissolved === 0; // High thermal dissolution

  const handleAddSpoon = () => {
    if (spoons >= 12) return;
    const next = spoons + 1;
    setSpoons(next);
    recordAction('added_sugar_spoon', { spoons: next, temperature });
  };

  const handleReset = () => {
    setSpoons(1);
    setTemperature(25);
    recordAction('reset_sugar_cup', {});
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Water Temp:</span>
          <input
            type="range" min="10" max="80" step="5" value={temperature}
            onChange={e => {
              const val = parseInt(e.target.value);
              setTemperature(val);
              recordAction('changed_water_temp', { temperature: val, spoons });
            }}
            className="w-24 sm:w-32 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Water Temperature Slider"
          />
          <span className="text-xs font-mono text-gray-200">{temperature}°C ({temperature >= 60 ? "Hot" : temperature <= 20 ? "Cold" : "Warm"})</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleAddSpoon}
            disabled={spoons >= 12}
            className="min-h-[44px] px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            aria-label="Add Spoon of Sugar"
          >
            <span className="material-symbols-outlined text-sm">nutrition</span>
            <span>+ Spoon ({spoons})</span>
          </button>
          <button
            onClick={handleReset}
            className="min-h-[44px] px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl shadow text-xs transition-colors cursor-pointer"
            aria-label="Reset Cup"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Solution Status Pill */}
        <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 bg-slate-800 border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${undissolved > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-gray-200">
            {undissolved > 0
              ? `Saturated Solution (${undissolved} spoons crystal sediment at bottom)`
              : `Unsaturated (${dissolved} spoons fully dissolved)`}
          </span>
        </div>

        {/* Glass Cup */}
        <div className="relative w-36 sm:w-44 h-48 border-4 border-slate-400/80 border-t-0 rounded-b-3xl bg-slate-800/40 backdrop-blur-xs flex flex-col justify-end p-2 shadow-2xl overflow-hidden">
          {/* Steam Wafts (if Hot) */}
          {temperature >= 55 && (
            <div className="absolute top-2 inset-x-0 flex justify-center gap-2 pointer-events-none opacity-60">
              <span className="text-white text-xs animate-bounce">~</span>
              <span className="text-white text-xs animate-bounce delay-150">~</span>
              <span className="text-white text-xs animate-bounce delay-300">~</span>
            </div>
          )}

          {/* Liquid Volume */}
          <div
            className="w-full rounded-b-2xl relative flex flex-col justify-end items-center transition-all duration-300"
            style={{
              height: '70%',
              backgroundColor: undissolved > 0 ? 'rgba(251, 191, 36, 0.45)' : 'rgba(186, 230, 253, 0.45)',
              boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.2)'
            }}
          >
            {/* Dissolved sugar particles (visual dots) */}
            <div className="absolute inset-0 flex flex-wrap justify-around items-center p-2 opacity-50 pointer-events-none">
              {[...Array(Math.min(18, dissolved * 2))].map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-white/80" />
              ))}
            </div>

            {/* Undissolved Sugar Sediment Settled at Bottom */}
            {undissolved > 0 && (
              <div
                className="w-full bg-amber-100/90 border-t border-amber-300 rounded-b-xl transition-all duration-300 flex items-center justify-center shadow-md z-10"
                style={{ height: `${Math.min(40, undissolved * 8)}px` }}
              >
                <span className="text-[9px] font-black text-amber-950 uppercase tracking-tight select-none">
                  {undissolved} Spoons Sediment
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly
            ? "Thermal Dissolution: Heating water to 70°C dissolved the settled sugar crystals!"
            : isSaturated
            ? "Saturation point reached: Extra sugar cannot dissolve and settles as crystals."
            : "Sugar dissolves between water molecules until the saturation limit is met."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Heat increases kinetic energy and expands spaces between water molecules, vastly increasing solubility."
            : "Observe how temperature directly governs maximum solubility without needing more liquid."}
        </p>
      </div>
    </div>
  );
}

// ==================================================
// EXPORT LEVEL CONTAINER
// ==================================================
export function KitchenChemistryLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <TurmericIndicator recordAction={recordAction} />}
      {experimentSubIndex === 1 && <SodaVinegarBalloon recordAction={recordAction} />}
      {experimentSubIndex === 2 && <SugarSaturation recordAction={recordAction} />}
    </div>
  );
}
