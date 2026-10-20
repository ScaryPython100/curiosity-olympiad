"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { KuppuAvatar } from "@/components/KuppuGuide";
import type { TeacherClassResult } from "@/app/actions/teacher";
import { classReportCsv, type HelpReason, type StudentReport } from "@/utils/classReport";

export type ClassData = Extract<TeacherClassResult, { success: true }>;
type SortKey = "name" | "help" | "score" | "active";

const fill = (s: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((out, [k, v]) => out.replace(`{${k}}`, String(v)), s);

/** Green / amber / red for a percent, so the teacher can scan quickly. */
function scoreTone(p: number | null) {
  if (p === null) return "bg-gray-100 text-gray-500";
  if (p >= 75) return "bg-green-100 text-green-800";
  if (p >= 50) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-800";
}

/** The signed-in teacher's class: numbers, who needs help, test by test, and every student. */
export function ClassView({ data }: { data: ClassData }) {
  const { t } = useLanguage();
  const tt = t.teacher;
  const { report, school, tests } = data;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("help");
  const [copied, setCopied] = useState(false);
  const [openStudent, setOpenStudent] = useState<StudentReport | null>(null);

  const helpLabel: Record<HelpReason, string> = {
    low_scores: tt.help_low,
    inactive: tt.help_inactive,
    not_started: tt.help_not_started,
  };
  const lastActive = (s: StudentReport) =>
    s.daysSinceActive === null
      ? tt.not_started
      : s.daysSinceActive === 0
        ? tt.today
        : s.daysSinceActive === 1
          ? tt.yesterday
          : fill(tt.days_ago, { n: s.daysSinceActive });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = report.students.filter(
      (s) => !q || s.username.toLowerCase().includes(q) || (s.realName ?? "").toLowerCase().includes(q)
    );
    const by: Record<SortKey, (a: StudentReport, b: StudentReport) => number> = {
      name: (a, b) => a.username.localeCompare(b.username),
      help: (a, b) => b.help.length - a.help.length || a.username.localeCompare(b.username),
      score: (a, b) => (b.averagePercent ?? -1) - (a.averagePercent ?? -1),
      active: (a, b) => (a.daysSinceActive ?? 9999) - (b.daysSinceActive ?? 9999),
    };
    return [...list].sort(by[sort]);
  }, [report.students, query, sort]);

  const downloadCsv = () => {
    const csv = classReportCsv(report, tests.map((x) => x.test));
    // BOM so Excel opens Indian-language names correctly
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${school.code}-class-report.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tiles = [
    { label: tt.students, value: report.totals.students, icon: "👩‍🎓" },
    { label: tt.active_today, value: report.totals.activeToday, icon: "🔥" },
    { label: tt.active_week, value: report.totals.activeThisWeek, icon: "📅" },
    { label: tt.tests_finished, value: report.totals.testsFinished, icon: "✅" },
    { label: tt.average, value: report.totals.averagePercent === null ? "–" : `${report.totals.averagePercent}%`, icon: "🎯" },
    { label: tt.thoughts, value: report.totals.thoughts, icon: "💡" },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* School + join code */}
      <section className="bg-gradient-to-r from-[#143867] to-[#285e9e] text-white rounded-3xl p-5 sm:p-6 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-black leading-tight">{school.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-blue-100">{tt.join_code}:</span>
          <span className="font-mono font-black text-lg bg-white/15 rounded-lg px-3 py-1 tracking-wider">{school.code}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(school.code).catch(() => {});
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
            className="min-h-[36px] px-3 rounded-lg bg-white text-[#143867] text-xs font-black"
          >
            {copied ? tt.copied : tt.copy}
          </button>
        </div>
      </section>

      {/* Numbers */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs">
            <div className="text-xl" aria-hidden>
              {tile.icon}
            </div>
            <div className="text-2xl font-black text-[#143867] mt-1">{tile.value}</div>
            <div className="text-[11px] font-bold text-gray-500 leading-tight">{tile.label}</div>
          </div>
        ))}
      </section>

      {report.totals.students === 0 ? (
        <section className="bg-white rounded-3xl border border-gray-200 p-6 text-center space-y-2">
          <div className="flex justify-center">
            <KuppuAvatar size={64} mood="think" />
          </div>
          <h2 className="text-lg font-black text-[#143867]">{tt.empty_title}</h2>
          <p className="text-sm text-gray-600">{fill(tt.empty_body, { code: school.code })}</p>
        </section>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Needs help */}
            <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
              <h2 className="text-base font-black text-[#143867] mb-3">
                🙋 {tt.needs_help} ({report.needsHelp.length})
              </h2>
              {report.needsHelp.length === 0 ? (
                <p className="text-sm font-bold text-green-700">{tt.all_good}</p>
              ) : (
                <ul className="space-y-2">
                  {report.needsHelp.slice(0, 8).map((s) => (
                    <li key={s.userId}>
                      <button
                        type="button"
                        onClick={() => setOpenStudent(s)}
                        className="w-full text-left rounded-xl border border-gray-200 hover:border-gray-300 px-3 py-2.5 flex flex-wrap items-center gap-2"
                      >
                        <span className="font-black text-sm text-[#143867] mr-auto">{s.realName || s.username}</span>
                        {s.help.map((h) => (
                          <span key={h} className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-amber-100 text-amber-900">
                            {helpLabel[h]}
                          </span>
                        ))}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Test by test */}
            <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
              <h2 className="text-base font-black text-[#143867] mb-3">📊 {tt.tests_title}</h2>
              <ul className="space-y-2.5">
                {report.tests.map((test) => (
                  <li key={test.test} className="text-xs">
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span className="text-[#143867] truncate">
                        {test.test}. {test.title}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 ${scoreTone(test.averagePercent)}`}>
                        {test.averagePercent === null ? "–" : `${test.averagePercent}%`}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden" aria-hidden>
                      <div
                        className="h-full bg-[#22c55e] rounded-full"
                        style={{ width: `${(test.finished / Math.max(1, report.totals.students)) * 100}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {fill(tt.finished_of, { done: test.finished, total: report.totals.students })}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Students */}
          <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black text-[#143867] mr-auto">
                {tt.students_title} ({report.totals.students})
              </h2>
              <button
                type="button"
                onClick={downloadCsv}
                className="min-h-[40px] px-3 rounded-xl bg-[#eef2f7] hover:bg-[#dde6f1] text-[#143867] text-xs font-black"
              >
                ⬇️ {tt.download}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tt.search}
                aria-label={tt.search}
                className="flex-1 min-h-[44px] px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#143867]"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label={tt.sort}
                className="min-h-[44px] px-3 rounded-xl border border-gray-300 text-sm font-bold bg-white text-[#143867]"
              >
                <option value="help">{tt.sort_help}</option>
                <option value="name">{tt.sort_name}</option>
                <option value="score">{tt.sort_score}</option>
                <option value="active">{tt.sort_active}</option>
              </select>
            </div>

            <ul className="divide-y divide-gray-100">
              {shown.map((s) => (
                <li key={s.userId}>
                  <button
                    type="button"
                    onClick={() => setOpenStudent(s)}
                    className="w-full text-left py-3 grid grid-cols-[1fr_auto] sm:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] gap-x-3 gap-y-1 items-center hover:bg-gray-50 rounded-lg px-1"
                  >
                    <span className="min-w-0">
                      <span className="block font-black text-sm text-[#143867] truncate">
                        {s.realName || s.username}
                        {s.help.length > 0 && <span className="ml-1.5" aria-label={tt.needs_help}>🙋</span>}
                      </span>
                      <span className="block text-[11px] text-gray-500 truncate">@{s.username}</span>
                    </span>
                    <span className={`justify-self-end sm:justify-self-start text-xs font-black rounded-full px-2 py-0.5 ${scoreTone(s.averagePercent)}`}>
                      {s.averagePercent === null ? "–" : `${s.averagePercent}%`}
                    </span>
                    <span className="text-xs text-gray-600 font-bold">
                      {tt.col_tests}: {s.testsDone}/{tests.length}
                    </span>
                    <span className="text-xs text-gray-600 font-bold justify-self-end sm:justify-self-start">🔥 {s.streak}</span>
                    <span className="text-xs text-gray-500 col-span-2 sm:col-span-1">{lastActive(s)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="text-xs text-gray-500 text-center">🔒 {tt.private_note}</p>

      {/* One student's tests */}
      {openStudent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setOpenStudent(null)}
          onKeyDown={(e) => e.key === "Escape" && setOpenStudent(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-title"
            onClick={(e) => e.stopPropagation()}
            className="sheet-up w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div>
              <h3 id="student-title" className="text-lg font-black text-[#143867]">
                {openStudent.realName || openStudent.username}
              </h3>
              <p className="text-xs text-gray-500">
                @{openStudent.username} · {lastActive(openStudent)} · 🔥 {openStudent.streak} · {openStudent.xp} XP · 💡{" "}
                {openStudent.thoughts}
              </p>
              {openStudent.help.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {openStudent.help.map((h) => (
                    <span key={h} className="text-[11px] font-bold rounded-full px-2 py-0.5 bg-amber-100 text-amber-900">
                      {helpLabel[h]}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {tests.map((test) => {
                const p = test.test in openStudent.perTest ? openStudent.perTest[test.test] : null;
                return (
                  <li key={test.test} className={`rounded-xl px-3 py-2 text-xs font-bold ${scoreTone(p)}`}>
                    <span className="block truncate">
                      {test.test}. {test.title}
                    </span>
                    <span className="text-sm font-black">{p === null ? tt.not_started : `${p}%`}</span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              autoFocus
              onClick={() => setOpenStudent(null)}
              className="w-full min-h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-sm text-gray-700"
            >
              {tt.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
