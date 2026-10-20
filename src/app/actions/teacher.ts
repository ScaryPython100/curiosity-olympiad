"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";
import { isMissingFreezeColumn } from "@/utils/xpLedger";
import { OFFICIAL_MOCK_TESTS } from "@/data/mockTestsData";
import { buildClassReport, type ClassReport, type GamificationRow, type SubmissionRow } from "@/utils/classReport";
import {
  LOCK_MINUTES,
  SESSION_HOURS,
  TEACHER_COOKIE,
  afterFailedLogin,
  hashPin,
  isLocked,
  isValidPin,
  isValidSchoolCode,
  normalizeSchoolCode,
  readTeacherSession,
  sameSecret,
  signTeacherSession,
  verifyPin,
} from "@/utils/teacherSession";

/*
 * Teacher portal. Teachers sign in with their school code + PIN; the server
 * then sets a signed, httpOnly cookie for that school. Every read below takes
 * the school from that cookie (never from the browser), and uses the
 * service-role client because the tables have no RLS policies at all.
 */

function sessionSecret() {
  return process.env.TEACHER_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

// A real-looking hash so a wrong school code takes as long as a wrong PIN.
const DUMMY_HASH = hashPin("not-a-real-pin");

// Exam UUIDs end in the test number: 00000000-0000-0000-0000-0000000000NN
function testNumberFromExamId(examId: string): number | null {
  const n = parseInt(examId.slice(-12), 10);
  return n >= 1 && n <= 13 ? n : null;
}

/** Splits a long id list so the request URLs stay short. */
function chunks<T>(xs: T[], size = 150): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size));
  return out;
}

export type TeacherLoginResult =
  | { success: true }
  | { success: false; error: "invalid" | "locked" | "setup"; minutes?: number };

