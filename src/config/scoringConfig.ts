export type DifficultyTier = "foundation" | "intermediate" | "advanced";

export type LevelGateType = "attempt_all" | "min_cq_score";

export interface FreeTextRubric {
  questionId: string;
  prompt: string;
  rubricConcepts: string[];
  maxPoints: number;
}

export interface ExperimentConfig {
  experimentId: string;
  levelIndex: number;
  experimentSubIndex: number;
  tier: DifficultyTier;
  basePts: number;
  explorationPts: number;
  freeTextRubric?: FreeTextRubric;
}

export interface LevelConfig {
  levelIndex: number;
  name: string;
  gateType: LevelGateType;
  gateThreshold: number; // e.g. 0 for attempt_all, 60 for min_cq_score (60%)
}

// Global configurations for difficulty scaling
export const DIFFICULTY_SCALING = {
  foundation: { basePts: 5, explorationPts: 5 },
  intermediate: { basePts: 4, explorationPts: 6 },
  advanced: { basePts: 3, explorationPts: 7 },
};

// Level definitions and gates
export const LEVELS_CONFIG: Record<number, LevelConfig> = {
  0: {
    levelIndex: 0,
    name: "Optics & Light",
    gateType: "attempt_all", // First level has no prior gate, but gating to level 1 requires attempting all
    gateThreshold: 0,
  },
  1: {
    levelIndex: 1,
    name: "Gravity & Orbits",
    gateType: "min_cq_score",
    gateThreshold: 40, // 40% CQ required on Optics to unlock
  },
  2: {
    levelIndex: 2,
    name: "Chemistry & Reactions",
    gateType: "min_cq_score",
    gateThreshold: 50, // 50% CQ required on Gravity to unlock
  },
};

// Individual Experiment Configs
export const EXPERIMENTS_CONFIG: Record<string, ExperimentConfig> = {
  // Level 0: Optics
  "optics_1": {
    experimentId: "optics_1",
    levelIndex: 0,
    experimentSubIndex: 0,
    tier: "foundation",
    ...DIFFICULTY_SCALING.foundation,
  },
  "optics_2": {
    experimentId: "optics_2",
    levelIndex: 0,
    experimentSubIndex: 1,
    tier: "intermediate",
    ...DIFFICULTY_SCALING.intermediate,
    freeTextRubric: {
      questionId: "optics_2_explain",
      prompt: "Explain in your own words why the light beam changes color when it hits the prism.",
      rubricConcepts: [
        "white light is made of different colors",
        "the prism bends/refracts the light",
        "different colors bend at different angles"
      ],
      maxPoints: 3
    }
  },
  
  // Level 1: Gravity
  "gravity_1": {
    experimentId: "gravity_1",
    levelIndex: 1,
    experimentSubIndex: 0,
    tier: "foundation",
    ...DIFFICULTY_SCALING.foundation,
  },
  "gravity_2": {
    experimentId: "gravity_2",
    levelIndex: 1,
    experimentSubIndex: 1,
    tier: "intermediate",
    ...DIFFICULTY_SCALING.intermediate,
    freeTextRubric: {
      questionId: "gravity_2_explain",
      prompt: "Why did the moon crash into the planet when you made the planet heavier?",
      rubricConcepts: [
        "heavier objects have stronger gravity/pull",
        "the moon's speed was not fast enough to escape the stronger pull",
        "gravity pulls things together"
      ],
      maxPoints: 3
    }
  },

  // Level 2: Chemistry
  "chemistry_1": {
    experimentId: "chemistry_1",
    levelIndex: 2,
    experimentSubIndex: 0,
    tier: "intermediate",
    ...DIFFICULTY_SCALING.intermediate,
  },
  "chemistry_2": {
    experimentId: "chemistry_2",
    levelIndex: 2,
    experimentSubIndex: 1,
    tier: "advanced",
    ...DIFFICULTY_SCALING.advanced,
    freeTextRubric: {
      questionId: "chemistry_2_explain",
      prompt: "Why did the reaction happen faster when you added the Platinum catalyst?",
      rubricConcepts: [
        "catalysts speed up reactions",
        "catalysts lower the energy needed to start (activation energy)",
        "catalysts are not consumed in the reaction"
      ],
      maxPoints: 3
    }
  },
};

export const getExperimentConfig = (levelIndex: number, subIndex: number): ExperimentConfig | undefined => {
  return Object.values(EXPERIMENTS_CONFIG).find(
    (c) => c.levelIndex === levelIndex && c.experimentSubIndex === subIndex
  );
};
