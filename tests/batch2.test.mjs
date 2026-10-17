import test from "node:test";
import assert from "node:assert/strict";
import { OFFICIAL_MOCK_TESTS } from "../src/data/mockTestsData.ts";
import { LEVELS_CONFIG, EXPERIMENTS_CONFIG } from "../src/config/scoringConfig.ts";

test("Batch 2: Mock Tests 12 & 13 Master Curriculum Verification", async (t) => {
  await t.test("OFFICIAL_MOCK_TESTS has all 13 tests", () => {
    assert.strictEqual(OFFICIAL_MOCK_TESTS.length, 13, "Should have 13 complete mock tests");
    const test12 = OFFICIAL_MOCK_TESTS.find((m) => m.id === 12);
    const test13 = OFFICIAL_MOCK_TESTS.find((m) => m.id === 13);

    assert.ok(test12, "Test 12 should be defined");
    assert.strictEqual(test12.module, "Seasons");
    assert.strictEqual(test12.questionCount, 9);
    assert.strictEqual(test12.experimentCount, 3);

    assert.ok(test13, "Test 13 should be defined");
    assert.strictEqual(test13.module, "Solar");
    assert.strictEqual(test13.questionCount, 9);
    assert.strictEqual(test13.experimentCount, 3);
  });

  await t.test("Scoring configs for Levels 11 & 12 exist", () => {
    assert.ok(LEVELS_CONFIG[11], "Level 11 config should exist");
    assert.strictEqual(LEVELS_CONFIG[11].name, "Day/Night & Seasons");

    assert.ok(LEVELS_CONFIG[12], "Level 12 config should exist");
    assert.strictEqual(LEVELS_CONFIG[12].name, "Solar System Scale");
  });

  await t.test("All 6 Batch 2 experiments are registered with rubric prompts", () => {
    const batch2ExpIds = [
      "daynight_1",
      "daynight_2",
      "daynight_3",
      "solar_1",
      "solar_2",
      "solar_3",
    ];

    batch2ExpIds.forEach((expId) => {
      const exp = EXPERIMENTS_CONFIG[expId];
      assert.ok(exp, `Experiment config for ${expId} should exist`);
      assert.ok(exp.basePts > 0, "Base points should be positive");
      assert.ok(exp.explorationPts > 0, "Exploration points should be positive");
      assert.ok(exp.freeTextInquiry, "Should have freeTextInquiry");
      assert.ok(exp.freeTextInquiry.prompt.length > 10, "Prompt should be meaningful");
    });
  });
});
