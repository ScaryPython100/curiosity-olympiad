"use client";

import { useState } from 'react';

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ attractorMass, launchSpeed, recordAction }: any) {
  const [bladeCount, setBladeCount] = useState<3 | 4 | 5>(3);
  const [showBreezeLines, setShowBreezeLines] = useState(true);

  const fanSpeedRpm = Math.round(attractorMass * 2 * 60 + launchSpeed);
  const spinDurationSec = Math.max(0.15, 2.0 / (attractorMass * 1.2));
  const breezeDurationSec = Math.max(0.25, 2.5 - (launchSpeed / 200));

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/95 p-2 rounded-xl border border-slate-700 text-xs z-20 shadow-md">
        <span className="text-gray-300 font-bold mr-1">Fan Blades:</span>
        {([3, 4, 5] as const).map((count) => (
          <button
            key={count}
            onClick={() => setBladeCount(count)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${bladeCount === count ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {count}
          </button>
        ))}
        <button
          onClick={() => setShowBreezeLines(prev => !prev)}
          className={`ml-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${showBreezeLines ? 'bg-cyan-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          {showBreezeLines ? 'Hide Air' : 'Show Air'}
        </button>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center my-auto overflow-hidden">
        <svg
          viewBox="0 0 280 280"
          className="w-[50%] max-w-[280px] aspect-square overflow-visible z-10"
        >
          <defs>
            <radialGradient id="hubGold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>
            <linearGradient id="bladeWood" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="bracketGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <filter id="fanShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
            </filter>
          </defs>

          <g
            style={{
              transformOrigin: '140px 140px',
              animation: `spin ${spinDurationSec}s linear infinite`,
            }}
          >
            {Array.from({ length: bladeCount }).map((_, bIdx) => {
              const rotDeg = (360 / bladeCount) * bIdx;
              return (
                <g key={bIdx} transform={`rotate(${rotDeg}, 140, 140)`}>
                  <rect x="162" y="136" width="22" height="8" rx="3" fill="url(#bracketGold)" stroke="#fcd34d" strokeWidth="1" />
                  <path d="M 180,131 C 220,123 255,129 260,139 C 265,149 230,157 180,149 Z" fill="url(#bladeWood)" stroke="#fcd34d" strokeWidth="1.5" filter="url(#fanShadow)" />
                  <circle cx="192" cy="140" r="2.5" fill="#fef08a" />
                  <circle cx="245" cy="140" r="2.5" fill="#fef08a" opacity="0.8" />
                </g>
              );
            })}
          </g>

          <g filter="url(#fanShadow)">
            <circle cx="140" cy="140" r="32" fill="#451a03" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="140" cy="140" r="26" fill="url(#hubGold)" stroke="#fcd34d" strokeWidth="2" />
            <circle cx="140" cy="140" r="14" fill="#78350f" stroke="#fcd34d" strokeWidth="1.5" />
            <circle cx="140" cy="140" r="6" fill="#fef08a" />
            <circle cx="140" cy="116" r="2" fill="#fcd34d" />
            <circle cx="140" cy="164" r="2" fill="#fcd34d" />
            <circle cx="116" cy="140" r="2" fill="#fcd34d" />
            <circle cx="164" cy="140" r="2" fill="#fcd34d" />
          </g>
        </svg>

        {showBreezeLines && (
          <div className="absolute inset-0 flex justify-around pointer-events-none opacity-60 z-0 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((line) => (
              <div key={line} className="w-1.5 h-full relative flex flex-col justify-around">
                <div
                  className="w-full bg-gradient-to-b from-cyan-400 via-sky-300 to-transparent rounded-full shadow-[0_0_12px_#38bdf8] animate-bounce"
                  style={{
                    height: `${25 + (line % 3) * 15}%`,
                    animationDuration: `${breezeDurationSec / (0.8 + (line % 3) * 0.2)}s`,
                    animationIterationCount: 'infinite',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/95 px-3 py-2 rounded-xl border border-slate-700 text-center shadow-lg z-20">
        <span className="text-xs sm:text-sm font-bold text-cyan-300 block">
          🌀 Fast Wind!
        </span>
        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
          {bladeCount === 3 ? "3 blades spin very fast and push lots of air." : `${bladeCount} blades push air quietly.`}
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ attractorMass, launchSpeed, recordAction }: any) {
  const [isHit, setIsHit] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 10, y: 80 });

  const hitBall = () => {
    if (isHit) return;
    setIsHit(true);
    recordAction('hit_cricket_ball');
    
    const power = launchSpeed / 10; // 10 to 50
    const angle = (attractorMass) * 30; // 15 to 75 degrees
    const radian = angle * (Math.PI / 180);
    
    let t = 0;
    const interval = setInterval(() => {
      t += 0.15;
      const x = 10 + (power * Math.cos(radian) * t);
      // y = v*t - 0.5*g*t^2
      const y = 80 - (power * Math.sin(radian) * t) + (0.5 * 9.8 * t * t);
      
      if (y > 80 || x > 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsHit(false);
          setBallPosition({ x: 10, y: 80 });
        }, 1000);
      } else {
        setBallPosition({ x, y });
      }
    }, 50);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-400 via-sky-300 to-green-500 flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      {/* Sun */}
      <div className="absolute top-5 right-5 w-16 h-16 bg-yellow-400 rounded-full shadow-[0_0_30px_#facc15]"></div>

      {/* Clouds */}
      <div className="absolute top-10 left-10 w-20 h-8 bg-white rounded-full opacity-80"></div>
      <div className="absolute top-16 right-32 w-24 h-10 bg-white rounded-full opacity-70"></div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-[25%] bg-green-600 border-t-4 border-green-700"></div>
      
      {/* Pitch */}
      <div className="absolute bottom-[10%] left-[10%] w-[30%] h-8 bg-amber-200 border border-amber-300"></div>
      
      {/* Stumps */}
      <div className="absolute bottom-[10%] left-[10%] flex gap-0.5">
        <div className="w-1 h-8 bg-orange-800"></div>
        <div className="w-1 h-8 bg-orange-800"></div>
        <div className="w-1 h-8 bg-orange-800"></div>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center my-auto">
        <div 
          className="absolute w-4 h-4 rounded-full bg-red-600 border border-white shadow-lg z-20"
          style={{ left: `${ballPosition.x}%`, top: `${ballPosition.y}%`, transition: 'left 0.05s linear, top 0.05s linear' }}
        ></div>
        {/* Bat */}
        {!isHit && (
           <div className="absolute w-2 h-16 bg-orange-300 border border-orange-700 origin-bottom shadow-lg z-10"
                style={{ left: `9%`, top: `70%`, transform: `rotate(${isHit ? -45 : 0}deg)` }}>
           </div>
        )}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/95 px-3 py-2 rounded-xl border border-slate-700 text-center shadow-lg z-20">
        <button
          onClick={hitBall}
          disabled={isHit}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-sm mb-2 disabled:opacity-50"
        >
          {isHit ? "Ball is flying!" : "HIT BALL"}
        </button>
        <span className="text-xs sm:text-sm font-bold text-yellow-300 block">
          🏏 Big Hit!
        </span>
        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
          Gravity always pulls the ball back to the ground.
        </p>
      </div>
    </div>
  );
}

function ExperimentThree({ attractorMass, launchSpeed, recordAction }: any) {
  const [isVacuumActive, setIsVacuumActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [ballProgress, setBallProgress] = useState(0); 
  const [featherProgress, setFeatherProgress] = useState(0); 

  const triggerDropAnimation = () => {
    if (isDropping) return;
    recordAction('triggered_freefall_drop', { isVacuumActive });
    setIsDropping(true);
    setBallProgress(0);
    setFeatherProgress(0);

    let ballP = 0;
    let featherP = 0;

    const interval = setInterval(() => {
      ballP += 5;
      featherP += isVacuumActive ? 5 : 2; 

      setBallProgress(Math.min(100, ballP));
      setFeatherProgress(Math.min(100, featherP));

      if (ballP >= 100 && featherP >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsDropping(false), 1000);
      }
    }, 50);
  };

  const altitudeMeters = Math.round(launchSpeed * 2);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-500 via-sky-300 to-green-600 flex flex-col items-center justify-between p-3 overflow-hidden gap-2">
      
      {/* Background scenery for school roof */}
      <div className="absolute bottom-0 w-full h-[20%] bg-green-600"></div>
      <div className="absolute bottom-[20%] w-[60%] h-[50%] bg-orange-100 border-4 border-orange-300 flex flex-col justify-end">
        <div className="flex justify-around mb-4">
          <div className="w-8 h-12 bg-blue-300 border-2 border-blue-400"></div>
          <div className="w-8 h-12 bg-blue-300 border-2 border-blue-400"></div>
        </div>
      </div>
      <div className="absolute top-[30%] w-[65%] h-4 bg-orange-500"></div>

      <div className="w-full max-w-md h-8 bg-white/90 border-2 border-gray-300 rounded-xl flex items-center justify-between px-3 shadow-md z-10 shrink-0 mt-2">
        <span className="text-[10px] font-bold text-gray-800">School Roof</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isVacuumActive ? 'bg-indigo-600 text-white' : 'bg-sky-500 text-white'}`}>
            {isVacuumActive ? 'No Air (Vacuum)' : 'Normal Air'}
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-md flex-1 flex justify-around px-2 py-4 z-10">
        <div className="relative w-20 sm:w-28 h-full border-r border-dashed border-gray-400/50 flex flex-col items-center justify-between">
          <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full text-center shadow-lg">Heavy Stone</span>
          <div 
            className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-400 shadow-lg flex items-center justify-center absolute transition-all duration-75"
            style={{ top: `${Math.min(90, ballProgress)}%`, transform: 'translateY(-50%)' }}
          />
        </div>

        <div className="relative w-20 sm:w-28 h-full flex flex-col items-center justify-between">
          <span className="text-[10px] font-bold text-white bg-green-800 px-2 py-0.5 rounded-full text-center shadow-lg">Dry Leaf</span>
          <div 
            className="w-8 h-4 bg-green-500 border border-green-400 rounded-[50%] shadow-lg flex items-center justify-center absolute transition-all duration-75"
            style={{ top: `${Math.min(90, featherProgress)}%`, transform: 'translateY(-50%) rotate(15deg)' }}
          >
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-2 border-2 border-gray-200 rounded-xl flex items-center justify-between gap-2 z-10 shrink-0 shadow-lg mb-2">
        <button
          onClick={() => setIsVacuumActive(prev => !prev)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all text-center ${isVacuumActive ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {isVacuumActive ? 'Add Air Back' : 'Remove Air'}
        </button>
        <button
          onClick={triggerDropAnimation}
          disabled={isDropping}
          className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-black text-[10px] sm:text-xs uppercase shadow-md active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isDropping ? 'Falling...' : 'Drop Both'}
        </button>
      </div>
    </div>
  );
}

// --- MAIN EXPORT COMPONENT ---

interface GravityLevelProps {
  recordAction: (actionType: string, actionDetails?: any) => void;
  experimentSubIndex?: number;
}

export function GravityLevel({ recordAction, experimentSubIndex = 0 }: GravityLevelProps) {
  const [attractorMass, setAttractorMass] = useState(1.0);
  const [launchSpeed, setLaunchSpeed] = useState(250);

  const expInfo = [
    {
      title: "Table Fan Game",
      objective: "Change the fan speed and see how blades make wind.",
      slider1Label: "Fan Speed",
      slider1Val: "",
      slider2Label: "Air Speed",
      slider2Val: ""
    },
    {
      title: "Cricket Shot Game",
      objective: "Hit the ball and watch gravity pull it down.",
      slider1Label: "Bat Angle",
      slider1Val: "",
      slider2Label: "Hit Power",
      slider2Val: ""
    },
    {
      title: "Dropping Things Game",
      objective: "Drop a stone and a leaf from the roof to see which hits the ground first.",
      slider1Label: "Stone Weight",
      slider1Val: "",
      slider2Label: "Roof Height",
      slider2Val: ""
    }
  ][experimentSubIndex] || {
    title: "Table Fan Game",
    objective: "Change the fan speed and see how blades make wind.",
    slider1Label: "Fan Speed",
    slider1Val: "",
    slider2Label: "Air Speed",
    slider2Val: ""
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Level Header */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex flex-wrap justify-between items-center gap-2 shrink-0 z-30 relative">
        <div className="flex-1 pr-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100 flex items-center gap-2">
             <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded text-white uppercase tracking-wider">Game {experimentSubIndex + 1}</span>
             {expInfo.title}
          </h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            <strong>Goal:</strong> {expInfo.objective}
          </p>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="bg-gray-900/90 border-b border-gray-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300 shrink-0 z-30 relative">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider1Label}</span>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={attractorMass}
            onChange={(e) => {
              setAttractorMass(parseFloat(e.target.value));
              recordAction('changed_attractor_mass', { val: parseFloat(e.target.value) });
            }}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-300">{expInfo.slider2Label}</span>
          <input
            type="range"
            min="100"
            max="500"
            step="20"
            value={launchSpeed}
            onChange={(e) => {
              setLaunchSpeed(parseInt(e.target.value));
              recordAction('changed_launch_speed', { val: parseInt(e.target.value) });
            }}
            className="w-24 md:w-32 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Strict Conditional Rendering Container */}
      <div className="flex-1 w-full relative overflow-hidden bg-gray-950">
        {experimentSubIndex === 0 && (
          <ExperimentOne 
            attractorMass={attractorMass} 
            launchSpeed={launchSpeed} 
            recordAction={recordAction} 
          />
        )}
        {experimentSubIndex === 1 && (
          <ExperimentTwo 
            attractorMass={attractorMass} 
            launchSpeed={launchSpeed} 
            recordAction={recordAction} 
          />
        )}
        {experimentSubIndex === 2 && (
          <ExperimentThree 
            attractorMass={attractorMass} 
            launchSpeed={launchSpeed} 
            recordAction={recordAction} 
          />
        )}
      </div>
    </div>
  );
}
