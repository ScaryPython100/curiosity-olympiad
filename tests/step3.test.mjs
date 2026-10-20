import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

import {
  streakAfterLesson,
  nextStreak,
  currentStreak,
  daysCoveredByFreezes,
  daysBetween,
  MAX_STREAK_FREEZES,
} from '../src/utils/xpRules.ts';
import { starsFor, nextTestId, pathOffset, pathCurve } from '../src/utils/learningPath.ts';

test('streak freezes', async (t) => {
  await t.test('next day adds one, same day keeps the streak', () => {
    assert.deepEqual(streakAfterLesson(4, '2026-10-19', '2026-10-20', 0), { streak: 5, freezes: 0, freezesUsed: 0, freezeEarned: false });
    assert.equal(streakAfterLesson(4, '2026-10-20', '2026-10-20', 1).streak, 4);
  });

  await t.test('one missed day is covered by one freeze', () => {
    const r = streakAfterLesson(4, '2026-10-18', '2026-10-20', 1);
    assert.deepEqual(r, { streak: 5, freezes: 0, freezesUsed: 1, freezeEarned: false });
  });

  await t.test('two missed days need two freezes', () => {
    assert.equal(streakAfterLesson(4, '2026-10-17', '2026-10-20', 1).streak, 1, 'one freeze is not enough');
    assert.equal(streakAfterLesson(4, '2026-10-17', '2026-10-20', 1).freezes, 1, 'freezes are kept when the streak breaks');
    const r = streakAfterLesson(4, '2026-10-17', '2026-10-20', 2);
    assert.equal(r.streak, 5);
    assert.equal(r.freezesUsed, 2);
    assert.equal(r.freezes, 0);
  });

  await t.test('reaching 7 and 14 days earns a freeze, up to the maximum', () => {
    const at7 = streakAfterLesson(6, '2026-10-19', '2026-10-20', 0);
    assert.equal(at7.streak, 7);
    assert.equal(at7.freezeEarned, true);
    assert.equal(at7.freezes, 1);
    const full = streakAfterLesson(13, '2026-10-19', '2026-10-20', MAX_STREAK_FREEZES);
    assert.equal(full.freezeEarned, false);
    assert.equal(full.freezes, MAX_STREAK_FREEZES);
  });

  await t.test('a second test on day 7 does not earn another freeze', () => {
    assert.equal(streakAfterLesson(7, '2026-10-20', '2026-10-20', 1).freezeEarned, false);
  });

  await t.test('a freeze used on the day the streak reaches 7 is replaced by the new one', () => {
    const r = streakAfterLesson(6, '2026-10-18', '2026-10-20', 1);
    assert.deepEqual(r, { streak: 7, freezes: 1, freezesUsed: 1, freezeEarned: true });
  });

  await t.test('first ever lesson and nonsense input', () => {
    assert.equal(streakAfterLesson(0, null, '2026-10-20', 2).streak, 1);
    assert.equal(streakAfterLesson(-5, null, '2026-10-20', 99).freezes <= MAX_STREAK_FREEZES, true);
    assert.equal(nextStreak(3, '2026-10-19', '2026-10-20'), 4, 'old helper still works');
  });

  await t.test('shown streak stays alive while freezes cover the gap', () => {
    assert.equal(currentStreak(5, '2026-10-18', '2026-10-20', 0), 0);
    assert.equal(currentStreak(5, '2026-10-18', '2026-10-20', 1), 5);
    assert.equal(daysCoveredByFreezes('2026-10-18', '2026-10-20', 1), 1);
    assert.equal(daysCoveredByFreezes('2026-10-19', '2026-10-20', 1), 0, 'nothing to cover yet');
    assert.equal(daysCoveredByFreezes('2026-10-15', '2026-10-20', 2), 0, 'too many missed days');
  });

  await t.test('day counting crosses months and years', () => {
    assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
    assert.equal(daysBetween('2026-02-28', '2026-03-01'), 1);
  });
});

test('learning path helpers', async (t) => {
  await t.test('stars match the end-of-test screen', () => {
    assert.equal(starsFor(9, 9), 3);
    assert.equal(starsFor(6, 9), 2);
    assert.equal(starsFor(5, 9), 1);
    assert.equal(starsFor(0, 0), 1);
  });
  await t.test('next test is the first unfinished one', () => {
    assert.equal(nextTestId([1, 2, 3], { 1: { completed: true } }), 2);
    assert.equal(nextTestId([1, 2, 3], { 2: { completed: true } }), 1);
    assert.equal(nextTestId([1, 2], { 1: { completed: true }, 2: { completed: true } }), null);
  });
  await t.test('the path winds inside the column', () => {
    const offsets = Array.from({ length: 13 }, (_, i) => pathOffset(i));
    assert.equal(offsets[0], 0);
    assert.ok(offsets.some((o) => o > 0) && offsets.some((o) => o < 0), 'goes both ways');
    assert.ok(offsets.every((o) => Math.abs(o) <= 84));
    assert.match(pathCurve([{ x: 0, y: 0 }, { x: 10, y: 20 }]), /^M 0 0 C /);
    assert.equal(pathCurve([]), '');
  });
});

test('Step 3 text exists in all 9 languages', () => {
  const load = (c) => JSON.parse(readFileSync(new URL(`../locales/${c}.json`, import.meta.url), 'utf8'));
  const en = load('en');
  const placeholders = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join();
  for (const code of ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu']) {
    const d = load(code);
    for (const section of ['path', 'kuppu', 'freeze', 'install']) {
      assert.deepEqual(Object.keys(d[section]).sort(), Object.keys(en[section]).sort(), `${code}.${section}`);
      for (const [k, v] of Object.entries(d[section])) {
        assert.ok(v.trim(), `${code}.${section}.${k} empty`);
        assert.equal(placeholders(v), placeholders(en[section][k]), `${code}.${section}.${k} placeholders`);
      }
    }
  }
});

test('app can be installed (manifest and icons)', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.start_url);
  const pngSize = (file) => {
    const b = readFileSync(file);
    return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
  };
  for (const icon of manifest.icons) {
    const file = new URL(`../public${icon.src}`, import.meta.url);
    assert.ok(existsSync(file), `${icon.src} exists`);
    assert.equal(pngSize(file), icon.sizes, `${icon.src} is really ${icon.sizes}`);
  }
  assert.ok(manifest.icons.some((i) => i.sizes === '192x192') && manifest.icons.some((i) => i.sizes === '512x512'));
  const layout = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /manifest: "\/manifest\.json"/, 'layout links the manifest');
  assert.ok(existsSync(new URL('../public/kuppu/face-128.webp', import.meta.url)));
});
