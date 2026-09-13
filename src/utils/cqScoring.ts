/**
 * Curiosity Quotient (CQ) Multi-Axis Scoring Engine
 * 
 * Based on the Agastya "Aah! Aha! Ha-ha!" experiential learning framework:
 * - Depth: Epistemic depth & hypothesis formulation (Generative Inquiry)
 * - Reversals: Systematic variable isolation & comparative testing (Directed Inquiry)
 * - Anomalies: Response to unexpected phenomena & boundary conditions (Uncertainty Response)
 * - Breadth: Range of distinct states & cross-domain exploration (Exploration Range)
 * - Voluntary: Unprompted actions & self-directed persistence (Voluntary Seeking)
 */

export interface CQAxis {
  id: "voluntary" | "uncertainty" | "directed" | "generative" | "range";
  label: string;
  score: number; // 0 to 100
  icon: string;
  description: string;
  superpowerText: string;
  growthFeedback: string;
}

export interface RawTelemetryLog {
  experiment_id?: string;
  mockTestId?: number;
  voluntary_trials?: number;
  voluntaryExplorationTrials?: number;
  distinct_states_reached?: number;
  distinctStatesReached?: number;
  epistemic_depth?: number;
  trigger_activated?: boolean;
  triggerActivated?: boolean;
  hasEcho?: boolean;
  isPinched?: boolean;
  comparison_pattern_detected?: boolean;
  comparisonPatternDetected?: boolean;
  reversals?: number;
  total_time_seconds?: number;
  totalDwellTime?: number;
  optionalActions?: number;
  clickCount?: number;
  dragCount?: number;
  sliderAdjustments?: number;
  boundaryProbes?: number;
  continue_vs_leave?: "continue" | "leave" | null;
  [key: string]: any;
}

export interface CQScoringInput {
  telemetryLogs?: RawTelemetryLog[];
  completedMockTests?: Record<string | number, any>;
  reflections?: Record<string, string>;
  xp?: number;
}

export interface CQProfileResult {
  axes: CQAxis[];
  superpower: {
    label: string;
    superpowerText: string;
    id?: string;
  };
  growthArea: {
    label: string;
    growthFeedback: string;
    id?: string;
  };
  isTiedOrTooClose: boolean;
  scoreSpread: number;
}

// Axis definitions with copy
const AXIS_CONFIG: Record<CQAxis["id"], Omit<CQAxis, "score">> = {
  voluntary: {
    id: "voluntary",
    label: "Voluntary Seeking",
    icon: "explore",
    description: "Exploring beyond the minimum requirement just to learn more.",
    superpowerText: "You have a natural drive to uncover hidden knowledge!",
    growthFeedback: "Try playing around a little longer after finishing the required steps!"
  },
  uncertainty: {
    id: "uncertainty",
    label: "Uncertainty Response",
    icon: "help_center",
    description: "How you react when things don't go as expected.",
    superpowerText: "You are not afraid of surprises, you investigate them!",
    growthFeedback: "When you see something weird happen in the lab, try investigating it!"
  },
  directed: {
    id: "directed",
    label: "Directed Inquiry",
    icon: "target",
    description: "Testing specific variables systematically to find an answer.",
    superpowerText: "You think like a scientist, testing one thing at a time!",
    growthFeedback: "Try changing just one slider at a time to see exactly what it does!"
  },
  generative: {
    id: "generative",
    label: "Generative Inquiry",
    icon: "psychology_alt",
    description: "Asking 'what if' questions and proposing new ideas.",
    superpowerText: "You ask incredible, mind-expanding questions!",
    growthFeedback: "When submitting your logbook, try asking a 'What if...' question!"
  },
  range: {
    id: "range",
    label: "Exploration Range",
    icon: "travel_explore",
    description: "Trying completely different things across the whole environment.",
    superpowerText: "You love seeing every possibility a system has to offer!",
    growthFeedback: "Don't be afraid to push the sliders to their extremes to see what happens!"
  }
};

/**
 * Computes genuine, distinct scores for each of the 5 Curiosity Quotient axes.
 */
