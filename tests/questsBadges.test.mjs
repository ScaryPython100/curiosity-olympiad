import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  questsForDay, dailyQuests, questProgress, exploreActionsFrom, newlyEarnedBadges, badgeShelf,
  BADGE_RULES, EXPLORE_TARGET,
} from '../src/utils/questsBadges.ts';

const test9 = (score, extra = {}) => ({ test: 1, score, maxScore: 9, exploreActions: 0, ...extra });

test('daily quests', async (t) => {
  await t.test('3 quests a day: always "finish 1 test", the other two change and never repeat', () => {
    const seen = new Set();
    for (let d = 1; d <= 12; d++) {
      const day = `2026-10-${String(d).padStart(2, '0')}`;
      const q = questsForDay(day);
      assert.equal(q.length, 3);
      assert.equal(q[0], 'finish_1');
      assert.equal(new Set(q).size, 3, `${day} has no duplicates`);
      assert.deepEqual(questsForDay(day), q, 'same quests all day, for everyone');
      seen.add(q.slice(1).join('+'));
    }
    assert.ok(seen.size >= 4, 'the pair changes from day to day');
  });

  await t.test('progress is counted from today\'s finished tests', () => {
    assert.deepEqual(questProgress('finish_1', []), { id: 'finish_1', progress: 0, target: 1, done: false });
    assert.equal(questProgress('finish_2', [test9(5), { ...test9(5), test: 1 }]).progress, 1, 'same test twice counts once');
    assert.equal(questProgress('finish_2', [test9(5), { ...test9(5), test: 2 }]).done, true);
    assert.equal(questProgress('score_7', [test9(6)]).done, false);
    assert.equal(questProgress('score_7', [test9(7)]).done, true);
    assert.equal(questProgress('perfect', [test9(8)]).done, false);
    assert.equal(questProgress('perfect', [test9(9)]).done, true);
    assert.equal(questProgress('explore', [test9(5, { exploreActions: 3 })]).progress, 3);
    assert.equal(questProgress('explore', [test9(5, { exploreActions: 40 })]).progress, EXPLORE_TARGET, 'capped at the target');
  });

  await t.test('no quest rewards the Scientist\'s Thought (framework rule)', () => {
    const all = new Set(Array.from({ length: 30 }, (_, i) => questsForDay(`2026-11-${String((i % 28) + 1).padStart(2, '0')}`)).flat());
    for (const id of all) assert.ok(!/thought|inquiry|write/i.test(id), id);
    assert.ok(!BADGE_RULES.some((b) => /thought|inquiry/i.test(b.id + b.stat)));
  });

  await t.test('explore count comes from telemetry, safely', () => {
    assert.equal(exploreActionsFrom({ sliderAdjustments: 5, reversals: 2 }), 7);
    assert.equal(exploreActionsFrom(null), 0);
    assert.equal(exploreActionsFrom({ sliderAdjustments: -4, reversals: 'x' }), 0);
    assert.equal(dailyQuests('2026-10-20', []).every((q) => !q.done), true);
  });
});

test('badges', async (t) => {
  const none = { testsDone: 0, perfectTests: 0, streak: 0, exploredTests: 0, chestsOpened: 0 };
  await t.test('earned once the stat reaches the target', () => {
    assert.deepEqual(newlyEarnedBadges(none, []), []);
    assert.deepEqual(newlyEarnedBadges({ ...none, testsDone: 1 }, []), ['first_test']);
    assert.deepEqual(newlyEarnedBadges({ ...none, testsDone: 5, perfectTests: 1 }, ['first_test']).sort(), ['five_tests', 'perfect']);
  });
  await t.test('kept badges are not given twice, and a broken streak does not take one away', () => {
    assert.deepEqual(newlyEarnedBadges({ ...none, streak: 7 }, ['streak_3', 'streak_7']), []);
    const shelf = badgeShelf({ ...none, streak: 0 }, { streak_7: '2026-10-01T00:00:00Z' });
    assert.equal(shelf.find((b) => b.id === 'streak_7').earnedAt, '2026-10-01T00:00:00Z');
  });
  await t.test('shelf shows progress towards locked badges', () => {
    const b = badgeShelf({ ...none, testsDone: 3 }, {}).find((x) => x.id === 'five_tests');
    assert.deepEqual([b.progress, b.target, b.earnedAt], [3, 5, null]);
  });
});

test('quest and badge text in all 9 languages', () => {
  const load = (c) => JSON.parse(readFileSync(new URL(`../locales/${c}.json`, import.meta.url), 'utf8'));
  const en = load('en');
  const ph = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join();
  for (const id of BADGE_RULES.map((b) => b.id)) assert.ok(en.badges[id] && en.badges[`${id}_how`], id);
  for (const code of ['hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu']) {
    const d = load(code);
    for (const section of ['quests', 'badges']) {
      assert.deepEqual(Object.keys(d[section]).sort(), Object.keys(en[section]).sort(), `${code}.${section}`);
      for (const k of Object.keys(en[section])) assert.equal(ph(d[section][k]), ph(en[section][k]), `${code}.${section}.${k}`);
    }
  }
});
