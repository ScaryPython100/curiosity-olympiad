import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  normalizeSchoolCode, isValidSchoolCode, isValidPin, hashPin, verifyPin,
  afterFailedLogin, isLocked, signTeacherSession, readTeacherSession, sameSecret,
  MAX_FAILED_LOGINS, SESSION_HOURS,
} from '../src/utils/teacherSession.ts';
import { buildClassReport, classReportCsv } from '../src/utils/classReport.ts';

test('teacher login security', async (t) => {
  await t.test('school codes are cleaned and checked', () => {
    assert.equal(normalizeSchoolCode('  ags-kuppam-101 '), 'AGS-KUPPAM-101');
    assert.ok(isValidSchoolCode('AGS-KUPPAM-101'));
    assert.ok(!isValidSchoolCode('AG'), 'too short');
    assert.ok(!isValidSchoolCode("AGS'; DROP TABLE"), 'no odd characters');
  });

  await t.test('PINs are hashed with a salt and checked', () => {
    assert.ok(isValidPin('482913'));
    assert.ok(!isValidPin('123'), 'too short');
    const a = hashPin('482913');
    const b = hashPin('482913');
    assert.notEqual(a, b, 'salted: same PIN gives different hashes');
    assert.ok(!a.includes('482913'), 'PIN is never stored as plain text');
    assert.ok(verifyPin('482913', a));
    assert.ok(!verifyPin('482914', a));
    assert.ok(!verifyPin('482913', 'garbage'));
    assert.ok(!verifyPin('482913', null));
  });

  await t.test('too many wrong PINs lock the school for a while', () => {
    let state = { failedAttempts: 0, lockedUntil: null };
    const now = Date.parse('2026-10-20T10:00:00Z');
    for (let i = 1; i < MAX_FAILED_LOGINS; i++) {
      state = afterFailedLogin(state.failedAttempts, now);
      assert.equal(state.lockedUntil, null, `still open after ${i} tries`);
    }
    state = afterFailedLogin(state.failedAttempts, now);
    assert.ok(state.lockedUntil, 'locked');
    assert.ok(isLocked(state.lockedUntil, now + 60_000));
    assert.ok(!isLocked(state.lockedUntil, now + 16 * 60_000), 'unlocks after 15 minutes');
  });

  await t.test('session cookie is signed and expires', () => {
    const now = Date.parse('2026-10-20T10:00:00Z');
    const cookie = signTeacherSession('AGS-KUPPAM-101', 'secret-1', now);
    assert.equal(readTeacherSession(cookie, 'secret-1', now + 1000), 'AGS-KUPPAM-101');
    assert.equal(readTeacherSession(cookie, 'other-secret', now), null, 'wrong secret');
    assert.equal(readTeacherSession(cookie, 'secret-1', now + SESSION_HOURS * 3600 * 1000 + 1), null, 'expired');
    const [payload, sig] = cookie.split('.');
    const forged = Buffer.from(JSON.stringify({ v: 1, c: 'OTHER-SCHOOL', e: now + 1e9 })).toString('base64url');
    assert.equal(readTeacherSession(`${forged}.${sig}`, 'secret-1', now), null, 'cannot switch school');
    assert.equal(readTeacherSession(`${payload}.`, 'secret-1', now), null);
    assert.equal(readTeacherSession(undefined, 'secret-1', now), null);
    assert.equal(readTeacherSession(cookie, '', now), null, 'no secret configured');
  });

  await t.test('admin key compare', () => {
    assert.ok(sameSecret('abc', 'abc'));
    assert.ok(!sameSecret('abd', 'abc'));
    assert.ok(!sameSecret('abc', undefined));
  });
});

