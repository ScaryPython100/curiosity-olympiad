import { test, describe } from "node:test";
import assert from "node:assert/strict";

function parseDescopeCookieUser(cookieString) {
  if (!cookieString) return null;
  const match = cookieString.match(/(^|;)\s*descope_session=([^;]+)/);
  if (match && match[2]) {
    const id = decodeURIComponent(match[2]);
    return { id, email: id };
  }
  return null;
}

function resolveUserAuthState({ supabaseUser, cookieString }) {
  const cookieUser = parseDescopeCookieUser(cookieString);
  const activeUser = supabaseUser || cookieUser || null;
  return {
    user: activeUser,
    userId: activeUser?.id ?? null,
    isAuthenticated: Boolean(activeUser),
  };
}

describe("useUser Hook Authentication State Logic", () => {
  test("returns null and unauthenticated when neither Supabase nor cookie exists", () => {
    const state = resolveUserAuthState({ supabaseUser: null, cookieString: "" });
    assert.equal(state.user, null);
    assert.equal(state.userId, null);
    assert.equal(state.isAuthenticated, false);
  });

  test("resolves authenticated user from valid descope_session cookie", () => {
    const cookie = "descope_session=student_explorer_99%40agastya.org; path=/";
    const state = resolveUserAuthState({ supabaseUser: null, cookieString: cookie });

    assert.ok(state.user);
    assert.equal(state.userId, "student_explorer_99@agastya.org");
    assert.equal(state.user.email, "student_explorer_99@agastya.org");
    assert.equal(state.isAuthenticated, true);
  });

  test("prioritizes Supabase user when both Supabase and cookie are present", () => {
    const supabaseUser = { id: "uuid-1234-5678", email: "primary@agastya.org" };
    const cookie = "descope_session=fallback%40agastya.org";
    const state = resolveUserAuthState({ supabaseUser, cookieString: cookie });

    assert.equal(state.userId, "uuid-1234-5678");
    assert.equal(state.user.email, "primary@agastya.org");
    assert.equal(state.isAuthenticated, true);
  });

  test("handles malformed cookie strings gracefully without crashing", () => {
    const malformed = "some_random_cookie=true; descope_session=";
    const user = parseDescopeCookieUser(malformed);
    assert.equal(user, null);
  });
});
