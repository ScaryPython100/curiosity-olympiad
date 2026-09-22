"use client";

import { useState, useEffect } from 'react';
import { useTelemetry } from './useTelemetry';
import { OpticsLevel } from './levels/OpticsLevel';
import { GravityLevel } from './levels/GravityLevel';
import { ChemistryLevel } from './levels/ChemistryLevel';
import { Grades68Level } from './levels/Grades68Level';
import { Grades910Level } from './levels/Grades910Level';
import { SoundLevel } from './levels/SoundLevel';
import { ElectricityLevel } from './levels/ElectricityLevel';
import { BuoyancyLevel } from './levels/BuoyancyLevel';
import { KitchenChemistryLevel } from './levels/KitchenChemistryLevel';
import { HumanBodyLevel } from './levels/HumanBodyLevel';
import { PlantsGrowthLevel } from './levels/PlantsGrowthLevel';

import { EXPERIMENTS_CONFIG } from '@/config/scoringConfig';

interface SandboxEngineProps {
  onLevelChange?: (index: number) => void;
  level?: "level1" | "level2";
  mockTestId?: number;
  activeExperimentIndex?: number;
  onExperimentChange?: (index: number) => void;
  onSubmitComplete?: () => void;
  onTelemetryUpdate?: (data: any) => void;
}

export const EXPERIMENT_LABELS: Record<number, string[]> = {
  1: ["Watching TV", "Scale & Prism", "Tree Shadow"],
  2: ["Ceiling Fan", "Cricket Hit", "Roof Freefall"],
  3: ["Kitchen Spoons", "Clay Matka", "Candle & Jar"],
  4: ["Matka in Sun", "Kite String", "Chapati Puff"],
  5: ["First-Rain Soil", "Solar Cooker", "Biogas Plant"],
  6: ["Tapping Matka", "String Telephone", "Well Echoes"],
  7: ["Comb & Paper", "Torch Circuit", "Magnet Test"],
  8: ["Paper Boat", "Egg in Salt Water", "Oil & Water"],
  9: ["Turmeric pH", "Soda & Balloon", "Sugar Saturation"],
  10: ["Pulse & Heartbeat", "Diaphragm & Lungs", "Pupil Reflex"],
  11: ["Oxygen Bubbles", "Leaf Transpiration", "Phototropism"]
};

export default function SandboxEngine({ 
  onLevelChange, 
  level, 
  mockTestId = 1,
  activeExperimentIndex,
  onExperimentChange,
  onSubmitComplete,
  onTelemetryUpdate
}: SandboxEngineProps = {}) {
  const { telemetryData, recordAction, resetTelemetry } = useTelemetry();
  
  const [internalLevelIndex, setInternalLevelIndex] = useState(0);
  const currentLevelIndex = typeof activeExperimentIndex === "number" ? activeExperimentIndex : internalLevelIndex;
  const levelsCount = 3;
  
  const experimentLabels = EXPERIMENT_LABELS[mockTestId] || ["Experiment 1", "Experiment 2", "Experiment 3"];

  useEffect(() => {
    onLevelChange?.(currentLevelIndex);
    onExperimentChange?.(currentLevelIndex);
  }, [currentLevelIndex, onLevelChange, onExperimentChange]);

  useEffect(() => {
    onTelemetryUpdate?.(telemetryData);
    if (typeof window !== "undefined" && (telemetryData.clickCount > 0 || telemetryData.dragCount > 0 || telemetryData.reversals > 0 || telemetryData.triggerActivated)) {
      try {
        const key = `curiosity_exp_telemetry_${mockTestId}_${currentLevelIndex}`;
        localStorage.setItem(key, JSON.stringify(telemetryData));
      } catch (e) {}
    }
  }, [telemetryData, mockTestId, currentLevelIndex, onTelemetryUpdate]);

  const handleRecordAction = (actionType: string, actionDetails?: any) => {
    recordAction(actionType, actionDetails);
  };

  const handleSwitchExperiment = (idx: number) => {
    setInternalLevelIndex(idx);
    onExperimentChange?.(idx);
  };

  const renderLevel = () => {
    if (mockTestId === 1) {
      return <OpticsLevel key={`optics-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 2) {
      return <GravityLevel key={`gravity-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 3) {
      return <ChemistryLevel key={`chem-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 4) {
      return <Grades68Level key={`grades68-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 5) {
      return <Grades910Level key={`grades910-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 6) {
      return <SoundLevel key={`sound-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 7) {
      return <ElectricityLevel key={`electricity-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 8) {
      return <BuoyancyLevel key={`buoyancy-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 9) {
      return <KitchenChemistryLevel key={`kitchen-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 10) {
      return <HumanBodyLevel key={`human-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 11) {
      return <PlantsGrowthLevel key={`plants-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    }
    return null;
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 font-sans relative overflow-x-hidden">
      {/* Ambient Experiment Navigation Bar */}
      <div className="relative w-full overflow-hidden p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200/80 shadow-xs">
        <div 
          className="flex items-center gap-2 w-full overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {experimentLabels.map((name, idx) => {
            const isActive = currentLevelIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handleSwitchExperiment(idx)}
                className={`shrink-0 py-2 px-3.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-[#143867] text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black shrink-0 ${
                  isActive ? 'bg-amber-400 text-amber-950' : 'bg-gray-300 text-gray-700'
                }`}>
                  {idx + 1}
                </span>
                <span className="whitespace-nowrap">{name}</span>
              </button>
            );
          })}
        </div>
        {/* Subtle edge fade indicator for horizontal scroll discovery on mobile */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100 to-transparent rounded-r-2xl sm:hidden flex items-center justify-end pr-1 text-gray-400">
          <span className="material-symbols-outlined text-xs opacity-60">chevron_right</span>
        </div>
      </div>

      {/* Dynamic Physics Level Container */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md border-2 border-gray-800 bg-gray-900 flex flex-col min-h-[380px] sm:min-h-[420px] flex-1 relative">
        {renderLevel()}
      </div>
    </div>
  );
}
