"use client";

import { useState } from 'react';
import { OptionalToolsDrawer } from '../OptionalToolsDrawer';

// --- SUB-COMPONENTS FOR STRICT CONDITIONAL RENDERING ---

function ExperimentOne({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [roomLight, setRoomLight] = useState(10);
  const [tvBrightness, setTvBrightness] = useState(80);
  const [tvShow, setTvShow] = useState<"Cartoon" | "Sports" | "News">("Cartoon");

  const isEyeStrain = roomLight < 30 && tvBrightness >= 40;
  const isGlare = roomLight > 70 && tvBrightness < 60;
  const isComfortable = !isEyeStrain && !isGlare;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar: Stacks vertically on mobile (<768px), horizontal row on desktop */}
      <div id="sandbox-slider-row" className="bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        {/* Room Light Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-amber-400">Room Light</span>
            <span className="text-[11px] font-mono text-gray-400">{roomLight}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={roomLight}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setRoomLight(val);
              recordAction('changed_room_light', { val });
            }}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>

        {/* TV Brightness Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-cyan-300">TV Brightness</span>
            <span className="text-[11px] font-mono text-gray-400">{tvBrightness}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={tvBrightness}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTvBrightness(val);
              recordAction('changed_tv_brightness', { val });
            }}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>

        {/* Comfort indicator & Optional Tools Drawer Trigger */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-gray-700">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Comfort:</span>
            <span className="text-base">{isComfortable ? "😌" : "😖"}</span>
          </div>
          
          <OptionalToolsDrawer
            title="TV Channel & Room Settings"
            description="Switch channels to test contrast differences."
            triggerLabel="Channels"
            icon="tv"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300 block">Select TV Broadcast:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["Cartoon", "Sports", "News"] as const).map((show) => (
                  <button
                    key={show}
                    type="button"
                    onClick={() => {
                      setTvShow(show);
                      recordAction('changed_tv_show', { val: show });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                      tvShow === show 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {show}
                  </button>
                ))}
              </div>
            </div>
          </OptionalToolsDrawer>
        </div>
      </div>

      {/* Show Selector Inline Bar for Desktop / Quick Access */}
      <div className="hidden md:flex bg-gray-900/80 border-b border-gray-800 px-3 py-1.5 items-center justify-center gap-2 text-xs shrink-0">
        <span className="text-gray-400 font-bold text-[11px]">Channel:</span>
        {(["Cartoon", "Sports", "News"] as const).map((show) => (
          <button
            key={show}
            onClick={() => {
              setTvShow(show);
              recordAction('changed_tv_show', { val: show });
            }}
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all ${
              tvShow === show ? 'bg-indigo-600 text-white shadow' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {show}
          </button>
        ))}
      </div>

      {/* Visual Canvas */}
      <div 
        className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 p-2 sm:p-4"
        style={{ backgroundColor: `hsl(220, ${roomLight / 2}%, ${roomLight / 1.5 + 5}%)` }}
      >
        {roomLight > 30 && (
          <div className="absolute top-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
        )}

        {/* TV Set */}
        <div className="relative w-full max-w-[220px] xs:max-w-[270px] sm:max-w-[340px] aspect-video bg-gray-900 border-4 border-gray-800 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 transition-opacity duration-300 flex items-center justify-center"
            style={{ 
              opacity: tvBrightness / 100,
              backgroundColor: tvShow === "Cartoon" ? "#3b82f6" : tvShow === "Sports" ? "#22c55e" : "#eab308"
            }}
          >
            <span className="text-white/90 font-black text-xl sm:text-2xl tracking-widest mix-blend-overlay">{tvShow.toUpperCase()}</span>
          </div>

          {isGlare && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <span className="text-gray-900 font-black text-[10px] bg-white/90 px-2 py-1 rounded shadow uppercase">Reflected Light (Glare)</span>
            </div>
          )}

          {isEyeStrain && (
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(255,255,255,0.5)] flex items-end justify-center pb-2">
              <span className="text-white font-bold text-[10px] bg-red-600/90 px-2 py-0.5 rounded uppercase animate-pulse">Too bright for dark room! (Eye Strain)</span>
            </div>
          )}
        </div>
        {/* TV Stand */}
        <div className="w-20 h-3 bg-gray-800 rounded-b shadow" />
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold block" style={{ color: isComfortable ? '#67e8f9' : '#fca5a5' }}>
          {isComfortable ? "😌 Comfortable TV watching!" : isGlare ? "😖 Too much glare on the screen!" : "😖 Ouch! TV is too bright for a dark room!"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isComfortable ? "The TV brightness matches the room light nicely." : isGlare ? "When the room is very bright, the TV screen reflects the light." : "A super bright TV in a pitch black room causes eye strain."}
        </p>
      </div>
    </div>
  );
}

