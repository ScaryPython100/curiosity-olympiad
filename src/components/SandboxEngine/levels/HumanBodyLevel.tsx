"use client";

import React, { useState, useEffect, useRef } from 'react';
import { playHeartbeat } from '@/utils/webAudio';

// ==========================================
// EXPERIMENT 1: PULSE RATE & HEARTBEAT
// ==========================================
function PulseHeartbeat({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  type Activity = "Resting" | "Brisk Walk" | "Sprint";
  const [activity, setActivity] = useState<Activity>("Resting");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bpmMap: Record<Activity, { bpm: number; o2: number; label: string }> = {
    "Resting": { bpm: 72, o2: 250, label: "Calm / Sitting" },
    "Brisk Walk": { bpm: 110, o2: 750, label: "Walking briskly" },
    "Sprint": { bpm: 165, o2: 2200, label: "All-out sprint" }
  };

  const { bpm, o2 } = bpmMap[activity];
  const isAnomaly = activity === "Sprint";

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

  // Animate live ECG wave on HTML Canvas
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

      // Grid lines
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // ECG Wave trace
      ctx.strokeStyle = "#10b981"; // Emerald green phosphor line
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const speedFactor = bpm / 60;
      step += speedFactor * 1.5;

      const midY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        const cycle = (x + step) % 120;
        let y = midY;

        if (cycle > 30 && cycle < 40) {
          // P Wave (atrial depolarization)
          y = midY - Math.sin(((cycle - 30) / 10) * Math.PI) * 10;
        } else if (cycle >= 45 && cycle < 50) {
          // Q dip
          y = midY + 8;
        } else if (cycle >= 50 && cycle < 56) {
          // R spike (ventricular contraction)
          y = midY - 45;
        } else if (cycle >= 56 && cycle < 60) {
          // S dip
          y = midY + 12;
        } else if (cycle > 70 && cycle < 85) {
          // T wave (ventricular repolarization)
          y = midY - Math.sin(((cycle - 70) / 15) * Math.PI) * 16;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [bpm]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-bold text-rose-400">Activity Level:</span>
          {(["Resting", "Brisk Walk", "Sprint"] as Activity[]).map(act => (
            <button
              key={act}
              onClick={() => handleSetActivity(act)}
              className={`min-h-[44px] px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                activity === act
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-label={`Select ${act}`}
            >
              {act}
            </button>
          ))}
        </div>

        <button
          onClick={handleListenHeartbeat}
          className={`min-h-[44px] px-4 py-1.5 rounded-xl font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer ${
            isPlayingAudio ? 'bg-amber-500 text-gray-950 scale-95' : 'bg-rose-700 hover:bg-rose-600 text-white'
          }`}
          aria-label="Listen to Heartbeat Stethoscope Audio"
        >
          <span className="material-symbols-outlined text-sm">hearing</span>
          <span>Stethoscope Audio ({bpm} BPM)</span>
        </button>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Vital Signs Header HUD */}
        <div className="w-full max-w-md flex items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800 mb-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 animate-pulse text-2xl">favorite</span>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-mono">Heart Rate</p>
              <p className="text-base font-black text-rose-400 font-mono">{bpm} <span className="text-xs">BPM</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-mono">Oxygen Demand</p>
            <p className="text-base font-black text-emerald-400 font-mono">{o2} <span className="text-xs">ml/min</span></p>
          </div>
        </div>

        {/* Live ECG Canvas Display */}
        <div className="w-full max-w-md h-28 sm:h-32 rounded-xl overflow-hidden border border-emerald-500/40 shadow-inner relative">
          <canvas
            ref={canvasRef}
            width={440}
            height={130}
            className="w-full h-full block bg-slate-950"
          />
          <div className="absolute top-1.5 right-2 text-[9px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            LEAD II • ECG TRACE
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-rose-300 block">
          {isAnomaly
            ? "Sprint Demands: Heart rate jumped from 72 to 165 BPM to pump oxygen to active muscle fibers!"
            : "Cardiac output scales directly with cellular metabolic rate."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Muscle cells consume ATP rapidly during vigorous exercise, releasing CO₂ into the blood. Brain sensors detect the acidity and trigger rapid cardiac contractions."
            : "Tap 'Stethoscope Audio' to hear the acoustic valve closure ('lub-dub') at physiological frequencies."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 2: DIAPHRAGM & BALLOON LUNGS
// ==========================================
function DiaphragmBalloonLungs({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Diaphragm displacement: 0 (Relaxed/Upwards, Exhale) to 100 (Contracted/Pulled Down, Inhale)
  const [diaphragmPos, setDiaphragmPos] = useState(50);

  const isInhaling = diaphragmPos >= 65;
  const isExhaling = diaphragmPos <= 35;
  const thoracicPressure = (760 - (diaphragmPos - 50) * 0.16).toFixed(1); // mmHg
  const lungScale = 0.5 + (diaphragmPos / 100) * 0.8;
  const isAnomaly = diaphragmPos >= 90;

  const handleSlider = (val: number) => {
    setDiaphragmPos(val);
    recordAction('pulled_diaphragm', { val, pressure: thoracicPressure });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-400">Diaphragm:</span>
          <input
            type="range" min="10" max="95" step="5" value={diaphragmPos}
            onChange={e => handleSlider(parseInt(e.target.value))}
            className="w-28 sm:w-40 accent-sky-500 cursor-pointer min-h-[44px]"
            aria-label="Diaphragm Pull Slider"
          />
          <span className="text-xs font-mono text-gray-200">{diaphragmPos}% ({isInhaling ? "Inhaling" : isExhaling ? "Exhaling" : "Rest"})</span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-gray-400">Thoracic Pressure:</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            parseFloat(thoracicPressure) < 760 ? 'bg-sky-950 text-sky-300 border border-sky-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {thoracicPressure} mmHg
          </span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Model Bell Jar Container */}
        <div className="relative w-44 sm:w-52 h-52 border-4 border-slate-400/80 rounded-t-3xl bg-slate-800/40 backdrop-blur-xs flex flex-col items-center justify-between shadow-2xl overflow-hidden pb-1">
          {/* Glass Bell Jar Trachea Tube */}
          <div className="w-3.5 h-10 bg-slate-300 border-x border-slate-400 rounded-t-sm relative flex justify-center">
            {/* Air flow indicator arrows */}
            {isInhaling && (
              <span className="material-symbols-outlined text-[12px] text-sky-500 animate-bounce absolute -top-1">
                arrow_downward
              </span>
            )}
            {isExhaling && (
              <span className="material-symbols-outlined text-[12px] text-amber-500 animate-bounce absolute -top-1">
                arrow_upward
              </span>
            )}
          </div>

          {/* Y-Split Bronchial Tubes */}
          <div className="w-16 h-4 border-t-2 border-slate-400 flex justify-between px-1" />

          {/* Twin Balloon Lungs */}
          <div className="flex items-center justify-center gap-4 flex-1">
            {/* Left Lung Balloon */}
            <div
              className="bg-rose-500/90 border border-rose-300 transition-all duration-300 origin-top shadow-md"
              style={{
                width: `${Math.round(26 * lungScale)}px`,
                height: `${Math.round(36 * lungScale)}px`,
                borderRadius: '45% 45% 55% 55%'
              }}
            />
            {/* Right Lung Balloon */}
            <div
              className="bg-rose-500/90 border border-rose-300 transition-all duration-300 origin-top shadow-md"
              style={{
                width: `${Math.round(26 * lungScale)}px`,
                height: `${Math.round(36 * lungScale)}px`,
                borderRadius: '45% 45% 55% 55%'
              }}
            />
          </div>

          {/* Rubber Diaphragm Sheet at Bottom */}
          <div
            className="w-full h-7 bg-amber-600/90 border-t-2 border-amber-400 transition-all duration-300 flex items-center justify-center shadow-inner"
            style={{
              transform: `translateY(${(diaphragmPos - 50) * 0.15}px)`
            }}
          >
            <span className="text-[9px] font-bold text-amber-950 uppercase tracking-tight select-none">
              Diaphragm Sheet ({diaphragmPos > 50 ? "Contracted Down" : "Relaxed Dome"})
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-sky-300 block">
          {isAnomaly
            ? "Deep Inhalation: Pulling down the diaphragm created a negative vacuum, sucking air into the lungs!"
            : isInhaling
            ? "Diaphragm contracts down → cavity volume increases → pressure drops below atmospheric → air rushes in."
            : "Diaphragm relaxes up → cavity volume shrinks → pressure rises → air is pushed out."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "Lungs have no independent muscles! Breathing is completely driven by pressure gradients created by the diaphragm and rib muscles."
            : "Drag the slider down to observe negative pressure inhalation in the bell jar."}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// EXPERIMENT 3: PUPIL DILATION REFLEX
// ==========================================
function PupilReflex({ recordAction }: { recordAction: (actionType: string, actionDetails?: any) => void }) {
  // Light intensity: 0 (Dark Room) to 100 (Direct Flashlight)
  const [lightIntensity, setLightIntensity] = useState(20);

  // Pupil diameter: 8mm (pitch dark) down to 2mm (bright light)
  const pupilDiameterMm = (8 - (lightIntensity / 100) * 6).toFixed(1);
  const pupilSizePx = Math.round(18 + (parseFloat(pupilDiameterMm) / 8) * 52);
  const isConstricted = lightIntensity >= 70;
  const isDilated = lightIntensity <= 25;
  const isAnomaly = lightIntensity >= 90;

  const handleSlider = (val: number) => {
    setLightIntensity(val);
    recordAction('changed_light_intensity', { intensity: val, pupilDiameterMm });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Control Bar */}
      <div className="bg-gray-900/95 border-b border-gray-700/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">Torch Beam:</span>
          <input
            type="range" min="0" max="100" step="5" value={lightIntensity}
            onChange={e => handleSlider(parseInt(e.target.value))}
            className="w-28 sm:w-40 accent-amber-500 cursor-pointer min-h-[44px]"
            aria-label="Torch Light Intensity Slider"
          />
          <span className="text-xs font-mono text-gray-200">{lightIntensity}% ({isConstricted ? "Intense Light" : isDilated ? "Dim/Dark" : "Moderate"})</span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-gray-400">Pupil Aperture:</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-700">
            {pupilDiameterMm} mm
          </span>
        </div>
      </div>

      {/* Visual Simulation Stage */}
      <div className="relative flex-1 min-h-[220px] bg-slate-950 overflow-hidden flex flex-col items-center justify-center p-3">
        {/* Stylized Human Eye Graphic */}
        <div className="relative flex items-center justify-center">
          {/* Torch Light Beam Flare */}
          <div
            className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: '#fef08a',
              opacity: lightIntensity * 0.007
            }}
          />

          {/* Sclera (White of Eye) */}
          <div className="w-56 sm:w-64 h-32 sm:h-36 bg-gradient-to-r from-slate-200 via-white to-slate-200 rounded-[50%] border-4 border-slate-700/90 shadow-2xl flex items-center justify-center overflow-hidden relative">
            {/* Fine Red Blood Vessel capillaries */}
            <div className="absolute left-2 w-8 h-4 border-b border-rose-300/40 rounded-full rotate-12" />
            <div className="absolute right-2 w-8 h-4 border-b border-rose-300/40 rounded-full -rotate-12" />

            {/* Iris (Brown/Hazel Circular Muscle) */}
            <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full bg-radial from-amber-900 via-amber-950 to-stone-900 border-2 border-stone-800 flex items-center justify-center relative shadow-inner">
              {/* Radial Muscle Fibers */}
              <div className="absolute inset-0 rounded-full opacity-30 bg-[radial-gradient(circle,_transparent_30%,_#000_100%)]" />

              {/* Pupil (Constricting Aperture) */}
              <div
                className="bg-black rounded-full transition-all duration-300 ease-out flex items-center justify-center shadow-inner relative"
                style={{
                  width: `${pupilSizePx}px`,
                  height: `${pupilSizePx}px`
                }}
              >
                {/* Specular White Light Reflection Dot */}
                <div className="w-2 h-2 rounded-full bg-white/90 absolute top-1.5 right-1.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Observation Strip */}
      <div className="shrink-0 w-full bg-gray-950 border-t border-gray-800 px-3 py-2 text-center z-10">
        <span className="text-xs sm:text-sm font-bold text-amber-300 block">
          {isAnomaly
            ? "Full Pupillary Constriction: Pupil closed to 2.0mm to protect the retina from light damage!"
            : isDilated
            ? "Pupil dilates to 8.0mm in darkness to gather every available photon of light."
            : "The iris sphincter muscle automatically contracts when light strikes the retina."}
        </span>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
          {isAnomaly
            ? "This pupillary light reflex is involuntary: the optic nerve detects high luminance and signals the oculomotor nerve to tighten iris sphincter muscles."
            : "Observe how the human eye adjusts its optical aperture just like a camera lens."}
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
