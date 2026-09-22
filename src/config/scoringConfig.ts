export type DifficultyTier = "foundation" | "intermediate" | "advanced";

export type LevelGateType = "attempt_all" | "min_cq_score";

export interface FreeTextInquiry {
  questionId: string;
  prompt: string;
  maxPoints: number;
}

export interface ExperimentConfig {
  experimentId: string;
  levelIndex: number;
  experimentSubIndex: number;
  tier: DifficultyTier;
  basePts: number;
  explorationPts: number;
  freeTextInquiry?: FreeTextInquiry;
}

export interface LevelConfig {
  levelIndex: number;
  name: string;
  gateType: LevelGateType;
  gateThreshold: number; 
}

export const DIFFICULTY_SCALING = {
  foundation: { basePts: 6, explorationPts: 4 },
  intermediate: { basePts: 6, explorationPts: 4 },
  advanced: { basePts: 6, explorationPts: 4 },
};

export const LEVELS_CONFIG: Record<number, LevelConfig> = {
  0: {
    levelIndex: 0,
    name: "Optics & Light",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  1: {
    levelIndex: 1,
    name: "Gravity & Orbits",
    gateType: "min_cq_score",
    gateThreshold: 40,
  },
  2: {
    levelIndex: 2,
    name: "Chemistry & Reactions",
    gateType: "min_cq_score",
    gateThreshold: 50,
  },
  3: {
    levelIndex: 3,
    name: "Concrete & Sensory (Grades 6-8)",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  4: {
    levelIndex: 4,
    name: "Hypothesis Testing (Grades 9-10)",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  5: {
    levelIndex: 5,
    name: "Sound & Vibration",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  6: {
    levelIndex: 6,
    name: "Electricity & Magnetism",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  7: {
    levelIndex: 7,
    name: "Water & Buoyancy",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  8: {
    levelIndex: 8,
    name: "Kitchen Chemistry",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  9: {
    levelIndex: 9,
    name: "The Human Body",
    gateType: "attempt_all",
    gateThreshold: 0,
  },
  10: {
    levelIndex: 10,
    name: "Plants & Growth",
    gateType: "attempt_all",
    gateThreshold: 0,
  }
};

export const EXPERIMENTS_CONFIG: Record<string, ExperimentConfig> = {
  "optics_1": {
    experimentId: "optics_1", levelIndex: 0, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "optics_1_wonder", prompt: "Is there anything about the water bowl and lemon that you are still wondering about? What would you like to find out?", maxPoints: 4 }
  },
  "optics_2": {
    experimentId: "optics_2", levelIndex: 0, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "optics_2_extend", prompt: "Was there anything you did not expect with the prism? If you could try one more experiment, what would you try?", maxPoints: 4 }
  },
  "optics_3": {
    experimentId: "optics_3", levelIndex: 0, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "optics_3_wonder", prompt: "What else do you want to learn about how shadows and the sun work?", maxPoints: 4 }
  },
  "gravity_1": {
    experimentId: "gravity_1", levelIndex: 1, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "gravity_1_wonder", prompt: "Is there anything about the fan and airflow that you are still wondering about?", maxPoints: 4 }
  },
  "gravity_2": {
    experimentId: "gravity_2", levelIndex: 1, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "gravity_2_extend", prompt: "If you could change the rules of gravity for your next experiment, what would you try to find out?", maxPoints: 4 }
  },
  "gravity_3": {
    experimentId: "gravity_3", levelIndex: 1, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "gravity_3_wonder", prompt: "What else do you want to learn about dropping objects in a vacuum without air?", maxPoints: 4 }
  },
  "chemistry_1": {
    experimentId: "chemistry_1", levelIndex: 2, experimentSubIndex: 0, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "chemistry_1_wonder", prompt: "After stirring the hot soup, what questions do you still have? What do you want to find out?", maxPoints: 4 }
  },
  "chemistry_2": {
    experimentId: "chemistry_2", levelIndex: 2, experimentSubIndex: 1, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "chemistry_2_extend", prompt: "What would you investigate next about the Matka (clay pot) cooling?", maxPoints: 4 }
  },
  "chemistry_3": {
    experimentId: "chemistry_3", levelIndex: 2, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "chemistry_3_wonder", prompt: "What else do you want to learn about candle flames, fire, and air?", maxPoints: 4 }
  },
  "grades68_1": {
    experimentId: "grades68_1", levelIndex: 3, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "grades68_1_q", prompt: "What would you try next with the matka?", maxPoints: 4 }
  },
  "grades68_2": {
    experimentId: "grades68_2", levelIndex: 3, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "grades68_2_q", prompt: "If you could change one thing about a real kite to make it fly better in low wind, what would it be?", maxPoints: 4 }
  },
  "grades68_3": {
    experimentId: "grades68_3", levelIndex: 3, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "grades68_3_q", prompt: "What do you think is inside the chapati when it puffs up like a balloon?", maxPoints: 4 }
  },
  "grades910_1": {
    experimentId: "grades910_1", levelIndex: 4, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "grades910_1_q", prompt: "If a farmer had only clay soil, what could they do differently before sowing?", maxPoints: 4 }
  },
  "grades910_2": {
    experimentId: "grades910_2", levelIndex: 4, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "grades910_2_q", prompt: "How would you design a solar cooker that didn't need to be re-angled by hand through the day?", maxPoints: 4 }
  },
  "grades910_3": {
    experimentId: "grades910_3", levelIndex: 4, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "grades910_3_q", prompt: "What could a family do to keep gas output steady through winter, without buying new equipment?", maxPoints: 4 }
  },
  "sound_1": {
    experimentId: "sound_1", levelIndex: 5, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "sound_1_q", prompt: "If you lined up five matkas with different water levels to tap out a simple tune, how would you arrange them from lowest to highest note?", maxPoints: 4 }
  },
  "sound_2": {
    experimentId: "sound_2", levelIndex: 5, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "sound_2_q", prompt: "Why do you think even a gentle pinch stops the sound, when a stronger pull on the string (more tension) doesn't?", maxPoints: 4 }
  },
  "sound_3": {
    experimentId: "sound_3", levelIndex: 5, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "sound_3_q", prompt: "Why doesn't shouting in an open field ever produce an echo, no matter how loud you shout?", maxPoints: 4 }
  },
  "electricity_1": {
    experimentId: "electricity_1", levelIndex: 6, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "electricity_1_q", prompt: "You've probably noticed this trick works better in some seasons than others at home. When does it work best, and why do you think that is now?", maxPoints: 4 }
  },
  "electricity_2": {
    experimentId: "electricity_2", levelIndex: 6, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "electricity_2_q", prompt: "During a power cut, if a hand torch doesn't light even with new batteries inside, what would you check first, and why?", maxPoints: 4 }
  },
  "electricity_3": {
    experimentId: "electricity_3", levelIndex: 6, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "electricity_3_q", prompt: "If you found a mystery metal object at home, how could you use a magnet to guess what it's made of?", maxPoints: 4 }
  },
  "buoyancy_1": {
    experimentId: "buoyancy_1", levelIndex: 7, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "buoyancy_1_q", prompt: "If you were making a paper boat to carry the most stones without sinking, what shape would you choose, and why?", maxPoints: 4 }
  },
  "buoyancy_2": {
    experimentId: "buoyancy_2", levelIndex: 7, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "buoyancy_2_q", prompt: "Why do you think people float much more easily in seawater than in a river or pond?", maxPoints: 4 }
  },
  "buoyancy_3": {
    experimentId: "buoyancy_3", levelIndex: 7, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "buoyancy_3_q", prompt: "If you had three liquids — water, mustard oil, and honey — all mixed in one glass and left to settle, what order do you think they'd stack in, and why?", maxPoints: 4 }
  },
  "kitchen_1": {
    experimentId: "kitchen_1", levelIndex: 8, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "kitchen_1_q", prompt: "What other everyday items in your kitchen do you think would turn turmeric paste red?", maxPoints: 4 }
  },
  "kitchen_2": {
    experimentId: "kitchen_2", levelIndex: 8, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "kitchen_2_q", prompt: "What gas filled the balloon during the fizzing reaction, and where did it come from?", maxPoints: 4 }
  },
  "kitchen_3": {
    experimentId: "kitchen_3", levelIndex: 8, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "kitchen_3_q", prompt: "Why do you think hot water can dissolve so much more sugar than cold water?", maxPoints: 4 }
  },
  "human_1": {
    experimentId: "human_1", levelIndex: 9, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "human_1_q", prompt: "Why does your heart beat faster when you sprint compared to when you are reading or resting?", maxPoints: 4 }
  },
  "human_2": {
    experimentId: "human_2", levelIndex: 9, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "human_2_q", prompt: "What creates the pressure difference that forces air inside your lungs when the diaphragm moves down?", maxPoints: 4 }
  },
  "human_3": {
    experimentId: "human_3", levelIndex: 9, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "human_3_q", prompt: "Why does your pupil shrink in bright sunlight and widen in a dim room?", maxPoints: 4 }
  },
  "plants_1": {
    experimentId: "plants_1", levelIndex: 10, experimentSubIndex: 0, tier: "foundation", ...DIFFICULTY_SCALING.foundation,
    freeTextInquiry: { questionId: "plants_1_q", prompt: "What gas is inside the tiny bubbles that the water plant produces when light shines on it?", maxPoints: 4 }
  },
  "plants_2": {
    experimentId: "plants_2", levelIndex: 10, experimentSubIndex: 1, tier: "intermediate", ...DIFFICULTY_SCALING.intermediate,
    freeTextInquiry: { questionId: "plants_2_q", prompt: "Where did the water droplets inside the clear plastic bag tied around the leafy branch come from?", maxPoints: 4 }
  },
  "plants_3": {
    experimentId: "plants_3", levelIndex: 10, experimentSubIndex: 2, tier: "advanced", ...DIFFICULTY_SCALING.advanced,
    freeTextInquiry: { questionId: "plants_3_q", prompt: "How does a plant stem know which direction the sunlight is coming from to bend toward it?", maxPoints: 4 }
  },
};

export const getExperimentConfig = (levelIndex: number, subIndex: number): ExperimentConfig | undefined => {
  return Object.values(EXPERIMENTS_CONFIG).find(
    (c) => c.levelIndex === levelIndex && c.experimentSubIndex === subIndex
  );
};
