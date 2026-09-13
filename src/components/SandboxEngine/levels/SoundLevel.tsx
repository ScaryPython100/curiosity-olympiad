"use client";

import React, { useState } from 'react';
import { playMatkaTap, playStringTelephone, playShoutWithEcho } from '@/utils/webAudio';

function MatkaPitch({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [waterLevel, setWaterLevel] = useState(50);
  const [playing, setPlaying] = useState(false);

  // Pitch maps directly to air column height: less air (more water) = higher frequency
  const pitch = 200 + (waterLevel * 5); 
  const isAnomaly = waterLevel > 80;

  const handleTap = () => {
    setPlaying(true);
    playMatkaTap(pitch);
    recordAction('tapped_matka', { waterLevel, pitch });
    setTimeout(() => setPlaying(false), 500);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400">Water Fill</span>
          <input 
            type="range" min="10" max="90" step="10" value={waterLevel} 
            onChange={e => { 
              const val = parseInt(e.target.value);
              setWaterLevel(val); 
              recordAction('changed_water_level', { val }); 
            }} 
            className="w-24 sm:w-32 accent-sky-500 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{waterLevel}%</span>
        </div>
        <button 
          onClick={handleTap} 
          className="bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold py-1.5 px-4 rounded-xl shadow text-xs transition-transform flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          aria-label="Tap Matka to play sound"
        >
          <span className="material-symbols-outlined text-sm">music_note</span>
          <span>TAP MATKA ({pitch} Hz)</span>
        </button>
      </div>

      {/* Acoustic Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {playing && (
          <div className="bg-white/95 px-4 py-1.5 rounded-full shadow-xl border border-sky-300 font-black text-xs text-sky-900 mb-3 animate-bounce flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-sky-600 animate-spin">graphic_eq</span>
            <span>🎵 Pitch: {pitch} Hz ({waterLevel > 70 ? "High Ceramic Ping" : waterLevel < 30 ? "Deep Hollow Tone" : "Mid Resonance"})</span>
          </div>
        )}

        {/* Matka Pot (Clickable to Tap) */}
        <div 
          onClick={handleTap}
          className="relative cursor-pointer group select-none"
          title="Click to tap the clay pot!"
        >
          {/* Sound waves radiating on tap */}
          {playing && (
            <div className="absolute -inset-4 border-2 border-sky-400/60 rounded-full animate-ping pointer-events-none" />
          )}

          <div className={`w-28 sm:w-36 h-36 sm:h-44 rounded-b-[50px] rounded-t-2xl bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900 border-t-8 border-amber-950 flex flex-col justify-end overflow-hidden shadow-2xl transition-transform duration-150 ${playing ? 'scale-105' : 'group-hover:scale-[1.02]'}`}>
            {/* Empty Air Column (Vibrating Zone) */}
            <div 
              className="w-full flex items-center justify-center text-amber-200/50 text-[10px] font-bold uppercase transition-all duration-300 relative"
              style={{ height: `${100 - waterLevel}%` }}
            >
              {playing && (
                <div className="absolute inset-0 bg-sky-400/20 flex items-center justify-center animate-pulse">
                  <span className="text-[10px] font-mono text-sky-200">〰️ Air Vibration 〰️</span>
                </div>
              )}
              {!playing && (
                <span className="text-[9px] opacity-70">Air Column ({100 - waterLevel}%)</span>
              )}
            </div>

            {/* Water Fill */}
            <div 
              className="w-full bg-gradient-to-t from-sky-600/90 to-sky-400/70 border-t-2 border-sky-300/80 transition-all duration-300 relative flex items-center justify-center" 
              style={{ height: `${waterLevel}%` }}
            >
              <span className="text-[9px] font-bold text-white/70">Water ({waterLevel}%)</span>
            </div>
          </div>
          
          <div className="w-40 h-2.5 bg-black/40 rounded-full mt-2 mx-auto blur-[1px]" />
          <span className="text-[10px] font-bold text-gray-400 text-center block mt-1">Tap pot to play pitch</span>
        </div>
      </div>

      {/* Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">
          {isAnomaly && playing ? "Surprise: More water makes a HIGHER pitch, not lower!" : `Air Column: ${100 - waterLevel}% | Frequency: ${pitch} Hz`}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly && playing 
            ? "When you add water, the remaining empty air column gets shorter. Shorter air columns vibrate at higher frequencies!" 
            : "Adjust the water slider and tap the pot to hear how the pitch rises as water replaces the air space."}
        </p>
      </div>
    </div>
  );
}

function StringTelephone({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [tension, setTension] = useState(60);
  const [pinched, setPinched] = useState(false);
  const [talking, setTalking] = useState(false);

  const isAnomaly = pinched && tension > 50;
  const soundPasses = tension >= 40 && !pinched;

  const handleTalk = () => {
    setTalking(true);
    playStringTelephone(tension, pinched);
    recordAction('used_phone', { tension, pinched, soundPasses });
    setTimeout(() => setTalking(false), 1500);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-400">Tension</span>
          <input 
            type="range" min="10" max="100" step="10" value={tension} 
            onChange={e => { 
              const val = parseInt(e.target.value);
              setTension(val); 
              recordAction('changed_tension', { val }); 
            }} 
            className="w-20 sm:w-28 accent-red-500 cursor-pointer" 
          />
          <span className="text-[11px] font-mono text-gray-400">{tension}% ({tension < 40 ? "Slack" : "Taut"})</span>
        </div>
        
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-yellow-300 bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-700">
          <input 
            type="checkbox" 
            checked={pinched} 
            onChange={e => { 
              setPinched(e.target.checked); 
              recordAction('toggled_pinch', { val: e.target.checked }); 
            }} 
            className="accent-yellow-400 cursor-pointer"
          />
          <span>Pinch String 🤏</span>
        </label>
        
        <button 
          onClick={handleTalk} 
          disabled={talking}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 active:scale-95 text-white font-bold py-1.5 px-4 rounded-xl shadow text-xs transition-transform flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          aria-label="Speak into string telephone"
        >
          <span className="material-symbols-outlined text-sm">record_voice_over</span>
          <span>SPEAK 🗣️</span>
        </button>
      </div>

      {/* Visual Telephone Workspace */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Transmission Speech Bubbles */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4 px-2 min-h-[28px]">
          {talking ? (
            <span className="bg-white/95 text-gray-900 px-3 py-1 rounded-full shadow text-xs font-bold animate-pulse flex items-center gap-1">
              <span>🗣️</span> <span>"Hello!"</span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-500">Speaker Cup</span>
          )}

          {talking ? (
            <span className={`px-3 py-1 rounded-full shadow text-xs font-black flex items-center gap-1 transition-all ${
              soundPasses 
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 animate-bounce' 
                : 'bg-red-950 border border-red-700 text-red-300'
            }`}>
              {soundPasses ? (
                <>
                  <span className="material-symbols-outlined text-sm text-emerald-700">volume_up</span>
                  <span>👂 Heard clearly!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm text-red-400">volume_off</span>
                  <span>🔇 {pinched ? "Blocked by Pinch!" : "Muffled by Slack String!"}</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-[10px] text-gray-500">Receiver Cup</span>
          )}
        </div>

        {/* Telephone Physical Rig (Cups + String) */}
        <div className="w-full max-w-md flex items-center justify-between relative px-2">
          {/* Left Speaker Cup */}
          <div className={`w-12 sm:w-14 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-l-2xl border-2 border-red-700 shadow-xl flex items-center justify-center shrink-0 z-10 ${talking ? 'scale-105 transition-transform' : ''}`}>
            <span className="text-white text-[10px] font-black -rotate-90">SPEAK</span>
          </div>

          {/* Dynamic Mechanical String with transverse vibration */}
          <div className="flex-1 relative h-16 flex items-center mx-1 overflow-visible">
            {/* When string is SLACK (<40% tension): sagging curved line */}
            {tension < 40 && (
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path 
                  d={`M 0,20 Q 50,${40 + (40 - tension) * 0.8} 100,20`}
                  fill="none" 
                  stroke="#94a3b8" 
                  strokeWidth="2.5" 
                  strokeDasharray={talking ? "4 2" : "none"}
                  className={talking ? "animate-pulse" : ""}
                />
              </svg>
            )}

            {/* When string is TAUT (>=40% tension): straight or vibrating wave */}
            {tension >= 40 && (
              <div className="w-full relative h-6 flex items-center">
                {/* Pinching divides string: left half vibrates, right half is completely damped */}
                {pinched ? (
                  <div className="w-full flex items-center h-full relative">
                    {/* Left half (from speaker to pinch) */}
                    <div className="w-1/2 h-full relative flex items-center">
                      <div 
                        className={`w-full h-0.5 bg-yellow-400 ${
                          talking ? 'animate-bounce shadow-[0_0_8px_#facc15]' : ''
                        }`} 
                      />
                    </div>

                    {/* Pinch Point */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-30 flex flex-col items-center">
                      <span className="text-2xl drop-shadow-md animate-bounce">🤏</span>
                      <span className="text-[8px] font-bold text-yellow-300 bg-black/80 px-1 rounded -mt-1">Pinch</span>
                    </div>

                    {/* Right half (from pinch to receiver - completely stationary!) */}
                    <div className="w-1/2 h-full relative flex items-center">
                      <div className="w-full h-0.5 bg-gray-500 opacity-60" />
                    </div>
                  </div>
                ) : (
                  /* Unpinched taut string */
                  <div className="w-full h-full relative flex items-center">
                    <div 
                      className={`w-full h-0.5 bg-slate-300 transition-all ${
                        talking 
                          ? 'bg-sky-400 h-1 shadow-[0_0_10px_#38bdf8] animate-pulse' 
                          : ''
                      }`} 
                    />
                    {/* Travelling transverse vibration waves when transmitting */}
                    {talking && soundPasses && (
                      <div className="absolute inset-0 flex items-center justify-around pointer-events-none overflow-hidden">
                        {[...Array(8)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-2 h-4 bg-sky-400 rounded-full blur-[1px] animate-ping"
                            style={{ animationDelay: `${i * 80}ms`, animationDuration: '600ms' }} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Receiver Cup */}
          <div className={`w-12 sm:w-14 h-16 bg-gradient-to-l from-red-600 to-red-500 rounded-r-2xl border-2 border-red-700 shadow-xl flex items-center justify-center shrink-0 z-10 ${talking && soundPasses ? 'scale-105 transition-transform' : ''}`}>
            <span className="text-white text-[10px] font-black rotate-90">LISTEN</span>
          </div>
        </div>

        {/* Audio / String status line */}
        <div className="mt-4 text-center">
          <span className="text-[11px] font-mono text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700">
            {pinched ? "❌ String pinched: Wave reflection kills transmission" : tension < 40 ? "⚠️ String slack: Low tension damps vibration" : "✅ String taut: Longitudinal sound wave propagates"}
          </span>
        </div>
      </div>

      {/* Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-red-400 block">
          {isAnomaly && talking ? "A simple pinch silenced the sound completely!" : soundPasses && talking ? "Sound transmitted as physical vibration!" : "Mechanical Wave Transmission"}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly && talking 
            ? "Sound travels as a mechanical physical wave along the string. Pinching it absorbs the kinetic energy and stops wave transmission instantly!" 
            : "Pull the string taut and click SPEAK to observe and hear voice vibrations travel through the wire."}
        </p>
      </div>
    </div>
  );
}

function Echoes({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  const [location, setLocation] = useState<"Well" | "Field">("Well");
  const [depth, setDepth] = useState(50);
  const [shouting, setShouting] = useState(false);
  const [echoStatus, setEchoStatus] = useState<"none" | "waiting" | "echo">("none");

  const isAnomaly = location === "Field" || (location === "Well" && depth < 30);

  const handleShout = () => {
    setShouting(true);
    setEchoStatus("waiting");
    const hasEcho = location === "Well" && depth >= 30;
    const delaySec = Math.max(0.25, Math.min(0.8, (depth / 100) * 0.7));
    playShoutWithEcho(hasEcho, delaySec);
    recordAction('shouted', { location, depth });

    setTimeout(() => {
      setShouting(false);
      if (hasEcho) {
        setEchoStatus("echo");
        setTimeout(() => setEchoStatus("none"), 1200);
      } else {
        setEchoStatus("none");
      }
    }, delaySec * 1000);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">Place:</span>
          <div className="flex gap-1">
            {(["Well", "Field"] as const).map(loc => (
              <button 
                key={loc}
                onClick={() => { setLocation(loc); recordAction('changed_location', { val: loc }); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${location === loc ? 'bg-emerald-500 text-white shadow' : 'bg-gray-700 text-gray-300'}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
        {location === "Well" && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400">Well Depth</span>
            <input 
              type="range" min="10" max="90" step="20" value={depth} 
              onChange={e => { 
                const val = parseInt(e.target.value);
                setDepth(val); 
                recordAction('changed_depth', { val }); 
              }} 
              className="w-20 sm:w-28 accent-emerald-500 cursor-pointer" 
            />
            <span className="text-[11px] font-mono text-gray-400">{depth}m</span>
          </div>
        )}
        <button 
          onClick={handleShout} 
          disabled={shouting}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-95 text-white font-bold py-1.5 px-4 rounded-xl shadow text-xs transition-transform flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          aria-label="Shout into location"
        >
          <span className="material-symbols-outlined text-sm">campaign</span>
          <span>SHOUT 🗣️</span>
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] overflow-hidden flex flex-col justify-end bg-slate-900">
        {location === "Field" ? (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-green-400 flex flex-col justify-end">
            <div className="w-full h-1/3 bg-green-600 border-t-4 border-green-700" />
            {shouting && (
              <div className="absolute top-1/4 left-1/3 border-4 border-white/40 rounded-full w-48 h-48 animate-ping pointer-events-none" />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-sky-200 flex flex-col items-center justify-end">
            <div className="w-full h-8 bg-green-600" />
            <div className="w-36 sm:w-44 bg-gray-800 border-4 border-gray-600 rounded-t shadow-inner relative overflow-hidden" style={{ height: `${Math.max(25, depth * 0.8)}%` }}>
              <div className="w-full h-3 bg-blue-900/60 absolute bottom-0" />
              {shouting && (
                <div className="absolute inset-x-0 top-0 h-4 bg-yellow-300/40 animate-pulse flex items-center justify-center text-[9px] text-yellow-200 font-mono">
                  ↓ sound waves ↓
                </div>
              )}
              {echoStatus === "echo" && (
                <div className="absolute inset-x-0 bottom-4 h-4 bg-emerald-400/50 animate-bounce flex items-center justify-center text-[9px] text-emerald-100 font-bold">
                  ↑ reflected echo ↑
                </div>
              )}
            </div>
          </div>
        )}

        {/* Character Shout Feedback */}
        <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
          <div className="w-8 h-8 bg-amber-200 rounded-full border border-gray-800 flex items-center justify-center text-sm shadow">
            👤
          </div>
          {shouting && (
            <span className="bg-white/95 px-3 py-1 rounded-full shadow text-xs font-bold text-gray-900 animate-pulse flex items-center gap-1">
              <span>🗣️</span> <span>"HELLO!!"</span>
            </span>
          )}
          {echoStatus === "echo" && (
            <span className="bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full shadow text-xs font-bold text-emerald-900 animate-bounce flex items-center gap-1">
              <span>🔊</span> <span>"...hello! (Echo)"</span>
            </span>
          )}
        </div>
      </div>

      {/* Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-emerald-300 block">
          {location === "Field" ? "No Echo in Open Field — Sound Radiates Away" : depth < 30 ? "Shallow Well — Shout Blends with Immediate Reflection" : `Deep Well (${depth}m) — Distinct Reflected Echo!`}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {location === "Field" 
            ? "Without solid vertical walls, sound waves disperse freely into the atmosphere with nothing to bounce back from." 
            : depth < 30 
              ? "Human ears require at least 0.1s (approx. 17 meters roundtrip) separation to distinguish an echo from original sound." 
              : "Sound travels down the shaft and reflects off hard stone walls, returning as a distinct delayed echo."}
        </p>
      </div>
    </div>
  );
}

export function SoundLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <MatkaPitch recordAction={recordAction} />}
      {experimentSubIndex === 1 && <StringTelephone recordAction={recordAction} />}
      {experimentSubIndex === 2 && <Echoes recordAction={recordAction} />}
    </div>
  );
}
