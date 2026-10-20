/**
 * Teacher portal security helpers: school codes, PIN hashing, login lockout
 * and the signed session cookie. Pure Node crypto, so the tests can use them.
 * The secret for signing is passed in by the server action (never sent to the browser).
 */
import crypto from "crypto";

export const TEACHER_COOKIE = "teacher_session";
export const SESSION_HOURS = 8;
export const MAX_FAILED_LOGINS = 5;
export const LOCK_MINUTES = 15;

/** "ags-kuppam-101 " → "AGS-KUPPAM-101". Same rule as student sign-up. */
export function normalizeSchoolCode(code: string): string {
  return (code || "").trim().toUpperCase();
}

/** Letters, digits and dashes, 3–40 long. */
export function isValidSchoolCode(code: string): boolean {
  return /^[A-Z0-9][A-Z0-9-]{2,39}$/.test(code);
}

/** Teacher PINs: 6–20 characters, letters or digits. */
export function isValidPin(pin: string): boolean {
  return /^[A-Za-z0-9]{6,20}$/.test(pin || "");
}

/** Salted scrypt hash, stored as "s1$salt$hash". */
export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pin, salt, 32);
  return `s1$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPin(pin: string, stored: string | null | undefined): boolean {
  const parts = (stored || "").split("$");
  if (parts.length !== 3 || parts[0] !== "s1") return false;
  const salt = Buffer.from(parts[1], "base64url");
  const expected = Buffer.from(parts[2], "base64url");
  const actual = crypto.scryptSync(pin || "", salt, expected.length);
  return expected.length > 0 && crypto.timingSafeEqual(actual, expected);
}

/** Lock state after a wrong PIN: locked for LOCK_MINUTES once MAX_FAILED_LOGINS is reached. */
export function afterFailedLogin(failedAttempts: number, now = Date.now()): { failedAttempts: number; lockedUntil: string | null } {
  const attempts = Math.max(0, failedAttempts || 0) + 1;
  if (attempts >= MAX_FAILED_LOGINS) {
    return { failedAttempts: 0, lockedUntil: new Date(now + LOCK_MINUTES * 60 * 1000).toISOString() };
  }
  return { failedAttempts: attempts, lockedUntil: null };
}

export function isLocked(lockedUntil: string | null | undefined, now = Date.now()): boolean {
  return Boolean(lockedUntil && Date.parse(lockedUntil) > now);
}

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", `teacher-session:${secret}`).update(payload).digest("base64url");
}

/** Cookie value that proves "this browser logged in as a teacher of `schoolCode`" until it expires. */
export function signTeacherSession(schoolCode: string, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ v: 1, c: schoolCode, e: now + SESSION_HOURS * 3600 * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** The school code from a valid, unexpired cookie, or null. */
export function readTeacherSession(value: string | null | undefined, secret: string, now = Date.now()): string | null {
  if (!value || !secret) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data?.v !== 1 || typeof data.c !== "string" || typeof data.e !== "number" || data.e <= now) return null;
    return data.c;
  } catch {
    return null;
  }
}

/** Constant-time compare for the admin key. */
export function sameSecret(given: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(given || "").digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}
