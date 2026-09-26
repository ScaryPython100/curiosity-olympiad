import { test, describe } from "node:test";
import assert from "node:assert/strict";

// We import the logic from userAvatar and gamification
const AVATARS = [
  { id: "kalam", name: "Abdul Kalam", url: "/avatars/abdul_kalam_1783786598184.png" },
  { id: "einstein", name: "Albert Einstein", url: "/avatars/albert_einstein_1783786524612.png" },
  { id: "curie", name: "Marie Curie", url: "/avatars/marie_curie_1783786533839.png" },
  { id: "ada", name: "Ada Lovelace", url: "/avatars/ada_lovelace_1783786544449.png" },
  { id: "newton", name: "Isaac Newton", url: "/avatars/isaac_newton_1783786553524.png" },
  { id: "hopper", name: "Grace Hopper", url: "/avatars/grace_hopper_1783786562459.png" },
];

function getDeterministicAvatar(seed = "explorer") {
  let hash = 0;
  const str = seed || "explorer";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATARS.length;
  return AVATARS[index].url;
}

function getUserAvatar(userId, customUrl, seedHint, mockLocalStorage) {
  if (customUrl) return customUrl;

  if (mockLocalStorage) {
    const currentUserId = mockLocalStorage.getItem("curiosity_user_id");
    const savedAvatar = mockLocalStorage.getItem("curiosity_avatar_url");

    if (savedAvatar && (!userId || userId === currentUserId)) {
      return savedAvatar;
    }
  }

  return getDeterministicAvatar(userId || seedHint || "explorer");
}

describe("getDeterministicAvatar String Hashing Logic", () => {
  test("returns deterministic result for identical inputs", () => {
    const seed = "explorer_test_123";
    const res1 = getDeterministicAvatar(seed);
    const res2 = getDeterministicAvatar(seed);
    assert.equal(res1, res2, "Same seed must produce identical avatar URL");
  });

  test("returns a valid avatar URL from the predefined list", () => {
    const validUrls = AVATARS.map((a) => a.url);
    const testSeeds = ["user_1", "user_2", "Ramanujan", "CuriousOwl", "AahAhaHaHa"];
    for (const s of testSeeds) {
      const url = getDeterministicAvatar(s);
      assert.ok(validUrls.includes(url), `Avatar URL ${url} must be in AVATARS list`);
    }
  });

  test("handles empty string, null, and undefined gracefully with default fallback", () => {
    const defaultUrl = getDeterministicAvatar("explorer");
    assert.equal(getDeterministicAvatar(""), defaultUrl);
    assert.equal(getDeterministicAvatar(undefined), defaultUrl);
  });
});

describe("getUserAvatar Caching and Fallback Logic", () => {
  test("customUrl takes highest precedence", () => {
    const custom = "https://example.com/custom-avatar.png";
    const result = getUserAvatar("user_123", custom, "seed_hint");
    assert.equal(result, custom);
  });

  test("uses cached localStorage avatar for current user", () => {
    const storage = {
      store: {
        curiosity_user_id: "user_456",
        curiosity_avatar_url: "/avatars/marie_curie_1783786533839.png",
      },
      getItem(key) {
        return this.store[key] || null;
      },
    };

    const result = getUserAvatar("user_456", null, null, storage);
    assert.equal(result, "/avatars/marie_curie_1783786533839.png");
  });

  test("does not bleed cached avatar to a different user ID", () => {
    const storage = {
      store: {
        curiosity_user_id: "user_456",
        curiosity_avatar_url: "/avatars/marie_curie_1783786533839.png",
      },
      getItem(key) {
        return this.store[key] || null;
      },
    };

    const result = getUserAvatar("user_999", null, "other_student", storage);
    const expectedDeterministic = getDeterministicAvatar("user_999");
    assert.equal(result, expectedDeterministic);
  });

  test("falls back to deterministic avatar when storage is empty", () => {
    const result = getUserAvatar("student_alpha");
    assert.equal(result, getDeterministicAvatar("student_alpha"));
  });
});
