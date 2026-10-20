/**
 * XP and streak rules shared by the server (which awards XP) and the
 * practice page (which shows the same numbers). Keep this file free of
 * server-only imports so both sides and the unit tests can use it.
 */

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

/** Most streak freezes a student can hold. */
export const MAX_STREAK_FREEZES = 2;
/** A freeze is earned each time the streak reaches a multiple of this. */
export const FREEZE_EVERY_DAYS = 7;

/** Whole IST days from `fromDay` to `toDay` (both "YYYY-MM-DD"). */
export function daysBetween(fromDay: string, toDay: string): number {
  return Math.round((Date.parse(`${toDay}T00:00:00Z`) - Date.parse(`${fromDay}T00:00:00Z`)) / (24 * 60 * 60 * 1000));
}

export interface StreakUpdate {
  streak: number;
  freezes: number;
  /** Missed days covered by freezes on this update. */
  freezesUsed: number;
  /** True when this update earned a new freeze. */
  freezeEarned: boolean;
}

/**
 * Streak after finishing a lesson today, with streak freezes.
 * - Same day: unchanged. Next day: +1.
 * - Missed days are covered by freezes (one freeze per missed day). If there
 *   are not enough freezes, the streak starts again at 1 and freezes are kept.
 * - Reaching 7, 14, 21… days earns a freeze, up to MAX_STREAK_FREEZES.
 */
export function streakAfterLesson(
  previousStreak: number,
  lastActiveDay: string | null,
  today: string,
  freezesHeld = 0
): StreakUpdate {
  const prev = Math.max(0, Math.floor(previousStreak || 0));
  let freezes = Math.min(MAX_STREAK_FREEZES, Math.max(0, Math.floor(freezesHeld || 0)));
  if (lastActiveDay === today) return { streak: Math.max(prev, 1), freezes, freezesUsed: 0, freezeEarned: false };

  let streak = 1;
  let freezesUsed = 0;
  const gap = lastActiveDay ? daysBetween(lastActiveDay, today) : Infinity;
  if (gap === 1) {
    streak = prev + 1;
  } else if (gap > 1 && prev > 0 && gap - 1 <= freezes) {
    freezesUsed = gap - 1;
    freezes -= freezesUsed;
    streak = prev + 1;
  }

  let freezeEarned = false;
  if (streak > prev && streak % FREEZE_EVERY_DAYS === 0 && freezes < MAX_STREAK_FREEZES) {
    freezes += 1;
    freezeEarned = true;
  }
  return { streak, freezes, freezesUsed, freezeEarned };
}

/** Streak after finishing a lesson today (no freezes). */
export function nextStreak(previousStreak: number, lastActiveDay: string | null, today: string): number {
  return streakAfterLesson(previousStreak, lastActiveDay, today, 0).streak;
}

/**
 * Streak to show right now. It stays alive through missed days that the
 * student's freezes can cover (they are used up when the next lesson is done);
 * otherwise it is broken (0) once a whole day is missed.
 */
export function currentStreak(
  storedStreak: number,
  lastActiveDay: string | null,
  today: string,
  freezesHeld = 0
): number {
  if (!lastActiveDay) return 0;
  const missed = daysBetween(lastActiveDay, today) - 1;
  if (missed <= Math.max(0, freezesHeld || 0)) return Math.max(0, storedStreak || 0);
  return 0;
}

/** Missed days (up to yesterday) that freezes are covering right now. */
export function daysCoveredByFreezes(lastActiveDay: string | null, today: string, freezesHeld = 0): number {
  if (!lastActiveDay) return 0;
  const missed = daysBetween(lastActiveDay, today) - 1;
  return missed > 0 && missed <= freezesHeld ? missed : 0;
}