function ExperimentTwo({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [scaleAngle, setScaleAngle] = useState(45);
  const [laserColor, setLaserColor] = useState<"Sunlight" | "Red Laser">("Sunlight");

  const isRainbow = laserColor === "Sunlight" && scaleAngle > 20 && scaleAngle < 70;
  const spread = isRainbow ? 20 : 2; 

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar: Stacks vertically on mobile (<768px), horizontal row on desktop */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-fuchsia-400">Scale Angle</span>
            <span className="text-[11px] text-gray-400 font-mono">{scaleAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={scaleAngle}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setScaleAngle(val);
              recordAction('changed_scale_angle', { val });
            }}
            className="w-full accent-fuchsia-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-1 md:pt-0 border-t border-gray-800 md:border-t-0">
          <span className="font-bold text-fuchsia-400 text-[11px]">Light Source:</span>
          <div className="flex gap-1.5">
            {(["Sunlight", "Red Laser"] as const).map(color => (
              <button 
                key={color}
                type="button"
                onClick={() => {
                  setLaserColor(color);
                  recordAction('changed_light_source', { val: color });
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  laserColor === color ? (color === "Sunlight" ? 'bg-amber-500 text-amber-950 font-black shadow' : 'bg-red-600 text-white font-black shadow') : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative flex-1 min-h-[220px] flex flex-col items-center justify-center overflow-hidden bg-gray-950 p-4">
        {/* Light Beam */}
        <div 
          className={`absolute left-1/2 top-0 h-1/2 w-3 -translate-x-1/2 origin-top ${
            laserColor === 'Sunlight' ? 'bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.6)]' : 'bg-red-500/90 shadow-[0_0_20px_rgba(255,0,0,0.8)]'
          }`}
        />

        {/* Plastic Scale */}
        <div 
          className="relative z-10 w-44 sm:w-56 h-6 bg-white/20 backdrop-blur-sm border border-white/40 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center"
          style={{ transform: `rotate(${scaleAngle}deg)` }}
        >
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => <div key={i} className="w-[1px] h-3 bg-white/50" />)}
          </div>
        </div>

        {/* Refracted Beam */}
        <div className="absolute left-1/2 top-1/2 h-1/2 flex -translate-x-1/2 origin-top" style={{ transform: `rotate(${-(scaleAngle - 45) * 0.5}deg)` }}>
          {isRainbow ? (
            <div className="flex h-full" style={{ width: `${spread * 4}px` }}>
              <div className="flex-1 h-full bg-red-500/80 blur-[2px]" />
              <div className="flex-1 h-full bg-orange-500/80 blur-[2px]" />
              <div className="flex-1 h-full bg-yellow-500/80 blur-[2px]" />
              <div className="flex-1 h-full bg-green-500/80 blur-[2px]" />
              <div className="flex-1 h-full bg-blue-500/80 blur-[2px]" />
              <div className="flex-1 h-full bg-indigo-500/80 blur-[2px]" />
              <div className="flex-1 h-full bg-purple-500/80 blur-[2px]" />
            </div>
          ) : (
            <div className={`h-full ${laserColor === 'Sunlight' ? 'bg-white/60 blur-[1px]' : 'bg-red-500/80 blur-[1px]'}`} style={{ width: `${spread * 4}px` }} />
          )}
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">{isRainbow ? "🌈 Beautiful Rainbow!" : "No rainbow."}</span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {laserColor === "Sunlight" 
            ? "Sunlight hits the scale and splits into colors at the right angle!" 
            : `The ${laserColor} light does not split into a rainbow because it is pure monochromatic single-wavelength light.`}
        </p>
      </div>
    </div>
  );
}

function ExperimentThree({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [sunHeight, setSunHeight] = useState(45);
  const [treeHeight, setTreeHeight] = useState(30);
  
  const sunRad = (sunHeight * Math.PI) / 180;
  const shadowLengthPct = Math.min(45, Math.max(5, treeHeight / Math.tan(sunRad)));
  const isNoon = sunHeight === 90;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Interactive Toolbar: Stacks vertically on mobile (<768px), horizontal row on desktop */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-300 shrink-0 z-20 w-full">
        {/* Sun Elevation Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-indigo-300">Sun Elevation</span>
            <span className="text-[11px] text-gray-400 font-mono">{sunHeight}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={sunHeight}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSunHeight(val);
              recordAction('changed_sun_height', { val });
            }}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>

        {/* Tree Height Slider */}
        <div className="flex flex-col gap-1 w-full md:w-auto md:flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-indigo-300">Tree Height</span>
            <span className="text-[11px] text-gray-400 font-mono">{treeHeight}m</span>
          </div>
          <input
            type="range"
            min="20"
            max="60"
            step="5"
            value={treeHeight}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setTreeHeight(val);
              recordAction('changed_tree_height', { val });
            }}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-gray-700 rounded-lg"
          />
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative flex-1 min-h-[220px] flex flex-col justify-end overflow-hidden bg-gradient-to-b from-sky-400 to-amber-100 p-4">
        {/* Sun */}
        <div 
          className="absolute w-10 h-10 bg-yellow-400 rounded-full shadow-[0_0_30px_#facc15] transition-all duration-300"
          style={{ 
            left: `${50 - Math.cos(sunRad) * 35}%`,
            top: `${70 - Math.sin(sunRad) * 55}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Ground */}
        <div className="w-full h-10 bg-amber-800/80 relative flex items-center justify-center">
          {/* Shadow */}
          <div 
            className="absolute bottom-6 bg-black/40 rounded-full blur-[1px] transition-all duration-300"
            style={{ 
              width: `${shadowLengthPct * 3.5}px`,
              height: '8px',
              left: `calc(50% + ${Math.cos(sunRad) * 20}px)`
            }}
          />
        </div>

        {/* Tree */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 pointer-events-none"
          style={{ height: `${treeHeight * 2.5}px` }}
        >
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-emerald-600 rounded-full -mb-4 shadow-lg border-2 border-emerald-700" />
          <div className="w-3 sm:w-4 flex-1 bg-amber-900 rounded-b" />
        </div>
      </div>

      {/* Dedicated Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isNoon ? "☀️ Midday Sun (Shortest Shadow!)" : "Sun casting a long shadow"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isNoon 
            ? "When the sun is highest in the sky and feeling hottest, the shadow is at its very shortest!" 
            : "Notice how the shadow shrinks as the sun climbs higher in the sky."}
        </p>
      </div>
    </div>
  );
}

export function OpticsLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <ExperimentOne recordAction={recordAction} />}
      {experimentSubIndex === 1 && <ExperimentTwo recordAction={recordAction} />}
      {experimentSubIndex === 2 && <ExperimentThree recordAction={recordAction} />}
    </div>
  );
}
