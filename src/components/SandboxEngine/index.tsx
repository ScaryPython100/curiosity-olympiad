"use client";

import { useState } from 'react';
import { useTelemetry } from './useTelemetry';
import { OpticsLevel } from './levels/OpticsLevel';
import { GravityLevel } from './levels/GravityLevel';
import { ChemistryLevel } from './levels/ChemistryLevel';

export default function SandboxEngine() {
  const { telemetryData, recordAction, resetTelemetry } = useTelemetry();
  
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [allTelemetry, setAllTelemetry] = useState<any[]>([]);

  const levels = ['optics', 'gravity', 'chemistry'];
  const currentLevelId = levels[currentLevelIndex];

  // We wrap recordAction so the parent component can know when something happens if needed
  const handleRecordAction = (actionType: string, actionDetails?: any) => {
    recordAction(actionType, actionDetails);
  };

  const calculateLevelScore = (telemetry: any) => {
    // Generate a simple curiosity score based on telemetry (out of 10)
    const baseScore = 5;
    const clickBonus = Math.min(2, telemetry.clickCount * 0.2);
    const reversalBonus = Math.min(2, telemetry.reversals * 0.5);
    const optionalBonus = telemetry.optionalActions > 0 ? 1 : 0;
    return Math.min(10, baseScore + clickBonus + reversalBonus + optionalBonus);
  };

  const handleNextOrSubmit = () => {
    const score = calculateLevelScore(telemetryData);
    const newScores = [...levelScores, score];
    const newTelemetry = [...allTelemetry, { level: currentLevelId, ...telemetryData }];

    if (currentLevelIndex < levels.length - 1) {
      // Go to next level
      setLevelScores(newScores);
      setAllTelemetry(newTelemetry);
      setCurrentLevelIndex(prev => prev + 1);
      resetTelemetry();
    } else {
      // Final Submit
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
  };

  const renderLevel = () => {
    switch (currentLevelId) {
      case 'optics': return <OpticsLevel key="optics" recordAction={handleRecordAction} />;
      case 'gravity': return <GravityLevel key="gravity" recordAction={handleRecordAction} />;
      case 'chemistry': return <ChemistryLevel key="chemistry" recordAction={handleRecordAction} />;
      default: return null;
    }
  };

  const isLastLevel = currentLevelIndex === levels.length - 1;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
      
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-gray-800 font-bold text-lg">Curiosity Assessment</h3>
          <p className="text-sm text-gray-500 font-semibold">Experiment {currentLevelIndex + 1} of {levels.length}</p>
        </div>
        
        <button 
          onClick={handleNextOrSubmit}
          className={`${isLastLevel ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2`}
        >
          <span>{isLastLevel ? 'Submit Complete Test' : 'Next Experiment'}</span>
          <span className="material-symbols-outlined text-sm">{isLastLevel ? 'send' : 'arrow_forward'}</span>
        </button>
      </div>

      {/* Dynamic Physics Level Container */}
      <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800 bg-gray-900 flex flex-col h-[500px]">
        {renderLevel()}
      </div>

    </div>
  );
}
