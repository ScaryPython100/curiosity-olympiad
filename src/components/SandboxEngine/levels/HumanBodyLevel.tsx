"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAnomalySignal } from '../useAnomalySignal';
import { playHeartbeat } from '@/utils/webAudio';
import { ObservationSpeaker } from "@/components/ReadAloud";
import { FitText, useSceneText } from '../SceneText';

type RecordAction = (actionType: string, actionDetails?: any) => void;

// ==========================================
// EXPERIMENT 1: PULSE RATE & HEARTBEAT
// ==========================================
function PulseHeartbeat({ recordAction }: { recordAction: RecordAction }) {
  const { s } = useSceneText("body");
  type Activity = "Resting" | "Brisk Walk" | "Sprint";
  const [activity, setActivity] = useState<Activity>("Resting");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bpmMap: Record<Activity, { bpm: number; o2: number; label: "pulse_sitting" | "pulse_walking" | "pulse_running" }> = {
    "Resting": { bpm: 72, o2: 250, label: "pulse_sitting" },
    "Brisk Walk": { bpm: 110, o2: 750, label: "pulse_walking" },
    "Sprint": { bpm: 165, o2: 2200, label: "pulse_running" }
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
              aria-label={s("pulse_choose", { activity: s(bpmMap[act].label) })}
            >
              {s(act === "Resting" ? "pulse_sit" : act === "Brisk Walk" ? "pulse_walk" : "pulse_run")}
            </button>
          ))}
        </div>
        <button
          onClick={handleListenHeartbeat}
          className={`px-4 rounded-xl font-black text-sm shadow transition-all cursor-pointer ${isPlayingAudio ? 'bg-amber-500 text-gray-950 scale-95' : 'bg-rose-700 hover:bg-rose-600 text-white'}`}
          aria-label={s("pulse_listen_label")}
        >
          {s("pulse_listen")}
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
              <p className="text-xs text-gray-400 font-bold">{s("pulse_heartbeats")}</p>
              <p className="text-xl font-black text-rose-400">{bpm} <span className="text-xs">{s("pulse_per_minute")}</span></p>
            </div>
          </div>
          <span className="text-3xl" aria-hidden>{activity === "Resting" ? "🪑" : activity === "Brisk Walk" ? "🚶" : "🏃"}</span>
        </div>
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
            <span>{s("pulse_air_needed")}</span>
            <span className="text-emerald-400">{s(o2 < 500 ? "pulse_air_little" : o2 < 1500 ? "pulse_air_more" : "pulse_air_lot")}</span>
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
          {isAnomaly ? s("pulse_twice") : s("pulse_beats", { activity: s(bpmMap[activity].label), n: bpm })}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s(isAnomaly ? "pulse_run_why" : "pulse_why")}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: DIAPHRAGM & BALLOON LUNGS
