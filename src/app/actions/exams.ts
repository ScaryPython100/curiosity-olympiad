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
