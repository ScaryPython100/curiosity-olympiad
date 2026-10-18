"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { applyXP } from "@/utils/xpLedger";
import { XP_RULES, currentStreak } from "@/utils/xpRules";
import { istDayKey, istStartOfDay, istStartOfWeek } from "@/utils/istTime";

const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  );
};

/**
 * Updates the student's avatar.
 * Avatar is stored client-side in localStorage because the student_profiles
 * table does not have an avatar_url column.
 * This server action is kept as a no-op success stub so the client flow works.
 */
export async function updateAvatar(avatarValue: string): Promise<{ success?: boolean; error?: string }> {
  // The student_profiles table does not have an avatar_url column,
  // so we simply return success. The avatar URL is persisted in localStorage
  // by the AvatarPickerModal component.
  return { success: true };
}

/**
 * Fetches the leaderboard data.
 */
export async function getLeaderboard(timeframe: 'weekly' | 'daily' | 'friends' = 'weekly') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let orderByCol = 'xp';
  if (timeframe === 'weekly') orderByCol = 'weekly_xp';
  if (timeframe === 'daily') orderByCol = 'daily_xp';

  let query = supabase
    .from("user_gamification")
    .select("user_id, xp, daily_xp, weekly_xp, curiosity_points, last_daily_reset, last_weekly_reset, last_claimed_date");

  if (timeframe === 'friends') {
    if (!user) return { data: [] };
    const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
    if (!follows || follows.length === 0) return { data: [] };
    const followingIds = follows.map(f => f.following_id);
    query = query.in("user_id", followingIds);
  }

  // Query gamification data
  const { data: gamificationData, error: gamError } = await query
    .order(orderByCol, { ascending: false })
    .limit(50);

  if (gamError) {
    console.error("Error fetching leaderboard:", gamError);
    return { error: gamError.message };
  }

  if (!gamificationData || gamificationData.length === 0) {
    return { data: [] };
  }

  // Daily and weekly cycles follow India time (midnight IST, weeks start Monday).
  const now = new Date();
  const todayStart = istStartOfDay(now);
  const currentWeekStart = istStartOfWeek(now);

  const fixCutoff = new Date("2026-07-27T00:30:00Z");

  // Determine past champions and reset expired XP in a single-pass traversal
  let pastDailyChampionId: string | null = null;
  let maxPastDailyXp = -1;
  let pastWeeklyChampionId: string | null = null;
  let maxPastWeeklyXp = -1;

  const processedData = new Array(gamificationData.length);

  for (let i = 0; i < gamificationData.length; i++) {
    const row = gamificationData[i];
    let rowDaily = row.daily_xp || 0;
    let rowWeekly = row.weekly_xp || 0;

    const dailyResetRef = row.last_daily_reset || row.last_claimed_date;
    if (dailyResetRef) {
      const lastDaily = new Date(dailyResetRef);
      if (lastDaily < todayStart && rowDaily > maxPastDailyXp && rowDaily > 0 && rowDaily !== row.xp) {
        maxPastDailyXp = rowDaily;
        pastDailyChampionId = row.user_id;
      }
      if (lastDaily < todayStart || lastDaily < fixCutoff || row.daily_xp === row.xp) {
        rowDaily = 0;
      }
    } else {
      rowDaily = 0;
    }

    const weeklyResetRef = row.last_weekly_reset || row.last_claimed_date;
    if (weeklyResetRef) {
      const lastWeekly = new Date(weeklyResetRef);
      if (lastWeekly < currentWeekStart && rowWeekly > maxPastWeeklyXp && rowWeekly > 0) {
        maxPastWeeklyXp = rowWeekly;
        pastWeeklyChampionId = row.user_id;
      }
      if (lastWeekly < currentWeekStart) {
        rowWeekly = 0;
      }
    } else {
      rowWeekly = 0;
    }

    processedData[i] = { ...row, daily_xp: rowDaily, weekly_xp: rowWeekly };
  }

  // Re-sort after adjusting for time
  if (timeframe === 'daily') {
    processedData.sort((a, b) => b.daily_xp - a.daily_xp);
  } else if (timeframe === 'weekly') {
    processedData.sort((a, b) => b.weekly_xp - a.weekly_xp);
  }

  // Fetch usernames from student_profiles for the user_ids we got
  const userIds = gamificationData.map((row) => row.user_id);
  const { data: profilesData } = await supabase
    .from("student_profiles")
    .select("id, username, real_name")
    .in("id", userIds);

  // Build a lookup map: userId -> { username, real_name }
  const profileMap = new Map<string, { username: string; real_name?: string }>();
  if (profilesData) {
    for (const p of profilesData) {
      profileMap.set(p.id, { username: p.username, real_name: p.real_name });
    }
  }

  // Merge the two datasets
  const data = processedData.map((row) => {
    let displayXp = row.xp;
    if (timeframe === 'daily') displayXp = row.daily_xp;
    if (timeframe === 'weekly') displayXp = row.weekly_xp;

    return {
      user_id: row.user_id,
      xp: displayXp,
      all_time_xp: row.xp,
      curiosity_points: row.curiosity_points,
      student_profiles: profileMap.get(row.user_id) || null,
    };
  });

  return { data, pastDailyChampionId, pastWeeklyChampionId };
}

