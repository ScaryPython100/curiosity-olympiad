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
 */
export async function updateAvatar(avatarValue: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const { data, error } = await supabase
    .from("student_profiles")
    .update({ avatar_url: avatarValue })
    .eq("id", user.id)
    .select();

  if (error) {
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    // If no rows were updated, it means the profile doesn't exist yet
    // Default username as 'Explorer' if it doesn't exist
    const { error: insertError } = await supabase
      .from("student_profiles")
      .insert([{ id: user.id, username: 'Explorer', avatar_url: avatarValue }]);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  return { success: true };
}

/**
 * Fetches the leaderboard data.
 */
export async function getLeaderboard() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_gamification")
    .select(`
      user_id,
      xp,
      curiosity_points,
      student_profiles (
        username,
        avatar_url
      )
    `)
    .order("xp", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return { error: error.message };
  }

  return { data };
}

/**
 * Awards XP to the user (Mock logic for demonstration).
 */
export async function awardXP(amount: number, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Check if they already got XP for this today to prevent spam
  const { data: currentData } = await supabase
    .from("user_gamification")
    .select("xp, curiosity_points, last_claimed_date")
    .eq("user_id", user.id)
    .single();

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
    const { error: updateError } = await supabase
      .from("user_gamification")
      .update({ xp: newXp, curiosity_points: newPoints, last_claimed_date: nowIso })
      .eq("user_id", user.id);

    if (updateError) return { error: updateError.message };
  } else {
    const { error: insertError } = await supabase
      .from("user_gamification")
      .insert([{ user_id: user.id, xp: newXp, curiosity_points: newPoints, last_claimed_date: nowIso }]);

    if (insertError) return { error: insertError.message };
  }

  return { success: true, newXp };
}
