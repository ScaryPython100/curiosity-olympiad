import { useState, useCallback, useRef, useEffect } from 'react';

export type TelemetryData = {
  clickCount: number;
  dragCount: number;
  totalDwellTime: number;
  averageDwellTime: number;
  reversals: number;
  optionalActions: number;
  tabSwitches: number;
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
  };
  
  const [data, setData] = useState<TelemetryData>(initialState);

  const lastActionTime = useRef<number>(Date.now());
  const actionHistory = useRef<string[]>([]);
  const dwellTimes = useRef<number[]>([]);

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
    dwellTimes.current.push(dwell);
    lastActionTime.current = now;
    actionHistory.current.push(actionType);

    setData(prev => {
      const isDrag = actionType.startsWith('drag');
      const isClick = actionType.startsWith('click');
      const isOptional = actionType === 'optional_tool_used';
      
      let reversals = prev.reversals;
      
      // Simple reversal logic: dragging something left, then right shortly after
      if (isDrag && actionHistory.current.length > 1) {
        const prevAction = actionHistory.current[actionHistory.current.length - 2];
        if (prevAction.startsWith('drag') && actionType !== prevAction && dwell < 2000) {
           reversals += 1;
        }
      }

      const totalDwell = dwellTimes.current.reduce((a, b) => a + b, 0);
      const avgDwell = dwellTimes.current.length > 0 ? totalDwell / dwellTimes.current.length : 0;

      return {
        ...prev,
        clickCount: prev.clickCount + (isClick ? 1 : 0),
        dragCount: prev.dragCount + (isDrag ? 1 : 0),
        optionalActions: prev.optionalActions + (isOptional ? 1 : 0),
        totalDwellTime: totalDwell,
        averageDwellTime: avgDwell,
        reversals,
      };
    });
  }, []);

  const resetTelemetry = useCallback(() => {
    setData(initialState);
    lastActionTime.current = Date.now();
    actionHistory.current = [];
    dwellTimes.current = [];
  }, [initialState]);

  return { telemetryData: data, recordAction, resetTelemetry };
}
