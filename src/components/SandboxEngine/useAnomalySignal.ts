"use client";

import { useEffect, useRef } from "react";

/**
 * Reports an experiment's anomaly (the unexpected result it is built around)
 * to telemetry, once. The state an experiment opens in does not count: only
 * a change the learner causes does, so the "after anomaly" prompt is shown
 * only to learners who actually ran into the surprise.
 */
export function useAnomalySignal(
  isAnomaly: boolean,
  recordAction: (actionType: string, actionDetails?: Record<string, unknown>) => void
) {
  const initial = useRef(isAnomaly);
  const fired = useRef(false);

  useEffect(() => {
    if (!isAnomaly) {
      initial.current = false;
      return;
    }
    if (initial.current || fired.current) return;
    fired.current = true;
    recordAction("anomaly_trigger_activated", { triggerActivated: true });
  }, [isAnomaly, recordAction]);
}
