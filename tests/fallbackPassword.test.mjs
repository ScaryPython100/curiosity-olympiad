import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEGACY_FALLBACK_SECRET,
  deriveFallbackPassword,
  signInMovingLegacyPassword,
} from '../src/utils/fallbackPassword.ts';

// A fake account store: signIn succeeds only with the stored password.
function fakeAccount(stored) {
  const account = { password: stored, updates: 0 };
  account.signIn = async (pwd) => ({ error: pwd === account.password ? null : new Error('Invalid login') });
  account.updatePassword = async (pwd) => { account.password = pwd; account.updates++; return { error: null }; };
  return account;
}

test('fallback password: moving legacy accounts', async (t) => {
  const id = '9876543210@phone.curiosityolympiad.org';
  const current = deriveFallbackPassword(id, 'service_role_key');
  const legacy = deriveFallbackPassword(id, LEGACY_FALLBACK_SECRET);

  await t.test('current password signs in without changes', async () => {
    const acc = fakeAccount(current);
    const res = await signInMovingLegacyPassword({ currentPassword: current, legacyPassword: legacy, signIn: acc.signIn, updatePassword: acc.updatePassword });
    assert.equal(res.error, null);
    assert.equal(acc.updates, 0);
  });

  await t.test('legacy account signs in and is moved to the current password', async () => {
    const acc = fakeAccount(legacy);
    const res = await signInMovingLegacyPassword({ currentPassword: current, legacyPassword: legacy, signIn: acc.signIn, updatePassword: acc.updatePassword });
    assert.equal(res.error, null);
    assert.equal(acc.password, current);
    assert.equal(acc.updates, 1);
  });

  await t.test('unknown account returns the original error and changes nothing', async () => {
    const acc = fakeAccount('someone-elses-password');
    const res = await signInMovingLegacyPassword({ currentPassword: current, legacyPassword: legacy, signIn: acc.signIn, updatePassword: acc.updatePassword });
    assert.ok(res.error);
    assert.equal(acc.updates, 0);
  });

  await t.test('matches the original password format', () => {
    assert.match(current, /^[0-9a-f]{24}!Aa9$/);
    assert.notEqual(current, legacy);
  });
});
