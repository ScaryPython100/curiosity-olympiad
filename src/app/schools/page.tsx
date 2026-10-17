"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getSchoolDashboardData,
  enrollStudentRoster,
  verifyTeacherPin,
  SchoolAnalytics,
  SchoolStudent,
} from "@/app/actions/schools";

export default function SchoolsPortalPage() {
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"analytics" | "roster_generator">("analytics");

  // School Authentication & Profile State
  const [schoolCode, setSchoolCode] = useState("AGS-KUPPAM-101");
  const [schoolName, setSchoolName] = useState("Agastya Kuppam Campus Lab School");
  const [teacherPin, setTeacherPin] = useState("AGASTYA2026");
  const [isVerified, setIsVerified] = useState(true); // default true for demo school
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinError, setPinError] = useState("");

  // Analytics & Student Data State
  const [analytics, setAnalytics] = useState<SchoolAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState(false);

  // Bulk Generator State
  const [grade, setGrade] = useState("8");
  const [csvText, setCsvText] = useState(
    `Aarav Sharma, 8, 01\nAnanya Iyer, 8, 02\nDevi Prasad, 8, 03\nKarthik Rao, 8, 04\nMeera Nair, 8, 05\nRohan Varma, 7, 01\nPooja Reddy, 7, 02\nSiddharth Das, 9, 01\nTanvi Kulkarni, 9, 02`
  );
  const [generatedAccounts, setGeneratedAccounts] = useState<SchoolStudent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSuccess, setGenSuccess] = useState("");

  // Load School Analytics on initial mount or code change
  useEffect(() => {
    async function loadData() {
      setIsLoadingAnalytics(true);
      try {
        const res = await getSchoolDashboardData(schoolCode);
        if (res.success && res.data) {
          setAnalytics(res.data);
          setSchoolName(res.data.schoolName);
        }
      } catch (err) {
        console.error("Failed to load school data", err);
      } finally {
        setIsLoadingAnalytics(false);
      }
    }
    loadData();
  }, [schoolCode]);

  // Handle PIN verification
  const handleVerifyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");
    const res = await verifyTeacherPin(schoolCode, teacherPin);
    if (res.success) {
      setIsVerified(true);
      setIsPinModalOpen(false);
      // Reload analytics
      const dataRes = await getSchoolDashboardData(schoolCode);
      if (dataRes.success && dataRes.data) {
        setAnalytics(dataRes.data);
        setSchoolName(dataRes.data.schoolName);
      }
    } else {
      setPinError(res.error || "Invalid Educator Access PIN.");
    }
  };

  // Copy School Code
  const copySchoolCode = () => {
    navigator.clipboard.writeText(schoolCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setGenSuccess(`Loaded CSV file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Generate & Enroll Bulk Accounts
  const handleGenerateAndEnroll = async () => {
    setIsGenerating(true);
    setGenError("");
    setGenSuccess("");

    try {
      const lines = csvText.trim().split("\n");
      const studentsToEnroll: Array<{ realName: string; grade: string; rollNumber: string }> = [];

      lines.forEach((line, index) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 1 || !parts[0]) return;

        const realName = parts[0];
        const studentGrade = parts[1] || grade;
        const rollNumber = parts[2] || String(index + 1).padStart(2, "0");

        studentsToEnroll.push({
          realName,
          grade: studentGrade,
          rollNumber,
        });
      });

      if (studentsToEnroll.length === 0) {
        setGenError("No valid student rows found. Format: Real Name, Grade, Roll Number");
        return;
      }

      const res = await enrollStudentRoster(schoolCode, schoolName, studentsToEnroll);
      if (res.success && res.students) {
        setGeneratedAccounts(res.students);
        setGenSuccess(
          `Successfully generated and registered ${res.students.length} student credentials!`
        );

        // Also merge into live analytics
        if (analytics) {
          const updatedStudents = [...res.students, ...analytics.students];
          setAnalytics({
            ...analytics,
            totalStudents: updatedStudents.length,
            students: updatedStudents,
          });
        }
      } else {
        setGenError(res.error || "Failed to generate accounts.");
      }
    } catch (err: any) {
      setGenError("Error parsing roster or generating accounts.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Credential CSV
  const downloadCredentialsCsv = (accountsToExport: SchoolStudent[]) => {
    if (accountsToExport.length === 0) return;
    const headers = "Real Name,Public Nickname,Grade,Roll Number,Access PIN,School Code,Login URL\n";
    const rows = accountsToExport
      .map(
        (a) =>
          `"${a.realName}","${a.username}",${a.grade},${a.rollNumber},"${a.accessCode}","${schoolCode}","https://curiosity-olympiad.vercel.app/login"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${schoolCode}_student_credentials.csv`;
    link.click();
  };

  // Export Full Progress Report CSV
  const downloadProgressReportCsv = () => {
    if (!analytics || analytics.students.length === 0) return;
    const headers = "Roll No,Real Name,Public Nickname,Grade,Tests Completed,Total XP,CQ Score,Streak Days,Status\n";
    const rows = analytics.students
      .map(
        (s) =>
          `${s.rollNumber},"${s.realName}","${s.username}",${s.grade},${s.testsCompleted},${s.xp},${s.cqScore},${s.streakDays},"${s.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${schoolCode}_classroom_progress_report.csv`;
    link.click();
  };

  // Filter students
  const filteredStudents = (analytics?.students || []).filter((s) => {
    const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.realName.toLowerCase().includes(q) ||
      s.username.toLowerCase().includes(q) ||
      s.rollNumber.includes(q);
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat']">
      {/* Top Header */}
      <header className="w-full top-0 sticky bg-[#f7f9fb]/95 backdrop-blur-md border-b border-gray-200/90 z-40">
        <div className="flex justify-between items-center px-4 py-3 w-full max-w-7xl mx-auto">
          <Link
            href="/login"
            className="flex items-center gap-2 group min-h-[44px] px-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#dde3eb] flex items-center justify-center text-[#143867] group-hover:bg-[#ffe16d] transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#143867]">Back to Student Login</span>
          </Link>

          {/* School Badge & Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-[#143867] hover:border-[#143867] shadow-2xs transition-all min-h-[38px]"
              title="Click to switch school or verify PIN"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[140px] sm:max-w-[220px]">{schoolName}</span>
              <span className="material-symbols-outlined text-xs text-gray-400">expand_more</span>
            </button>

            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#143867] px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-base">explore</span>
              <span>Student Lab</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 px-4 pt-6 pb-24 max-w-7xl mx-auto w-full">
        {/* Institutional Hero Banner */}
        <div className="bg-gradient-to-br from-[#143867] via-[#1a447c] to-[#0f2b50] rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden border border-[#204a80]">
          <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none">
            <span className="material-symbols-outlined text-[200px]">school</span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#ffe16d] text-[#143867] font-black text-[10px] sm:text-xs uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  Agastya Educator Workspace
                </span>
                <span className="bg-white/10 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified Institution
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {analytics?.schoolName || schoolName}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                Empowering hands-on scientific curiosity across India. Monitor cohort inquiry trajectories, generate bulk student credentials, and view classroom Curiosity Quotients.
              </p>
            </div>

            {/* School Code Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 flex flex-col justify-between min-w-[200px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                Institutional School Code
              </span>
              <div className="flex items-center justify-between gap-3 mt-1.5">
                <span className="font-mono text-lg font-black text-[#ffe16d] tracking-wider">
                  {schoolCode}
                </span>
                <button
                  onClick={copySchoolCode}
                  className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg text-xs transition-colors active:scale-95 flex items-center justify-center min-w-[32px] min-h-[32px]"
                  title="Copy School Code"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedCode ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
              <span className="text-[10px] text-blue-200/80 mt-1">
                Share with students during self-signup
              </span>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 mb-8" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            className={`min-h-[44px] flex items-center gap-2 px-4 sm:px-6 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-[#143867] text-[#143867]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span>Classroom Analytics & Progress</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "roster_generator"}
            onClick={() => setActiveTab("roster_generator")}
            className={`min-h-[44px] flex items-center gap-2 px-4 sm:px-6 py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === "roster_generator"
                ? "border-[#143867] text-[#143867]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="material-symbols-outlined text-base">group_add</span>
            <span>Bulk Student Roster Generator</span>
          </button>
        </div>

        {/* TAB 1: CLASSROOM ANALYTICS & STUDENT PROGRESS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Students */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Enrolled Students
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#143867] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">groups</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#143867]">
                    {isLoadingAnalytics ? "..." : analytics?.totalStudents || 0}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {analytics?.activeStreakRate || 85}% active
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Across Grades 6–9 cohorts
                </span>
              </div>

              {/* Card 2: Experiments Completed */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Tests & Labs Run
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">science</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#143867]">
                    {isLoadingAnalytics ? "..." : analytics?.totalExperimentsCompleted || 0}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    of 11 mock tests
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Interactive physics & bio simulations
                </span>
              </div>

              {/* Card 3: Class Average XP */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Cohort Average XP
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#143867]">
                    {isLoadingAnalytics ? "..." : `${analytics?.averageClassXP.toLocaleString() || 0}`}
                  </span>
                  <span className="text-xs font-bold text-purple-600">XP</span>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Van Highway milestone: Level ~6
                </span>
              </div>

              {/* Card 4: Average Curiosity Quotient */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Class Avg. CQ
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ea580c] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#ea580c]">
                    {isLoadingAnalytics ? "..." : `${analytics?.averageCQScore || 85}`}
                  </span>
                  <span className="text-xs font-bold text-gray-400">/ 100</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  High Epistemic Inquiry Rank
                </span>
              </div>
            </div>

            {/* Middle Section: Curiosity Radar & Pedagogy Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* CQ 5-Axis Breakdown */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#143867]">
                      Curiosity Quotient (CQ) — 5 Dimensional Matrix
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Measured from telemetry variables (sliders, reversals, dwell time, anomaly triggers)
                    </p>
                  </div>
                  <span className="bg-[#143867]/10 text-[#143867] px-2.5 py-1 rounded-full text-xs font-black">
                    Agastya Pedagogy
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Axis 1 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#143867]">visibility</span>
                        <span>Observational Acuity</span>
                      </span>
                      <span className="text-[#143867] font-black">{analytics?.cqBreakdown.observationalAcuity || 88}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-[#143867] rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.cqBreakdown.observationalAcuity || 88}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Axis 2 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
                        <span>Hypothesis Formulation</span>
                      </span>
                      <span className="text-amber-700 font-black">{analytics?.cqBreakdown.hypothesisFormulation || 82}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.cqBreakdown.hypothesisFormulation || 82}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Axis 3 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-emerald-600">tune</span>
                        <span>Variable Isolation</span>
                      </span>
                      <span className="text-emerald-700 font-black">{analytics?.cqBreakdown.variableIsolation || 85}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.cqBreakdown.variableIsolation || 85}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Axis 4 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#ea580c]">warning</span>
                        <span>Anomaly Detection</span>
                      </span>
                      <span className="text-[#ea580c] font-black">{analytics?.cqBreakdown.anomalyDetection || 79}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-[#ea580c] rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.cqBreakdown.anomalyDetection || 79}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Axis 5 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-purple-600">all_inclusive</span>
                        <span>Scientific Persistence (Unprompted Trials)</span>
                      </span>
                      <span className="text-purple-700 font-black">{analytics?.cqBreakdown.scientificPersistence || 91}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${analytics?.cqBreakdown.scientificPersistence || 91}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Recent Lab Milestones & Teacher Controls */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs flex-1">
                  <h3 className="text-base font-black text-[#143867] mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">celebration</span>
                    <span>Recent Class Milestones</span>
                  </h3>
                  <div className="space-y-3">
                    {(analytics?.recentMilestones || []).map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#f7f9fb] rounded-xl border border-gray-100 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{m.title}</p>
                          <span className="text-[10px] text-gray-400">{m.time}</span>
                        </div>
                        <span className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-[#143867] border border-gray-200 shrink-0">
                          {m.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#143867]/5 border border-[#143867]/15 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-[#143867] block">Need to enroll new students?</span>
                    <span className="text-gray-500 text-[11px]">Generate login credentials via CSV in 30 seconds.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("roster_generator")}
                    className="bg-[#143867] hover:bg-[#1e4a85] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95"
                  >
                    Open Generator →
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Classroom Student Roster Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#143867]">
                      Classroom Student Roster
                    </h3>
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {filteredStudents.length} Students
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real names are visible only to verified teachers. Public leaderboards show explorer nicknames.
                  </p>
                </div>

                {/* Actions: Search & Export */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <span className="material-symbols-outlined text-gray-400 text-sm absolute left-3 top-2.5">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#f7f9fb] border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#143867] w-40 sm:w-48"
                    />
                  </div>

                  {/* Grade Filter */}
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="bg-[#f7f9fb] border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#143867]"
                  >
                    <option value="all">All Grades</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                  </select>

                  {/* Export CSV */}
                  <button
                    onClick={downloadProgressReportCsv}
                    className="min-h-[36px] bg-[#143867] hover:bg-[#1e4a85] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-extrabold uppercase text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-4">Roll #</th>
                      <th className="py-3 px-4">Real Name (Teacher View)</th>
                      <th className="py-3 px-4">Public Nickname</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-4">Tests Done</th>
                      <th className="py-3 px-4">XP & Level</th>
                      <th className="py-3 px-4">CQ Score</th>
                      <th className="py-3 px-4">Streak</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                            {s.rollNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-gray-400 text-xs" title="Protected Real Name">
                                lock
                              </span>
                              <span className="font-bold text-gray-900">{s.realName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-[#143867]/10 text-[#143867] px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                              {s.username}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-700">{s.grade}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-gray-800">
                              {s.testsCompleted}
                            </span>
                            <span className="text-gray-400 font-normal"> / 11</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#143867]">
                                {s.xp.toLocaleString()} XP
                              </span>
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                                L{s.level}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                s.cqScore >= 90
                                  ? "bg-emerald-100 text-emerald-800"
                                  : s.cqScore >= 80
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {s.cqScore} CQ
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-600">
                            {s.streakDays > 0 ? `🔥 ${s.streakDays}d` : "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {s.status === "active" ? "Active" : "Enrolled"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-400">
                          No students matched your search or filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BULK STUDENT ROSTER GENERATOR */}
        {activeTab === "roster_generator" && (
          <div>
            {/* Privacy Highlight Badge */}
            <div className="bg-gradient-to-r from-[#143867] to-[#2f4f7f] text-white rounded-2xl p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#ffe16d] text-[#143867] flex items-center justify-center shrink-0 font-bold">
                  <span className="material-symbols-outlined text-2xl">privacy_tip</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#ffe16d]">
                    Agastya Privacy Protocol: Real Name vs. Explorer Nickname
                  </h4>
                  <p className="text-xs text-blue-100 mt-0.5">
                    • <strong>Real Names</strong> are stored securely & used <em>exclusively</em> on earned Certificates (Rank 1).<br />
                    • <strong>Nicknames</strong> (e.g. <code>Aarav_8_01</code>) are displayed on the public profile & leaderboard.
                  </p>
                </div>
              </div>
              <span className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
                COPPA / GDPR Safe
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: CSV Input & Settings */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-200/80">
                  <h3 className="text-base font-bold text-[#143867] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ea580c]">tune</span>
                    <span>School & Cohort Settings</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                        School / Institution Name
                      </label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#143867]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                          School Code
                        </label>
                        <input
                          type="text"
                          value={schoolCode}
                          onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                          className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#143867]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                          Default Grade
                        </label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#143867]"
                        >
                          <option value="6">Grade 6</option>
                          <option value="7">Grade 7</option>
                          <option value="8">Grade 8</option>
                          <option value="9">Grade 9</option>
                          <option value="10">Grade 10</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-2xs border border-gray-200/80">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-[#143867] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#2f4f7f]">upload_file</span>
                      <span>Roster CSV Upload or Paste</span>
                    </h3>
                    <label className="bg-[#eef2f7] hover:bg-[#dde3eb] text-[#143867] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                      Upload .CSV
                      <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Format: <code>Student Real Name, Grade, Roll Number</code> (1 per line).
                  </p>

                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={8}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl p-3 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#143867]"
                    placeholder="e.g. Aarav Sharma, 8, 01&#10;Ananya Iyer, 8, 02"
                  />

                  <button
                    onClick={handleGenerateAndEnroll}
                    disabled={isGenerating}
                    className="mt-4 w-full min-h-[48px] bg-[#143867] text-white py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>
                      {isGenerating
                        ? "Generating & Enrolling Students..."
                        : "Generate & Enroll Student Accounts"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Panel: Generated Accounts Roster Table */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-gray-200/80 min-h-full flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="text-lg font-black text-[#143867]">
                          Generated Credential Roster
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {generatedAccounts.length > 0
                            ? `${generatedAccounts.length} students generated for ${schoolName}`
                            : "Click 'Generate & Enroll' on the left to create accounts."}
                        </p>
                      </div>

                      {generatedAccounts.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadCredentialsCsv(generatedAccounts)}
                            className="bg-[#ffe16d] text-[#705d00] font-black text-xs px-3.5 py-2 rounded-xl hover:bg-[#ffd633] transition-colors shadow-2xs flex items-center gap-1.5 active:scale-95 min-h-[36px]"
                          >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span>Download Credentials CSV</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("analytics")}
                            className="bg-[#143867] text-white font-bold text-xs px-3 py-2 rounded-xl hover:bg-[#1e4a85] transition-colors flex items-center gap-1 min-h-[36px]"
                          >
                            <span>View in Analytics →</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {genError && (
                      <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-xs font-semibold mb-4">
                        {genError}
                      </div>
                    )}

                    {genSuccess && (
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-semibold mb-4">
                        {genSuccess}
                      </div>
                    )}

                    {generatedAccounts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 text-[11px] font-extrabold uppercase text-gray-400">
                              <th className="py-2.5 px-3">Roll #</th>
                              <th className="py-2.5 px-3">Real Name (Cert Only)</th>
                              <th className="py-2.5 px-3">Public Nickname</th>
                              <th className="py-2.5 px-3">Grade</th>
                              <th className="py-2.5 px-3">Access PIN</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs">
                            {generatedAccounts.map((acc) => (
                              <tr key={acc.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-gray-500">
                                  {acc.rollNumber}
                                </td>
                                <td className="py-3 px-3 font-semibold text-gray-800">
                                  {acc.realName}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="bg-[#143867]/10 text-[#143867] px-2 py-0.5 rounded font-mono font-bold">
                                    {acc.username}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-bold">{acc.grade}</td>
                                <td className="py-3 px-3 font-mono font-bold text-[#ea580c]">
                                  {acc.accessCode}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">groups</span>
                        <p className="text-sm font-bold text-gray-600">No Roster Generated Yet</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                          Use the sample test roster on the left or upload your school's CSV file and click "Generate & Enroll Student Accounts".
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Instructions Footer */}
                  <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Agastya Roster Sync Engine v2.0</span>
                    <button
                      onClick={() => setActiveTab("analytics")}
                      className="text-[#143867] font-bold hover:underline"
                    >
                      ← Back to Analytics Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Switch School / Teacher PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200 space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#143867] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#143867]">Educator Authentication</h3>
                  <p className="text-xs text-gray-500">Access your school dashboard & roster</p>
                </div>
              </div>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleVerifyTeacher} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                  School Code
                </label>
                <input
                  type="text"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AGS-KUPPAM-101"
                  className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#143867]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                  Teacher / Coordinator Access PIN
                </label>
                <input
                  type="password"
                  value={teacherPin}
                  onChange={(e) => setTeacherPin(e.target.value)}
                  placeholder="Enter PIN (Default: AGASTYA2026)"
                  className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#143867]"
                  required
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Default demo PIN: <code>AGASTYA2026</code>
                </span>
              </div>

              {pinError && (
                <div className="bg-red-50 text-red-600 border border-red-200 p-2.5 rounded-xl text-xs font-semibold">
                  {pinError}
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] bg-[#143867] hover:bg-[#1e4a85] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                Verify & Open Dashboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
