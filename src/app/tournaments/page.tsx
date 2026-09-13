"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { OFFICIAL_MOCK_TESTS, MockTestItem } from "@/data/mockTestsData";
import { colors, radii, typography, touchTargets, motion } from "@/design-system/tokens";

const CATEGORIES = [
  "All Modules",
  "Physics & Optics",
  "Mechanics & Sound",
  "Chemistry & Thermal",
  "Electricity & Fluids",
  "Hypothesis Testing"
] as const;

export default function TournamentsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All Modules");

  const filteredTests = selectedCategory === "All Modules"
    ? OFFICIAL_MOCK_TESTS
    : OFFICIAL_MOCK_TESTS.filter(test => test.category === selectedCategory);

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      {/* TopAppBar: Standardized Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs w-full">
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-2.5 min-h-[56px] w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 shrink-0">
            <Link 
              href="/dashboard"
              className="text-[#143867] hover:bg-gray-100 p-2 rounded-full active:scale-95 transition-all flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#143867] text-amber-300 flex items-center justify-center shadow-xs shrink-0">
                <span className="material-symbols-outlined text-lg">emoji_events</span>
              </div>
              <h1 className="text-sm sm:text-base md:text-lg font-black text-[#143867] tracking-tight whitespace-nowrap">
                Tournaments <span className="hidden sm:inline">&amp; Mock Tests</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Home
            </Link>
            <Link href="/tournaments" className="text-xs font-black text-[#143867] border-b-2 border-[#143867] pb-1">
              Tournaments
            </Link>
            <Link href="/practice" className="text-xs font-bold text-[#ea580c] hover:text-[#ea580c]/80 transition-colors pb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">science</span>
              Practice Lab
            </Link>
            <Link href="/leaderboard" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col px-3 sm:px-6 md:px-8 pt-6 pb-24 md:pb-12 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Practice Hero Banner */}
        <section className="relative overflow-hidden bg-[#143867] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">science</span>
                Practice Tournament Series
              </span>
              <span className="bg-white/15 text-blue-100 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                8 Curriculum Modules
              </span>
              <span className="bg-white/15 text-blue-100 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                Grades 6–10
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              Curiosity Practice Tournaments
            </h2>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
              Master hands-on science concepts through interactive experimentation and hypothesis testing. Measure your scientific curiosity quotient and exploratory instincts across 8 official curriculum practice modules.
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <Link
                href="/practice?mockTestId=1&start=true"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-transform duration-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Start Practice Test</span>
              </Link>
              <Link
                href="/campus-map"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-transform duration-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">explore</span>
                <span>Explore Campus Labs</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Section Header & Filters */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="bg-[#eef2f7] text-[#143867] border border-[#d1dbe5] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Official Curriculum Tests
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[#143867] mt-2">
                Curriculum Practice Tests ({filteredTests.length})
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Choose Level 1: Foundation (Grades 6–8 • 5m • 9 Questions) or Level 2: Advanced (Grades 9–10 • 10m • 9 Questions).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 duration-100 cursor-pointer ${
                    isActive
                      ? "bg-[#143867] text-white shadow-2xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Mock Test Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#eef2f7] border border-[#d1dbe5] text-[#143867] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">{test.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-[#143867] leading-tight">
                        {test.title}
                      </h4>
                      <p className="text-xs font-bold text-[#ea580c] mt-0.5">
                        {test.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full shrink-0 border border-gray-200">
                    {test.gradeBand}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {test.description}
                </p>

                {/* Badges / Metrics Row */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs text-emerald-600">science</span>
                    {test.experimentCount} Experiments
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs text-blue-600">quiz</span>
                    {test.questionCount} Questions
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-xs text-amber-600">psychology</span>
                    Curiosity Quotient Telemetry
                  </span>
                </div>
              </div>

              {/* Level Select & Launch Controls */}
              <div className="pt-2 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>Select Challenge Level:</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/practice?mockTestId=${test.id}&level=level1&start=true`}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#143867] border border-blue-200 font-bold text-xs active:scale-95 transition-all text-center"
                  >
                    <span className="material-symbols-outlined text-sm">stairs</span>
                    <span>Level 1: Foundation ({test.idealTime.level1})</span>
                  </Link>

                  <Link
                    href={`/practice?mockTestId=${test.id}&level=level2&start=true`}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs active:scale-95 transition-all text-center"
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Level 2: Advanced ({test.idealTime.level2})</span>
                  </Link>
                </div>

                <Link
                  href={`/practice?mockTestId=${test.id}&start=true`}
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-xs active:scale-95 transition-transform duration-100 shadow-xs text-center cursor-pointer"
                >
                  <span>Launch Practice Test</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </section>

      </main>

      {/* Streamlined 5-Tab BottomNavBar Component (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-3 py-2 bg-white/95 backdrop-blur-xs border-t border-gray-200 z-50 shadow-lg">
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/dashboard"
          aria-label="Dashboard"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">home</span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Home</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/tournaments"
          aria-label="Tournaments"
        >
          <div className="w-8 h-8 rounded-full bg-[#eef2f7] flex items-center justify-center text-[#143867]">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          </div>
          <span className="text-[10px] font-bold text-[#143867] mt-0.5">Tests</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/practice"
          aria-label="Practice"
        >
          <div className="w-8 h-8 rounded-full bg-[#ea580c] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-lg">science</span>
          </div>
          <span className="text-[10px] font-bold text-[#ea580c] mt-0.5">Lab</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/leaderboard"
          aria-label="Leaderboard"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">leaderboard</span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Ranks</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/profile"
          aria-label="Profile"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>

    </div>
  );
}