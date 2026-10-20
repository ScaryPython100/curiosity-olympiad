"use server";

import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import {
  INQUIRY_PROMPTS,
  INQUIRY_STAGES,
  buildCodingPrompt,
  type InquiryCodes,
  type InquiryPromptType,
} from "@/config/inquiryMatrix";

// AI Gateway model id (see AGENTS.md). Override with THOUGHT_CODING_MODEL.
// Gemini Flash-Lite is available on the Gateway free tier (Anthropic models are not).
const CODING_MODEL = process.env.THOUGHT_CODING_MODEL || "google/gemini-2.5-flash-lite";
const MAX_RESPONSE_CHARS = 600;

const level02 = z.number().int().min(0).max(2);
const codesSchema = z.object({
  epistemicDepth: z.number().int().min(0).max(6).describe("A. Epistemic depth, 0-6"),
  inquiryStage: z.enum(INQUIRY_STAGES).nullable().describe("B. Inquiry stage; null only when epistemicDepth is 0"),
  evidenceGrounding: level02,
  testability: level02,
  causalOrientation: level02,
  generativity: level02,
  transfer: level02,
  uncertaintySpecificity: level02,
});

// On Vercel the Gateway can authenticate with the project's OIDC token automatically;
// locally it needs AI_GATEWAY_API_KEY (or `vercel env pull` for an OIDC token).
function gatewayConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL === "1");
}

/** Ask the model for the Question Matrix vector. Returns null if coding is unavailable or fails. */
async function codeResponse(input: {
  promptText: string;
  response: string;
  experimentName: string;
  anomalyTriggered: boolean;
}): Promise<InquiryCodes | null> {
  if (!gatewayConfigured()) return null;
  try {
    const { output } = await generateText({
      model: CODING_MODEL,
      output: Output.object({ schema: codesSchema }),
      prompt: buildCodingPrompt(input),
      temperature: 0,
      abortSignal: AbortSignal.timeout(20000),
    });
    // Depth 0 means no inquiry, so there is no stage to code.
    return output.epistemicDepth === 0 ? { ...output, inquiryStage: null } : output;
  } catch (err) {
    console.error("Question Matrix coding failed:", err);
    return null;
  }
}

/**
 * Saves a learner's open-inquiry ("Quick Scientist's Thought") response and
 * its Question Matrix codes. The codes are measurement data only: they are
 * not shown to the learner and do not change XP or rank.
 */
export async function submitInquiryResponse(input: {
  mockTestId: number;
  experimentIndex: number;
  experimentName: string;
  promptType: InquiryPromptType;
  response: string;
  anomalyTriggered: boolean;
}): Promise<{ success: boolean; saved: boolean; coded: boolean; codes?: InquiryCodes; error?: string }> {
  const response = (input.response || "").trim().slice(0, MAX_RESPONSE_CHARS);
  if (!response) return { success: false, saved: false, coded: false, error: "Empty response." };
  if (!(input.promptType in INQUIRY_PROMPTS)) {
    return { success: false, saved: false, coded: false, error: "Unknown prompt." };
  }
  const mockTestId = Math.floor(Number(input.mockTestId));
  const experimentIndex = Math.floor(Number(input.experimentIndex));
  if (!(mockTestId >= 1 && mockTestId <= 13) || !(experimentIndex >= 0 && experimentIndex <= 2)) {
    return { success: false, saved: false, coded: false, error: "Unknown experiment." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, saved: false, coded: false, error: "Not signed in." };

  const promptText = INQUIRY_PROMPTS[input.promptType];
  const experimentName = String(input.experimentName || "").slice(0, 80);
  const anomalyTriggered = Boolean(input.anomalyTriggered);
  const codes = await codeResponse({ promptText, response, experimentName, anomalyTriggered });

  const { error } = await supabase.from("inquiry_responses").upsert(
    {
      user_id: user.id,
      mock_test_id: mockTestId,
      experiment_index: experimentIndex,
      prompt_type: input.promptType,
      prompt_text: promptText,
      response_text: response,
      anomaly_triggered: anomalyTriggered,
      epistemic_depth: codes?.epistemicDepth ?? null,
      inquiry_stage: codes?.inquiryStage ?? null,
      evidence_grounding: codes?.evidenceGrounding ?? null,
      testability: codes?.testability ?? null,
      causal_orientation: codes?.causalOrientation ?? null,
      generativity: codes?.generativity ?? null,
      transfer: codes?.transfer ?? null,
      uncertainty_specificity: codes?.uncertaintySpecificity ?? null,
      coding_status: codes ? "coded" : "pending",
      coding_model: codes ? CODING_MODEL : null,
      coded_at: codes ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,mock_test_id,experiment_index" }
  );

  if (error) {
    console.warn("inquiry_responses save failed (has the SQL been run?):", error.message);
    return { success: true, saved: false, coded: Boolean(codes), codes: codes ?? undefined };
  }
  return { success: true, saved: true, coded: Boolean(codes), codes: codes ?? undefined };
}

/** The signed-in learner's coded responses, for the Curiosity Quotient profile. */
export async function getMyInquiryCodes(): Promise<{ success: boolean; data: InquiryCodes[] }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };
    const { data, error } = await supabase
      .from("inquiry_responses")
      .select("epistemic_depth, inquiry_stage, evidence_grounding, testability, causal_orientation, generativity, transfer, uncertainty_specificity")
      .eq("user_id", user.id)
      .eq("coding_status", "coded");
    if (error || !data) return { success: false, data: [] };
    return {
      success: true,
      data: data.map((r) => ({
        epistemicDepth: r.epistemic_depth,
        inquiryStage: r.inquiry_stage,
        evidenceGrounding: r.evidence_grounding,
        testability: r.testability,
        causalOrientation: r.causal_orientation,
        generativity: r.generativity,
        transfer: r.transfer,
        uncertaintySpecificity: r.uncertainty_specificity,
      })),
    };
  } catch {
    return { success: false, data: [] };
  }
}
