import test from "node:test";
import assert from "node:assert/strict";
import { verifyTeacherPin, getSchoolDashboardData, enrollStudentRoster } from "../src/app/actions/schools.ts";

test("School Admin: Teacher PIN Verification", async (t) => {
  await t.test("accepts official Agastya master PIN", async () => {
    const res = await verifyTeacherPin("AGS-KUPPAM-101", "AGASTYA2026");
    assert.strictEqual(res.success, true);
  });

  await t.test("accepts Kuppam coordinator PIN", async () => {
    const res = await verifyTeacherPin("AGS-KUPPAM-101", "KUPPAM101");
    assert.strictEqual(res.success, true);
  });

  await t.test("accepts valid custom 6+ character educator PIN", async () => {
    const res = await verifyTeacherPin("AGS-HYD-204", "TEACHER2026");
    assert.strictEqual(res.success, true);
  });

  await t.test("rejects missing or empty school code", async () => {
    const res = await verifyTeacherPin("", "AGASTYA2026");
    assert.strictEqual(res.success, false);
    assert.match(res.error, /School Code/i);
  });

  await t.test("rejects missing or short invalid PIN", async () => {
    const res = await verifyTeacherPin("AGS-KUPPAM-101", "123");
    assert.strictEqual(res.success, false);
    assert.match(res.error, /Invalid PIN/i);
  });
});

test("School Admin: Dashboard Analytics & CQ Matrix", async (t) => {
  await t.test("fetches full dashboard metrics for AGS-KUPPAM-101", async () => {
    const res = await getSchoolDashboardData("AGS-KUPPAM-101");
    assert.strictEqual(res.success, true);
    assert.ok(res.data);

    const { data } = res;
    assert.strictEqual(data.schoolCode, "AGS-KUPPAM-101");
    assert.ok(data.totalStudents >= 10, "Should have seeded or live students");
    assert.ok(data.totalExperimentsCompleted > 0, "Should have completed tests");
    assert.ok(data.averageClassXP > 0, "Average XP should be positive");
    assert.ok(data.averageCQScore >= 60 && data.averageCQScore <= 100, "CQ score in range");
    assert.ok(data.activeStreakRate >= 0 && data.activeStreakRate <= 100);

    // Verify 5 Curiosity Dimensions
    const { cqBreakdown } = data;
    assert.ok(cqBreakdown.observationalAcuity >= 50 && cqBreakdown.observationalAcuity <= 100);
    assert.ok(cqBreakdown.hypothesisFormulation >= 50 && cqBreakdown.hypothesisFormulation <= 100);
    assert.ok(cqBreakdown.variableIsolation >= 50 && cqBreakdown.variableIsolation <= 100);
    assert.ok(cqBreakdown.anomalyDetection >= 50 && cqBreakdown.anomalyDetection <= 100);
    assert.ok(cqBreakdown.scientificPersistence >= 50 && cqBreakdown.scientificPersistence <= 100);

    // Verify student records
    assert.ok(Array.isArray(data.students));
    const firstStudent = data.students[0];
    assert.ok(firstStudent.realName, "Should have realName");
    assert.ok(firstStudent.username, "Should have public username");
    assert.ok(firstStudent.accessCode, "Should have accessCode");
  });
});

test("School Admin: Bulk Student Roster Enrollment", async (t) => {
  await t.test("generates privacy-safe nicknames and access PINs", async () => {
    const testRoster = [
      { realName: "Rohan Varma", grade: "8", rollNumber: "01" },
      { realName: "Pooja Reddy", grade: "8", rollNumber: "02" },
      { realName: "Devi Prasad", grade: "9", rollNumber: "03" },
    ];

    const res = await enrollStudentRoster("AGS-KUPPAM-101", "Agastya Kuppam Lab School", testRoster);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.enrolledCount, 3);
    assert.strictEqual(res.students.length, 3);

    const s1 = res.students[0];
    assert.strictEqual(s1.realName, "Rohan Varma");
    assert.strictEqual(s1.username, "Rohan_8_01");
    assert.strictEqual(s1.accessCode, "AGS801");
    assert.strictEqual(s1.grade, "8");
    assert.strictEqual(s1.rollNumber, "01");

    const s3 = res.students[2];
    assert.strictEqual(s3.username, "Devi_9_03");
    assert.strictEqual(s3.accessCode, "AGS903");
  });

  await t.test("handles empty student list gracefully", async () => {
    const res = await enrollStudentRoster("AGS-KUPPAM-101", "Agastya Kuppam Lab School", []);
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.enrolledCount, 0);
    assert.match(res.error, /No students/i);
  });
});
