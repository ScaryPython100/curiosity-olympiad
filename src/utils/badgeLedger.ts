import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { istDayKey, istStartOfDay } from "@/utils/istTime";
import { currentStreak } from "@/utils/xpRules";
import {
  EXPLORE_TARGET,
  badgeShelf,
  exploreActionsFrom,
  isBadgeId,
  newlyEarnedBadges,
  type BadgeId,
  type BadgeView,
  type TodaysTest,
} from "@/utils/questsBadges";

/*
 * Server-only: reads a student's progress and records badges they have
 * earned. Like applyXP, badges are only written by the server (service-role
 * client), never from numbers the browser sends.
 */

// Exam UUIDs end in the test number: 00000000-0000-0000-0000-0000000000NN
const testNumber = (examId: string) => parseInt(examId.slice(-12), 10);

export interface StudentProgress {
  /** user_gamification row; select("*") so missing new columns never break it */
  gamification: Record<string, unknown> | null;
  todaysTests: TodaysTest[];
  badges: BadgeView[];
  newlyEarned: BadgeId[];
  /** False until phase2_quests_badges.sql has been run. */
  ready: boolean;
}

export async function loadProgressAndSyncBadges(userClient: SupabaseClient, userId: string): Promise<StudentProgress> {
  const db = createAdminClient() ?? userClient;
  const now = new Date();
  const today = istDayKey(now);
  const dayStart = istStartOfDay(now).toISOString();

  const [gamRes, subsRes, badgeRes] = await Promise.all([
    db.from("user_gamification").select("*").eq("user_id", userId).maybeSingle(),
    db.from("exam_submissions").select("exam_id, score, max_score, submitted_at, telemetry_data").eq("user_id", userId),
    db.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
  ]);
  const gamification = (gamRes.data as Record<string, unknown> | null) ?? null;
  const subs = subsRes.data ?? [];
  const ready = !badgeRes.error && gamification !== null && "quest_chests" in gamification;

  const todaysTests: TodaysTest[] = subs
    .filter((s) => s.submitted_at >= dayStart)
    .map((s) => ({
      test: testNumber(s.exam_id),
      score: s.score,
      maxScore: s.max_score,
      exploreActions: exploreActionsFrom(s.telemetry_data),
    }));

  const stats = {
    testsDone: subs.length,
    perfectTests: subs.filter((s) => s.max_score > 0 && s.score >= s.max_score).length,
    streak: currentStreak(
      Number(gamification?.streak_days ?? 0),
      (gamification?.last_login_date as string | null) ?? null,
      today,
      Number(gamification?.streak_freezes ?? 0)
    ),
    exploredTests: subs.filter((s) => exploreActionsFrom(s.telemetry_data) >= EXPLORE_TARGET).length,
    chestsOpened: Number(gamification?.quest_chests ?? 0),
  };

  const earned: Record<string, string> = {};
  for (const b of badgeRes.data ?? []) if (isBadgeId(b.badge_id)) earned[b.badge_id] = b.earned_at;

  let newlyEarned: BadgeId[] = [];
  const admin = createAdminClient();
  if (ready && admin) {
    newlyEarned = newlyEarnedBadges(stats, Object.keys(earned));
    if (newlyEarned.length) {
      const nowIso = now.toISOString();
      const { error } = await admin
        .from("user_badges")
        .upsert(newlyEarned.map((badge_id) => ({ user_id: userId, badge_id, earned_at: nowIso })), {
          onConflict: "user_id,badge_id",
          ignoreDuplicates: true,
        });
      if (error) {
        console.error("Saving badges failed:", error.message);
        newlyEarned = [];
      } else {
        for (const id of newlyEarned) earned[id] = nowIso;
      }
    }
  }

  return { gamification, todaysTests, badges: badgeShelf(stats, earned), newlyEarned, ready };
}
