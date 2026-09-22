"use server";

import { createClient } from "@/utils/supabase/server";

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
};

/**
 * Submits a Mock Test attempt to Supabase exam_submissions
 * Sets up the dedicated Mock Test UUID and persists rich Curiosity Quotient telemetry.
 */
export async function submitMockTestAttempt(
  mockTestId: number,
  score: number,
  maxScore: number,
  telemetryData: any
) {
  const examId = MOCK_TEST_EXAM_IDS[mockTestId] || "00000000-0000-0000-0000-000000000000";
  return submitExamScore(examId, score, maxScore, telemetryData);
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

    const reverseMap: Record<string, number> = {};
    Object.entries(MOCK_TEST_EXAM_IDS).forEach(([testId, examUuid]) => {
      reverseMap[examUuid] = Number(testId);
    });

    const attemptsMap: Record<number, any> = {};
    if (data) {
      data.forEach((row) => {
        const testId = reverseMap[row.exam_id];
        if (testId) {
          const telemetry = row.telemetry_data || {};
          const accuracyXP = telemetry.accuracyXP ?? (row.score * 100);
          const telemetryBonusXP = telemetry.telemetryBonusXP ?? 210;
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
