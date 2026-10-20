/**
 * Which days of the current Monday-first week to light up on the streak card.
 *
 * The streak ends on the last day a test was finished: today if one is done,
 * otherwise yesterday (the streak is still alive until today ends).
 */
export function streakWeekDots(
  streakCount: number,
  doneToday: boolean,
  todayKey: string
): { lit: boolean[]; todayIdx: number } {
  const dow = new Date(`${todayKey}T00:00:00Z`).getUTCDay();
  const todayIdx = dow === 0 ? 6 : dow - 1;
  const lastIdx = doneToday ? todayIdx : todayIdx - 1;
  const n = Math.max(0, Math.floor(streakCount || 0));
  const lit = Array.from({ length: 7 }, (_, i) => n > 0 && i <= lastIdx && i > lastIdx - n);
  return { lit, todayIdx };
}
