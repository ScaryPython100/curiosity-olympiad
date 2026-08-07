"use server";

import { createClient } from "@/utils/supabase/server";
import { EXPERIMENTS_CONFIG } from "@/config/scoringConfig";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function evaluateExperiment(payload: {
  experimentId: string;
  telemetry: any;
  objectiveCompleted: boolean; // Did they actually solve it?
  freeTextResponse?: string;
  freeTextScore?: number;
  freeTextFeedback?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const config = EXPERIMENTS_CONFIG[payload.experimentId];
    if (!config) return { success: false, error: "Invalid experiment ID" };

    // 1. Base Correctness (60% objective, 40% efficiency)
    let baseScore = 0;
    if (payload.objectiveCompleted) {
      const objPoints = config.basePts * 0.6;
      
      // Efficiency calculation based on submit attempts
      // 1 or 2 attempts = full efficiency credit. >2 attempts = scaled down
      const attempts = Math.max(1, payload.telemetry.submitAttempts || 1);
      const effRatio = attempts <= 2 ? 1 : Math.max(0, 1 - ((attempts - 2) * 0.25));
      const effPoints = config.basePts * 0.4 * effRatio;
      
      baseScore = objPoints + effPoints;
    }

    // 2. Exploration (Curiosity) Depth-Gradient Model
    let explorationScore = 0;
    let tierReached = 0;

    const hasTrigger = payload.telemetry.triggerActivated;
    const distinctStates = payload.telemetry.distinctStatesReached || 0;
    const hasPattern = payload.telemetry.comparisonPatternDetected || false;
    const entropy = payload.telemetry.dragEntropyScore || 0;
    const dwellAvg = payload.telemetry.averageDwellTime || 0;

    if (hasTrigger) {
      tierReached = 1; // Base activation
      
      // If entropy is extremely high (jittery) AND average dwell is very low, flag as restless and cap at Tier 1
      const isRestless = entropy > 0.8 && dwellAvg < 500;
      
      if (!isRestless) {
        if (distinctStates >= 2) {
          tierReached = 2;
        }
        if (distinctStates >= 3 && hasPattern) {
          tierReached = 3;
        }
      }
      
      explorationScore = (tierReached / 3) * config.explorationPts;
    }

    // 3. Optional Free Text ML Score (added to base if present)
    if (payload.freeTextScore !== undefined) {
      // Typically, free text overrides the objective completion score or adds to it.
      // We will add it to the base score, capped at basePts
      baseScore = Math.min(config.basePts, baseScore + payload.freeTextScore);
    }

    const totalScore = baseScore + explorationScore;

    // 4. Log to Supabase telemetry_logs table (safe failure if table doesn't exist yet)
    const { error: insertError } = await supabase.from('telemetry_logs').insert({
      user_id: user.id,
      experiment_id: payload.experimentId,
      tier: tierReached,
      trigger_activated: hasTrigger,
      distinct_states_reached: distinctStates,
      comparison_pattern_detected: hasPattern,
      drag_entropy_score: entropy,
      total_time_seconds: Math.floor((payload.telemetry.totalDwellTime || 0) / 1000),
      submit_attempts: payload.telemetry.submitAttempts || 1,
      tab_switch_count: payload.telemetry.tabSwitches || 0,
      idle_time_seconds: payload.telemetry.idleTimeSeconds || 0,
      free_text_response: payload.freeTextResponse || null,
      ml_score: payload.freeTextScore || null,
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
      explorationScore,
      tierReached
    };
  } catch (err) {
    console.error("evaluateExperiment error:", err);
    return { success: false, error: "Internal server error" };
  }
}


export async function gradeFreeText(experimentId: string, studentResponse: string) {
  try {
    const config = EXPERIMENTS_CONFIG[experimentId];
    if (!config || !config.freeTextRubric) {
      return { success: false, error: "No rubric found for this experiment." };
    }

    const rubric = config.freeTextRubric;

    const { object } = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: z.object({
        conceptsHit: z.array(z.string()).describe("The rubric concepts that were semantically present in the student's answer."),
        conceptsMissed: z.array(z.string()).describe("The rubric concepts that were NOT found in the student's answer."),
        score: z.number().describe("Partial score out of the maximum points based on concepts hit."),
        feedback: z.string().describe("A short (<20 words) piece of feedback in age-appropriate, encouraging language.")
      }),
      prompt: `
      You are an expert, encouraging science teacher grading a student's short answer.
      
      Question: "${rubric.prompt}"
      Student Answer: "${studentResponse}"
      
      Rubric Concepts (Max Points: ${rubric.maxPoints}):
      ${rubric.rubricConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')}
      
      Instructions:
      1. Identify which rubric concepts are semantically present in the student's answer, regardless of their exact wording or spelling.
      2. Do not penalize for poor grammar or spelling.
      3. Award partial points proportionally based on how many concepts were hit.
      4. Provide a very short, encouraging feedback sentence.
      `
    });

    return { success: true, result: object };
  } catch (error) {
    console.error("ML Grading Error:", error);
    return { success: false, error: "Failed to grade response using ML model." };
  }
}

export async function getUnlockedLevels() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, unlockedLevels: [0] };

    const { data, error } = await supabase
      .from('student_levels')
      .select('level_index, status')
      .eq('user_id', user.id);

    if (error || !data) {
      // If table doesn't exist yet, gracefully unlock all or just the first
      return { success: true, unlockedLevels: [0, 1, 2] }; 
    }

    const unlocked = [0]; // Level 0 is always unlocked
    data.forEach((lvl: any) => {
      if (lvl.status === 'unlocked' || lvl.status === 'completed') {
        unlocked.push(lvl.level_index);
      }
    });

    return { success: true, unlockedLevels: unlocked };
  } catch (err) {
    console.error("getUnlockedLevels error:", err);
    return { success: false, unlockedLevels: [0, 1, 2] };
  }
}
