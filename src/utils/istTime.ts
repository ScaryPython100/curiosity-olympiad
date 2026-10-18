/**
 * India Standard Time helpers.
 *
 * Vercel servers run in UTC, so `new Date().getHours()` style math resets
 * leaderboards and streaks at 5:30 AM in India. Every daily/weekly cycle must
 * use these helpers instead. IST is a fixed UTC+05:30 with no daylight saving.
 */

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar day in India as "YYYY-MM-DD". */
export function istDayKey(date: Date = new Date()): string {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The day before an IST day key, as "YYYY-MM-DD". */
export function previousIstDayKey(dayKey: string): string {
  return new Date(Date.parse(`${dayKey}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);
}

/** The instant of midnight (00:00 IST) that starts the given moment's day. */
export function istStartOfDay(date: Date = new Date()): Date {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}

/** The instant of Monday 00:00 IST that starts the given moment's week. */
export function istStartOfWeek(date: Date = new Date()): Date {
  const dayStart = istStartOfDay(date);
  const dayOfWeek = new Date(dayStart.getTime() + IST_OFFSET_MS).getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(dayStart.getTime() - daysSinceMonday * DAY_MS);
}
