"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getQuestsAndBadges } from "@/app/actions/quests";
import { useBadgeToasts } from "@/components/DailyQuests";
import type { BadgeView } from "@/utils/questsBadges";

/** Khan-style badge shelf: earned badges in colour, the rest grey with how far along you are. */
export function BadgeShelf() {
  const { t, language } = useLanguage();
  const showBadges = useBadgeToasts();
  const [badges, setBadges] = useState<BadgeView[] | null>(null);

  useEffect(() => {
    let alive = true;
    getQuestsAndBadges()
      .then((res) => {
        if (!alive || !res.success) return;
        setBadges(res.badges);
        if (res.newBadges.length) showBadges(res.newBadges);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [showBadges]);

  if (!badges) return null;
  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const dateFmt = new Intl.DateTimeFormat(language === "en" ? "en-IN" : `${language}-IN`, { day: "numeric", month: "short" });

  return (
    <section aria-labelledby="badges-title" className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 id="badges-title" className="text-lg font-black text-[#143867]">
          🏅 {t.badges.title}
        </h3>
        <span className="text-xs font-black text-[#ea580c] bg-[#fff7ed] border border-[#fed7aa] rounded-full px-3 py-1">
          {earnedCount} / {badges.length}
        </span>
      </div>
      <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {badges.map((b) => {
          const earned = Boolean(b.earnedAt);
          const name = t.badges[b.id as keyof typeof t.badges];
          const how = t.badges[`${b.id}_how` as keyof typeof t.badges];
          return (
            <li
              key={b.id}
              className={`rounded-2xl border p-2.5 text-center flex flex-col items-center gap-1 ${
                earned ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50"
              }`}
              title={how}
            >
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  earned ? "bg-amber-400 shadow-[0_4px_0_0_#b45309]" : "bg-gray-200 grayscale opacity-60"
                }`}
                aria-hidden
              >
                {b.emoji}
              </span>
              <span className={`text-[11px] font-black leading-tight ${earned ? "text-[#143867]" : "text-gray-500"}`}>
                {name}
              </span>
              {earned ? (
                <span className="text-[10px] font-bold text-amber-800">
                  {t.badges.earned} {dateFmt.format(new Date(b.earnedAt as string))}
                </span>
              ) : (
                <>
                  <span className="text-[10px] text-gray-500 leading-tight">{how}</span>
                  <span className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden" aria-hidden>
                    <span className="block h-full bg-amber-400 rounded-full" style={{ width: `${(b.progress / b.target) * 100}%` }} />
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">
                    {t.badges.locked_progress.replace("{n}", String(b.progress)).replace("{total}", String(b.target))}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
