import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateCQProfile } from '../src/utils/cqScoring.ts';

test('CQ Scoring: calculateCQProfile', async (t) => {
  await t.test('handles empty inputs gracefully with balanced baseline', () => {
    const profile = calculateCQProfile({});
    
    assert.equal(profile.axes.length, 5, 'Must return exactly 5 CQ axes');
    assert.ok(profile.scoreSpread >= 0, 'Score spread must be non-negative');
    assert.ok(profile.superpower.label.length > 0, 'Superpower must have a non-empty label');
    assert.ok(profile.growthArea.label.length > 0, 'Growth area must have a non-empty label');
    
    const axisIds = profile.axes.map(a => a.id).sort();
    assert.deepEqual(axisIds, ['directed', 'generative', 'range', 'uncertainty', 'voluntary']);
  });

  await t.test('surfaces generative superpower when epistemic reflections are extensive', () => {
    const richInput = {
      telemetryLogs: [
        {
          epistemic_depth: 10,
          reversals: 1,
          voluntary_trials: 1,
          distinct_states_reached: 2
        }
      ],
      completedMockTests: { 1: { score: 9 } },
      reflections: {
        q1: "The light beam refracted because white light contains all wavelengths and each bends at a distinct angle according to Snell's Law."
      },
      xp: 15000
    };

    const profile = calculateCQProfile(richInput);
    assert.equal(profile.superpower.id, 'generative', 'Deep reflections should prioritize Generative Inquiry');
    assert.notEqual(profile.growthArea.id, 'generative', 'Growth area must never contradict superpower');
  });

  await t.test('surfaces directed inquiry superpower on high reversals and parameter tinkering', () => {
    const tinkeringInput = {
      telemetryLogs: [
        {
          reversals: 8,
          sliderAdjustments: 25,
          comparison_pattern_detected: true,
          distinct_states_reached: 12
        }
      ],
      completedMockTests: { 1: { score: 9 }, 2: { score: 9 } },
      xp: 20000
    };

    const profile = calculateCQProfile(tinkeringInput);
    assert.equal(profile.superpower.id, 'directed', 'High systematic reversals should award Directed Inquiry');
    assert.notEqual(profile.growthArea.id, 'directed');
  });

  await t.test('guarantees all 5 axis scores are bounded within [0, 100]', () => {
    const extremeInput = {
      telemetryLogs: Array.from({ length: 50 }, () => ({
        reversals: 50,
        voluntary_trials: 50,
        distinct_states_reached: 50,
        epistemic_depth: 50
      })),
      completedMockTests: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {}, 9: {}, 10: {}, 11: {} },
      reflections: { r1: "Detailed hypothesis ".repeat(50) },
      xp: 500000
    };

    const profile = calculateCQProfile(extremeInput);
    for (const axis of profile.axes) {
      assert.ok(axis.score >= 0 && axis.score <= 100, `Axis ${axis.id} score ${axis.score} must be between 0 and 100`);
    }
  });
});
