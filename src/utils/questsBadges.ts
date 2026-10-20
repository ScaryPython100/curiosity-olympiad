/**
 * Daily quests and achievement badges. Pure rules, shared by the server
 * (which checks and awards them) and the tests.
 *
 * Nothing here rewards the Quick Scientist's Thought: the Agastya framework
 * needs that open question to stay free of rewards, so it is measured honestly.
 */
import { daysBetween } from "./xpRules.ts";

// ---------------- Daily quests ----------------

export type QuestId = "finish_1" | "finish_2" | "score_7" | "perfect" | "explore";

/** A finished test today, as the quest rules need it. */
export interface TodaysTest {
  test: number;
  score: number;
  maxScore: number;
  /** Slider moves + taps + back-and-forth changes in the experiment. */
  exploreActions: number;
}

export const CHEST_XP = 150;
export const EXPLORE_TARGET = 8;

const ROTATING: QuestId[] = ["finish_2", "score_7", "perfect", "explore"];
const PAIRS: [number, number][] = [[0, 1], [2, 3], [0, 3], [1, 2], [0, 2], [1, 3]];

/** Today's 3 quests: always "finish 1 test", plus two that change every day (same for everyone). */
export function questsForDay(dayKey: string): QuestId[] {
  const day = Math.abs(daysBetween("2026-01-01", dayKey));
  const [a, b] = PAIRS[day % PAIRS.length];
  return ["finish_1", ROTATING[a], ROTATING[b]];
}

export interface QuestProgress {
  id: QuestId;
  progress: number;
  target: number;
  done: boolean;
}

export function questProgress(id: QuestId, today: TodaysTest[]): QuestProgress {
  const distinct = new Set(today.map((t) => t.test)).size;
  const [progress, target] = (() => {
    switch (id) {
      case "finish_1":
        return [Math.min(distinct, 1), 1];
      case "finish_2":
        return [Math.min(distinct, 2), 2];
      case "score_7":
        return [today.some((t) => t.score >= 7) ? 1 : 0, 1];
      case "perfect":
        return [today.some((t) => t.maxScore > 0 && t.score >= t.maxScore) ? 1 : 0, 1];
      case "explore":
        return [Math.min(EXPLORE_TARGET, Math.max(0, ...today.map((t) => t.exploreActions))), EXPLORE_TARGET];
    }
  })();
  return { id, progress, target, done: progress >= target };
}

export function dailyQuests(dayKey: string, today: TodaysTest[]): QuestProgress[] {
  return questsForDay(dayKey).map((id) => questProgress(id, today));
}

/** Exploring the experiment, from a submission's telemetry (counts are capped by the XP rules anyway). */
export function exploreActionsFrom(telemetry: unknown): number {
  const t = (telemetry ?? {}) as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0);
  return Math.min(1000, n(t.sliderAdjustments) + n(t.reversals));
}

// ---------------- Badges ----------------

export type BadgeId =
  | "first_test"
  | "five_tests"
  | "all_tests"
  | "perfect"
  | "star_collector"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "explorer"
  | "quest_hero"
  | "quest_7";

export interface BadgeStats {
  testsDone: number;
  perfectTests: number;
  streak: number;
  exploredTests: number;
  chestsOpened: number;
}

interface BadgeRule {
  id: BadgeId;
  emoji: string;
  stat: keyof BadgeStats;
  target: number;
}

/** In the order they show on the badge shelf. */
export const BADGE_RULES: BadgeRule[] = [
  { id: "first_test", emoji: "🧪", stat: "testsDone", target: 1 },
  { id: "five_tests", emoji: "🔬", stat: "testsDone", target: 5 },
  { id: "all_tests", emoji: "🏆", stat: "testsDone", target: 13 },
  { id: "perfect", emoji: "⭐", stat: "perfectTests", target: 1 },
  { id: "star_collector", emoji: "🌟", stat: "perfectTests", target: 5 },
  { id: "streak_3", emoji: "🔥", stat: "streak", target: 3 },
  { id: "streak_7", emoji: "📅", stat: "streak", target: 7 },
  { id: "streak_30", emoji: "🚀", stat: "streak", target: 30 },
  { id: "explorer", emoji: "🧭", stat: "exploredTests", target: 3 },
  { id: "quest_hero", emoji: "🎁", stat: "chestsOpened", target: 1 },
  { id: "quest_7", emoji: "👑", stat: "chestsOpened", target: 7 },
];

export const BADGE_EMOJI = Object.fromEntries(BADGE_RULES.map((b) => [b.id, b.emoji])) as Record<BadgeId, string>;

export function isBadgeId(id: string): id is BadgeId {
  return BADGE_RULES.some((b) => b.id === id);
}

/** Badges the stats qualify for that are not earned yet. Once earned, a badge is kept (even if a streak breaks). */
export function newlyEarnedBadges(stats: BadgeStats, alreadyEarned: Iterable<string>): BadgeId[] {
  const have = new Set(alreadyEarned);
  return BADGE_RULES.filter((b) => !have.has(b.id) && stats[b.stat] >= b.target).map((b) => b.id);
}

export interface BadgeView {
  id: BadgeId;
  emoji: string;
  earnedAt: string | null;
  progress: number;
  target: number;
}

export function badgeShelf(stats: BadgeStats, earned: Record<string, string>): BadgeView[] {
  return BADGE_RULES.map((b) => ({
    id: b.id,
    emoji: b.emoji,
    earnedAt: earned[b.id] ?? null,
    progress: Math.min(b.target, Math.max(0, stats[b.stat])),
    target: b.target,
  }));
}
