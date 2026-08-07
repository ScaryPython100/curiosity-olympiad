import { useState, useCallback, useRef, useEffect } from 'react';

export type TelemetryData = {
  clickCount: number;
  dragCount: number;
  totalDwellTime: number;
  averageDwellTime: number;
  reversals: number;
  optionalActions: number;
  tabSwitches: number;
  distinctStatesReached: number;
  dragEntropyScore: number;
  comparisonPatternDetected: boolean;
  idleTimeSeconds: number;
  triggerActivated: boolean;
};

export function useTelemetry() {
  const initialState = {
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
    triggerActivated: false,
  };
  
  const [data, setData] = useState<TelemetryData>(initialState);

  const lastActionTime = useRef<number>(Date.now());
  const actionHistory = useRef<string[]>([]);
  const dwellTimes = useRef<number[]>([]);
  const stateHistory = useRef<{stateId: string, timestamp: number}[]>([]);
  const totalIdleTime = useRef<number>(0);
  const dragVectors = useRef<{dx: number, dy: number}[]>([]);

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
    if (actionDetails?.stateId) {
      // If the pointer was stationary in the LAST state for >= 800ms
      if (dwell >= 800) {
        // Add previous state to valid distinct states if not already there
        const prevState = actionHistory.current.length > 1 ? actionHistory.current[actionHistory.current.length - 2] : null;
        if (prevState) {
          stateHistory.current.push({ stateId: prevState, timestamp: now - dwell });
        }
      }
    }

    // Drag Entropy logic
    if (actionType.startsWith('drag') && actionDetails?.dx !== undefined && actionDetails?.dy !== undefined) {
      dragVectors.current.push({ dx: actionDetails.dx, dy: actionDetails.dy });
    }

    setData(prev => {
      const isDrag = actionType.startsWith('drag');
      const isClick = actionType.startsWith('click');
      const isOptional = actionType === 'optional_tool_used';
      const isTrigger = actionType === 'trigger_activated';
      
      let reversals = prev.reversals;
      let comparisonPatternDetected = prev.comparisonPatternDetected;
      
      // Simple reversal logic: dragging something left, then right shortly after
      if (isDrag && actionHistory.current.length > 1) {
        const prevAction = actionHistory.current[actionHistory.current.length - 2];
        if (prevAction.startsWith('drag') && actionType !== prevAction && dwell < 2000) {
           reversals += 1;
        }
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
      const uniqueStates = new Set(stateHistory.current.map(s => s.stateId)).size;

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
        // Ratio of actual path to straight line. If path is very wiggly, ratio > 1. Map to 0-1 range.
        if (straightLineLength > 0) {
           const ratio = totalPathLength / straightLineLength;
           dragEntropyScore = Math.min(1, 1 - (1 / ratio)); 
        }
      }

      return {
        ...prev,
        clickCount: prev.clickCount + (isClick ? 1 : 0),
        dragCount: prev.dragCount + (isDrag ? 1 : 0),
        optionalActions: prev.optionalActions + (isOptional ? 1 : 0),
        totalDwellTime: totalDwell,
        averageDwellTime: avgDwell,
        reversals,
        distinctStatesReached: uniqueStates,
        dragEntropyScore,
        comparisonPatternDetected,
        idleTimeSeconds: totalIdleTime.current,
        triggerActivated: prev.triggerActivated || isTrigger,
      };
    });
  }, []);

  const resetTelemetry = useCallback(() => {
    setData(initialState);
    lastActionTime.current = Date.now();
    actionHistory.current = [];
    dwellTimes.current = [];
    stateHistory.current = [];
    totalIdleTime.current = 0;
    dragVectors.current = [];
  }, [initialState]);

  return { telemetryData: data, recordAction, resetTelemetry };
}
