"use server";

import { createClient } from "@/utils/supabase/server";
import { OFFICIAL_MOCK_TESTS } from "@/data/mockTestsData";
import { computeMockTestXP } from "@/utils/xpRules";
import { applyXP } from "@/utils/xpLedger";
import { istDayKey } from "@/utils/istTime";
import { loadProgressAndSyncBadges } from "@/utils/badgeLedger";

/**
 * Silently submits an H5P exam score for the currently authenticated user.
 * 
 * @param examId The UUID of the exam
 * @param score The points scored
 * @param maxScore The maximum possible points
 */
export async function submitExamScore(examId: string, score: number, maxScore: number, telemetryData: any = null) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user securely on the server
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized: You must be logged in to submit a test." };
    }

    // Upsert the score into public.exam_submissions
    // The RLS policy guarantees users can only insert for themselves
    const { error: insertError } = await supabase
      .from("exam_submissions")
      .upsert(
        { 
          user_id: user.id, 
          exam_id: examId, 
          score: score, 
          max_score: maxScore,
          telemetry_data: telemetryData,
          submitted_at: new Date().toISOString()
        },
        { onConflict: 'user_id, exam_id' } // Note: requires a unique constraint on these columns (which was provided in the SQL)
      );

    if (insertError) {
      console.error("Exam submission DB error:", insertError);
      return { success: false, error: "Failed to securely save your score." };
    }

    return { success: true };
  } catch (err) {
    console.error("Server Action Exception (submitExamScore):", err);
    return { success: false, error: "An unexpected server error occurred." };
  }
}

const MOCK_TEST_EXAM_IDS: Record<number, string> = {
  1: "00000000-0000-0000-0000-000000000001",
  2: "00000000-0000-0000-0000-000000000002",
  3: "00000000-0000-0000-0000-000000000003",
  4: "00000000-0000-0000-0000-000000000004",
  5: "00000000-0000-0000-0000-000000000005",
  6: "00000000-0000-0000-0000-000000000006",
  7: "00000000-0000-0000-0000-000000000007",
  8: "00000000-0000-0000-0000-000000000008",
  9: "00000000-0000-0000-0000-000000000009",
  10: "00000000-0000-0000-0000-000000000010",
  11: "00000000-0000-0000-0000-000000000011",
  12: "00000000-0000-0000-0000-000000000012",
  13: "00000000-0000-0000-0000-000000000013",
};

const REVERSE_EXAM_MAP: Record<string, number> = Object.entries(MOCK_TEST_EXAM_IDS).reduce(
  (acc, [testId, examUuid]) => {
    acc[examUuid] = Number(testId);
    return acc;
  },
  {} as Record<string, number>
);

/**
 * Submits a Mock Test attempt to Supabase exam_submissions and awards its XP.
 * XP is calculated here from clamped inputs, never taken from the browser.
 * A test earns XP once per India day; retakes the same day still save the
 * attempt and keep the streak alive, but award 0 XP.
 */
export async function submitMockTestAttempt(
  mockTestId: number,
  score: number,
  maxScore: number,
  telemetryData: any
) {
  const test = OFFICIAL_MOCK_TESTS.find((t) => t.id === mockTestId);
  const examId = MOCK_TEST_EXAM_IDS[mockTestId];
  if (!test || !examId) {
    return { success: false, error: "Unknown mock test." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized: You must be logged in to submit a test." };
  }

  const level = telemetryData?.level === "level2" ? "level2" : "level1";
  const xp = computeMockTestXP({
    score,
    total: maxScore,
    questionCap: test.questionCount,
    reversals: telemetryData?.reversals,
    adjustments: telemetryData?.sliderAdjustments,
    timeSecs: telemetryData?.timeSecs,
    idealSecs: test.idealSeconds[level],
  });

  const { data: previous } = await supabase
    .from("exam_submissions")
    .select("submitted_at")
    .eq("user_id", user.id)
    .eq("exam_id", examId)
    .maybeSingle();
  const alreadyEarnedToday =
    !!previous?.submitted_at && istDayKey(new Date(previous.submitted_at)) === istDayKey();
  const xpAwarded = alreadyEarnedToday ? 0 : xp.totalXP;

  const saved = await submitExamScore(examId, xp.score, xp.total, {
    ...(telemetryData || {}),
    score: xp.score,
    total: xp.total,
    accuracyXP: xp.accuracyXP,
    telemetryBonusXP: xp.telemetryBonusXP,
    totalXP: xp.totalXP,
    xpAwarded,
  });
  if (!saved.success) return { ...saved, xpAwarded: 0 };

  const award = await applyXP(supabase, user.id, xpAwarded, { countsForStreak: true });
  if (!award.success) {
    console.error("XP award failed after saving attempt:", award.error);
    return { success: true, ...xp, xpAwarded: 0, alreadyEarnedToday, xpError: award.error };
  }

  // Badges this test earned (e.g. first test, perfect score), shown on the celebration screen
  let newBadges: string[] = [];
  try {
    newBadges = (await loadProgressAndSyncBadges(supabase, user.id)).newlyEarned;
  } catch (err) {
    console.error("Badge check failed:", err);
  }

  return {
    success: true,
    ...xp,
    xpAwarded,
    alreadyEarnedToday,
    newBadges,
    newXp: award.newXp,
    streakCount: award.streakCount,
    streakFreezes: award.streakFreezes,
    freezesUsed: award.freezesUsed,
    freezeEarned: award.freezeEarned,
  };
}

/**
 * Fetches all saved Mock Test attempts for the currently authenticated user from Supabase.
 * Returns a dictionary keyed by mockTestId.
 */
export async function getMockTestAttempts(): Promise<{ success: boolean; data?: Record<number, any>; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, data: {} };

    const examIds = Object.values(MOCK_TEST_EXAM_IDS);
    const { data, error } = await supabase
      .from("exam_submissions")
      .select("exam_id, score, max_score, telemetry_data, submitted_at")
      .eq("user_id", user.id)
      .in("exam_id", examIds);

    if (error) {
      console.warn("Error fetching mock test attempts:", error);
      return { success: false, error: error.message };
    }

    const attemptsMap: Record<number, any> = {};
    if (data) {
      data.forEach((row) => {
        const testId = REVERSE_EXAM_MAP[row.exam_id];
        if (testId) {
          const telemetry = row.telemetry_data || {};
          const accuracyXP = telemetry.accuracyXP ?? (row.score * 100);
          const telemetryBonusXP = telemetry.telemetryBonusXP ?? 0;
          const totalXP = telemetry.totalXP ?? (accuracyXP + telemetryBonusXP);
          attemptsMap[testId] = {
            completed: true,
            score: row.score,
            total: row.max_score,
            percentage: Math.round((row.score / (row.max_score || 9)) * 100),
            timeSecs: telemetry.timeSecs || 180,
            accuracyXP,
            telemetryBonusXP,
            totalXP,
            level: telemetry.level || "level1",
            date: row.submitted_at ? new Date(row.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
            telemetryData: telemetry
          };
        }
      });
    }

    return { success: true, data: attemptsMap };
  } catch (err: any) {
    console.error("Exception fetching mock test attempts:", err);
    return { success: false, error: err.message };
  }
}
