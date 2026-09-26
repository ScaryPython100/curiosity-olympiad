"use client";

import { createClient } from "@/utils/supabase/client";

/**
 * Initializes the current browser tab session
 */
export function initTabSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("curiosity_tab_session_active", "true");
    sessionStorage.setItem("curiosity_tab_session_time", Date.now().toString());
  } catch {}
}

/**
 * Checks whether the current browser tab has an active session
 */
export function isTabSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem("curiosity_tab_session_active") === "true";
  } catch (e) {
    return false;
  }
}

/**
 * Cleanly signs out the user across Supabase, cookies, and tab storage
 */
export async function logoutUser() {
  if (typeof window === "undefined") return;

  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {}

  try {
    // Clear descope_session cookie
    document.cookie = "descope_session=; max-age=0; path=/;";

    // Clear any Supabase auth cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (name.startsWith("sb-")) {
        document.cookie = `${name}=; max-age=0; path=/;`;
      }
    }
  } catch {}

  try {
    // Clear tab session
    sessionStorage.clear();
  } catch {}

  try {
    // Clear user-specific storage to prevent cross-account bleed between students
    localStorage.removeItem("curiosity_school_code");
    localStorage.removeItem("curiosity_real_name");
    localStorage.removeItem("curiosity_username");
    localStorage.removeItem("curiosity_avatar_url");
    localStorage.removeItem("curiosity_user_id");
    localStorage.removeItem("curiosity_parental_consent");
    localStorage.removeItem("curiosity_consent_timestamp");
  } catch {}

  window.location.href = "/login";
}
