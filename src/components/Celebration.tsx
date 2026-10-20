"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { KuppuBubble } from "@/components/KuppuGuide";
import { starsFor } from "@/utils/learningPath";
import { BADGE_EMOJI, type BadgeId } from "@/utils/questsBadges";

// Fixed confetti pieces (no random values, so server and client render the same)
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 6) * 0.12,
  color: ["#f37021", "#143867", "#22c55e", "#facc15", "#ec4899", "#38bdf8"][i % 6],
  rotate: (i * 47) % 360,
}));

/** Counts up from 0 to `target` over about a second. */
function useCountUp(target: number | null) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === null) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

export interface CelebrationProps {
  testTitle: string;
  score: number;
  total: number;
  /** XP the server awarded; null while waiting for the server. */
  xpEarned: number | null;
  alreadyEarnedToday: boolean;
  /** The server could not save the attempt (offline or signed out). */
  saveFailed: boolean;
  breakdown: { rightAnswers: number; trying: number; onTime: number };
  /** Streak after this test; null until known. */
  streakCount: number | null;
  goalDone: boolean;
  /** This test earned a streak freeze. */
  freezeEarned?: boolean;
  /** A streak freeze covered a missed day. */
  freezeUsed?: boolean;
  /** Badges this test earned. */
  newBadges?: BadgeId[];
  onSeeAnswers: () => void;
  onAllTests: () => void;
}

/** End-of-test screen: confetti, score, XP counting up, streak and today's goal. */
export function Celebration({
  testTitle,
  score,
  total,
  xpEarned,
  alreadyEarnedToday,
  saveFailed,
  breakdown,
  streakCount,
  goalDone,
  freezeEarned = false,
  freezeUsed = false,
  newBadges = [],
  onSeeAnswers,
  onAllTests,
}: CelebrationProps) {
  const { t } = useLanguage();
  const xpShown = useCountUp(xpEarned);
  const stars = starsFor(score, total);
  const cheer = stars === 3 ? t.kuppu.cheer_3 : stars === 2 ? t.kuppu.cheer_2 : t.kuppu.cheer_1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div className="confetti-layer pointer-events-none absolute inset-0" aria-hidden>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.color, rotate: `${c.rotate}deg` }}
          />
        ))}
      </div>

      <div className="celebration-pop relative bg-white rounded-3xl max-w-sm w-full p-5 sm:p-7 space-y-4 shadow-2xl text-center max-h-[92vh] overflow-y-auto">
        <div className="text-4xl tracking-widest" aria-hidden>
          {"⭐".repeat(stars)}
          <span className="opacity-25">{"⭐".repeat(3 - stars)}</span>
        </div>
        <div>
          <h3 id="celebration-title" className="text-2xl font-black text-[#143867]">
            {t.learn.test_done}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{testTitle}</p>
        </div>

        <KuppuBubble speech={cheer} mood={stars === 1 ? "think" : "happy"} size={52} className="text-left">
          {cheer}
        </KuppuBubble>

        <p className="text-lg font-black text-[#143867]">
          {t.learn.score_line.replace("{score}", String(score)).replace("{total}", String(total))}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl py-3">
            <div className="text-2xl font-black text-[#ea580c]" aria-live="polite">
              {xpEarned === null ? "…" : saveFailed ? "–" : `+${xpShown}`}
            </div>
            <div className="text-[11px] font-bold text-[#9a3412] uppercase tracking-wide">{t.learn.xp_earned}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl py-3">
            <div className="text-2xl font-black text-amber-600">🔥 {streakCount ?? (xpEarned === null ? "…" : "–")}</div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">{t.learn.streak}</div>
          </div>
        </div>

        {freezeUsed && (
          <p className="text-sm font-black text-sky-800 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
            {t.freeze.used}
          </p>
        )}
        {freezeEarned && (
          <p className="text-sm font-black text-sky-800 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
            {t.freeze.earned}
          </p>
        )}

        {newBadges.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 space-y-1">
            <p className="text-xs font-black text-amber-800 uppercase tracking-wide">🏅 {t.badges.new_badge}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {newBadges.map((id) => (
                <span key={id} className="celebration-pop inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1 text-sm font-black text-[#143867] shadow-sm">
                  <span aria-hidden>{BADGE_EMOJI[id]}</span>
                  {t.badges[id as keyof typeof t.badges]}
                </span>
              ))}
            </div>
          </div>
        )}

        {goalDone && (
          <p className="text-sm font-black text-green-700 bg-green-50 border border-green-200 rounded-xl py-2">
            ✅ {t.learn.goal_done}
          </p>
        )}

        {saveFailed ? (
          <p className="text-xs font-bold text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            📶 {t.learn.not_saved}
          </p>
        ) : alreadyEarnedToday ? (
          <p className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            🔁 {t.learn.already_earned}
          </p>
        ) : (
          xpEarned !== null && (
            <ul className="text-xs text-gray-600 space-y-1 text-left bg-gray-50 rounded-xl px-4 py-2.5">
              <li className="flex justify-between"><span>🎯 {t.learn.xp_right_answers}</span><b>+{breakdown.rightAnswers}</b></li>
              <li className="flex justify-between"><span>🔬 {t.learn.xp_trying}</span><b>+{breakdown.trying}</b></li>
              <li className="flex justify-between"><span>⏱️ {t.learn.xp_on_time}</span><b>+{breakdown.onTime}</b></li>
            </ul>
          )
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={onSeeAnswers}
            className="w-full min-h-[48px] bg-[#143867] hover:bg-[#1e4a85] text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            {t.learn.see_answers}
          </button>
          <button
            type="button"
            onClick={onAllTests}
            className="w-full min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl active:scale-95 transition-transform"
          >
            {t.learn.all_tests}
          </button>
        </div>
      </div>
    </div>
  );
}
