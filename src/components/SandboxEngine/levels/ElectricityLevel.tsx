"use client";

import React, { useState } from 'react';

function CombHair({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [rubCount, setRubCount] = useState(0);
  const [humidity, setHumidity] = useState(20);
  const [testing, setTesting] = useState(false);

  const isAnomaly = humidity > 70 && rubCount >= 10;
  
  let bitsPickedUp = Math.min(10, Math.floor(rubCount / 2));
  if (humidity > 70) bitsPickedUp = Math.min(1, bitsPickedUp);

  const handleTest = () => {
    setTesting(true);
    recordAction('tested_comb', { rubCount, humidity, bitsPickedUp });
    setTimeout(() => {
      setTesting(false);
      setRubCount(0);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setRubCount(r => r + 1); recordAction('rubbed_comb', { val: rubCount + 1 }); }} 
            className="bg-yellow-600 hover:bg-yellow-500 active:scale-95 text-white font-bold py-1 px-2.5 rounded shadow text-xs transition-transform"
          >
            RUB COMB ⚡ ({rubCount})
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400">Humidity</span>
          <input 
            type="range" min="10" max="90" step="20" value={humidity} 
            onChange={e => { setHumidity(parseInt(e.target.value)); recordAction('changed_humidity', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-sky-500 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{humidity}%</span>
        </div>
        <button 
          onClick={handleTest} 
          disabled={testing || rubCount === 0} 
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 active:scale-95 text-white font-bold py-1 px-3 rounded shadow text-xs transition-transform"
        >
          TEST ON PAPER
        </button>
      </div>
      
      <div className={`relative flex-1 min-h-[220px] overflow-hidden flex flex-col items-center justify-center p-3 transition-colors duration-500 ${
        humidity > 70 ? 'bg-slate-900' : 'bg-amber-950/40'
      }`}>
        <div className="bg-white/90 px-3 py-0.5 rounded-full shadow text-[11px] font-bold text-gray-800 mb-6 border border-gray-200">
          {humidity > 70 ? "🌧️ Monsoon / Humid Air" : "☀️ Dry Weather"}
        </div>

        <div className="flex flex-col items-center relative">
          {/* Comb Graphic */}
          <div className={`w-28 sm:w-32 h-8 bg-gray-900 rounded-t border-t-2 border-gray-700 flex gap-0.5 items-end p-0.5 transition-transform duration-500 shadow-xl ${
            testing ? 'translate-y-8' : ''
          }`}>
            {[...Array(14)].map((_, i) => <div key={i} className="flex-1 h-5 bg-gray-800 rounded-b" />)}
            {!testing && rubCount > 5 && humidity <= 70 && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs text-yellow-400 animate-pulse font-bold">⚡ Charged</span>
            )}
          </div>

          {/* Paper Bits Row */}
          <div className="w-36 sm:w-44 h-2 bg-amber-800 mt-14 relative rounded-full shadow">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-2.5 h-2.5 bg-white border border-gray-300 transition-all duration-500 shadow"
                style={{ 
                  left: `${8 + i * 8.5}%`, 
                  bottom: (testing && i < bitsPickedUp) ? '24px' : '0',
                  transform: `rotate(${i * 20}deg)`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-yellow-400 block">
          {isAnomaly && testing ? "Why didn't the comb attract the paper?" : "Electrostatic Charge"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly && testing 
            ? "Moisture in humid air acts as a conductor, letting the built-up static charge leak into the air before it can lift paper!" 
            : "Rub the plastic comb to build static electrons, then test how many paper scraps it lifts."}
        </p>
      </div>
    </div>
  );
}

function TorchCircuit({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [batteries, setBatteries] = useState(1);
  const [wireGap, setWireGap] = useState(false);

  const isLit = !wireGap;
  const isAnomaly = wireGap && batteries === 2;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400">Batteries:</span>
          <div className="flex gap-1">
            {[1, 2].map(b => (
              <button 
                key={b}
                onClick={() => { setBatteries(b); recordAction('changed_batteries', { val: b }); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${batteries === b ? 'bg-yellow-500 text-yellow-950' : 'bg-gray-700 text-gray-300'}`}
              >
                {b} Cell{b > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-red-400">
          <input 
            type="checkbox" 
            checked={wireGap} 
            onChange={e => { setWireGap(e.target.checked); recordAction('toggled_gap', { val: e.target.checked }); }} 
            className="accent-red-500"
          />
          <span>Loose Connection (Gap)</span>
        </label>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Bulb Glow */}
        {isLit && (
          <div 
            className="absolute top-0 w-full bg-gradient-to-b from-yellow-300/30 to-transparent blur-lg transition-all duration-300 pointer-events-none"
            style={{ height: `${batteries * 50}%` }}
          />
        )}

        <div className="flex flex-col items-center relative z-10">
          {/* Bulb */}
          <div className={`w-10 h-12 rounded-t-full border-2 border-gray-600 flex justify-center items-end pb-1 transition-all duration-300 ${
            isLit ? 'bg-yellow-200 shadow-[0_0_35px_#fef08a]' : 'bg-gray-800'
          }`}>
            <div className={`w-3 h-3 rounded-full ${isLit ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'}`} />
          </div>
          <div className="w-12 h-2 bg-gray-600 rounded-b" />

          {/* Wires */}
          <div className="flex w-24 h-10 relative">
            <div className="absolute left-0 w-1.5 h-full bg-red-500 rounded-l" />
            <div className="absolute right-0 flex flex-col items-center h-full">
              <div className="w-1.5 h-3 bg-gray-400" />
              <div className={`w-1.5 h-4 ${wireGap ? 'bg-transparent border border-red-500' : 'bg-gray-400'}`} />
              <div className="w-1.5 h-3 bg-gray-400" />
            </div>
          </div>

          {/* Battery Holder */}
          <div className="w-20 border-2 border-gray-700 rounded-lg bg-gray-900 flex flex-col items-center p-1.5 gap-1 shadow-lg">
            <div className="w-full h-8 bg-green-600 rounded flex items-center justify-center text-[8px] font-bold text-black border border-black shadow-inner">
              Cell 1
            </div>
            {batteries === 2 && (
              <div className="w-full h-8 bg-green-600 rounded flex items-center justify-center text-[8px] font-bold text-black border border-black shadow-inner">
                Cell 2
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-yellow-400 block">
          {isAnomaly ? "Why is it totally dark even with 2 batteries?" : isLit ? "Complete Circuit — Light On!" : "Circuit Broken — No Light"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Electricity requires an unbroken, closed loop to flow. A loose gap stops current completely, no matter how many batteries you stack!" 
            : "Ensure the loop is continuous to allow electric current to power the bulb."}
        </p>
      </div>
    </div>
  );
}

function MagnetTest({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [distance, setDistance] = useState(100);
  const [testObject, setTestObject] = useState<"Nail" | "Coin" | "Wood">("Nail");

  const isMagnetic = testObject === "Nail";
  const isAttracted = isMagnetic && distance < 40;
  const isAnomaly = testObject === "Coin" && distance < 20;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-fuchsia-400">Object:</span>
          <div className="flex gap-1">
            {(["Nail", "Coin", "Wood"] as const).map(obj => (
              <button 
                key={obj}
                onClick={() => { setTestObject(obj); setDistance(100); recordAction('changed_object', { val: obj }); }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${testObject === obj ? 'bg-fuchsia-500 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-fuchsia-400">Distance</span>
          <input 
            type="range" min="10" max="100" step="10" value={distance} 
            onChange={e => { setDistance(parseInt(e.target.value)); recordAction('changed_distance', {val: parseInt(e.target.value)}); }} 
            className="w-16 sm:w-24 accent-fuchsia-500 cursor-pointer" 
            dir="rtl" 
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4">
        <div className="relative w-full max-w-xs h-24 flex items-center border-b-2 border-slate-700">
          {/* Target Object */}
          <div className={`absolute left-4 bottom-1 transition-all duration-300 flex flex-col items-center ${
            isAttracted ? 'translate-x-24' : 'translate-x-0'
          }`}>
            {testObject === "Nail" && <div className="w-12 h-3 bg-gray-400 rounded border border-gray-300 shadow" />}
            {testObject === "Coin" && <div className="w-8 h-8 bg-yellow-400 rounded-full border border-yellow-500 shadow flex items-center justify-center font-bold text-[8px] text-yellow-900">₹5</div>}
            {testObject === "Wood" && <div className="w-10 h-5 bg-amber-800 rounded border border-amber-950 shadow" />}
            <span className="text-[9px] font-bold mt-1 text-gray-400">{testObject}</span>
          </div>

          {/* Horseshoe Magnet */}
          <div className="absolute bottom-1 transition-all duration-300 flex flex-col items-center" style={{ left: `${30 + distance * 0.5}%` }}>
            <div className="w-10 h-10 border-4 border-red-600 rounded-r-full flex flex-col justify-between p-0.5 bg-slate-900">
              <div className="w-2.5 h-1.5 bg-slate-300 rounded" />
              <div className="w-2.5 h-1.5 bg-slate-300 rounded" />
            </div>
            <span className="text-[9px] font-bold text-red-500 mt-0.5">Magnet</span>
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-fuchsia-300 block">
          {isAnomaly ? "The coin looks metallic, but it's not magnetic!" : isAttracted ? "Snap! Object Attracted" : "Testing Magnetic Attraction"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly 
            ? "Not all metals are magnetic! Common coins contain nickel/brass/aluminum alloys that do not attract to magnets." 
            : "Bring the magnet closer to determine whether the object contains ferromagnetic elements like iron or steel."}
        </p>
      </div>
    </div>
  );
}

export function ElectricityLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <CombHair recordAction={recordAction} />}
      {experimentSubIndex === 1 && <TorchCircuit recordAction={recordAction} />}
      {experimentSubIndex === 2 && <MagnetTest recordAction={recordAction} />}
    </div>
  );
}
