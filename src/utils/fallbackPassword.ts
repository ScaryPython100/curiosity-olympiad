import crypto from "crypto";

// Secret that production used before SUPABASE_SERVICE_ROLE_KEY was set there.
// It is public in the repo, so accounts made with it are moved to the current
// password the next time the student signs in with a verified OTP.
export const LEGACY_FALLBACK_SECRET = "agastya_private_server_hmac_salt";

export function deriveFallbackPassword(identifier: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(identifier).digest("hex").slice(0, 24) + "!Aa9";
}

type SignInResult = { error: unknown };

/**
 * Signs in with the current derived password. If that fails, tries the legacy
 * password once and, on success, changes the account to the current password.
 * Only call this after the OTP has been verified.
 */
export async function signInMovingLegacyPassword<R extends SignInResult>({
  currentPassword,
  legacyPassword,
  signIn,
  updatePassword,
}: {
  currentPassword: string;
  legacyPassword: string;
  signIn: (password: string) => Promise<R>;
  updatePassword: (password: string) => Promise<{ error: unknown }>;
}): Promise<R> {
  const res = await signIn(currentPassword);
  if (!res.error || legacyPassword === currentPassword) return res;

  const legacyRes = await signIn(legacyPassword);
  if (legacyRes.error) return res;

  const { error } = await updatePassword(currentPassword);
  if (error) console.error("Could not move account to the new sign-in password:", error);
  return legacyRes;
}
