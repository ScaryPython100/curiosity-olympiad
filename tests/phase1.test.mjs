import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { streakWeekDots } from '../src/utils/streakWeek.ts';
import { playCorrect, playWrong, playCelebrate } from '../src/utils/webAudio.ts';

const LOCALES = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu'];
const load = (code) => JSON.parse(readFileSync(new URL(`../locales/${code}.json`, import.meta.url), 'utf8'));

test('streak week dots', async (t) => {
  // 2026-10-20 is a Tuesday (index 1 in a Monday-first week)
  await t.test('lights yesterday, not today, when no test is done yet today', () => {
    const { lit, todayIdx } = streakWeekDots(1, false, '2026-10-20');
    assert.equal(todayIdx, 1);
    assert.deepEqual(lit, [true, false, false, false, false, false, false]);
  });

  await t.test('lights today once a test is done', () => {
    const { lit } = streakWeekDots(2, true, '2026-10-20');
    assert.deepEqual(lit, [true, true, false, false, false, false, false]);
  });

  await t.test('stays inside this week for long streaks', () => {
    const { lit, todayIdx } = streakWeekDots(30, true, '2026-10-25'); // Sunday
    assert.equal(todayIdx, 6);
    assert.ok(lit.every(Boolean));
  });

  await t.test('lights nothing for a 0 streak', () => {
    assert.ok(streakWeekDots(0, false, '2026-10-21').lit.every((x) => !x));
  });

  await t.test('a Monday with no test yet lights nothing this week', () => {
    assert.ok(streakWeekDots(3, false, '2026-10-19').lit.every((x) => !x));
  });
});

test('Phase 1 text exists in all 9 languages', () => {
  const en = load('en');
  for (const code of LOCALES) {
    const d = load(code);
    for (const section of ['learn', 'thought']) {
      assert.deepEqual(Object.keys(d[section]).sort(), Object.keys(en[section]).sort(), `${code}.${section} keys`);
      for (const [k, v] of Object.entries(d[section])) {
        assert.ok(typeof v === 'string' && v.trim().length > 0, `${code}.${section}.${k} is empty`);
      }
    }
    assert.ok(d.learn.right_answer.includes('{letter}'), `${code} right_answer keeps {letter}`);
    assert.ok(d.learn.score_line.includes('{score}') && d.learn.score_line.includes('{total}'), `${code} score_line keeps placeholders`);
  }
});

test('answer sounds are safe without a browser', () => {
  assert.doesNotThrow(() => { playCorrect(); playWrong(); playCelebrate(); });
});
