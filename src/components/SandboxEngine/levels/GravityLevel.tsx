"use client";

import { useState } from 'react';

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [fanSpeed, setFanSpeed] = useState(1);
  const [bladeType, setBladeType] = useState<"Flat" | "Angled">("Angled");
  
  const windReach = bladeType === "Flat" ? fanSpeed * 5 : fanSpeed * 20; 
  const isAnomaly = bladeType === "Flat" && fanSpeed === 5;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sky-400">Fan Speed</span>
            <span className="text-[11px] font-mono text-gray-400">Speed {fanSpeed}</span>
          </div>
          <input
            type="range" min="1" max="5" step="1" value={fanSpeed}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setFanSpeed(val);
              recordAction('changed_fan_speed', { val });
            }}
            className="w-full accent-sky-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <span className="font-bold text-sky-400 text-[11px]">Blades:</span>
          <div className="flex gap-1.5">
            {(["Flat", "Angled"] as const).map(bt => (
              <button 
                key={bt}
                type="button"
                onClick={() => {
                  setBladeType(bt);
                  recordAction('changed_blade_type', { val: bt });
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${bladeType === bt ? 'bg-sky-500 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] flex items-center justify-between px-6 overflow-hidden bg-slate-900">
        {/* Fan graphic */}
        <div className="relative w-24 h-40 flex flex-col items-center justify-end shrink-0 z-10">
          <div className="w-20 h-20 rounded-full border-4 border-slate-700 bg-slate-800 absolute top-0 flex items-center justify-center overflow-hidden shadow-lg">
            <div 
               className="w-full h-full relative origin-center"
               style={{ animation: `spin ${6 - fanSpeed}s linear infinite` }}
            >
              {[0, 120, 240].map(deg => (
                <div 
                  key={deg} 
                  className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-8 ${bladeType === 'Angled' ? 'bg-sky-400 skew-x-12' : 'bg-slate-500'} rounded-t-full origin-bottom opacity-80`}
                  style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}
                />
              ))}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full border-2 border-slate-600 z-10" />
            </div>
          </div>
          <div className="w-3 h-20 bg-slate-700 mt-10 rounded-t" />
          <div className="w-16 h-3 bg-slate-800 rounded-t-xl" />
        </div>

        {/* Airflow Lines */}
        <div className="flex-1 h-20 relative mx-4 overflow-hidden flex items-center">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="absolute h-0.5 bg-sky-200/50 rounded-full"
              style={{ 
                left: 0, 
                top: `${20 + i*20}%`, 
                width: `${windReach}%`,
                animation: fanSpeed > 0 && windReach > 10 ? `dash ${1.5 / fanSpeed}s linear infinite` : 'none' 
              }}
            />
          ))}
        </div>

        {/* Cooling Target Zone */}
        <div className="w-12 h-28 border-2 border-dashed border-sky-400/80 rounded-lg flex items-center justify-center bg-sky-950/30 shrink-0">
          <span className="text-[10px] text-sky-300 font-bold uppercase rotate-90 whitespace-nowrap">Target</span>
        </div>

        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes dash { 0% { transform: translateX(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(50px); opacity: 0; } }
        `}</style>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">{isAnomaly ? "Why is there no breeze?" : "Airflow Reach"}</span>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
          {isAnomaly 
            ? "The fan is at maximum speed, but flat blades cannot push air forward! Angled blades are required to direct air." 
            : "Adjust fan speed and blade angle to direct the airflow to the target."}
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [hitPower, setHitPower] = useState(50);
  const [batAngle, setBatAngle] = useState(45);
  const [distance, setDistance] = useState(0);

  const calculateHit = () => {
    const v = hitPower;
    const theta = (batAngle * Math.PI) / 180;
    const g = 9.8;
    const calcDist = (v * v * Math.sin(2 * theta)) / g;
    setDistance(calcDist);
    recordAction('triggered_cricket_hit', { power: hitPower, angle: batAngle, distance: calcDist });
  };

  const distancePct = Math.min(100, (distance / 1020) * 100);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-400">Power</span>
            <span className="text-[11px] font-mono text-gray-400">{hitPower}%</span>
          </div>
          <input
             type="range" min="10" max="100" step="10" value={hitPower}
             onChange={e => { const val = parseInt(e.target.value); setHitPower(val); recordAction('changed_hit_power', {val}); }}
             className="w-full accent-red-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-400">Angle</span>
            <span className="text-[11px] font-mono text-gray-400">{batAngle}°</span>
          </div>
          <input
             type="range" min="0" max="90" step="15" value={batAngle}
             onChange={e => { const val = parseInt(e.target.value); setBatAngle(val); recordAction('changed_bat_angle', {val}); }}
             className="w-full accent-red-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>
        <button onClick={calculateHit} className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-bold py-2 md:py-1 px-4 rounded-xl shadow text-xs shrink-0 cursor-pointer active:scale-95">HIT BALL</button>
      </div>

      <div className="relative flex-1 min-h-[220px] flex flex-col justify-end overflow-hidden bg-gradient-to-b from-sky-400 to-sky-100 p-2">
        {/* Ball Trajectory Area */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
          {distance > 0 && (
            <div 
              className="absolute bottom-10 bg-red-600 w-4 h-4 rounded-full shadow-[0_0_10px_red] transition-all duration-700 ease-out flex items-center justify-center"
              style={{ left: `calc(${distancePct * 0.8}% + 10px)` }}
            >
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          )}
        </div>

        {/* Cricket Pitch Ground */}
        <div className="w-full h-8 bg-green-600 border-t-4 border-green-700 relative z-10 flex items-center justify-between px-4">
          <div className="h-4 w-1 bg-amber-200" />
          <div className="h-4 w-1 bg-white shadow flex items-center justify-center">
            <span className="absolute -top-5 text-[9px] font-bold text-gray-700 bg-white/90 px-1 rounded">Boundary</span>
          </div>
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-gray-100 block">
          Distance Hit: {Math.round(distance)} meters
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {distance > 0 && hitPower === 100 && batAngle === 0 
            ? "You hit it with maximum power, but flat on the ground! Without launch angle, power alone cannot clear the field." 
            : "Experiment with power and bat angle to hit the cricket ball as far as possible."}
        </p>
      </div>
    </div>
  );
}

function ExperimentThree({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [roofHeight, setRoofHeight] = useState(50);
  const [isVacuum, setIsVacuum] = useState(false);
  const [falling, setFalling] = useState(false);
  const [ballLanded, setBallLanded] = useState(false);
  const [leafLanded, setLeafLanded] = useState(false);

  const handleDrop = () => {
    setFalling(true);
    setBallLanded(false);
    setLeafLanded(false);
    recordAction('dropped_objects', { roofHeight, isVacuum });

    // In vacuum both fall together!
    const fallTime = Math.sqrt(roofHeight) * 300;
    setTimeout(() => {
      setBallLanded(true);
      if (isVacuum) setLeafLanded(true);
    }, fallTime);

    if (!isVacuum) {
      setTimeout(() => {
        setLeafLanded(true);
      }, fallTime * 2.2); // Leaf flutters slower due to air drag
    }

    setTimeout(() => {
      setFalling(false);
    }, fallTime * 2.4);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-purple-400">Roof Height</span>
            <span className="text-[11px] font-mono text-gray-400">{roofHeight}m</span>
          </div>
          <input
             type="range" min="30" max="80" step="10" value={roofHeight} disabled={falling}
             onChange={e => { const val = parseInt(e.target.value); setRoofHeight(val); recordAction('changed_roof_height', {val}); }}
             className="w-full accent-purple-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input 
              type="checkbox" 
              checked={isVacuum} 
              disabled={falling}
              onChange={(e) => { setIsVacuum(e.target.checked); recordAction('toggled_vacuum', { val: e.target.checked }); }} 
              className="accent-purple-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-bold text-gray-300 text-[11px]">Vacuum Chamber</span>
          </label>
          <button onClick={handleDrop} disabled={falling} className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-bold py-1.5 px-4 rounded-xl shadow text-xs cursor-pointer active:scale-95">DROP</button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] flex flex-col justify-end overflow-hidden bg-slate-800 p-2">
        {/* School Roof Structure */}
        <div className="absolute bottom-0 left-[8%] w-[28%] bg-slate-700 border-t-4 border-slate-600 z-10 flex items-start justify-center pt-1" style={{ height: `${roofHeight}%` }}>
           <span className="text-slate-400 text-[9px] font-bold uppercase">Roof</span>
        </div>

        {/* Falling Stone */}
        <div 
          className="absolute z-20 w-6 h-6 bg-gray-400 rounded-full shadow-lg flex items-center justify-center transition-all ease-in"
          style={{ 
            left: '18%', 
            bottom: falling ? '4%' : `${roofHeight}%`, 
            transitionDuration: falling ? '1s' : '0s' 
          }}
        >
          <span className="text-[7px] font-bold text-gray-900">Stone</span>
        </div>

        {/* Falling Leaf */}
        <div 
          className="absolute z-20 w-8 h-4 bg-green-500 rounded-full shadow-lg flex items-center justify-center transition-all ease-in"
          style={{ 
            left: '26%', 
            bottom: falling ? '4%' : `${roofHeight}%`, 
            transitionDuration: falling ? (isVacuum ? '1s' : '1.8s') : '0s' 
          }}
        >
          <span className="text-[7px] font-bold text-green-950">Leaf</span>
        </div>

        <div className="w-full h-4 bg-emerald-700 relative z-30" />
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-purple-300 block">
          {isVacuum ? "Freefall in Vacuum" : "Freefall in Normal Air"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {(ballLanded || leafLanded) && isVacuum 
            ? "In a vacuum with no air resistance, the heavy stone and the light leaf hit the ground at the exact same instant!" 
            : "In normal air, air drag slows the leaf down. Turn on Vacuum Mode to remove air resistance!"}
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