/**
 * Claims the once-a-day login reward. The amount is fixed on the server;
 * the first argument is ignored and only kept so existing callers still work.
 */
export async function awardXP(_amount: number, reason: string) {
  if (reason !== "daily_login") return { error: "Unsupported XP reason." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const result = await applyXP(supabase, user.id, XP_RULES.dailyLoginXP, { dailyClaim: true });
  if (!result.success) return { error: result.error };

  return { success: true, newXp: result.newXp, newXP: result.newXp, newPoints: result.newPoints };
}

/**
 * Fetches the user's profile statistics including live ranking.
 */
export async function getProfileStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // 1. Fetch user's gamification data
  const { data: gamificationData, error: gamError } = await supabase
    .from("user_gamification")
    .select("xp, curiosity_points, streak_days, last_login_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (gamError) return { error: gamError.message };

  // 2. Fetch user's profile
  const { data: profileData } = await supabase
    .from("student_profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const xp = gamificationData?.xp || 0;
  
  // 3. Calculate live ranking by counting how many users have more XP
  const { count, error: countError } = await supabase
    .from("user_gamification")
    .select("*", { count: 'exact', head: true })
    .gt("xp", xp);

  const rank = countError ? "-" : (count !== null ? count + 1 : 1);

  // 4. Streak counts days with a finished practice lesson (India time).
  // A streak shows as 0 once a whole day has been missed.
  const today = istDayKey();
  const lastActiveDay: string | null = gamificationData?.last_login_date ?? null;
  const streakDays = currentStreak(gamificationData?.streak_days ?? 0, lastActiveDay, today);
  const hasCompletedActivityToday = lastActiveDay === today;

  return {
    data: {
      xp,
      points: gamificationData?.curiosity_points || 0,
      username: profileData?.username || "Explorer",
      school_code: (user.user_metadata?.school_code as string) || null,
      rank: `#${rank}`,
      streak: `${streakDays} ${streakDays === 1 ? "Day" : "Days"}`,
      streakCount: streakDays,
      hasCompletedActivityToday,
      quests: "0" // Placeholder until quests are implemented
    }
  };
}

/**
 * Follow another user
 */
export async function followUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (user.id === targetUserId) {
    return { error: "Cannot follow yourself" };
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId });

  if (error) {
    if (error.code === '23505') return { success: true }; // Already following
    return { error: error.message };
  }
  return { success: true };
}

/**
 * Unfollow another user
 */
export async function unfollowUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (error) return { error: error.message };
  return { success: true };
}

/**
 * Check if the current user is following the target user
 */
export async function getFollowStatus(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isFollowing: false };

  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (error) return { isFollowing: false };
  return { isFollowing: !!data };
}

/**
 * Get followers count and list for a user
 */
export async function getFollowers(userId: string) {
  const supabase = await createClient();
  const { data: follows, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);

  if (error || !follows) return { count: 0, data: [] };
  
  // To avoid complex joins if not setup, we can fetch usernames manually or rely on UI to just show count for now
  return { count: follows.length, data: follows };
}

