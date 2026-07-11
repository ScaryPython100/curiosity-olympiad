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
export async function getLeaderboard() {
  const supabase = await createClient();

  // Query gamification data (sorted by XP, top 50)
  const { data: gamificationData, error: gamError } = await supabase
    .from("user_gamification")
    .select("user_id, xp, curiosity_points")
    .order("xp", { ascending: false })
    .limit(50);

  if (gamError) {
    console.error("Error fetching leaderboard:", gamError);
    return { error: gamError.message };
  }

  if (!gamificationData || gamificationData.length === 0) {
    return { data: [] };
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
  const data = gamificationData.map((row) => ({
    user_id: row.user_id,
    xp: row.xp,
    curiosity_points: row.curiosity_points,
    student_profiles: profileMap.get(row.user_id) || null,
  }));

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
    .select("xp, curiosity_points, last_claimed_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };

  // Check 24-hour cooldown
  if (currentData?.last_claimed_date) {
    const timeSinceLastClaim = Date.now() - new Date(currentData.last_claimed_date).getTime();
    if (timeSinceLastClaim < 24 * 60 * 60 * 1000) {
      return { error: "Daily XP already claimed today. Come back tomorrow!" };
    }
  }

  const newXp = (currentData?.xp || 0) + amount;
  const newPoints = (currentData?.curiosity_points || 0) + amount;
  const nowIso = new Date().toISOString();

  if (currentData) {
    // Row exists → UPDATE (works with existing RLS policies)
    const { error: updateError } = await supabase
      .from("user_gamification")
      .update({ xp: newXp, curiosity_points: newPoints, last_claimed_date: nowIso })
      .eq("user_id", user.id);

    if (updateError) return { error: updateError.message };
  } else {
    // The DB error "violates foreign key constraint 'user_gamification_id_fkey'" means
    // the 'id' column itself is a foreign key to the user's ID.
    // So both id and user_id must be the same as user.id.
    const row = { 
      id: user.id, 
      user_id: user.id, 
      xp: newXp, 
      curiosity_points: newPoints, 
      last_claimed_date: nowIso 
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

  return { success: true, newXp };
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
