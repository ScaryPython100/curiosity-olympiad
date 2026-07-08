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

  const { error } = await supabase
    .from("student_profiles")
    .update({ avatar_url: avatarValue })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
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

  // In a real app, you'd check if they already got XP for this today
  const { data: currentData } = await supabase
    .from("user_gamification")
    .select("xp")
    .eq("user_id", user.id)
    .single();

  const newXp = (currentData?.xp || 0) + amount;

  const { error } = await supabase
    .from("user_gamification")
    .update({ xp: newXp })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true, newXp };
}
