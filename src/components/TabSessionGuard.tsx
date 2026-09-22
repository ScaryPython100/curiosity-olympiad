"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { initTabSession, isTabSessionActive } from "@/utils/auth";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/leaderboard",
  "/profile",
  "/tournaments",
  "/practice",
  "/settings",
  "/campus-map",
  "/mock-h5p-content",
];

export function TabSessionGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const runSessionCheck = async () => {
      if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("review") === "true") {
        return;
      }
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const active = isTabSessionActive();
        const isProtected = PROTECTED_ROUTES.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`)
        );

        const supabase = createClient();
        let user = null;
        try {
          const { data } = await supabase.auth.getUser();
          user = data?.user;
        } catch {
          user = null;
        }

        const match = document.cookie.match(/(^|;)\s*descope_session=([^;]+)/);
        const hasDescope = !!(match && match[2]);
        const isAuthenticated = !!(user || hasDescope);

        if (!active) {
          // Newly opened browser tab / new tab session
          if (isAuthenticated) {
            // Existing account saved in Supabase:
            // 1. Create a fresh session token
            try {
              await supabase.auth.refreshSession();
            } catch {
              // Ignore network refresh failure
            }

            // 2. Mark this browser tab session as active
            initTabSession();

            // 3. Whatever page was opened on launch (such as /profile, /leaderboard, /practice, /login),
            // redirect automatically to the default dashboard page
            if (pathname !== "/dashboard" && (isProtected || pathname === "/login")) {
              router.replace("/dashboard");
            }
          } else {
            // Completely new device or unauthenticated: take them to /login and nothing else
            if (isProtected) {
              router.replace("/login");
            }
          }
        } else {
          // Tab session is already active - allow free in-tab navigation across all pages.
          // If session was revoked/unauthenticated while on a protected page, enforce login.
          if (!isAuthenticated && isProtected) {
            router.replace("/login");
          }
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    runSessionCheck();
  }, [pathname, router]);

  return null;
}
