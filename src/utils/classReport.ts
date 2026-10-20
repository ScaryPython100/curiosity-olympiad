/**
 * Builds the teacher's class report from database rows. Pure (no database),
 * so it is easy to test. Only real data: no made-up scores or milestones.
 */
import { istDayKey } from "./istTime.ts";
import { currentStreak, daysBetween } from "./xpRules.ts";

export interface ClassMember {
  userId: string;
  username: string;
  realName: string | null;
  joinedAt: string;
}

export interface GamificationRow {
  user_id: string;
  xp: number | null;
  streak_days: number | null;
  last_login_date: string | null;
  streak_freezes?: number | null;
}

export interface SubmissionRow {
  user_id: string;
  test: number;
  score: number;
  max_score: number;
  submitted_at: string;
}

export type HelpReason = "low_scores" | "inactive" | "not_started";

export interface StudentReport {
  userId: string;
  username: string;
  realName: string | null;
  xp: number;
  streak: number;
  testsDone: number;
  averagePercent: number | null;
  /** Latest IST day with a finished test, or null. */
  lastActiveDay: string | null;
  daysSinceActive: number | null;
  thoughts: number;
  /** Percent right per test number (latest attempt). */
  perTest: Record<number, number>;
  help: HelpReason[];
}

export interface TestReport {
  test: number;
  title: string;
  finished: number;
  averagePercent: number | null;
}

export interface ClassReport {
  totals: {
    students: number;
    activeToday: number;
    activeThisWeek: number;
    testsFinished: number;
    averagePercent: number | null;
    thoughts: number;
  };
  tests: TestReport[];
  students: StudentReport[];
  needsHelp: StudentReport[];
}

const pct = (score: number, max: number) => (max > 0 ? Math.round((score / max) * 100) : 0);
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export const LOW_SCORE_PERCENT = 50;
export const INACTIVE_DAYS = 7;
export const NOT_STARTED_DAYS = 3;

export function buildClassReport(input: {
  members: ClassMember[];
  gamification: GamificationRow[];
  submissions: SubmissionRow[];
  thoughtCounts: Record<string, number>;
  tests: { test: number; title: string }[];
  now?: Date;
}): ClassReport {
  const now = input.now ?? new Date();
  const today = istDayKey(now);
  const gam = new Map(input.gamification.map((g) => [g.user_id, g]));
  const subsByUser = new Map<string, SubmissionRow[]>();
  for (const s of input.submissions) {
    if (!subsByUser.has(s.user_id)) subsByUser.set(s.user_id, []);
    subsByUser.get(s.user_id)!.push(s);
  }

  const students: StudentReport[] = input.members.map((m) => {
    const g = gam.get(m.userId);
    const subs = subsByUser.get(m.userId) ?? [];
    const perTest: Record<number, number> = {};
    for (const s of subs) perTest[s.test] = pct(s.score, s.max_score);
    const percents = Object.values(perTest);
    const lastSubmitted = subs.reduce<string | null>(
      (latest, s) => (!latest || s.submitted_at > latest ? s.submitted_at : latest),
      null
    );
    const lastActiveDay = lastSubmitted ? istDayKey(new Date(lastSubmitted)) : g?.last_login_date ?? null;
    const daysSinceActive = lastActiveDay ? Math.max(0, daysBetween(lastActiveDay, today)) : null;
    const averagePercent = avg(percents);
    const help: HelpReason[] = [];
    if (percents.length >= 2 && averagePercent !== null && averagePercent < LOW_SCORE_PERCENT) help.push("low_scores");
    if (percents.length > 0 && daysSinceActive !== null && daysSinceActive >= INACTIVE_DAYS) help.push("inactive");
    if (percents.length === 0 && daysBetween(istDayKey(new Date(m.joinedAt)), today) >= NOT_STARTED_DAYS) help.push("not_started");
    return {
      userId: m.userId,
      username: m.username,
      realName: m.realName,
      xp: g?.xp ?? 0,
      streak: currentStreak(g?.streak_days ?? 0, g?.last_login_date ?? null, today, g?.streak_freezes ?? 0),
      testsDone: percents.length,
      averagePercent,
      lastActiveDay,
      daysSinceActive,
      thoughts: input.thoughtCounts[m.userId] ?? 0,
      perTest,
      help,
    };
  });

  const tests: TestReport[] = input.tests.map(({ test, title }) => {
    const scores = students.filter((s) => test in s.perTest).map((s) => s.perTest[test]);
    return { test, title, finished: scores.length, averagePercent: avg(scores) };
  });

  const allPercents = students.flatMap((s) => Object.values(s.perTest));
  return {
    totals: {
      students: students.length,
      activeToday: students.filter((s) => s.daysSinceActive === 0).length,
      activeThisWeek: students.filter((s) => s.daysSinceActive !== null && s.daysSinceActive < 7).length,
      testsFinished: allPercents.length,
      averagePercent: avg(allPercents),
      thoughts: students.reduce((n, s) => n + s.thoughts, 0),
    },
    tests,
    students: students.sort((a, b) => a.username.localeCompare(b.username)),
    needsHelp: students.filter((s) => s.help.length > 0),
  };
}

/** CSV for the teacher to download (Excel/Sheets friendly). */
export function classReportCsv(report: ClassReport, testNumbers: number[]): string {
  const esc = (v: string | number | null) => {
    let s = v === null ? "" : String(v);
    // Stop Excel from running a name like "=SUM(...)" as a formula
    if (typeof v === "string" && /^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = ["Username", "Name", "Tests done", "Average %", "Streak", "XP", "Last active", "Thoughts", ...testNumbers.map((n) => `Test ${n} %`)];
  const rows = report.students.map((s) => [
    s.username,
    s.realName,
    s.testsDone,
    s.averagePercent,
    s.streak,
    s.xp,
    s.lastActiveDay,
    s.thoughts,
    ...testNumbers.map((n) => (n in s.perTest ? s.perTest[n] : null)),
  ]);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}