test('class report', async (t) => {
  const now = new Date('2026-10-20T06:00:00Z'); // 11:30 IST
  const tests = [{ test: 1, title: 'Light & Sight' }, { test: 2, title: 'Forces & Motion' }];
  const members = [
    { userId: 'a', username: 'asha', realName: 'Asha', joinedAt: '2026-10-01T05:00:00Z' },
    { userId: 'b', username: 'babu', realName: null, joinedAt: '2026-10-01T05:00:00Z' },
    { userId: 'c', username: 'chitra', realName: 'Chitra', joinedAt: '2026-10-19T05:00:00Z' },
    { userId: 'd', username: 'dev', realName: 'Dev', joinedAt: '2026-10-05T05:00:00Z' },
  ];
  const report = buildClassReport({
    members,
    gamification: [
      { user_id: 'a', xp: 1900, streak_days: 3, last_login_date: '2026-10-20' },
      { user_id: 'b', xp: 600, streak_days: 5, last_login_date: '2026-10-01' },
    ],
    submissions: [
      { user_id: 'a', test: 1, score: 9, max_score: 9, submitted_at: '2026-10-20T04:00:00Z' },
      { user_id: 'a', test: 2, score: 7, max_score: 9, submitted_at: '2026-10-19T04:00:00Z' },
      { user_id: 'b', test: 1, score: 3, max_score: 9, submitted_at: '2026-10-01T04:00:00Z' },
      { user_id: 'b', test: 2, score: 2, max_score: 9, submitted_at: '2026-10-01T05:00:00Z' },
    ],
    thoughtCounts: { a: 2 },
    tests,
    now,
  });

  await t.test('totals use only real data', () => {
    assert.equal(report.totals.students, 4);
    assert.equal(report.totals.activeToday, 1);
    assert.equal(report.totals.activeThisWeek, 1);
    assert.equal(report.totals.testsFinished, 4);
    assert.equal(report.totals.averagePercent, Math.round((100 + 78 + 33 + 22) / 4));
    assert.equal(report.totals.thoughts, 2);
  });

  await t.test('flags students who need help, with reasons', () => {
    const byId = Object.fromEntries(report.students.map((s) => [s.userId, s]));
    assert.deepEqual(byId.a.help, []);
    assert.deepEqual(byId.b.help.sort(), ['inactive', 'low_scores']);
    assert.deepEqual(byId.c.help, [], 'joined yesterday: too early to flag');
    assert.deepEqual(byId.d.help, ['not_started']);
    assert.equal(byId.b.streak, 0, 'missed days break the shown streak');
    assert.equal(byId.a.streak, 3);
    assert.deepEqual(report.needsHelp.map((s) => s.userId).sort(), ['b', 'd']);
  });

  await t.test('test-by-test shows how many finished and the average', () => {
    assert.deepEqual(report.tests[0], { test: 1, title: 'Light & Sight', finished: 2, averagePercent: Math.round((100 + 33) / 2) });
  });

  await t.test('CSV is Excel-safe', () => {
    const r = buildClassReport({
      members: [{ userId: 'x', username: '=HYPERLINK("http://bad")', realName: 'Ravi, Kumar', joinedAt: '2026-10-01T00:00:00Z' }],
      gamification: [], submissions: [], thoughtCounts: {}, tests, now,
    });
    const csv = classReportCsv(r, [1, 2]);
    const line = csv.split('\n')[1];
    assert.ok(line.startsWith(`"'=HYPERLINK`), 'formula is neutralised');
    assert.ok(line.includes('"Ravi, Kumar"'), 'commas are quoted');
  });
});

test('teacher text exists in all 9 languages', () => {
  const load = (c) => JSON.parse(readFileSync(new URL(`../locales/${c}.json`, import.meta.url), 'utf8'));
  const en = load('en').teacher;
  const ph = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join();
  for (const code of ['hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu']) {
    const d = load(code).teacher;
    assert.deepEqual(Object.keys(d).sort(), Object.keys(en).sort(), code);
    for (const k of Object.keys(en)) assert.equal(ph(d[k]), ph(en[k]), `${code}.${k}`);
  }
});

test('no demo students or master PINs remain', () => {
  const page = readFileSync(new URL('../src/app/schools/page.tsx', import.meta.url), 'utf8');
  assert.ok(!/AGASTYA2026|DEMO_KUPPAM|Aarav Sharma/.test(page));
});
