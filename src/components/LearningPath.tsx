"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { KuppuAvatar } from "@/components/KuppuGuide";
import { nextTestId, pathCurve, pathOffset, starsFor } from "@/utils/learningPath";

export interface PathTest {
  id: number;
  title: string;
  description: string;
  icon: string;
  idealMinutes: number;
  questionCount: number;
}

export interface PathResult {
  completed?: boolean;
  score: number;
  total: number;
}

// Path geometry in SVG units; the drawing scales to the column width.
const WIDTH = 360;
const STEP = 150;
const TOP = 84;
const NODE = 68;

function Stars({ count, size = "text-sm" }: { count: number; size?: string }) {
  return (
    <span className={`${size} leading-none tracking-tight`} aria-hidden>
      {"★".repeat(count)}
      <span className="opacity-25">{"★".repeat(3 - count)}</span>
    </span>
  );
}

/**
 * Duolingo-style winding path over the 13 tests. Every test stays open (no
 * locking); the next unfinished one is highlighted and Kuppu points at it.
 * Tapping a bubble opens a small card with the details and a Start button.
 */
export function LearningPath({
  tests,
  results,
  onStart,
}: {
  tests: PathTest[];
  results: Record<number, PathResult | undefined>;
  onStart: (testId: number) => void;
}) {
  const { t } = useLanguage();
  const [openId, setOpenId] = useState<number | null>(null);
  const currentId = nextTestId(
    tests.map((x) => x.id),
    results
  );
  const doneCount = tests.filter((x) => results[x.id]?.completed).length;

  const points = tests.map((_, i) => ({ x: WIDTH / 2 + pathOffset(i), y: TOP + i * STEP }));
  const trophy = { x: WIDTH / 2, y: TOP + tests.length * STEP };
  const height = trophy.y + 80;
  const doneUpTo = currentId === null ? tests.length : tests.findIndex((x) => x.id === currentId);
  const doneCurve = pathCurve(points.slice(0, Math.max(1, doneUpTo + (currentId === null ? 0 : 1))));

  // Bring the next test into view once saved progress has loaded (only once,
  // so it never jumps while the student is scrolling).
  const currentRef = useRef<HTMLButtonElement>(null);
  const scrolledOnce = useRef(false);
  useEffect(() => {
    if (scrolledOnce.current || doneCount === 0 || currentId === null) return;
    scrolledOnce.current = true;
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [doneCount, currentId]);

  const open = tests.find((x) => x.id === openId) ?? null;
  const openResult = open ? results[open.id] : undefined;

  return (
    <section aria-labelledby="path-title" className="space-y-4">
      {/* Progress header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <h3 id="path-title" className="text-lg font-black text-[#143867]">
            {t.path.title}
          </h3>
          <span className="text-xs font-black text-[#ea580c] bg-[#fff7ed] border border-[#fed7aa] rounded-full px-3 py-1 whitespace-nowrap">
            {t.path.progress.replace("{done}", String(doneCount)).replace("{total}", String(tests.length))}
          </span>
        </div>
        <div className="mt-3 h-3 rounded-full bg-gray-100 overflow-hidden" aria-hidden>
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] transition-[width] duration-700"
            style={{ width: `${(doneCount / Math.max(1, tests.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* The path */}
      <div className="relative w-full max-w-[360px] mx-auto" style={{ height }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          aria-hidden
        >
          <path d={pathCurve([...points, trophy])} fill="none" stroke="#dbe3ee" strokeWidth="14" strokeLinecap="round" />
          <path d={pathCurve([...points, trophy])} fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" />
          {doneUpTo > 0 && (
            <path d={doneCurve} fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
          )}
        </svg>

        {tests.map((test, i) => {
          const p = points[i];
          const result = results[test.id];
          const done = Boolean(result?.completed);
          const isCurrent = test.id === currentId;
          const stars = done && result ? starsFor(result.score, result.total) : 0;
          const shortTitle = test.title.includes(":") ? test.title.split(":").slice(1).join(":").trim() : test.title;
          // Kuppu sits on the side of the bubble that faces the middle, where there is room.
          const kuppuOnLeft = pathOffset(i) > 0;
          return (
            <div
              key={test.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${(p.x / WIDTH) * 100}%`, top: p.y - NODE / 2, transform: "translateX(-50%)" }}
            >
              {isCurrent && (
                <>
                  <span
                    className="path-tip absolute bottom-full mb-1.5 bg-[#143867] text-white text-[11px] leading-4 font-black rounded-lg px-2.5 py-1 whitespace-nowrap shadow-md pointer-events-none"
                    aria-hidden
                  >
                    {t.kuppu.start_here}
                  </span>
                  <span
                    className={`absolute top-3 ${kuppuOnLeft ? "right-full mr-1.5" : "left-full ml-1.5"} kuppu-hop pointer-events-none`}
                    aria-hidden
                  >
                    <KuppuAvatar size={40} />
                  </span>
                </>
              )}

              <button
                ref={isCurrent ? currentRef : undefined}
                type="button"
                onClick={() => setOpenId(test.id)}
                aria-label={`${shortTitle}${done ? ` — ${result?.score}/${result?.total}` : ""}`}
                className={`path-node relative rounded-full flex items-center justify-center transition-transform active:translate-y-1 cursor-pointer ${
                  done
                    ? stars === 3
                      ? "bg-amber-400 text-amber-950 path-node-gold"
                      : "bg-[#22c55e] text-white path-node-green"
                    : isCurrent
                      ? "bg-[#ea580c] text-white path-node-orange"
                      : "bg-white text-[#143867] border-2 border-[#dbe3ee] path-node-plain"
                }`}
                style={{ width: NODE, height: NODE }}
              >
                {isCurrent && <span className="path-pulse absolute inset-0 rounded-full" aria-hidden />}
                <span className="material-symbols-outlined text-[30px]" aria-hidden>
                  {done && stars === 3 ? "workspace_premium" : test.icon}
                </span>
              </button>

              <div className="mt-1.5 flex flex-col items-center w-[132px] text-center">
                {done && <Stars count={stars} size="text-[13px] text-amber-500" />}
                <span className="text-[11px] font-black text-[#143867] leading-tight mt-0.5">{shortTitle}</span>
              </div>
            </div>
          );
        })}

        {/* Finish line */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: "50%", top: trophy.y - 30, transform: "translateX(-50%)" }}
        >
          <div
            className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-3xl ${
              currentId === null ? "bg-amber-400 path-node-gold kuppu-hop" : "bg-gray-100 border-2 border-[#dbe3ee] grayscale opacity-70"
            }`}
            aria-hidden
          >
            🏆
          </div>
          {currentId === null && (
            <span className="mt-2 text-sm font-black text-[#143867] whitespace-nowrap">{t.path.all_done}</span>
          )}
        </div>
      </div>

      {/* Test card */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setOpenId(null)}
          onKeyDown={(e) => e.key === "Escape" && setOpenId(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="path-sheet-title"
            onClick={(e) => e.stopPropagation()}
            className="sheet-up w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" aria-hidden />
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#143867] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl" aria-hidden>
                  {open.icon}
                </span>
              </div>
              <div className="min-w-0">
                <h4 id="path-sheet-title" className="text-lg font-black text-[#143867] leading-tight">
                  {open.title}
                </h4>
                {openResult?.completed && (
                  <p className="text-xs font-bold text-gray-600 mt-1 flex items-center gap-1.5">
                    <Stars count={starsFor(openResult.score, openResult.total)} size="text-sm text-amber-500" />
                    {t.path.last_score
                      .replace("{score}", String(openResult.score))
                      .replace("{total}", String(openResult.total))}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{open.description}</p>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[#143867]">
              <span className="bg-[#eef2f7] rounded-full px-3 py-1">
                ❓ {t.path.questions.replace("{count}", String(open.questionCount))}
              </span>
              <span className="bg-[#eef2f7] rounded-full px-3 py-1">
                ⏱️ {t.path.minutes.replace("{mins}", String(open.idealMinutes))}
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setOpenId(null);
                  onStart(open.id);
                }}
                className="w-full min-h-[52px] rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-base shadow-[0_5px_0_0_#9a3412] active:translate-y-1 active:shadow-none transition-all"
              >
                {openResult?.completed ? t.path.play_again : t.path.start}
              </button>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="w-full min-h-[44px] rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm"
              >
                {t.path.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
