import { useState, useCallback, useRef, useEffect } from 'react';

export type TelemetryPhase = 'orientation' | 'silent_explore' | 'minimum_met' | 'optional_explore';

export type TelemetryData = {
  clickCount: number;
  dragCount: number;
  totalDwellTime: number;
  averageDwellTime: number;
  reversals: number;
  optionalActions: number; // e.g. hints or optional tools
  tabSwitches: number;
  distinctStatesReached: number;
  dragEntropyScore: number;
  comparisonPatternDetected: boolean;
  idleTimeSeconds: number;
  // New metrics
  voluntaryExplorationTrials: number; // actions taken during 'optional_explore' phase
  continueVsLeaveChoice: 'continue' | 'leave' | null;
  triggerActivated: boolean; // keep for anomaly trigger, NOT for hint button
};

export function useTelemetry() {
  const initialState: TelemetryData = {
    clickCount: 0,
    dragCount: 0,
    totalDwellTime: 0,
    averageDwellTime: 0,
    reversals: 0,
    optionalActions: 0,
    tabSwitches: 0,
    distinctStatesReached: 0,
    dragEntropyScore: 0,
    comparisonPatternDetected: false,
    idleTimeSeconds: 0,
    voluntaryExplorationTrials: 0,
    continueVsLeaveChoice: null,
    triggerActivated: false,
  };
  
  const [data, setData] = useState<TelemetryData>(initialState);
  const [currentPhase, setCurrentPhase] = useState<TelemetryPhase>('orientation');

  const lastActionTime = useRef<number>(Date.now());
  const actionHistory = useRef<string[]>([]);
  const dwellTimes = useRef<number[]>([]);
  const stateHistory = useRef<{stateId: string, timestamp: number}[]>([]);
  const totalIdleTime = useRef<number>(0);
  const dragVectors = useRef<{dx: number, dy: number}[]>([]);

  // Last known values of parameters for reversal detection
  const lastParamValues = useRef<Record<string, { val: number; delta: number; time: number }>>({});

  // Browser Proctoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setData(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const recordAction = useCallback((actionType: string, actionDetails?: any) => {
    const now = Date.now();
    const dwell = now - lastActionTime.current;
    
    // Idle time logic: if dwell > 10 seconds, count it as idle time
    if (dwell > 10000) {
      totalIdleTime.current += Math.floor(dwell / 1000);
    } else {
      dwellTimes.current.push(dwell);
    }
    
    lastActionTime.current = now;
    actionHistory.current.push(actionType);

    // Dwell rule for distinct states
    const stateVal = actionDetails?.stateId || (actionDetails?.val !== undefined ? `${actionType}:${actionDetails.val}` : null) || (actionDetails?.waterLevel !== undefined ? `water:${actionDetails.waterLevel}` : null);
    if (stateVal) {
      if (dwell >= 300) {
        stateHistory.current.push({ stateId: String(stateVal), timestamp: now });
      }
    }

    // Drag Entropy logic
    if (actionType.startsWith('drag') && actionDetails?.dx !== undefined && actionDetails?.dy !== undefined) {
      dragVectors.current.push({ dx: actionDetails.dx, dy: actionDetails.dy });
    }

    setData(prev => {
      const isDrag = actionType.startsWith('drag');
      const isClick = actionType.startsWith('click') || actionType.startsWith('tap') || actionType.startsWith('rub') || actionType.startsWith('stir') || actionType.startsWith('add');
      const isChange = actionType.startsWith('change') || actionType.startsWith('toggle') || actionType.startsWith('reset');
      const isOptional = actionType === 'optional_tool_used' || actionType.includes('filter') || actionType.includes('catalyst');
      
      const isAnomalyTrigger = 
        actionType === 'anomaly_trigger_activated' || 
        Boolean(actionDetails?.hasEcho) || 
        Boolean(actionDetails?.isPinched) || 
        Boolean(actionDetails?.triggerActivated) ||
        Boolean(actionDetails?.isTrigger) ||
        actionType.includes('anomaly') ||
        actionType.includes('trigger');

      let reversals = prev.reversals;
      let comparisonPatternDetected = prev.comparisonPatternDetected;
      let voluntaryExplorationTrials = prev.voluntaryExplorationTrials;

      // Detect slider reversals (e.g. dragging left then right, or value moving up then down within 2500ms)
      const numericVal = typeof actionDetails?.val === 'number' 
        ? actionDetails.val 
        : typeof actionDetails?.waterLevel === 'number' 
          ? actionDetails.waterLevel 
          : typeof actionDetails?.tension === 'number'
            ? actionDetails.tension
            : typeof actionDetails?.depth === 'number'
              ? actionDetails.depth
              : typeof actionDetails?.refractiveIndex === 'number'
                ? actionDetails.refractiveIndex
                : null;

      if (numericVal !== null) {
        const lastParam = lastParamValues.current[actionType];
        if (lastParam) {
          const currentDelta = numericVal - lastParam.val;
          const timeSince = now - lastParam.time;
          if (timeSince < 2500 && Math.abs(currentDelta) > 0 && Math.abs(lastParam.delta) > 0) {
            // Opposite direction indicates hypothesis testing reversal
            if ((currentDelta > 0 && lastParam.delta < 0) || (currentDelta < 0 && lastParam.delta > 0)) {
              reversals += 1;
            }
          }
          lastParamValues.current[actionType] = { val: numericVal, delta: currentDelta, time: now };
        } else {
          lastParamValues.current[actionType] = { val: numericVal, delta: 0, time: now };
        }
      }

      // Drag reversal logic
      if (isDrag && actionHistory.current.length > 1) {
        const prevAction = actionHistory.current[actionHistory.current.length - 2];
        if (prevAction.startsWith('drag') && actionType !== prevAction && dwell < 2000) {
           reversals += 1;
        }
      }

      // Increment voluntary trials if in optional_explore phase or after minimum engagement
      if (currentPhase === 'optional_explore' && (isDrag || isClick || isChange)) {
        voluntaryExplorationTrials += 1;
      }

      // Comparison Pattern logic (State A -> State B -> State A)
      if (stateHistory.current.length >= 3) {
        const states = stateHistory.current.map(s => s.stateId);
        const last = states[states.length - 1];
        const prev2 = states[states.length - 3];
        if (last === prev2 && last !== states[states.length - 2]) {
          comparisonPatternDetected = true;
        }
      }

      const totalDwell = dwellTimes.current.reduce((a, b) => a + b, 0);
      const avgDwell = dwellTimes.current.length > 0 ? totalDwell / dwellTimes.current.length : 0;

      // Unique states
      const uniqueStates = Math.max(1, new Set(stateHistory.current.map(s => s.stateId)).size);

      // Entropy calculation: sum of distances vs straight line distance
      let dragEntropyScore = 0;
      if (dragVectors.current.length > 0) {
        let totalPathLength = 0;
        let startPoint = { x: 0, y: 0 };
        let currentPoint = { x: 0, y: 0 };
        
        for (const v of dragVectors.current) {
          totalPathLength += Math.sqrt(v.dx * v.dx + v.dy * v.dy);
          currentPoint.x += v.dx;
          currentPoint.y += v.dy;
        }
        
        const straightLineLength = Math.sqrt(currentPoint.x * currentPoint.x + currentPoint.y * currentPoint.y);
        if (straightLineLength > 0) {
           const ratio = totalPathLength / straightLineLength;
           dragEntropyScore = Math.min(1, 1 - (1 / ratio)); 
        }
      }

      return {
        ...prev,
        clickCount: prev.clickCount + (isClick ? 1 : 0),
        dragCount: prev.dragCount + (isDrag || isChange ? 1 : 0),
        optionalActions: prev.optionalActions + (isOptional ? 1 : 0),
        totalDwellTime: totalDwell,
        averageDwellTime: avgDwell,
        reversals,
        distinctStatesReached: uniqueStates,
        dragEntropyScore,
        comparisonPatternDetected,
        idleTimeSeconds: totalIdleTime.current,
        triggerActivated: prev.triggerActivated || isAnomalyTrigger,
        voluntaryExplorationTrials
      };
    });
  }, [currentPhase]);

  const setChoice = useCallback((choice: 'continue' | 'leave') => {
    setData(prev => ({ ...prev, continueVsLeaveChoice: choice }));
    if (choice === 'continue') {
      setCurrentPhase('optional_explore');
    }
  }, []);

  const resetTelemetry = useCallback(() => {
    setData(initialState);
    setCurrentPhase('orientation');
    lastActionTime.current = Date.now();
    actionHistory.current = [];
    dwellTimes.current = [];
    stateHistory.current = [];
    totalIdleTime.current = 0;
    dragVectors.current = [];
  }, [initialState]); // react-hooks/exhaustive-deps will complain if initialState changes but it's constant above so okay

  return { telemetryData: data, currentPhase, setCurrentPhase, recordAction, setChoice, resetTelemetry };
}
