"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { playHeartbeat } from '@/utils/webAudio';
import { ObservationSpeaker } from "@/components/ReadAloud";

type RecordAction = (actionType: string, actionDetails?: any) => void;

// ==========================================
// EXPERIMENT 1: PULSE RATE & HEARTBEAT
// ==========================================
function PulseHeartbeat({ recordAction }: { recordAction: RecordAction }) {
  type Activity = "Resting" | "Brisk Walk" | "Sprint";
  const [activity, setActivity] = useState<Activity>("Resting");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bpmMap: Record<Activity, { bpm: number; o2: number; label: string }> = {
    "Resting": { bpm: 72, o2: 250, label: "Sitting" },
    "Brisk Walk": { bpm: 110, o2: 750, label: "Walking fast" },
    "Sprint": { bpm: 165, o2: 2200, label: "Running fast" }
  };

  const { bpm, o2 } = bpmMap[activity];
  const isAnomaly = activity === "Sprint";
  useAnomalySignal(isAnomaly, recordAction);

  const handleSetActivity = (act: Activity) => {
    setActivity(act);
    recordAction('changed_activity', { activity: act, bpm: bpmMap[act].bpm });
  };

  const handleListenHeartbeat = () => {
    setIsPlayingAudio(true);
    playHeartbeat(bpm);
    recordAction('listened_heartbeat', { bpm, activity });
    setTimeout(() => setIsPlayingAudio(false), 600);
  };

  // Heartbeat line on a small canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      step += (bpm / 60) * 1.5;
      const midY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const cycle = (x + step) % 120;
        let y = midY;
        if (cycle > 30 && cycle < 40) y = midY - Math.sin(((cycle - 30) / 10) * Math.PI) * 8;
        else if (cycle >= 45 && cycle < 50) y = midY + 6;
        else if (cycle >= 50 && cycle < 56) y = midY - 34;
        else if (cycle >= 56 && cycle < 60) y = midY + 10;
        else if (cycle > 70 && cycle < 85) y = midY - Math.sin(((cycle - 70) / 15) * Math.PI) * 12;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [bpm]);

  const beatSeconds = 60 / bpm;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-2 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="grid grid-cols-3 gap-1.5">
          {(["Resting", "Brisk Walk", "Sprint"] as Activity[]).map(act => (
            <button
              key={act}
              onClick={() => handleSetActivity(act)}
              className={`px-2 rounded-xl font-bold transition-all text-xs cursor-pointer ${activity === act ? 'bg-rose-600 text-white shadow-md' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              aria-label={`Choose ${bpmMap[act].label}`}
            >
              {act === "Resting" ? "🪑 Sit" : act === "Brisk Walk" ? "🚶 Walk" : "🏃 Run"}
            </button>
          ))}
        </div>
        <button
          onClick={handleListenHeartbeat}
          className={`px-4 rounded-xl font-black text-sm shadow transition-all cursor-pointer ${isPlayingAudio ? 'bg-amber-500 text-gray-950 scale-95' : 'bg-rose-700 hover:bg-rose-600 text-white'}`}
          aria-label="Listen to the heartbeat"
        >
          👂 Listen to the heart
        </button>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-950 flex flex-col items-center justify-center gap-2 p-3">
        <div className="w-full max-w-md flex items-center justify-between gap-3 px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="text-4xl inline-block"
              style={{ animationName: 'heart-beat', animationDuration: `${beatSeconds}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }}
              aria-hidden
            >
              ❤️
            </span>
            <div>
              <p className="text-xs text-gray-400 font-bold">Heartbeats</p>
              <p className="text-xl font-black text-rose-400">{bpm} <span className="text-xs">per minute</span></p>
            </div>
          </div>
          <span className="text-3xl" aria-hidden>{activity === "Resting" ? "🪑" : activity === "Brisk Walk" ? "🚶" : "🏃"}</span>
        </div>
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
            <span>Air your muscles need</span>
            <span className="text-emerald-400">{o2 < 500 ? "a little" : o2 < 1500 ? "more" : "a lot!"}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(o2 / 2200) * 100}%` }} />
          </div>
        </div>
        <div className="w-full max-w-md h-24 rounded-xl overflow-hidden border border-emerald-500/40">
          <canvas ref={canvasRef} width={440} height={100} className="w-full h-full block bg-slate-950" />
        </div>
        <style>{`@keyframes heart-beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.25); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } }`}</style>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-rose-300 block">
          {isAnomaly ? "🏃 Running: your heart beats more than twice as fast!" : `${bpmMap[activity].label}: ${bpm} beats a minute`}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "Working muscles need lots of air and food from the blood, so the heart pumps faster."
            : "Press “Listen” to hear the lub-dub sound: the heart's doors (valves) shutting."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: DIAPHRAGM & BALLOON LUNGS
// ==========================================
function DiaphragmBalloonLungs({ recordAction }: { recordAction: RecordAction }) {
  // Diaphragm displacement: 0 (Relaxed/Upwards, Exhale) to 100 (Contracted/Pulled Down, Inhale)
  const [diaphragmPos, setDiaphragmPos] = useState(50);

  const isInhaling = diaphragmPos >= 65;
  const isExhaling = diaphragmPos <= 35;
  const thoracicPressure = (760 - (diaphragmPos - 50) * 0.16).toFixed(1); // mmHg, kept for telemetry
  const isAnomaly = diaphragmPos >= 90;
  useAnomalySignal(isAnomaly, recordAction);

  const handleSlider = (val: number) => {
    setDiaphragmPos(val);
    recordAction('pulled_diaphragm', { val, pressure: thoracicPressure });
  };

  // Jar geometry: the rubber sheet bulges up when relaxed, pulls down when contracted
  const SHEET_Y = 176;
  const bulge = (50 - diaphragmPos) * 0.7; // +25 (up) .. -32 (down)
  const lungR = 16 + (diaphragmPos / 100) * 18;

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-1 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex justify-between items-center">
          <span className="font-bold text-sky-300">⬇ Pull the bottom sheet down</span>
          <span className="text-xs font-mono text-gray-300">{isInhaling ? "Breathing in" : isExhaling ? "Breathing out" : "Resting"}</span>
        </div>
        <input
          type="range" min="10" max="95" step="5" value={diaphragmPos}
          onChange={e => handleSlider(parseInt(e.target.value))}
          aria-label="Pull the diaphragm down"
        />
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={isInhaling ? "Air goes into the lungs" : isExhaling ? "Air comes out of the lungs" : "Lungs at rest"}>
          {/* Air arrows at the top */}
          {isInhaling && <g><polygon points="162,4 178,4 170,18" fill="#38bdf8" /><text x="188" y="16" fontSize="11" fontWeight="800" fill="#7dd3fc">air goes IN</text></g>}
          {isExhaling && <g><polygon points="162,18 178,18 170,4" fill="#f59e0b" /><text x="188" y="16" fontSize="11" fontWeight="800" fill="#fcd34d">air goes OUT</text></g>}

          {/* Jar (chest) */}
          <path d={`M 100 ${SHEET_Y} L 100 70 Q 100 40 130 40 L 210 40 Q 240 40 240 70 L 240 ${SHEET_Y}`} fill="#ffffff" fillOpacity="0.05" stroke="#cbd5e1" strokeWidth="3" />
          {/* Windpipe and two tubes */}
          <rect x="165" y="20" width="10" height="44" fill="#e2e8f0" />
          <path d="M 170 64 L 146 84 M 170 64 L 194 84" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Balloon lungs */}
          <ellipse cx="140" cy={84 + lungR} rx={lungR * 0.85} ry={lungR} fill="#f43f5e" opacity="0.9" style={{ transition: 'all 0.3s' }} />
          <ellipse cx="200" cy={84 + lungR} rx={lungR * 0.85} ry={lungR} fill="#f43f5e" opacity="0.9" style={{ transition: 'all 0.3s' }} />
          <text x="170" y={92 + lungR * 2 + 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fda4af">lungs</text>

          {/* Rubber sheet (diaphragm) */}
          <path d={`M 100 ${SHEET_Y} Q 170 ${SHEET_Y - bulge * 2} 240 ${SHEET_Y}`} stroke="#f59e0b" strokeWidth="6" fill="none" style={{ transition: 'd 0.3s' }} />
          <line x1="170" y1={SHEET_Y - bulge} x2="170" y2="210" stroke="#d97706" strokeWidth="3" />
          <circle cx="170" cy="210" r="6" fill="#d97706" />
          <text x="252" y={SHEET_Y + 4} fontSize="10" fontWeight="700" fill="#fcd34d">diaphragm</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-sky-300 block">
          {isAnomaly ? "🫁 Pulled all the way down: big breath in!" : isInhaling ? "🫁 Breathing in" : isExhaling ? "💨 Breathing out" : "Pull the sheet down and watch the lungs"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isInhaling
            ? "Pulling the sheet down makes more space in the jar, so air rushes into the balloons."
            : isExhaling
              ? "When the sheet goes back up, the space gets smaller and air is pushed out."
              : "Lungs have no muscles of their own. The diaphragm under them does the work."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: PUPIL DILATION REFLEX
// ==========================================
function PupilReflex({ recordAction }: { recordAction: RecordAction }) {
  // Light intensity: 0 (Dark Room) to 100 (Direct Flashlight)
  const [lightIntensity, setLightIntensity] = useState(20);

  // Pupil diameter: 8mm (pitch dark) down to 2mm (bright light)
  const pupilDiameterMm = (8 - (lightIntensity / 100) * 6).toFixed(1);
  const pupilR = 8 + (parseFloat(pupilDiameterMm) / 8) * 26;
  const isConstricted = lightIntensity >= 70;
  const isDilated = lightIntensity <= 25;
  const isAnomaly = lightIntensity >= 90;
  useAnomalySignal(isAnomaly, recordAction);

  const handleSlider = (val: number) => {
    setLightIntensity(val);
    recordAction('changed_light_intensity', { intensity: val, pupilDiameterMm });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="sim-toolbar bg-gray-900/95 border-b border-gray-700/80 p-3 flex flex-col gap-1 text-xs text-gray-300 shrink-0 z-20 w-full">
        <div className="flex justify-between items-center">
          <span className="font-bold text-amber-300">🔦 Torch brightness</span>
          <span className="text-xs font-mono text-gray-300">{isConstricted ? "Very bright" : isDilated ? "Dark room" : "Medium"}</span>
        </div>
        <input
          type="range" min="0" max="100" step="5" value={lightIntensity}
          onChange={e => handleSlider(parseInt(e.target.value))}
          aria-label="Torch brightness"
        />
      </div>

      <div className="relative flex-1 min-h-[220px] flex items-end" style={{ backgroundColor: `hsl(222, 47%, ${4 + lightIntensity * 0.12}%)` }}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={`Pupil is ${pupilDiameterMm} millimetres wide`}>
          {/* Torch + beam */}
          <rect x="6" y="100" width="40" height="22" rx="4" fill="#475569" />
          <rect x="44" y="96" width="10" height="30" rx="2" fill="#94a3b8" />
          <polygon points="54,100 200,60 200,162 54,122" fill="#fef08a" opacity={lightIntensity / 180} />

          {/* Eye */}
          <ellipse cx="200" cy="111" rx="100" ry="54" fill="#f8fafc" stroke="#334155" strokeWidth="4" />
          <circle cx="200" cy="111" r="44" fill="#92400e" />
          <circle cx="200" cy="111" r="44" fill="none" stroke="#451a03" strokeWidth="3" />
          {[...Array(16)].map((_, i) => (
            <line key={i} x1={200 + Math.cos((i * Math.PI) / 8) * (pupilR + 2)} y1={111 + Math.sin((i * Math.PI) / 8) * (pupilR + 2)} x2={200 + Math.cos((i * Math.PI) / 8) * 42} y2={111 + Math.sin((i * Math.PI) / 8) * 42} stroke="#78350f" strokeWidth="1.5" />
          ))}
          <circle cx="200" cy="111" r={pupilR} fill="#020617" style={{ transition: 'r 0.3s ease-out' }} />
          <circle cx={200 + pupilR * 0.4} cy={111 - pupilR * 0.4} r="4" fill="#ffffff" opacity="0.9" />

          {/* Labels */}
          <line x1="246" y1="76" x2="292" y2="40" stroke="#94a3b8" strokeWidth="1" />
          <text x="294" y="38" fontSize="10" fontWeight="700" fill="#cbd5e1">iris</text>
          <line x1="200" y1={111 + pupilR} x2="200" y2="196" stroke="#94a3b8" strokeWidth="1" />
          <text x="200" y="208" textAnchor="middle" fontSize="10" fontWeight="700" fill="#cbd5e1">pupil: {pupilDiameterMm} mm</text>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {isAnomaly ? "👁️ Bright light: the pupil became tiny!" : isDilated ? "🌑 In the dark, the pupil opens wide" : "Make the torch brighter and watch the black circle"}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {isAnomaly
            ? "The coloured part (iris) squeezes the pupil small to protect the inside of your eye from too much light."
            : isDilated
              ? "A wide pupil lets in as much light as possible so you can see."
              : "This happens by itself. You cannot stop your pupil from changing."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPORT LEVEL CONTAINER
// ==========================================
export function HumanBodyLevel({ recordAction, experimentSubIndex = 0 }: any) {
  return (
    <div className="flex-1 w-full relative overflow-hidden bg-gray-950 flex flex-col">
      {experimentSubIndex === 0 && <PulseHeartbeat recordAction={recordAction} />}
      {experimentSubIndex === 1 && <DiaphragmBalloonLungs recordAction={recordAction} />}
      {experimentSubIndex === 2 && <PupilReflex recordAction={recordAction} />}
    </div>
  );
}
