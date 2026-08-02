"use client";

import { useState, useEffect } from 'react';
import { useTelemetry } from './useTelemetry';
import { OpticsLevel } from './levels/OpticsLevel';
import { GravityLevel } from './levels/GravityLevel';
import { ChemistryLevel } from './levels/ChemistryLevel';

interface SandboxEngineProps {
  onLevelChange?: (index: number) => void;
  level?: "level1" | "level2";
  mockTestId?: number;
  activeExperimentIndex?: number;
  onExperimentChange?: (index: number) => void;
  onSubmitComplete?: () => void;
}

export default function SandboxEngine({ 
  onLevelChange, 
  level, 
  mockTestId = 1,
  activeExperimentIndex,
  onExperimentChange,
  onSubmitComplete
}: SandboxEngineProps = {}) {
  const { telemetryData, recordAction, resetTelemetry } = useTelemetry();
  
  const [internalLevelIndex, setInternalLevelIndex] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [allTelemetry, setAllTelemetry] = useState<any[]>([]);

  const currentLevelIndex = typeof activeExperimentIndex === "number" ? activeExperimentIndex : internalLevelIndex;
  const levelsCount = 3;

  useEffect(() => {
    onLevelChange?.(currentLevelIndex);
    onExperimentChange?.(currentLevelIndex);
  }, [currentLevelIndex, onLevelChange, onExperimentChange]);

  const handleRecordAction = (actionType: string, actionDetails?: any) => {
    recordAction(actionType, actionDetails);
  };

  const calculateLevelScore = (telemetry: any) => {
    const baseScore = 5;
    const clickBonus = Math.min(2, telemetry.clickCount * 0.2);
    const reversalBonus = Math.min(2, telemetry.reversals * 0.5);
    const optionalBonus = telemetry.optionalActions > 0 ? 1 : 0;
    return Math.min(10, baseScore + clickBonus + reversalBonus + optionalBonus);
  };

  const handleNextOrSubmit = () => {
    const score = calculateLevelScore(telemetryData);
    const newScores = [...levelScores, score];
    const newTelemetry = [...allTelemetry, { level: currentLevelIndex, ...telemetryData }];

    if (currentLevelIndex < levelsCount - 1) {
      const nextIdx = currentLevelIndex + 1;
      setLevelScores(newScores);
      setAllTelemetry(newTelemetry);
      setInternalLevelIndex(nextIdx);
      onExperimentChange?.(nextIdx);
      resetTelemetry();
    } else {
      if (onSubmitComplete) {
        onSubmitComplete();
      } else {
        const totalScore = newScores.reduce((a, b) => a + b, 0);
        const averageScoreOutOf10 = totalScore / newScores.length;

        const payload = {
          statement: {
            verb: { display: { "en-US": "completed" } },
            result: {
              score: {
                raw: Math.round(averageScoreOutOf10),
                max: 10
              }
            },
            extensions: {
              "http://telemetry.org": newTelemetry
            }
          }
        };

        window.parent.postMessage(JSON.stringify(payload), "*");
      }
    }
  };

  const renderLevel = () => {
    if (mockTestId === 1) {
      return <OpticsLevel key={`optics-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 2) {
      return <GravityLevel key={`gravity-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    } else if (mockTestId === 3) {
      return <ChemistryLevel key={`chem-${currentLevelIndex}`} recordAction={handleRecordAction} experimentSubIndex={currentLevelIndex} />;
    }
    
    switch (currentLevelIndex) {
      case 0: return <OpticsLevel key="optics" recordAction={handleRecordAction} experimentSubIndex={0} />;
      case 1: return <GravityLevel key="gravity" recordAction={handleRecordAction} experimentSubIndex={1} />;
      case 2: return <ChemistryLevel key="chemistry" recordAction={handleRecordAction} experimentSubIndex={2} />;
      default: return null;
    }
  };

  const isLastLevel = currentLevelIndex === levelsCount - 1;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 bg-gray-50 p-3 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
        <div>
          <h3 className="text-gray-800 font-bold text-base sm:text-lg">Curiosity Assessment</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs sm:text-sm text-gray-500 font-semibold">Experiment {currentLevelIndex + 1} of {levelsCount}</p>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInternalLevelIndex(idx);
                    onExperimentChange?.(idx);
                  }}
                  className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                    currentLevelIndex === idx 
                      ? "bg-[#143867] text-white ring-2 ring-[#f37021]" 
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleNextOrSubmit}
          className={`w-full sm:w-auto justify-center ${isLastLevel ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2`}
        >
          <span>{isLastLevel ? 'Submit Complete Test' : 'Next Experiment →'}</span>
          <span className="material-symbols-outlined text-sm">{isLastLevel ? 'send' : 'arrow_forward'}</span>
        </button>
      </div>

      {/* Dynamic Physics Level Container */}
      <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-gray-800 bg-gray-900 flex flex-col min-h-[520px] sm:min-h-[560px] md:min-h-[600px] h-auto">
        {renderLevel()}
      </div>

    </div>
  );
}