export function calculateCQProfile(input: CQScoringInput): CQProfileResult {
  const {
    telemetryLogs = [],
    completedMockTests = {},
    reflections = {},
  } = input;

  const completedTestKeys = Object.keys(completedMockTests);
  const completedCount = completedTestKeys.length;
  const logsCount = telemetryLogs.length;

  const validReflections = Object.entries(reflections).filter(
    ([_, text]) => typeof text === "string" && text.trim().length > 3
  );
  const reflectionCount = validReflections.length;

  const hasAnyActivity = completedCount > 0 || logsCount > 0 || reflectionCount > 0;

  // Uncalibrated / brand-new account fallback (safe starting baseline)
  if (!hasAnyActivity) {
    const baselineScore = 20;
    const axes: CQAxis[] = (Object.keys(AXIS_CONFIG) as CQAxis["id"][]).map((id) => ({
      ...AXIS_CONFIG[id],
      score: baselineScore
    }));

    return {
      axes,
      isTiedOrTooClose: true,
      scoreSpread: 0,
      superpower: {
        label: "Balanced Explorer",
        superpowerText: "Your curiosity profile is ready for discovery. Complete your first practice labs to reveal your unique scientific strengths!"
      },
      growthArea: {
        label: "Begin Your Lab Journey",
        growthFeedback: "Start with any physics or chemistry lab. Try tweaking sliders, testing extreme values, and writing down a 'What if' question!"
      }
    };
  }

  // 1. Extract and aggregate distinct telemetry signals
  let totalVoluntaryTrials = 0;
  let totalDwellSeconds = 0;
  let totalOptionalActions = 0;
  let totalReversals = 0;
  let totalAnomalies = 0;
  let totalDistinctStates = 0;
  let totalComparisons = 0;
  let totalBoundaryProbes = 0;
  let totalSliderEdits = 0;

  telemetryLogs.forEach((log) => {
    totalVoluntaryTrials += (log.voluntary_trials || log.voluntaryExplorationTrials || 0);
    totalDwellSeconds += Math.floor((log.totalDwellTime || 0) / 1000) || (log.total_time_seconds || 0);
    totalOptionalActions += (log.optionalActions || 0);
    totalReversals += (log.reversals || 0);
    
    if (log.trigger_activated || log.triggerActivated || log.hasEcho || log.isPinched) {
      totalAnomalies += 1;
    }
    
    totalDistinctStates += (log.distinct_states_reached || log.distinctStatesReached || 0);
    if (log.comparison_pattern_detected || log.comparisonPatternDetected) {
      totalComparisons += 1;
    }
    totalBoundaryProbes += (log.boundaryProbes || 0);
    totalSliderEdits += (log.sliderAdjustments || log.clickCount || log.dragCount || 0);
  });

  // Extract signals from completed mock test metadata
  Object.entries(completedMockTests).forEach(([testId, res]: [string, any]) => {
    if (res.timeSecs) totalDwellSeconds += res.timeSecs;
    if (res.telemetryBonusXP && totalReversals === 0) {
      const inferredReversals = Math.floor((res.telemetryBonusXP % 1000) / 50);
      if (inferredReversals > 0) totalReversals += inferredReversals;
    }
  });

  // -------------------------------------------------------------
  // AXIS 1: VOLUNTARY SEEKING (unprompted actions, dwell, optional tools)
  // Baseline: 32. Sensitive to unprompted exploration trials & staying active in lab
  // -------------------------------------------------------------
  const voluntaryActivity = 
    Math.min(32, totalVoluntaryTrials * 3.5) + 
    Math.min(16, totalOptionalActions * 4) + 
    Math.min(16, Math.floor(totalDwellSeconds / 60) * 1.8);
  const voluntaryScore = Math.min(96, Math.max(22, Math.round(32 + voluntaryActivity)));

  // -------------------------------------------------------------
  // AXIS 2: UNCERTAINTY RESPONSE (anomalies discovered, boundary probing)
  // Baseline: 28. Sensitive to physical triggers (prism dispersion, echo threshold, damping)
  // -------------------------------------------------------------
  const anomalySignal = 
    Math.min(42, totalAnomalies * 11) + 
    Math.min(18, totalBoundaryProbes * 4.5);
  const uncertaintyScore = Math.min(97, Math.max(22, Math.round(28 + anomalySignal)));

  // -------------------------------------------------------------
  // AXIS 3: DIRECTED INQUIRY (reversals, hypothesis testing, comparisons)
  // Baseline: 30. Sensitive to back-and-forth slider reversals & variable isolation
  // -------------------------------------------------------------
  const directedSignal = 
    Math.min(38, totalReversals * 4) + 
    Math.min(16, totalComparisons * 5.5) + 
    Math.min(10, Math.floor(totalSliderEdits / 8));
  const directedScore = Math.min(96, Math.max(22, Math.round(30 + directedSignal)));

  // -------------------------------------------------------------
  // AXIS 4: GENERATIVE INQUIRY (epistemic depth, reflection questions)
  // Baseline: 24. Sensitive to "Quick Scientist's Thought" reflections and question syntax
  // -------------------------------------------------------------
  let reflectionScore = 0;
  validReflections.forEach(([_, text]) => {
    const lower = text.toLowerCase();
    let pts = 10;
    if (lower.includes("what if") || lower.includes("what-if")) pts += 8;
    if (lower.includes("why") || lower.includes("because")) pts += 5;
    if (lower.includes("if we") || lower.includes("predict") || lower.includes("hypothesis") || lower.includes("suppose")) pts += 7;
    if (lower.includes("?")) pts += 4;
    if (text.trim().length > 30) pts += 4;
    reflectionScore += pts;
  });
  const avgEpistemic = telemetryLogs.length > 0 
    ? telemetryLogs.reduce((acc, l) => acc + (l.epistemic_depth || 0), 0) / telemetryLogs.length 
    : 0;
  reflectionScore += Math.round(avgEpistemic * 6);
  const generativeScore = Math.min(96, Math.max(22, Math.round(24 + Math.min(55, reflectionScore))));

  // -------------------------------------------------------------
  // AXIS 5: EXPLORATION RANGE (distinct experiments & state space coverage)
  // Baseline: 26. Sensitive to multi-domain breadth & distinct configurations explored
  // -------------------------------------------------------------
  const domainBreadth = Math.min(44, completedCount * 9.5); // e.g. 1 test = +9.5, 3 tests = +28.5, 4 tests = +38
  const stateBreadth = Math.min(24, totalDistinctStates * 1.4);
  const rangeScore = Math.min(98, Math.max(22, Math.round(26 + domainBreadth + stateBreadth)));

  // Build axes array
  const computedScores: Record<CQAxis["id"], number> = {
    voluntary: voluntaryScore,
    uncertainty: uncertaintyScore,
    directed: directedScore,
    generative: generativeScore,
    range: rangeScore
  };

  const axes: CQAxis[] = (Object.keys(AXIS_CONFIG) as CQAxis["id"][]).map((id) => ({
    ...AXIS_CONFIG[id],
    score: computedScores[id]
  }));

  // -------------------------------------------------------------
  // TIE-BREAKING & SUPERPOWER / GROWTH AREA SELECTION
  // -------------------------------------------------------------
  const scoreValues = axes.map((a) => a.score);
  const maxScore = Math.max(...scoreValues);
  const minScore = Math.min(...scoreValues);
  const scoreSpread = maxScore - minScore;

  // If scores are too close together to meaningfully differentiate (<5 pts)
  const isTiedOrTooClose = scoreSpread < 5;

  if (isTiedOrTooClose) {
    return {
      axes,
      isTiedOrTooClose: true,
      scoreSpread,
      superpower: {
        label: "Balanced Explorer",
        superpowerText: "Your curiosity profile is remarkably balanced across all dimensions. As you tackle more diverse labs, distinct specialized traits will emerge!"
      },
      growthArea: {
        label: "Broaden Your Spectrum",
        growthFeedback: "You have an even curiosity baseline across all five areas. Try diving deeply into a single experiment with systematic reversals, or proposing an unexpected 'What if...' to develop your signature scientific superpower!"
      }
    };
  }

  // Priority order for Superpower tie-breaking:
  // generative > uncertainty > directed > range > voluntary
  const superpowerPriority: CQAxis["id"][] = ["generative", "uncertainty", "directed", "range", "voluntary"];
  const maxAxes = axes.filter((a) => a.score === maxScore);
  const superpower = maxAxes.sort(
    (a, b) => superpowerPriority.indexOf(a.id) - superpowerPriority.indexOf(b.id)
  )[0];

  // Priority order for Growth Area tie-breaking (most actionable foundational skill):
  // directed > voluntary > range > uncertainty > generative
  // MUST EXCLUDE the chosen superpower axis so contradiction is mathematically impossible
  const growthPriority: CQAxis["id"][] = ["directed", "voluntary", "range", "uncertainty", "generative"];
  const eligibleGrowthAxes = axes.filter((a) => a.id !== superpower.id);
  const minEligibleScore = Math.min(...eligibleGrowthAxes.map((a) => a.score));
  const minAxes = eligibleGrowthAxes.filter((a) => a.score === minEligibleScore);
  const growthAxis = minAxes.sort(
    (a, b) => growthPriority.indexOf(a.id) - growthPriority.indexOf(b.id)
  )[0];

  return {
    axes,
    isTiedOrTooClose: false,
    scoreSpread,
    superpower: {
      id: superpower.id,
      label: superpower.label,
      superpowerText: superpower.superpowerText
    },
    growthArea: {
      id: growthAxis.id,
      label: growthAxis.label,
      growthFeedback: growthAxis.growthFeedback
    }
  };
}
