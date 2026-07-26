"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  // Compute current week start (Monday 00:00:00)
  const currentWeekStart = new Date(now);
  const dayOfWeek = currentWeekStart.getDay();
  const diffToMonday = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  currentWeekStart.setDate(diffToMonday);
  currentWeekStart.setHours(0, 0, 0, 0);

  // Process data locally to reset expired XP
  let processedData = gamificationData.map((row) => {
    let rowDaily = row.daily_xp || 0;
    let rowWeekly = row.weekly_xp || 0;

    const dailyResetRef = row.last_daily_reset || row.last_claimed_date;
    if (!dailyResetRef) {
      rowDaily = 0;
    } else {
      const lastDaily = new Date(dailyResetRef);
      if (lastDaily < todayStart) {
        rowDaily = 0; // Reset to 0 for the new day
      }
    }

    const weeklyResetRef = row.last_weekly_reset || row.last_claimed_date;
    if (!weeklyResetRef) {
      rowWeekly = 0;
    } else {
      const lastWeekly = new Date(weeklyResetRef);
      if (lastWeekly < currentWeekStart) {
        rowWeekly = 0; // Reset to 0 for the new week
      }
    }

    return { ...row, daily_xp: rowDaily, weekly_xp: rowWeekly };
  });

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
    .select("id, username")
    .in("id", userIds);

  // Build a lookup map: userId -> { username }
  const profileMap = new Map<string, { username: string }>();
  if (profilesData) {
    for (const p of profilesData) {
      profileMap.set(p.id, { username: p.username });
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

  return { data };
}

/**
 * Awards XP to the user.
 * Handles DB constraints: user_id has no UNIQUE constraint (so upsert with
 * onConflict: 'user_id' fails), and RLS may block plain inserts.
 * Strategy: UPDATE for existing rows, plain INSERT for new rows.
 */
export async function awardXP(amount: number, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Fetch current data to check daily claim limit
  const { data: currentData, error: fetchError } = await supabase
    .from("user_gamification")
    .select("xp, curiosity_points, last_claimed_date, daily_xp, weekly_xp, last_daily_reset, last_weekly_reset")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };

  const now = new Date();

  // Check 11:59 P.M. cooldown
  if (currentData?.last_claimed_date) {
    const lastClaimed = new Date(currentData.last_claimed_date);
    const resetBoundary = new Date(lastClaimed);
    resetBoundary.setHours(23, 59, 59, 999);
    
    if (now <= resetBoundary) {
      return { error: "Daily XP already claimed today. Come back tomorrow!" };
    }
  }

  let newDailyXp = amount;
  let newWeeklyXp = amount;
  
  if (currentData) {
    // Reset daily_xp if we crossed a day since last_daily_reset
    if (currentData.last_daily_reset) {
      const lastDaily = new Date(currentData.last_daily_reset);
      const dailyBoundary = new Date(lastDaily);
      dailyBoundary.setHours(23, 59, 59, 999);
      if (now > dailyBoundary) {
        newDailyXp = amount;
      } else {
        newDailyXp = (currentData.daily_xp || 0) + amount;
      }
    } else {
      newDailyXp = (currentData.daily_xp || 0) + amount;
    }

    // Reset weekly_xp if we crossed a Sunday 11:59 PM boundary
    if (currentData.last_weekly_reset) {
      const lastWeekly = new Date(currentData.last_weekly_reset);
      const weeklyBoundary = new Date(lastWeekly);
      const diffToSunday = lastWeekly.getDay() === 0 ? 0 : 7 - lastWeekly.getDay();
      weeklyBoundary.setDate(lastWeekly.getDate() + diffToSunday);
      weeklyBoundary.setHours(23, 59, 59, 999);
      
      if (now > weeklyBoundary) {
        newWeeklyXp = amount;
      } else {
        newWeeklyXp = (currentData.weekly_xp || 0) + amount;
      }
    } else {
      newWeeklyXp = (currentData.weekly_xp || 0) + amount;
    }
  }

  const newXp = (currentData?.xp || 0) + amount;
  const newPoints = (currentData?.curiosity_points || 0) + amount;
  const nowIso = now.toISOString();

  if (currentData) {
    // Row exists → UPDATE
    const { error: updateError } = await supabase
      .from("user_gamification")
      .update({ 
        xp: newXp, 
        curiosity_points: newPoints, 
        last_claimed_date: nowIso,
        daily_xp: newDailyXp,
        weekly_xp: newWeeklyXp,
        last_daily_reset: nowIso,
        last_weekly_reset: nowIso
      })
      .eq("user_id", user.id);

    if (updateError) return { error: updateError.message };
  } else {
    const row = { 
      id: user.id, 
      user_id: user.id, 
      xp: newXp, 
      curiosity_points: newPoints, 
      last_claimed_date: nowIso,
      daily_xp: newDailyXp,
      weekly_xp: newWeeklyXp,
      last_daily_reset: nowIso,
      last_weekly_reset: nowIso
    };

    const { error: upsertError } = await supabase
      .from("user_gamification")
      .upsert(row, { onConflict: "user_id" });

    if (upsertError) {
      // Fallback: try a plain insert
      const { error: insertError } = await supabase
        .from("user_gamification")
        .insert([row]);

      if (insertError) {
        return {
          error: `Failed to create XP record. Upsert error: ${upsertError.message}. Insert error: ${insertError.message}`
        };
      }
    }
  }

  return { success: true, newXp, newXP: newXp, newPoints: newPoints };
}

