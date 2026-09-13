"use client";

import React, { useState } from 'react';

function PaperBoat({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [stones, setStones] = useState(0);
  const [boatShape, setBoatShape] = useState<"Flat" | "Narrow">("Flat");

  const capacity = boatShape === "Flat" ? 8 : 3;
  const isSunk = stones > capacity;
  const isAnomaly = boatShape === "Narrow" && stones === 4;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400">Hull Shape:</span>
          <div className="flex gap-1">
            {(["Flat", "Narrow"] as const).map(shape => (
              <button 
                key={shape}
                onClick={() => { setBoatShape(shape); setStones(0); recordAction('changed_shape', { val: shape }); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${boatShape === shape ? 'bg-sky-500 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setStones(s => s + 1); recordAction('added_stone', { val: stones + 1 }); }} 
            disabled={isSunk || stones >= 10} 
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-1 px-2.5 rounded shadow text-xs"
          >
            + Stone ({stones})
          </button>
          <button 
            onClick={() => { setStones(0); recordAction('reset_stones', {}); }} 
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-1 px-2 rounded shadow text-xs"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-sky-200 overflow-hidden flex flex-col items-center justify-end p-2">
        {/* Water Pool */}
        <div className="w-full max-w-sm h-36 bg-blue-500/80 rounded-b-2xl border-t-4 border-blue-400 flex justify-center relative shadow-inner">
          {/* Paper Boat */}
          <div 
            className={`absolute transition-all duration-500 flex flex-col items-center justify-end ${
              boatShape === 'Flat' ? 'w-36 sm:w-44 h-10' : 'w-20 sm:w-24 h-12'
            } ${
              isSunk ? 'bottom-2 rotate-12 opacity-60' : 'top-0 -translate-y-1/2'
            }`}
          >
            {/* Stones */}
            <div className="flex flex-wrap justify-center gap-0.5 mb-0.5 max-w-[85%] z-10">
              {[...Array(stones)].map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 bg-gray-700 rounded-full border border-gray-900 shadow" />
              ))}
            </div>
            
            {/* Paper Fold Hull */}
            <div 
              className="w-full h-full bg-white relative shadow-lg border border-gray-300"
              style={{ clipPath: boatShape === 'Flat' ? 'polygon(10% 0, 90% 0, 100% 100%, 0 100%)' : 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }}
            />
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">
          {isAnomaly ? "The narrow boat capsized and sank at only 4 stones!" : isSunk ? "Overloaded — Boat Submerged" : "Boat Floating Stably"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "A flat-bottomed boat displaces water across a wider surface area, generating greater buoyant counter-force than a narrow hull." 
            : "Add weight to find the maximum stone load before buoyancy is overwhelmed."}
        </p>
      </div>
    </div>
  );
}

function EggSaltWater({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [salt, setSalt] = useState(0);

  const isFloating = salt >= 60;
  const isAnomaly = salt === 50 && !isFloating;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-200">Dissolved Salt</span>
          <input 
            type="range" min="0" max="100" step="10" value={salt} 
            onChange={e => { setSalt(parseInt(e.target.value)); recordAction('changed_salt', {val: parseInt(e.target.value)}); }} 
            className="w-24 sm:w-32 accent-gray-200 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{salt}%</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Glass Beaker */}
        <div className="w-32 sm:w-36 h-44 border-4 border-white/30 rounded-b-3xl relative overflow-hidden bg-white/5 flex flex-col justify-end shadow-2xl">
          {/* Saline Water */}
          <div className="absolute bottom-0 w-full h-[88%] bg-sky-500/30 transition-colors duration-500">
            {salt > 0 && (
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:8px_8px]" />
            )}
          </div>

          {/* Egg */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-9 h-12 bg-amber-100 rounded-full border border-amber-200 shadow-lg transition-all duration-700 z-10 flex items-center justify-center"
            style={{ bottom: isFloating ? '65%' : '6%' }}
          >
            <span className="text-[8px] font-bold text-amber-900/50 uppercase">Egg</span>
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">
          {isAnomaly ? "Even at 50% salt, the egg remains at the bottom!" : isFloating ? "Threshold Passed — Egg Floats to Top!" : "Freshwater — Egg Sinks to Bottom"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Buoyancy is a strict density threshold, not a gradual ramp. Water must become denser than the egg before any flotation occurs!" 
            : "Dissolve salt to increase water density until it exceeds the egg's average density."}
        </p>
      </div>
    </div>
  );
}

function OilAndWater({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [pourOrder, setPourOrder] = useState<"Water First" | "Oil First">("Water First");
  const [mixed, setMixed] = useState(false);
  
  const isAnomaly = pourOrder === "Oil First" && !mixed;

  const handleStir = () => {
    setMixed(true);
    recordAction('stirred_liquids', { pourOrder });
    setTimeout(() => {
      setMixed(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Pour Order:</span>
          <div className="flex gap-1">
            {(["Water First", "Oil First"] as const).map(order => (
              <button 
                key={order}
                onClick={() => { setPourOrder(order); setMixed(false); recordAction('changed_order', { val: order }); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${pourOrder === order ? 'bg-amber-500 text-amber-950' : 'bg-gray-700 text-gray-300'}`}
              >
                {order}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={handleStir} 
          disabled={mixed} 
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 active:scale-95 text-white font-bold py-1 px-3 rounded shadow text-xs transition-transform"
        >
          STIR VIGOROUSLY 🌪️
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Glass */}
        <div className="w-28 sm:w-32 h-44 border-4 border-white/40 bg-white/5 rounded-b-2xl relative overflow-hidden shadow-2xl flex flex-col justify-end">
          {mixed ? (
            <div className="w-full h-[85%] bg-amber-200/80 flex flex-wrap content-start p-1.5 gap-1 animate-pulse">
              {[...Array(24)].map((_, i) => <div key={i} className="w-2 h-2 bg-yellow-500 rounded-full" />)}
            </div>
          ) : (
            <div className="w-full h-[85%] flex flex-col transition-all duration-700">
              {/* Mustard Oil (top) */}
              <div className="w-full flex-1 bg-yellow-400/85 border-b border-yellow-500 flex items-center justify-center shadow-inner">
                <span className="font-bold text-yellow-950 text-[10px] tracking-wider uppercase">Mustard Oil</span>
              </div>
              {/* Water (bottom) */}
              <div className="w-full flex-1 bg-blue-500/70 flex items-center justify-center shadow-inner">
                <span className="font-bold text-blue-950 text-[10px] tracking-wider uppercase">Water</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly ? "Oil was poured first, yet it still rose to the top!" : mixed ? "Emulsion Formed — Settling Shortly..." : "Density Stratification"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Pour order and stirring are irrelevant to equilibrium. Mustard oil is less dense than water, so buoyant forces always push it to the top layer." 
            : "Observe how two immiscible fluids spontaneously separate based purely on density."}
        </p>
      </div>
    </div>
  );
}

export function BuoyancyLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <PaperBoat recordAction={recordAction} />}
      {experimentSubIndex === 1 && <EggSaltWater recordAction={recordAction} />}
      {experimentSubIndex === 2 && <OilAndWater recordAction={recordAction} />}
    </div>
  );
}
