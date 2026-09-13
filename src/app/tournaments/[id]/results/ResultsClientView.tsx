"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CuriosityQuotientCard } from "@/components/CuriosityQuotientCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { RawTelemetryLog } from "@/utils/cqScoring";

export interface ExamMeta {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  module?: string;
  icon?: string;
  badge?: string;
  questionCount?: number;
  isReleased: boolean;
  resultsReleaseDate?: string | null;
}

export interface SubmissionMeta {
  score: number;
  maxScore: number;
  percentage?: number;
  telemetryBonusXP?: number;
  totalXP?: number;
  submittedAt?: string;
  telemetryData?: any;
  level?: string;
}

interface ResultsClientViewProps {
  exam: ExamMeta;
  initialSubmission: SubmissionMeta | null;
  username: string;
  userXp: number;
}

export function ResultsClientView({
  exam,
  initialSubmission,
  username,
  userXp,
}: ResultsClientViewProps) {
  const [submission, setSubmission] = useState<SubmissionMeta | null>(initialSubmission);
  const [telemetryLogs, setTelemetryLogs] = useState<RawTelemetryLog[]>([]);
  const [mounted, setMounted] = useState(false);

  // Client-side hydration: inspect localStorage for offline/client-side mock test completions
  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    try {
      // 1. If server didn't have a submission, check curiosity_mock_tests_results
      const storedResultsRaw = localStorage.getItem("curiosity_mock_tests_results");
      let localSubmission: SubmissionMeta | null = null;

      if (storedResultsRaw) {
        const storedResults = JSON.parse(storedResultsRaw);
        const matched = storedResults[exam.id] || storedResults[Number(exam.id)];
        if (matched) {
          localSubmission = {
            score: matched.score ?? 0,
            maxScore: matched.maxScore ?? (exam.questionCount || 9),
            percentage: matched.accuracy ?? Math.round(((matched.score ?? 0) / (matched.maxScore || 9)) * 100),
            telemetryBonusXP: matched.telemetryBonusXP ?? 0,
            totalXP: matched.totalXP ?? ((matched.score ?? 0) * 100 + (matched.telemetryBonusXP ?? 0)),
            submittedAt: matched.date ? new Date().toISOString() : undefined,
            level: matched.level || "level1",
          };
        }
      }

      if (!initialSubmission && localSubmission) {
        setSubmission(localSubmission);
      }

      // 2. Read telemetry history
      const historyRaw = localStorage.getItem("curiosity_telemetry_history");
      let logs: RawTelemetryLog[] = [];
      if (historyRaw) {
        const parsed = JSON.parse(historyRaw);
        if (Array.isArray(parsed)) {
          logs = parsed;
        }
      }

      if (initialSubmission?.telemetryData) {
        if (Array.isArray(initialSubmission.telemetryData)) {
          logs = [...logs, ...initialSubmission.telemetryData];
        } else if (typeof initialSubmission.telemetryData === "object") {
          logs = [...logs, initialSubmission.telemetryData];
        }
      }

      setTelemetryLogs(logs);
    } catch (e) {
      console.warn("Error reading local submission data:", e);
    }
  }, [exam.id, exam.questionCount, initialSubmission]);

  const percentage = submission
    ? submission.percentage ??
      Math.round((submission.score / (submission.maxScore || 1)) * 100)
    : 0;

  // Pedagogical distinction tier
  const distinction =
    percentage >= 85
      ? {
          title: "Mastery Distinction",
          color: "text-amber-800 bg-amber-50 border-amber-300",
          icon: "military_tech",
          desc: "Outstanding scientific hypothesis testing and precision.",
        }
      : percentage >= 60
      ? {
          title: "Solid Scientific Inquiry",
          color: "text-emerald-800 bg-emerald-50 border-emerald-300",
          icon: "verified",
          desc: "Consistent exploration and reliable variable manipulation.",
        }
      : {
          title: "Active Practice Explorer",
          color: "text-[#143867] bg-[#eef2f7] border-[#d1dbe5]",
          icon: "science",
          desc: "Good initial inquiry. Keep exploring variables to deepen intuition.",
        };

  // SVG circular score ring geometry
  const ringRadius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen w-full flex flex-col font-['Montserrat'] antialiased">
      {/* TopAppBar: Strict Design Token Responsive Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-2xs w-full">
        <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 py-2 min-h-14 max-w-7xl mx-auto w-full">
          {/* Left: Back Link with 44px touch target */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/tournaments"
              className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl text-[#143867] hover:bg-gray-100 active:scale-95 transition-transform duration-100 flex items-center gap-1.5 text-xs sm:text-sm font-bold cursor-pointer"
              aria-label="Back to Tournaments"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="hidden xs:inline">Tournaments</span>
            </Link>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0" />
              <h1 className="text-xs sm:text-sm font-black text-[#143867] tracking-tight truncate">
                Results & CQ Report
              </h1>
            </div>
          </div>

          {/* Center/Right: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-600">
            <Link href="/dashboard" className="hover:text-[#143867] transition-colors">
              Dashboard
            </Link>
            <Link href="/tournaments" className="text-[#ea580c] transition-colors">
              Tournaments
            </Link>
            <Link href="/practice" className="hover:text-[#143867] transition-colors">
              Practice Lab
            </Link>
            <Link href="/leaderboard" className="hover:text-[#143867] transition-colors">
              Leaderboard
            </Link>
            <Link href="/profile" className="hover:text-[#143867] transition-colors">
              Profile
            </Link>
          </nav>

          {/* Right: Language Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Breadcrumb & Assessment Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold flex-wrap">
            <Link href="/tournaments" className="hover:text-[#143867] transition-colors">
              Practice Tournaments
            </Link>
            <span>/</span>
            <span className="text-[#143867] font-bold truncate">{exam.title}</span>
            <span>/</span>
            <span className="text-gray-900 font-black">Results</span>
          </div>

          {/* Status Badge */}
          {exam.isReleased && submission ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Verified Assessment Report</span>
            </span>
          ) : !exam.isReleased ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
              <span className="material-symbols-outlined text-sm">lock_clock</span>
              <span>Results Locked Until Release</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-50 text-[#143867] border border-blue-200 shrink-0">
              <span className="material-symbols-outlined text-sm">pending</span>
              <span>Not Yet Attempted</span>
            </span>
          )}
        </div>

        {/* CASE 1: LOCKED / TIME-GATED VIEW */}
        {!exam.isReleased && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-[#eef2f7] text-[#143867] rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <span className="material-symbols-outlined text-4xl">lock_clock</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#143867] tracking-tight">
                Results Coming Soon
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                The evaluation data for <strong>{exam.title}</strong> is securely encrypted and will be unveiled officially on:
              </p>
            </div>

            {exam.resultsReleaseDate && (
              <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-4 inline-block max-w-sm w-full">
                <p className="text-base sm:text-lg font-black text-[#143867]">
                  {new Date(exam.resultsReleaseDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  {new Date(exam.resultsReleaseDate).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/tournaments"
                className="min-h-[44px] px-6 py-3 bg-[#143867] hover:bg-[#1e4a85] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xs active:scale-95 transition-transform duration-100 inline-flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Return to Practice Tournaments</span>
              </Link>
            </div>
          </div>
        )}

        {/* CASE 2: UNLOCKED & SUBMISSION AVAILABLE */}
        {exam.isReleased && submission && (
          <>
            {/* Score & Inquiry Distinction Hero Card */}
            <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left Column: Radial Score Ring & Distinction */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-[#f8fafc] rounded-2xl border border-gray-200 shadow-2xs text-center space-y-4">
                  {/* Circular Score Meter (SVG) */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg
                      width="140"
                      height="140"
                      viewBox="0 0 140 140"
                      className="rotate-[-90deg] overflow-visible"
                    >
                      {/* Background Track */}
                      <circle
                        cx="70"
                        cy="70"
                        r={ringRadius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth={strokeWidth}
                      />
                      {/* Progress Stroke */}
                      <circle
                        cx="70"
                        cy="70"
                        r={ringRadius}
                        fill="transparent"
                        stroke={percentage >= 60 ? "#143867" : "#ea580c"}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Centered Accuracy Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-[#143867] tracking-tight">
                        {percentage}%
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                        Accuracy
                      </span>
                    </div>
                  </div>

                  {/* Distinction Pill */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${distinction.color}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {distinction.icon}
                    </span>
                    <span>{distinction.title}</span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
                    {distinction.desc}
                  </p>
                </div>

                {/* Right Column: Score Breakdown & Curiosity Telemetry Metrics */}
                <div className="md:col-span-7 space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#143867] text-white px-2.5 py-0.5 rounded-full">
                        {exam.module || "Science"} Module
                      </span>
                      {submission.level && (
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase">
                          {submission.level === "level1" ? "Level 1: Foundation" : "Level 2: Advanced"}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#143867] tracking-tight">
                      {exam.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {submission.submittedAt
                        ? `Submitted on ${new Date(submission.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : "Practice Session Completed"}
                    </p>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Questions Correct
                      </p>
                      <p className="text-base sm:text-lg font-black text-[#143867] mt-0.5">
                        {submission.score} / {submission.maxScore}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700">
                        +{submission.score * 100} Accuracy XP
                      </span>
                    </div>

                    <div className="bg-[#f8fafc] border border-gray-200 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Telemetry Bonus
                      </p>
                      <p className="text-base sm:text-lg font-black text-[#ea580c] mt-0.5">
                        +{submission.telemetryBonusXP || 210} XP
                      </p>
                      <span className="text-[10px] font-bold text-gray-500">
                        Variable & Reversal bonus
                      </span>
                    </div>
                  </div>

                  {/* Total XP Earned Banner */}
                  <div className="bg-[#eef2f7] border border-[#d1dbe5] rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#143867] text-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">star</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Total Curiosity XP Earned
                        </p>
                        <p className="text-xs text-gray-600">
                          Applied directly to your student rank
                        </p>
                      </div>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-[#ea580c]">
                      +{submission.totalXP || (submission.score * 100 + (submission.telemetryBonusXP || 210))} XP
                    </span>
                  </div>

                  {/* Quick CTAs */}
                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    <Link
                      href={`/practice?mockTestId=${exam.id}&start=true`}
                      className="min-h-[44px] px-5 py-2.5 bg-[#143867] hover:bg-[#1e4a85] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xs active:scale-95 transition-transform duration-100 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">replay</span>
                      <span>Retake Practice Lab</span>
                    </Link>
                    <Link
                      href="/tournaments"
                      className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-gray-50 text-[#143867] border border-gray-300 text-xs sm:text-sm font-bold rounded-xl active:scale-95 transition-transform duration-100 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">list</span>
                      <span>All Tournaments</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Curiosity Profile (5-Axis CQ Radar Breakdown) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#143867] tracking-tight">
                    Scientific Curiosity Profile
                  </h3>
                  <p className="text-xs text-gray-600">
                    Calculated from your behavioral signals, hypothesis test reversals, and exploration depth.
                  </p>
                </div>
              </div>

              {/* Embedded CQ Card */}
              <CuriosityQuotientCard
                username={username}
                xp={userXp}
                telemetryLogs={telemetryLogs}
              />
            </div>

            {/* Pedagogical Takeaways & Next Steps */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c] text-xl">
                  lightbulb
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#143867]">
                  Scientific Inquiry Takeaways for {exam.title.split(":")[1] || exam.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#143867]">
                    <span className="material-symbols-outlined text-base text-[#0284c7]">
                      swap_horiz
                    </span>
                    <span>Test Boundary Reversals</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Students who reverse variable sliders to compare extremes build up to 3× stronger conceptual retention than those who test only a single state.
                  </p>
                </div>

                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#143867]">
                    <span className="material-symbols-outlined text-base text-[#16a34a]">
                      biotech
                    </span>
                    <span>Isolate Single Variables</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Always hold one variable steady while testing another. For example, hold tension steady while varying string pinch or medium thickness.
                  </p>
                </div>

                <div className="p-4 bg-[#f8fafc] rounded-2xl border border-gray-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#143867]">
                    <span className="material-symbols-outlined text-base text-[#ea580c]">
                      psychology
                    </span>
                    <span>Write Scientific Reflections</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Recording your reasoning in the &ldquo;Quick Scientist&apos;s Thought&rdquo; input boosts your Generative Inquiry score and clarifies physical laws.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* CASE 3: NO SUBMISSION FOUND YET */}
        {exam.isReleased && !submission && mounted && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm text-center max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5] rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <span className="material-symbols-outlined text-4xl">science</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#143867] text-white px-3 py-1 rounded-full">
                Practice Assessment Available
              </span>
              <h2 className="text-2xl font-black text-[#143867] tracking-tight">
                Ready to Test Your Curiosity?
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                You haven&apos;t recorded a completed attempt for <strong>{exam.title}</strong> yet. Enter the simulation lab, run hands-on experiments, and measure your Curiosity Quotient.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-4 text-xs text-gray-600 space-y-2 text-left">
              <div className="flex items-center justify-between font-bold text-[#143867]">
                <span>Simulation Experiments:</span>
                <span>3 Hands-On Labs</span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#143867]">
                <span>Inquiry Questions:</span>
                <span>{exam.questionCount || 9} Standardized Qs</span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#143867]">
                <span>Ideal Completion Time:</span>
                <span>5 to 10 Minutes</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/practice?mockTestId=${exam.id}&start=true`}
                className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-[#143867] hover:bg-[#1e4a85] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xs active:scale-95 transition-transform duration-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Start Practice Test Now</span>
              </Link>
              <Link
                href="/tournaments"
                className="min-h-[44px] w-full sm:w-auto px-5 py-3 bg-white hover:bg-gray-50 text-[#143867] border border-gray-300 font-bold text-xs sm:text-sm rounded-xl active:scale-95 transition-transform duration-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Back to Tournaments</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