/**
 * Awards XP specifically for mock test attempts, practice labs, and telemetry bonuses without daily claim locks.
 */
export async function addActivityXP(amount: number, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: currentData, error: fetchError } = await supabase
    .from("user_gamification")
    .select("xp, curiosity_points, daily_xp, weekly_xp")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };

  const newXp = (currentData?.xp || 0) + amount;
  const newPoints = (currentData?.curiosity_points || 0) + amount;
  const newDailyXp = (currentData?.daily_xp || 0) + amount;
  const newWeeklyXp = (currentData?.weekly_xp || 0) + amount;
  const nowIso = new Date().toISOString();

  if (currentData) {
    const { error: updateError } = await supabase
      .from("user_gamification")
      .update({
        xp: newXp,
        curiosity_points: newPoints,
        daily_xp: newDailyXp,
        weekly_xp: newWeeklyXp,
      })
      .eq("user_id", user.id);

    if (updateError) return { error: updateError.message };
  } else {
    const row = {
      id: user.id,
      user_id: user.id,
      xp: newXp,
      curiosity_points: newPoints,
      last_claimed_date: nowIso,
      daily_xp: newDailyXp,
      weekly_xp: newWeeklyXp,
      last_daily_reset: nowIso,
      last_weekly_reset: nowIso,
    };
    await supabase.from("user_gamification").upsert(row, { onConflict: "user_id" });
  }

  return { success: true, newXp, newXP: newXp, newPoints: newPoints };
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
    .select("xp, curiosity_points, last_claimed_date")
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

  // 4. Calculate streak (Basic implementation based on last_claimed_date)
  let streak = 0;
  if (gamificationData?.last_claimed_date) {
    const lastClaimed = new Date(gamificationData.last_claimed_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastClaimed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      streak = 1; // Basic 1 day streak if claimed recently
    }
  }

  return {
    data: {
      xp,
      points: gamificationData?.curiosity_points || 0,
      username: profileData?.username || "Explorer",
      rank: `#${rank}`,
      streak: `${streak} Days`,
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

  // 1. Fetch user's gamification data
  const { data: gamificationData, error: gamError } = await supabase
    .from("user_gamification")
    .select("xp, curiosity_points")
    .eq("user_id", userId)
    .maybeSingle();

  if (gamError) return { error: gamError.message };
  if (!gamificationData) return { error: "User not found" };

  // 2. Fetch user's profile
  const { data: profileData } = await supabase
    .from("student_profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

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