export async function teacherLogin(schoolCode: string, pin: string): Promise<TeacherLoginResult> {
  const code = normalizeSchoolCode(schoolCode);
  const cleanPin = (pin || "").trim();
  if (!isValidSchoolCode(code) || !isValidPin(cleanPin)) return { success: false, error: "invalid" };

  const admin = createAdminClient();
  const secret = sessionSecret();
  if (!admin || !secret) return { success: false, error: "setup" };

  const { data: school, error } = await admin
    .from("schools")
    .select("code, teacher_pin_hash, failed_attempts, locked_until")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error("teacherLogin: schools table unavailable (has teacher_portal.sql been run?)", error.message);
    return { success: false, error: "setup" };
  }
  if (!school) {
    verifyPin(cleanPin, DUMMY_HASH);
    return { success: false, error: "invalid" };
  }
  if (isLocked(school.locked_until)) {
    const minutes = Math.ceil((Date.parse(school.locked_until) - Date.now()) / 60000);
    return { success: false, error: "locked", minutes };
  }

  if (!verifyPin(cleanPin, school.teacher_pin_hash)) {
    const next = afterFailedLogin(school.failed_attempts);
    await admin
      .from("schools")
      .update({ failed_attempts: next.failedAttempts, locked_until: next.lockedUntil })
      .eq("code", code);
    return next.lockedUntil
      ? { success: false, error: "locked", minutes: LOCK_MINUTES }
      : { success: false, error: "invalid" };
  }

  await admin.from("schools").update({ failed_attempts: 0, locked_until: null }).eq("code", code);
  (await cookies()).set(TEACHER_COOKIE, signTeacherSession(code, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return { success: true };
}

export async function teacherLogout(): Promise<{ success: true }> {
  (await cookies()).delete(TEACHER_COOKIE);
  return { success: true };
}

export type TeacherClassResult =
  | {
      success: true;
      school: { code: string; name: string };
      report: ClassReport;
      tests: { test: number; title: string }[];
    }
  | { success: false; error: "signed_out" | "setup" | "failed" };

/** The signed-in teacher's class: only students who joined with this school's code. */
export async function getTeacherClass(): Promise<TeacherClassResult> {
  const secret = sessionSecret();
  const code = readTeacherSession((await cookies()).get(TEACHER_COOKIE)?.value, secret);
  if (!code) return { success: false, error: "signed_out" };

  const admin = createAdminClient();
  if (!admin) return { success: false, error: "setup" };

  try {
    const { data: school } = await admin.from("schools").select("code, name").eq("code", code).maybeSingle();
    if (!school) return { success: false, error: "signed_out" };

    const { data: members, error: membersError } = await admin
      .from("school_students")
      .select("user_id, username, real_name, joined_at")
      .eq("school_code", code)
      .limit(2000);
    if (membersError) throw new Error(membersError.message);

    const ids = (members ?? []).map((m) => m.user_id);
    const profiles = new Map<string, { username: string | null; real_name: string | null }>();
    const gamification: GamificationRow[] = [];
    const submissions: SubmissionRow[] = [];
    const thoughtCounts: Record<string, number> = {};

    for (const part of chunks(ids)) {
      const [prof, subs, thoughts] = await Promise.all([
        admin.from("student_profiles").select("id, username, real_name").in("id", part),
        admin.from("exam_submissions").select("user_id, exam_id, score, max_score, submitted_at").in("user_id", part),
        admin.from("inquiry_responses").select("user_id").in("user_id", part),
      ]);
      for (const p of prof.data ?? []) profiles.set(p.id, p);
      for (const s of subs.data ?? []) {
        const test = testNumberFromExamId(s.exam_id);
        if (test) submissions.push({ user_id: s.user_id, test, score: s.score, max_score: s.max_score, submitted_at: s.submitted_at });
      }
      // inquiry_responses may not exist yet; counts then stay 0
      for (const t of thoughts.data ?? []) thoughtCounts[t.user_id] = (thoughtCounts[t.user_id] ?? 0) + 1;

      const withFreezes = await admin
        .from("user_gamification")
        .select("user_id, xp, streak_days, last_login_date, streak_freezes")
        .in("user_id", part);
      const gamRows = isMissingFreezeColumn(withFreezes.error)
        ? (await admin.from("user_gamification").select("user_id, xp, streak_days, last_login_date").in("user_id", part)).data
        : withFreezes.data;
      gamification.push(...((gamRows ?? []) as GamificationRow[]));
    }

    const tests = OFFICIAL_MOCK_TESTS.map((t, i) => ({
      test: i + 1,
      title: t.title.includes(":") ? t.title.split(":").slice(1).join(":").trim() : t.title,
    }));

    const report = buildClassReport({
      members: (members ?? []).map((m) => {
        const p = profiles.get(m.user_id);
        return {
          userId: m.user_id,
          username: p?.username || m.username || "Explorer",
          realName: p?.real_name || m.real_name || null,
          joinedAt: m.joined_at,
        };
      }),
      gamification,
      submissions,
      thoughtCounts,
      tests,
    });

    return { success: true, school: { code: school.code, name: school.name }, report, tests };
  } catch (err) {
    console.error("getTeacherClass failed:", err);
    return { success: false, error: "failed" };
  }
}

export type AddSchoolResult =
  | { success: true; code: string; studentsAlreadyJoined: number }
  | { success: false; error: "unauthorized" | "bad_code" | "bad_name" | "bad_pin" | "setup" | "failed" };

/**
 * Agastya admin: add a school or reset its PIN. Protected by ADMIN_SECRET_KEY.
 * Students who already signed up with this code appear in the class at once.
 */
export async function addSchool(adminKey: string, schoolCode: string, schoolName: string, pin: string): Promise<AddSchoolResult> {
  if (!sameSecret((adminKey || "").trim(), process.env.ADMIN_SECRET_KEY)) return { success: false, error: "unauthorized" };
  const code = normalizeSchoolCode(schoolCode);
  const name = (schoolName || "").trim().replace(/\s+/g, " ");
  const cleanPin = (pin || "").trim();
  if (!isValidSchoolCode(code)) return { success: false, error: "bad_code" };
  if (name.length < 2 || name.length > 120) return { success: false, error: "bad_name" };
  if (!isValidPin(cleanPin)) return { success: false, error: "bad_pin" };

  const admin = createAdminClient();
  if (!admin) return { success: false, error: "setup" };

  const { error } = await admin.from("schools").upsert(
    {
      code,
      name,
      teacher_pin_hash: hashPin(cleanPin),
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "code" }
  );
  if (error) {
    console.error("addSchool failed (has teacher_portal.sql been run?)", error.message);
    return { success: false, error: "setup" };
  }
  const { count } = await admin
    .from("school_students")
    .select("user_id", { count: "exact", head: true })
    .eq("school_code", code);
  return { success: true, code, studentsAlreadyJoined: count ?? 0 };
}