/**
 * Get following count and list for a user
 */
export async function getFollowing(userId: string) {
  const supabase = await createClient();
  const { data: follows, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error || !follows) return { count: 0, data: [] };
  return { count: follows.length, data: follows };
}

/**
 * Fetch a public user profile by ID
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  // 1 & 2. Concurrently fetch user's gamification data and public profile
  const [gamRes, profRes] = await Promise.all([
    supabase
      .from("user_gamification")
      .select("xp, curiosity_points")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("student_profiles")
      .select("username")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const { data: gamificationData, error: gamError } = gamRes;
  if (gamError) return { error: gamError.message };
  if (!gamificationData) return { error: "User not found" };

  const profileData = profRes.data;
  const xp = gamificationData.xp;
  
  // 3. Calculate live ranking by counting how many users have more XP
  const { count, error: countError } = await supabase
    .from("user_gamification")
    .select("*", { count: 'exact', head: true })
    .gt("xp", xp);

  const rank = countError ? "-" : (count !== null ? count + 1 : 1);

  return {
    data: {
      userId,
      xp,
      points: gamificationData.curiosity_points,
      username: profileData?.username || "Explorer",
      rank: `#${rank}`
    }
  };
}

/**
 * Fetch recent activity of friends
 */
export async function getFriendsActivity() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
  if (!follows || follows.length === 0) return { data: [] };
  const followingIds = follows.map(f => f.following_id);

  const { data: activityData, error } = await supabase
    .from("user_gamification")
    .select("user_id, daily_xp, last_claimed_date")
    .in("user_id", followingIds)
    .gt("daily_xp", 0)
    .order("last_claimed_date", { ascending: false })
    .limit(5);

  if (error || !activityData || activityData.length === 0) return { data: [] };

  const userIds = activityData.map(a => a.user_id);
  const { data: profiles } = await supabase
    .from("student_profiles")
    .select("id, username")
    .in("id", userIds);

  const profileMap = new Map<string, string>();
  if (profiles) {
    for (const p of profiles) profileMap.set(p.id, p.username);
  }

  const result = activityData.map(a => ({
    user_id: a.user_id,
    daily_xp: a.daily_xp,
    last_claimed_date: a.last_claimed_date,
    username: profileMap.get(a.user_id) || "Explorer"
  }));

  return { data: result };
}

/**
 * Search for users by username
 */
export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) return { data: [] };
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] };

  // 1. Search profiles by username (case insensitive)
  const { data: profiles, error } = await supabase
    .from("student_profiles")
    .select("id, username")
    .ilike("username", `%${query.trim()}%`)
    .limit(20);

  if (error || !profiles || profiles.length === 0) return { data: [] };

  // 2. Get gamification stats for these users
  const userIds = profiles.map(p => p.id);
  const { data: gamification } = await supabase
    .from("user_gamification")
    .select("user_id, xp")
    .in("user_id", userIds);

  const xpMap = new Map<string, number>();
  if (gamification) {
    gamification.forEach(g => xpMap.set(g.user_id, g.xp));
  }

  // 3. Map together
  const result = profiles.map(p => ({
    userId: p.id,
    username: p.username,
    xp: xpMap.get(p.id) || 0,
  }));

  // Sort by XP descending
  result.sort((a, b) => b.xp - a.xp);

  return { data: result };
}

/**
 * Updates the user's real name in the student_profiles table.
 */
export async function updateRealName(realName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("student_profiles")
    .update({ real_name: realName.trim() })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating real name:", error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Fetches user telemetry logs from exam submissions
 */
export async function getUserTelemetry(targetUserId?: string) {
  try {
    const supabase = await createClient();
    let uid = targetUserId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }
    if (!uid) return { success: false, data: [] };

    const { data, error } = await supabase
      .from("exam_submissions")
      .select("exam_id, score, max_score, telemetry_data, submitted_at")
      .eq("user_id", uid);

    if (error) {
      console.warn("getUserTelemetry error:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("getUserTelemetry exception:", err);
    return { success: false, data: [] };
  }
}
