import test from "node:test";
import assert from "node:assert/strict";

import { istDayKey, previousIstDayKey, istStartOfDay, istStartOfWeek } from "../src/utils/istTime.ts";
import { computeMockTestXP, nextStreak, currentStreak, XP_RULES } from "../src/utils/xpRules.ts";

test("IST time helpers", async (t) => {
  await t.test("day key follows India time, not UTC", () => {
    // 19:00 UTC on Oct 18 is 00:30 IST on Oct 19
    assert.equal(istDayKey(new Date("2026-10-18T19:00:00Z")), "2026-10-19");
    // 18:29 UTC is still 23:59 IST on Oct 18
    assert.equal(istDayKey(new Date("2026-10-18T18:29:00Z")), "2026-10-18");
  });

  await t.test("previous day crosses month and year boundaries", () => {
    assert.equal(previousIstDayKey("2026-11-01"), "2026-10-31");
    assert.equal(previousIstDayKey("2027-01-01"), "2026-12-31");
  });

  await t.test("start of day is midnight IST (18:30 UTC the day before)", () => {
    assert.equal(istStartOfDay(new Date("2026-10-19T10:00:00Z")).toISOString(), "2026-10-18T18:30:00.000Z");
    assert.equal(istStartOfDay(new Date("2026-10-18T19:00:00Z")).toISOString(), "2026-10-18T18:30:00.000Z");
  });

  await t.test("week starts Monday 00:00 IST", () => {
    // Oct 19 2026 is a Monday
    const monday = "2026-10-18T18:30:00.000Z";
    assert.equal(istStartOfWeek(new Date("2026-10-19T05:00:00Z")).toISOString(), monday);
    assert.equal(istStartOfWeek(new Date("2026-10-25T18:00:00Z")).toISOString(), monday); // Sunday 23:30 IST
    assert.equal(istStartOfWeek(new Date("2026-10-25T18:30:00Z")).toISOString(), "2026-10-25T18:30:00.000Z"); // next Monday 00:00 IST
  });
});

test("Mock test XP is capped on the server", async (t) => {
  const base = { questionCap: 9, idealSecs: 300 };

  await t.test("normal attempt matches the original formula", () => {
    const xp = computeMockTestXP({ ...base, score: 7, total: 9, reversals: 3, adjustments: 10, timeSecs: 200 });
    assert.equal(xp.accuracyXP, 700);
    assert.equal(xp.telemetryBonusXP, 3 * 50 + 10 * 20 + 50);
    assert.equal(xp.totalXP, 700 + 400);
  });

  await t.test("tampered numbers can't exceed the real maximum", () => {
    const xp = computeMockTestXP({ ...base, score: 1e9, total: 1e9, reversals: 1e6, adjustments: 1e6, timeSecs: 1 });
    const max = 9 * XP_RULES.perCorrectAnswer
      + XP_RULES.maxReversals * XP_RULES.perReversal
      + XP_RULES.maxAdjustments * XP_RULES.perAdjustment
      + XP_RULES.speedBonus;
    assert.equal(xp.score, 9);
    assert.equal(xp.totalXP, max);
  });

  await t.test("negative, NaN and score-above-total inputs are clamped", () => {
    const xp = computeMockTestXP({ ...base, score: 5, total: 3, reversals: -4, adjustments: "abc", timeSecs: -10 });
    assert.equal(xp.score, 3);
    assert.equal(xp.telemetryBonusXP, 0);
  });

  await t.test("no speed bonus for an empty instant submit", () => {
    const xp = computeMockTestXP({ ...base, score: 0, total: 9, reversals: 0, adjustments: 0, timeSecs: 5 });
    assert.equal(xp.totalXP, 0);
  });
});

test("Streaks", async (t) => {
  await t.test("first lesson ever starts a 1-day streak", () => {
    assert.equal(nextStreak(0, null, "2026-10-19"), 1);
  });

  await t.test("lesson on the next day adds one", () => {
    assert.equal(nextStreak(4, "2026-10-18", "2026-10-19"), 5);
  });

  await t.test("second lesson the same day keeps the streak", () => {
    assert.equal(nextStreak(5, "2026-10-19", "2026-10-19"), 5);
  });

  await t.test("missing a day restarts at 1", () => {
    assert.equal(nextStreak(9, "2026-10-16", "2026-10-19"), 1);
  });

  await t.test("shown streak is 0 once a whole day is missed", () => {
    assert.equal(currentStreak(5, "2026-10-18", "2026-10-19"), 5); // still savable today
    assert.equal(currentStreak(5, "2026-10-17", "2026-10-19"), 0);
    assert.equal(currentStreak(1, null, "2026-10-19"), 0); // never finished a lesson
  });
});
