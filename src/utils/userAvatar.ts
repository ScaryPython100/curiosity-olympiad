"use client";

import { useState, useEffect } from "react";
import { AVATARS } from "./gamification";

/**
 * Returns a deterministic fallback avatar based on userId or username.
 * Ensures the exact SAME user gets the exact SAME avatar on all pages.
 */
export function getDeterministicAvatar(seed: string = "explorer"): string {
  let hash = 0;
  const str = seed || "explorer";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATARS.length;
  return AVATARS[index].url;
}

/**
 * Gets the avatar URL for a given user.
 * - If user is current user (or no userId provided), checks localStorage first.
 * - Otherwise falls back to deterministic avatar for that user.
 */
export function getUserAvatar(userId?: string | null, customUrl?: string | null, seedHint?: string | null): string {
  if (customUrl) return customUrl;

  if (typeof window !== "undefined") {
    const currentUserId = localStorage.getItem("curiosity_user_id");
    const savedAvatar = localStorage.getItem("curiosity_avatar_url");

    // If this is the current logged-in user, use saved avatar from localStorage
    if (savedAvatar && (!userId || userId === currentUserId)) {
      return savedAvatar;
    }
  }

  // Fallback to deterministic avatar derived from userId or seedHint
  return getDeterministicAvatar(userId || seedHint || "explorer");
}

/**
 * React Hook to read and subscribe to real-time profile picture updates across all components and pages.
 */
export function useUserAvatar(userId?: string | null, initialUrl?: string | null, seedHint?: string | null) {
  const [avatarUrl, setAvatarUrl] = useState<string>(() => getUserAvatar(userId, initialUrl, seedHint));

  useEffect(() => {
    const update = () => {
      setAvatarUrl(getUserAvatar(userId, initialUrl, seedHint));
    };

    update();

    if (typeof window !== "undefined") {
      window.addEventListener("curiosity_avatar_changed", update);
      window.addEventListener("storage", update);
      return () => {
        window.removeEventListener("curiosity_avatar_changed", update);
        window.removeEventListener("storage", update);
      };
    }
  }, [userId, initialUrl, seedHint]);

  return avatarUrl;
}
