"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { applyXP } from "@/utils/xpLedger";
import { loadProgressAndSyncBadges } from "@/utils/badgeLedger";
import { istDayKey, istStartOfDay } from "@/utils/istTime";
import { CHEST_XP, dailyQuests, type BadgeId, type BadgeView, type QuestProgress } from "@/utils/questsBadges";

export type QuestsResult =
  | {
      success: true;
      quests: QuestProgress[];
      chest: "locked" | "ready" | "opened";
      /** Minutes until new quests (IST midnight). */
      resetsInMinutes: number;
      badges: BadgeView[];
      newBadges: BadgeId[];
      ready: boolean;
    }
  | { success: false; error: string };

function minutesToMidnightIst(now = new Date()) {
  const next = istStartOfDay(new Date(now.getTime() + 24 * 3600 * 1000));
  return Math.max(0, Math.ceil((next.getTime() - now.getTime()) / 60000));
}

/** Today's quests, the chest state and the student's badges (also saves any badge just earned). */
export async function getQuestsAndBadges(): Promise<QuestsResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const p = await loadProgressAndSyncBadges(supabase, user.id);
  const today = istDayKey();
  const quests = dailyQuests(today, p.todaysTests);
  const allDone = quests.every((q) => q.done);
  const chest = p.gamification?.quest_chest_date === today ? "opened" : allDone ? "ready" : "locked";
  return {
    success: true,
    quests,
    chest,
    resetsInMinutes: minutesToMidnightIst(),
    badges: p.badges,
    newBadges: p.newlyEarned,
    ready: p.ready,
  };
}

export type OpenChestResult =
  | { success: true; xpAwarded: number; newBadges: BadgeId[] }
  | { success: false; error: "not_ready" | "already_opened" | "setup" | "failed" };

/**
 * Opens today's quest chest: checks all 3 quests on the server, then gives
 * CHEST_XP once per IST day. The date check is part of the update, so tapping
 * twice (or two tabs) cannot pay out twice.
 */
export async function openQuestChest(): Promise<OpenChestResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "failed" };
  const admin = createAdminClient();
  if (!admin) return { success: false, error: "setup" };

  const p = await loadProgressAndSyncBadges(supabase, user.id);
  if (!p.ready) return { success: false, error: "setup" };
  const today = istDayKey();
  if (!dailyQuests(today, p.todaysTests).every((q) => q.done)) return { success: false, error: "not_ready" };

  const { data: claimed, error } = await admin
    .from("user_gamification")
    .update({ quest_chest_date: today, quest_chests: Number(p.gamification?.quest_chests ?? 0) + 1 })
    .eq("user_id", user.id)
    .or(`quest_chest_date.is.null,quest_chest_date.neq.${today}`)
    .select("user_id");
  if (error) {
    console.error("openQuestChest failed:", error.message);
    return { success: false, error: "failed" };
  }
  if (!claimed?.length) return { success: false, error: "already_opened" };

  const award = await applyXP(supabase, user.id, CHEST_XP);
  if (!award.success) console.error("Chest XP failed:", award.error);

  // Opening a chest can earn the quest badges
  const after = await loadProgressAndSyncBadges(supabase, user.id);
  return { success: true, xpAwarded: award.success ? CHEST_XP : 0, newBadges: after.newlyEarned };
}
