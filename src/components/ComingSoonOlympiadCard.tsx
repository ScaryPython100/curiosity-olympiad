"use client";

import React from "react";

interface ComingSoonOlympiadCardProps {
  className?: string;
}

export default function ComingSoonOlympiadCard({ className = "" }: ComingSoonOlympiadCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2340] via-[#143867] to-[#1e293b] text-white p-6 sm:p-8 shadow-md border border-[#334155]/60 select-none ${className}`}
      data-testid="coming-soon-olympiad-card"
    >
      {/* Subtle Background Pattern & Soft Glowing Orb */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Content */}
        <div className="space-y-3 max-w-2xl">
          {/* Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <span className="material-symbols-outlined text-xs">lock</span>
              <span>Coming Soon</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 text-blue-100 border border-white/10">
              Dates to be Announced
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-white/10 text-blue-100 border border-white/10">
              Grades 6–10
            </span>
          </div>

          {/* Title & Tagline */}
          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-2.5">
              <span>All-India Curiosity Olympiad 2026</span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-amber-300/90 mt-1">
              National Hands-On Science Finale &amp; Scientific Inquiry Showcase
            </p>
          </div>

          {/* Descriptive Body */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            The premier nationwide celebration of young scientific thinkers across India, inspired by Agastya&apos;s
            transformative hands-on philosophy. Students will experience advanced real-world inquiry, creative problem solving,
            and collaborative experimentation. Official schedules, guidelines, and registration details will be announced later this year.
          </p>

          {/* Transparent Educational Disclaimer */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-gray-300 leading-normal flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-amber-400 shrink-0 mt-0.5">
              info
            </span>
            <span>
              <strong>Practice Lab Notice:</strong> The Curiosity Practice Lab is an independent learning environment.
              Practice test completion and accumulated scores do not guarantee automatic entry or qualification for the national olympiad.
            </span>
          </div>
        </div>

        {/* Right Locked Interaction Widget */}
        <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs text-center space-y-3 md:min-w-[240px]">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <span className="material-symbols-outlined text-2xl">lock_clock</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white">Curiosity Grand Finale</p>
            <p className="text-[10px] text-gray-400">Something exciting to look forward to</p>
          </div>

          {/* Non-Clickable / Disabled Button */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 border border-white/15 text-gray-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
          >
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>Registration Not Yet Open</span>
          </button>
        </div>
      </div>
    </div>
  );
}
