import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { istDayKey, istStartOfDay, istStartOfWeek } from "@/utils/istTime";
import { nextStreak } from "@/utils/xpRules";

/**
 * Single place where XP, daily/weekly XP and streaks are written.
 * Only call this from server actions, with an amount the server computed
 * itself, never a number sent by the browser.
 *
 * Writes go through the service-role client when it is configured, so the
 * RLS policies can stop students editing their own XP row directly. Without
 * the key it falls back to the signed-in user's client (the old behaviour).
 */
export async function applyXP(
  userClient: SupabaseClient,
  userId: string,
  amount: number,
  opts: { countsForStreak?: boolean; dailyClaim?: boolean } = {}
): Promise<
  | { success: true; newXp: number; newPoints: number; streakCount: number }
  | { success?: false; error: string }
> {
  const db = createAdminClient() ?? userClient;
  const safeAmount = Math.max(0, Math.floor(amount) || 0);

  const { data: row, error: fetchError } = await db
    .from("user_gamification")
    .select(
      "xp, curiosity_points, daily_xp, weekly_xp, last_daily_reset, last_weekly_reset, last_claimed_date, streak_days, last_login_date"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };

  const now = new Date();
  const nowIso = now.toISOString();
  const today = istDayKey(now);
  const todayStart = istStartOfDay(now);
  const weekStart = istStartOfWeek(now);

  if (opts.dailyClaim && row?.last_claimed_date && new Date(row.last_claimed_date) >= todayStart) {
    return { error: "Daily XP already claimed today. Come back tomorrow!" };
  }

  // Daily/weekly counters restart when their last update was before this IST day/week.
  const sameDay = row?.last_daily_reset && new Date(row.last_daily_reset) >= todayStart;
  const sameWeek = row?.last_weekly_reset && new Date(row.last_weekly_reset) >= weekStart;
  const newDailyXp = (sameDay ? row?.daily_xp || 0 : 0) + safeAmount;
  const newWeeklyXp = (sameWeek ? row?.weekly_xp || 0 : 0) + safeAmount;
  const newXp = (row?.xp || 0) + safeAmount;
  const newPoints = (row?.curiosity_points || 0) + safeAmount;

  const storedStreak = row?.streak_days ?? 0;
  const lastActiveDay: string | null = row?.last_login_date ?? null;
  const streakCount = opts.countsForStreak ? nextStreak(storedStreak, lastActiveDay, today) : storedStreak;

  const fields: Record<string, unknown> = {
    xp: newXp,
    curiosity_points: newPoints,
    daily_xp: newDailyXp,
    weekly_xp: newWeeklyXp,
    last_daily_reset: nowIso,
    last_weekly_reset: nowIso,
  };
  if (opts.countsForStreak) {
    fields.streak_days = streakCount;
    fields.last_login_date = today;
  }
  if (opts.dailyClaim) {
    fields.last_claimed_date = nowIso;
  }

  if (row) {
    const { error: updateError } = await db.from("user_gamification").update(fields).eq("user_id", userId);
    if (updateError) return { error: updateError.message };
  } else {
    const newRow = { id: userId, user_id: userId, ...fields };
    const { error: upsertError } = await db.from("user_gamification").upsert(newRow, { onConflict: "user_id" });
    if (upsertError) {
      const { error: insertError } = await db.from("user_gamification").insert([newRow]);
      if (insertError) {
        return {
          error: `Failed to create XP record. Upsert error: ${upsertError.message}. Insert error: ${insertError.message}`,
        };
      }
    }
  }

  return { success: true, newXp, newPoints, streakCount };
}
