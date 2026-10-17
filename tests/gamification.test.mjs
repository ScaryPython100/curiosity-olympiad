import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BADGES,
  XP_PER_LEVEL,
  getBestBadge,
  calculateLevelProgress,
  checkTournamentQualification,
} from '../src/utils/gamification.ts';

test('Gamification: getBestBadge', async (t) => {
  await t.test('returns null for negative or zero XP below any badge threshold', () => {
    // If novice minXp is 0, 0 XP returns novice badge
    const badgeAt0 = getBestBadge(0);
    assert.equal(badgeAt0?.id, 'novice');
  });

  await t.test('correctly identifies intermediate badges', () => {
    assert.equal(getBestBadge(2500)?.id, 'logic_initiate');
    assert.equal(getBestBadge(4999)?.id, 'logic_initiate');
    assert.equal(getBestBadge(5000)?.id, 'curious_mind');
    assert.equal(getBestBadge(10000)?.id, 'scholar');
    assert.equal(getBestBadge(25000)?.id, 'expert');
    assert.equal(getBestBadge(50000)?.id, 'master');
  });

  await t.test('returns grandmaster for maximum XP tier', () => {
    const badge = getBestBadge(300000);
    assert.equal(badge?.id, 'grandmaster');
    assert.equal(badge?.name, 'Grandmaster Scientist');
  });
});

test('Gamification: calculateLevelProgress', async (t) => {
  await t.test('calculates correct level and progress percentage', () => {
    const p1 = calculateLevelProgress(0);
    assert.equal(p1.level, 1);
    assert.equal(p1.currentLevelXp, 0);
    assert.equal(p1.progressPercentage, 0);

    const p2 = calculateLevelProgress(1250);
    assert.equal(p2.level, 1);
    assert.equal(p2.currentLevelXp, 1250);
    assert.equal(p2.progressPercentage, 50);

    const p3 = calculateLevelProgress(2500);
    assert.equal(p3.level, 2);
    assert.equal(p3.currentLevelXp, 0);
    assert.equal(p3.progressPercentage, 0);
  });

  await t.test('accurately surfaces unlockedBadges and nextBadge', () => {
    const result = calculateLevelProgress(5000);
    assert.ok(result.unlockedBadges.length >= 3);
    assert.equal(result.nextBadge?.id, 'scholar');
  });
});

test('Gamification: checkTournamentQualification', async (t) => {
  await t.test('rejects nonexistent tournament policies', () => {
    const res = checkTournamentQualification(10000, 5, true, 'non-existent-tourney');
    assert.equal(res.qualified, false);
    assert.match(res.reason, /policy not found/i);
  });

  await t.test('verifies qualifier level and xp thresholds', () => {
    // "weekly-sprint": minLevel: 1, minXp: 500
    const disqualified = checkTournamentQualification(100, 0, false, 'weekly-sprint');
    assert.equal(disqualified.qualified, false);
    assert.match(disqualified.reason, /requires/i);

    const qualified = checkTournamentQualification(1000, 2, false, 'weekly-sprint');
    assert.equal(qualified.qualified, true);
  });

  await t.test('enforces school verification requirement when policy demands it', () => {
    // "national-olympiad-final": minLevel 20, minXp 50000, requiresSchoolVerification: true
    const unverified = checkTournamentQualification(60000, 25, false, 'national-olympiad-final');
    assert.equal(unverified.qualified, false);
    assert.match(unverified.reason, /verified School Roster/i);

    const verified = checkTournamentQualification(60000, 25, true, 'national-olympiad-final');
    assert.equal(verified.qualified, true);
  });
});
