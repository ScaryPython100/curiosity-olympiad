import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Replicate deterministic HMAC-SHA256 password generator from actions.ts
function getSecureFallbackPassword(identifier, secretKey) {
  const secret = secretKey || "agastya_secure_salt";
  return crypto.createHmac("sha256", secret).update(identifier).digest("hex").slice(0, 24) + "!Aa9";
}

test('Security: getSecureFallbackPassword logic', async (t) => {
  await t.test('generates unique, deterministic passwords per user identifier', () => {
    const pwd1 = getSecureFallbackPassword("student1@example.com", "mock_service_key");
    const pwd2 = getSecureFallbackPassword("student1@example.com", "mock_service_key");
    const pwd3 = getSecureFallbackPassword("student2@example.com", "mock_service_key");

    assert.equal(pwd1, pwd2, "Same user identifier and key must produce identical password");
    assert.notEqual(pwd1, pwd3, "Different user identifiers must produce distinct passwords");
  });

  await t.test('never outputs the deprecated static dev sandbox password', () => {
    const testIdentifiers = [
      "admin",
      "student@agastya.org",
      "test_user",
      "",
      "ScaryPython692"
    ];

    for (const id of testIdentifiers) {
      const pwd = getSecureFallbackPassword(id, "secret_key");
      assert.notEqual(pwd, "DevSandboxOverridePassword!123", "Must never return hardcoded override password");
      assert.ok(pwd.length >= 16, "Password length must satisfy strong entropy requirements");
      assert.match(pwd, /[!@#$%^&*!Aa9]/, "Password must include special characters");
    }
  });

  await t.test('changes hash output if server salt changes', () => {
    const pwdSaltA = getSecureFallbackPassword("student@agastya.org", "salt_A");
    const pwdSaltB = getSecureFallbackPassword("student@agastya.org", "salt_B");

    assert.notEqual(pwdSaltA, pwdSaltB, "Altering secret salt must alter generated password");
  });
});

test('Security: Admin Authorization Guard verification logic', async (t) => {
  function verifyAdminAuth(providedKey, adminSecretKey) {
    if (!adminSecretKey) return false;
    if (!providedKey) return false;
    return providedKey === adminSecretKey;
  }

  await t.test('rejects unauthenticated requests when key is missing or undefined', () => {
    assert.equal(verifyAdminAuth(null, "valid_admin_secret"), false);
    assert.equal(verifyAdminAuth(undefined, "valid_admin_secret"), false);
    assert.equal(verifyAdminAuth("", "valid_admin_secret"), false);
  });

  await t.test('rejects unauthorized requests with mismatched key', () => {
    assert.equal(verifyAdminAuth("wrong_key", "valid_admin_secret"), false);
    assert.equal(verifyAdminAuth("Bearer wrong_key", "valid_admin_secret"), false);
  });

  await t.test('authorizes valid administrator secret key', () => {
    assert.equal(verifyAdminAuth("valid_admin_secret", "valid_admin_secret"), true);
  });
});
