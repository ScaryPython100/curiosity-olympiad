"use server";

import { createClient } from "@/utils/supabase/server";
import { EXPERIMENTS_CONFIG } from "@/config/scoringConfig";

export async function evaluateExperiment(payload: {
  experimentId: string;
  telemetry: any;
  objectiveCompleted: boolean;
  freeTextResponse?: string;
  freeTextScore?: number;
  freeTextFeedback?: string;
  epistemicDepth?: number;
  inquiryStage?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const config = EXPERIMENTS_CONFIG[payload.experimentId];
    if (!config) return { success: false, error: "Invalid experiment ID" };

    // 1. Base Correctness (6 Points for Objective)
    let baseScore = config.basePts;

    // 2. Ambient Exploration (Curiosity) - max 4 points
    let telemetryPoints = 0;
    
    // Evaluate unprompted trials: total user interactions with the variables
    const trials = (payload.telemetry.clickCount || 0) + (payload.telemetry.dragCount || 0);
    const reversals = payload.telemetry.reversals || 0;
    const triggerActivated = Boolean(payload.telemetry.triggerActivated);
    const distinctStates = payload.telemetry.distinctStatesReached || 0;

    // Broad parameter exploration
    if (trials >= 5) {
      telemetryPoints += 2;
    } else if (trials >= 2) {
      telemetryPoints += 1;
    }

    // Hypothesis testing (reversals) or discovering the physical anomaly trigger
    if (triggerActivated || reversals >= 2) {
      telemetryPoints += 1;
    }

    // Diverse states explored
    if (distinctStates >= 3 && telemetryPoints < 3) {
      telemetryPoints += 1;
    }

    // 3. Free Text ML Score (Epistemic Depth from optional thought prompt)
    const mlScore = payload.freeTextScore || 0;

    // Combined curiosity score
    const explorationScore = Math.min(config.explorationPts, telemetryPoints + mlScore);
    const totalScore = baseScore + explorationScore;

    // 4. Detailed Log to Supabase telemetry_logs table
    const { error: insertError } = await supabase.from('telemetry_logs').insert({
      user_id: user.id,
      experiment_id: payload.experimentId,
      base_score: baseScore,
      exploration_score: explorationScore,
      total_score: totalScore,
      voluntary_trials: trials,
      continue_vs_leave: null,
      trigger_activated: triggerActivated,
      distinct_states_reached: distinctStates,
      comparison_pattern_detected: payload.telemetry.comparisonPatternDetected || false,
      drag_entropy_score: payload.telemetry.dragEntropyScore || 0,
      total_time_seconds: Math.floor((payload.telemetry.totalDwellTime || 0) / 1000),
      idle_time_seconds: payload.telemetry.idleTimeSeconds || 0,
      free_text_response: payload.freeTextResponse || null,
      ml_score: mlScore,
      epistemic_depth: payload.epistemicDepth || 0,
      inquiry_stage: payload.inquiryStage || null,
      ml_feedback: payload.freeTextFeedback || null
    });

    if (insertError) {
      console.warn("Telemetry log insert failed (table may not exist yet):", insertError);
    }

    return { 
      success: true, 
      score: totalScore, 
      maxScore: config.basePts + config.explorationPts,
      baseScore,
      explorationScore
    };
  } catch (err) {
    console.error("evaluateExperiment error:", err);
    return { success: false, error: "Internal server error" };
  }
}

export async function getUnlockedLevels() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    if (!user) return { success: true, unlockedLevels: allLevels };

    const { data, error } = await supabase
      .from('student_levels')
      .select('level_index, status')
      .eq('user_id', user.id);

    if (error || !data) {
      return { success: true, unlockedLevels: allLevels }; 
    }

    const unlocked = [...allLevels]; 
    data.forEach((lvl: any) => {
      if (lvl.status === 'unlocked' || lvl.status === 'completed') {
        if (!unlocked.includes(lvl.level_index)) unlocked.push(lvl.level_index);
      }
    });

    return { success: true, unlockedLevels: unlocked };
  } catch (err) {
    console.error("getUnlockedLevels error:", err);
    return { success: false, unlockedLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
  }
}
