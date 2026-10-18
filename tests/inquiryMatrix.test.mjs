import test from "node:test";
import assert from "node:assert/strict";

import {
  INQUIRY_PROMPTS,
  choosePromptType,
  buildCodingPrompt,
  questionGenerationRate,
  generativeExtensionRate,
  EPISTEMIC_DEPTH_LEVELS,
  INQUIRY_STAGES,
  ANALYTIC_DIMENSIONS,
} from "../src/config/inquiryMatrix.ts";

const code = (o = {}) => ({ epistemicDepth: 0, inquiryStage: null, evidenceGrounding: 0, testability: 0, causalOrientation: 0, generativity: 0, transfer: 0, uncertaintySpecificity: 0, ...o });

test("Open-inquiry prompts (framework section 5)", async (t) => {
  await t.test("uses the document's exact wording", () => {
    assert.equal(INQUIRY_PROMPTS.common_anchor, "Is there anything about what you explored that you are still wondering about? What would you like to find out?");
    assert.equal(INQUIRY_PROMPTS.next_investigation, "If you could try one more experiment, what would you try, and what would you be trying to find out?");
    assert.equal(INQUIRY_PROMPTS.after_anomaly, "Was there anything you did not expect? What would you investigate about it?");
  });

  await t.test("after an anomaly, the after-anomaly prompt wins", () => {
    assert.equal(choosePromptType({ anomalyTriggered: true, experimentIndex: 2, experimentCount: 3 }), "after_anomaly");
  });

  await t.test("last experiment gets the next-investigation prompt, others the common anchor", () => {
    assert.equal(choosePromptType({ anomalyTriggered: false, experimentIndex: 2, experimentCount: 3 }), "next_investigation");
    assert.equal(choosePromptType({ anomalyTriggered: false, experimentIndex: 0, experimentCount: 3 }), "common_anchor");
  });
});

test("Question Matrix (framework section 6)", async (t) => {
  await t.test("has depth 0-6, seven inquiry stages and six analytic dimensions", () => {
    assert.deepEqual(EPISTEMIC_DEPTH_LEVELS.map((d) => d.level), [0, 1, 2, 3, 4, 5, 6]);
    assert.deepEqual([...INQUIRY_STAGES], ["Notice", "Wonder", "Predict", "Explore", "Compare", "Explain", "Extend"]);
    assert.equal(ANALYTIC_DIMENSIONS.length, 6);
  });

  await t.test("coding prompt asks for codes only and includes the fairness rule", () => {
    const p = buildCodingPrompt({ promptText: INQUIRY_PROMPTS.common_anchor, response: "what if longer blade?", experimentName: "Ceiling Fan", anomalyTriggered: false });
    assert.match(p, /Do not score, grade or give feedback/);
    assert.match(p, /Do not reward grammar, spelling, response length or sophisticated English/);
    assert.match(p, /what if longer blade\?/);
  });
});

test("Core indicators (framework section 4)", async (t) => {
  await t.test("question generation counts responses with an identifiable inquiry", () => {
    const codes = [code({ epistemicDepth: 0 }), code({ epistemicDepth: 3 }), code({ epistemicDepth: 1 })];
    assert.equal(questionGenerationRate(codes, 6), 2 / 6);
  });

  await t.test("generative extension counts new variables, tests or transfer", () => {
    const codes = [code({ generativity: 2 }), code({ testability: 2 }), code({ transfer: 1 }), code({ generativity: 1 })];
    assert.equal(generativeExtensionRate(codes, 4), 3 / 4);
  });

  await t.test("no opportunities means zero, never NaN", () => {
    assert.equal(questionGenerationRate([], 0), 0);
    assert.equal(generativeExtensionRate([], 0), 0);
  });
});
