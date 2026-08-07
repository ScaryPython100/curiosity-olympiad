"use client";

import { useState, useEffect } from 'react';
import { useTelemetry } from './useTelemetry';
import { OpticsLevel } from './levels/OpticsLevel';
import { GravityLevel } from './levels/GravityLevel';
import { ChemistryLevel } from './levels/ChemistryLevel';
import { getExperimentConfig, EXPERIMENTS_CONFIG } from '@/config/scoringConfig';
import { evaluateExperiment, gradeFreeText } from '@/app/actions/scoring';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
  
  const [internalLevelIndex, setInternalLevelIndex] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [allTelemetry, setAllTelemetry] = useState<any[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");
  
  const [freeTextResponse, setFreeTextResponse] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [objectiveCompleted, setObjectiveCompleted] = useState(false);

  const currentLevelIndex = typeof activeExperimentIndex === "number" ? activeExperimentIndex : internalLevelIndex;
  const levelsCount = 3;
  
  // Mapping level indices to experiment IDs based on our scoringConfig
  const experimentMap: Record<number, Record<number, string>> = {
    1: { 0: "optics_1", 1: "optics_2", 2: "optics_1" },
    2: { 0: "gravity_1", 1: "gravity_2", 2: "gravity_1" },
    3: { 0: "chemistry_1", 1: "chemistry_2", 2: "chemistry_1" }
  };
  
  const experimentId = experimentMap[mockTestId] ? experimentMap[mockTestId][currentLevelIndex] : "optics_1";
  const experimentConfig = EXPERIMENTS_CONFIG[experimentId];
  const hasFreeText = !!experimentConfig?.freeTextRubric;

  useEffect(() => {
    onLevelChange?.(currentLevelIndex);
    onExperimentChange?.(currentLevelIndex);
    setFeedbackMsg(""); // clear message on change
    setFreeTextResponse("");
    setObjectiveCompleted(false);
  }, [currentLevelIndex, onLevelChange, onExperimentChange]);

  const handleRecordAction = (actionType: string, actionDetails?: any) => {
    recordAction(actionType, actionDetails);
  };

  const handleSubmitAnswer = () => {
    setObjectiveCompleted(true);
    setFeedbackMsg("Objective completed! Now, explore further or submit your findings.");
  };

  const handleCuriosity = () => {
    recordAction('trigger_activated');
    setFeedbackMsg("What if? Try doing something silly and see what happens!");
  };

  const handleNextOrSubmit = async () => {
    setIsGrading(true);
    
    let mlScore = 0;
    let mlFeedback = "";
    
    if (hasFreeText && freeTextResponse.trim()) {
      setFeedbackMsg("Grading your response...");
      const result = await gradeFreeText(experimentId, freeTextResponse);
      if (result.success && result.result) {
        mlScore = result.result.score;
        mlFeedback = result.result.feedback;
      }
    }
    
    // Process backend scoring and save telemetry
    const evalResult = await evaluateExperiment({
      experimentId,
      telemetry: telemetryData,
      objectiveCompleted,
      freeTextResponse,
      freeTextScore: mlScore,
      freeTextFeedback: mlFeedback
    });

    const finalScore: number = (evalResult.success && evalResult.score) ? evalResult.score : 0;
    const newScores = [...levelScores, finalScore];
    const newTelemetry = [...allTelemetry, { level: currentLevelIndex, ...telemetryData, mlFeedback }];

    setIsGrading(false);

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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3 bg-white p-3 sm:p-5 rounded-2xl shadow-sm border border-gray-100 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1">
        <div>
          <h3 className="text-gray-800 font-bold text-base sm:text-lg">{t.sandbox.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">{t.sandbox.game} {currentLevelIndex + 1} {t.sandbox.of} {levelsCount}</p>
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
                      ? "bg-[#143867] text-white ring-2 ring-[#143867]" 
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Physics Level Container - Fluid Aspect Ratio */}
      <div className="w-full rounded-xl overflow-hidden shadow-md border-2 border-gray-800 bg-gray-900 flex flex-col aspect-video relative">
        {renderLevel()}
      </div>
      
      {/* Free Text ML Question UI */}
      {hasFreeText && objectiveCompleted && (
        <div className="w-full bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col gap-2">
          <p className="font-bold text-blue-900">{experimentConfig.freeTextRubric?.prompt}</p>
          <textarea
            className="w-full border border-blue-300 rounded-lg p-2 text-sm text-gray-800 bg-white"
            rows={3}
            placeholder={t.sandbox.type_answer_placeholder}
            value={freeTextResponse}
            onChange={(e) => setFreeTextResponse(e.target.value)}
          />
        </div>
      )}

      {/* NEW Control Panel */}
      <div className="w-full bg-gray-100 p-3 sm:p-4 rounded-xl flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center w-full">
          {/* Left: Submit */}
          <button 
            onClick={handleSubmitAnswer}
            className="w-full sm:w-1/3 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm font-bold transition-colors"
          >
            {t.sandbox.submit_objective}
          </button>
          
          {/* Middle: Move to next */}
          <button 
            onClick={handleNextOrSubmit}
            disabled={isGrading}
            className="w-full sm:w-1/3 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {isGrading ? t.sandbox.evaluating : (isLastLevel ? t.sandbox.finish_game : t.sandbox.skip_next)}
          </button>

          {/* Right: Curiosity */}
          <button 
            onClick={handleCuriosity}
            className="w-full sm:w-1/3 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Curiosity
          </button>
        </div>
        
        {/* Feedback Text Area */}
        {feedbackMsg && (
          <div className="w-full min-h-[40px] px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 font-bold text-sm">
            {feedbackMsg}
          </div>
        )}
      </div>

    </div>
  );
}
