/**
 * XP and streak rules shared by the server (which awards XP) and the
 * practice page (which shows the same numbers). Keep this file free of
 * server-only imports so both sides and the unit tests can use it.
 */

// Kept import-free: Node's test runner needs ".ts" import extensions, which
// this tsconfig doesn't allow. Same as previousIstDayKey in istTime.ts.
function previousIstDayKey(dayKey: string): string {
  return new Date(Date.parse(`${dayKey}T00:00:00Z`) - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const XP_RULES = {
  perCorrectAnswer: 100,
  perReversal: 50,
  maxReversals: 10,
  perAdjustment: 20,
  maxAdjustments: 25,
  speedBonus: 50,
  dailyLoginXP: 500,
} as const;

function clampInt(value: unknown, min: number, max: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export interface MockTestXPInput {
  score: unknown;
  total: unknown;
  /** Most questions this test can have (from mockTestsData.questionCount). */
  questionCap: number;
  reversals: unknown;
  adjustments: unknown;
  timeSecs: unknown;
  idealSecs: number;
}

export interface MockTestXPResult {
  score: number;
  total: number;
  accuracyXP: number;
  telemetryBonusXP: number;
  totalXP: number;
}

/**
 * XP for one mock test attempt. Every input is clamped, so a tampered
 * request can never earn more than the real maximum for that test.
 */
export function computeMockTestXP(input: MockTestXPInput): MockTestXPResult {
  const total = clampInt(input.total, 0, input.questionCap);
  const score = clampInt(input.score, 0, total);
  const reversals = clampInt(input.reversals, 0, XP_RULES.maxReversals);
  const adjustments = clampInt(input.adjustments, 0, XP_RULES.maxAdjustments);
  const timeSecs = clampInt(input.timeSecs, 0, Number.MAX_SAFE_INTEGER);

  const accuracyXP = score * XP_RULES.perCorrectAnswer;
  // Speed bonus needs at least one right answer, so an empty instant submit earns nothing.
  const speedBonus = score > 0 && timeSecs > 0 && timeSecs <= input.idealSecs ? XP_RULES.speedBonus : 0;
  const telemetryBonusXP =
    reversals * XP_RULES.perReversal + adjustments * XP_RULES.perAdjustment + speedBonus;

  return { score, total, accuracyXP, telemetryBonusXP, totalXP: accuracyXP + telemetryBonusXP };
}

/**
 * Streak after finishing a lesson today.
 * Same day: unchanged. Day after the last lesson: +1. Any gap: back to 1.
 */
export function nextStreak(previousStreak: number, lastActiveDay: string | null, today: string): number {
  const prev = Math.max(0, previousStreak || 0);
  if (lastActiveDay === today) return Math.max(prev, 1);
  if (lastActiveDay && lastActiveDay === previousIstDayKey(today)) return prev + 1;
  return 1;
}

/** Streak to show right now: a streak is broken (0) once a whole day is missed. */
export function currentStreak(storedStreak: number, lastActiveDay: string | null, today: string): number {
  if (!lastActiveDay) return 0;
  if (lastActiveDay === today || lastActiveDay === previousIstDayKey(today)) {
    return Math.max(0, storedStreak || 0);
  }
  return 0;
}