// ==========================================
function DiaphragmBalloonLungs({ recordAction }: { recordAction: RecordAction }) {
  const { s, en } = useSceneText("body");
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
          <span className="font-bold text-sky-300">{s("lungs_pull")}</span>
          <span className="text-xs font-mono text-gray-300">{s(isInhaling ? "lungs_in" : isExhaling ? "lungs_out" : "lungs_rest")}</span>
        </div>
        <input
          type="range" min="10" max="95" step="5" value={diaphragmPos}
          onChange={e => handleSlider(parseInt(e.target.value))}
          aria-label={s("lungs_slider")}
        />
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-end">
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={s(isInhaling ? "lungs_pic_in" : isExhaling ? "lungs_pic_out" : "lungs_pic_rest")}>
          {/* Air arrows at the top */}
          {isInhaling && <g><polygon points="162,4 178,4 170,18" fill="#38bdf8" /><FitText en={en("lungs_air_in")} x="188" y="16" fontSize="11" fontWeight="800" fill="#7dd3fc">{s("lungs_air_in")}</FitText></g>}
          {isExhaling && <g><polygon points="162,18 178,18 170,4" fill="#f59e0b" /><FitText en={en("lungs_air_out")} x="188" y="16" fontSize="11" fontWeight="800" fill="#fcd34d">{s("lungs_air_out")}</FitText></g>}

          {/* Jar (chest) */}
          <path d={`M 100 ${SHEET_Y} L 100 70 Q 100 40 130 40 L 210 40 Q 240 40 240 70 L 240 ${SHEET_Y}`} fill="#ffffff" fillOpacity="0.05" stroke="#cbd5e1" strokeWidth="3" />
          {/* Windpipe and two tubes */}
          <rect x="165" y="20" width="10" height="44" fill="#e2e8f0" />
          <path d="M 170 64 L 146 84 M 170 64 L 194 84" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Balloon lungs */}
          <ellipse cx="140" cy={84 + lungR} rx={lungR * 0.85} ry={lungR} fill="#f43f5e" opacity="0.9" style={{ transition: 'all 0.3s' }} />
          <ellipse cx="200" cy={84 + lungR} rx={lungR * 0.85} ry={lungR} fill="#f43f5e" opacity="0.9" style={{ transition: 'all 0.3s' }} />
          <FitText en={en("lungs_label")} x="170" y={92 + lungR * 2 + 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fda4af">{s("lungs_label")}</FitText>

          {/* Rubber sheet (diaphragm) */}
          <path d={`M 100 ${SHEET_Y} Q 170 ${SHEET_Y - bulge * 2} 240 ${SHEET_Y}`} stroke="#f59e0b" strokeWidth="6" fill="none" style={{ transition: 'd 0.3s' }} />
          <line x1="170" y1={SHEET_Y - bulge} x2="170" y2="210" stroke="#d97706" strokeWidth="3" />
          <circle cx="170" cy="210" r="6" fill="#d97706" />
          <FitText en={en("lungs_diaphragm")} x="252" y={SHEET_Y + 4} fontSize="10" fontWeight="700" fill="#fcd34d">{s("lungs_diaphragm")}</FitText>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-sky-300 block">
          {s(isAnomaly ? "lungs_big_breath" : isInhaling ? "lungs_breathing_in" : isExhaling ? "lungs_breathing_out" : "lungs_try")}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s(isInhaling ? "lungs_in_why" : isExhaling ? "lungs_out_why" : "lungs_rest_why")}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: PUPIL DILATION REFLEX
// ==========================================
function PupilReflex({ recordAction }: { recordAction: RecordAction }) {
  const { s, en } = useSceneText("body");
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
          <span className="font-bold text-amber-300">{s("eye_torch")}</span>
          <span className="text-xs font-mono text-gray-300">{s(isConstricted ? "eye_very_bright" : isDilated ? "eye_dark_room" : "eye_medium")}</span>
        </div>
        <input
          type="range" min="0" max="100" step="5" value={lightIntensity}
          onChange={e => handleSlider(parseInt(e.target.value))}
          aria-label={s("eye_torch_slider")}
        />
      </div>

      <div className="relative flex-1 min-h-[220px] flex items-end" style={{ backgroundColor: `hsl(222, 47%, ${4 + lightIntensity * 0.12}%)` }}>
        <svg viewBox="0 0 340 220" className="w-full h-auto max-h-full block" preserveAspectRatio="xMidYMax meet" role="img" aria-label={s("eye_pic", { n: pupilDiameterMm })}>
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
          <FitText en={en("eye_iris")} x="294" y="38" fontSize="10" fontWeight="700" fill="#cbd5e1">{s("eye_iris")}</FitText>
          <line x1="200" y1={111 + pupilR} x2="200" y2="196" stroke="#94a3b8" strokeWidth="1" />
          <FitText en={en("eye_pupil", { n: pupilDiameterMm })} x="200" y="208" textAnchor="middle" fontSize="10" fontWeight="700" fill="#cbd5e1">{s("eye_pupil", { n: pupilDiameterMm })}</FitText>
        </svg>
      </div>

      <div className="relative shrink-0 w-full bg-gray-950 border-t border-gray-800 pl-3 pr-12 py-2 text-center z-10">

        <ObservationSpeaker />
        <span className="text-sm font-bold text-amber-300 block">
          {s(isAnomaly ? "eye_tiny" : isDilated ? "eye_wide" : "eye_try")}
        </span>
        <p className="text-xs text-gray-300 mt-0.5">
          {s(isAnomaly ? "eye_tiny_why" : isDilated ? "eye_wide_why" : "eye_why")}
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
