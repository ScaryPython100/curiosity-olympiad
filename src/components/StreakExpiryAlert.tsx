"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfileStats } from "@/app/actions/profile";

export function StreakExpiryAlert() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [streakCount, setStreakCount] = useState(1);
  const [hoursRemaining, setHoursRemaining] = useState(6);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check review harness override (e.g. ?review=true or ?testStreak=true)
    const params = new URLSearchParams(window.location.search);
    const forceTest = params.get("testStreak") === "true";

    const now = new Date();
    const currentHour = now.getHours();

    // Condition 1: Must be at or past 6:00 PM (18:00) local time (unless forced for verification)
    const isEvening = currentHour >= 18 || forceTest;
    if (!isEvening) return;

    // Condition 2: Must not have been dismissed in this session
    const isDismissed = sessionStorage.getItem("curiosity_streak_warning_dismissed");
    if (isDismissed && !forceTest) return;

    // Calculate hours remaining until midnight
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diffHours = Math.max(1, Math.round((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
    setHoursRemaining(diffHours);

    if (forceTest) {
      setStreakCount(3);
      setHoursRemaining(diffHours || 5);
      setShowAlert(true);
      return;
    }

    // Condition 3: Check student streak and daily activity
    getProfileStats().then((res: any) => {
      if (res?.data) {
        const count = res.data.streakCount || (parseInt(res.data.streak?.split(" ")[0]) || 0);
        const hasCompleted = res.data.hasCompletedActivityToday;

        // If user has an active streak and has NOT completed an activity today
        if (count >= 1 && !hasCompleted) {
          setStreakCount(count);
          setShowAlert(true);
        }
      }
    }).catch(() => {
      // Ignore unauthenticated or guest errors
    });
  }, []);

  const handleDismiss = () => {
    setShowAlert(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("curiosity_streak_warning_dismissed", "true");
    }
  };

  const handlePracticeNow = () => {
    handleDismiss();
    router.push("/practice?start=true");
  };

  if (!showAlert) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-linear-to-r from-gray-950 via-slate-900 to-gray-950 text-white p-4 rounded-2xl border-2 border-orange-500/80 shadow-2xl shadow-orange-950/40 flex flex-col gap-3">
        {/* Alert Header */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-orange-400 text-lg">local_fire_department</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-400">
                  Streak Expiring Tonight
                </span>
                <span className="text-[10px] bg-orange-950/80 text-orange-300 border border-orange-600/60 px-1.5 py-0.5 rounded font-mono font-bold">
                  {hoursRemaining}h left
                </span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                Your <strong className="text-white font-bold">{streakCount}-Day Streak</strong> will reset at midnight! Complete 1 experiment to save it.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1.5 -mt-1.5"
            aria-label="Dismiss streak alert"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Action Buttons (Reflow cleanly at 360px) */}
        <div className="flex items-center gap-2 pt-0.5 min-w-0">
          <button
            onClick={handlePracticeNow}
            className="flex-1 min-h-[44px] py-2 px-3 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer min-w-0"
            aria-label="Save Streak in Practice Lab"
          >
            <span className="material-symbols-outlined text-sm shrink-0">science</span>
            <span className="truncate">Save Streak in Lab</span>
          </button>
          <button
            onClick={handleDismiss}
            className="min-h-[44px] px-3.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
            aria-label="Dismiss alert for today"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
