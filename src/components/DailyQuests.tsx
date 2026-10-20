"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { getQuestsAndBadges, openQuestChest, type QuestsResult } from "@/app/actions/quests";
import { BADGE_EMOJI, CHEST_XP, type BadgeId, type QuestId } from "@/utils/questsBadges";
import { playCelebrate } from "@/utils/webAudio";

type Loaded = Extract<QuestsResult, { success: true }>;

const QUEST_EMOJI: Record<QuestId, string> = {
  finish_1: "✅",
  finish_2: "📚",
  score_7: "🎯",
  perfect: "⭐",
  explore: "🧭",
};

/** Pops a toast for each newly earned badge. */
export function useBadgeToasts() {
  const { t } = useLanguage();
  return useCallback(
    (ids: BadgeId[]) => {
      for (const id of ids) {
        toast.success(`${BADGE_EMOJI[id]} ${t.badges.new_badge}`, {
          description: t.badges[id as keyof typeof t.badges],
          duration: 4000,
        });
      }
    },
    [t]
  );
}

/**
 * Duolingo-style daily quests: 3 small goals (checked on the server) and a
 * chest that gives CHEST_XP once all three are done. New quests at IST midnight.
 */
export function DailyQuests({ onXpGained }: { onXpGained?: (xp: number) => void }) {
  const { t } = useLanguage();
  const showBadges = useBadgeToasts();
  const [data, setData] = useState<Loaded | null>(null);
  const [opening, setOpening] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  const load = useCallback(async () => {
    const res = await getQuestsAndBadges().catch(() => null);
    if (res?.success) {
      setData(res);
      if (res.newBadges.length) showBadges(res.newBadges);
    }
  }, [showBadges]);

  useEffect(() => {
    // Fetching today's quests from the server
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (!data) return null;
  const hours = Math.floor(data.resetsInMinutes / 60);
  const minutes = data.resetsInMinutes % 60;

  const open = async () => {
    setOpening(true);
    const res = await openQuestChest().catch(() => null);
    setOpening(false);
    if (res?.success) {
      playCelebrate();
      setJustOpened(true);
      onXpGained?.(res.xpAwarded);
      if (res.newBadges.length) showBadges(res.newBadges);
    }
    load();
  };

  return (
    <section aria-labelledby="quests-title" className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 id="quests-title" className="text-base font-black text-[#143867]">
          🎯 {t.quests.title}
        </h3>
        <span className="text-[11px] font-bold text-gray-500">
          {t.quests.resets.replace("{h}", String(hours)).replace("{m}", String(minutes))}
        </span>
      </div>

      <ul className="space-y-2.5">
        {data.quests.map((q) => (
          <li key={q.id} className="flex items-center gap-3">
            <span
              className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                q.done ? "bg-green-100" : "bg-gray-100"
              }`}
              aria-hidden
            >
              {q.done ? "✔️" : QUEST_EMOJI[q.id]}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-tight ${q.done ? "text-green-800" : "text-[#143867]"}`}>
                {t.quests[q.id]}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden" aria-hidden>
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${q.done ? "bg-[#22c55e]" : "bg-amber-400"}`}
                    style={{ width: `${(q.progress / q.target) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-black text-gray-500 w-9 text-right">
                  {q.progress}/{q.target}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* The chest */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        {!data.ready ? (
          <p className="text-xs text-gray-500">{t.quests.setup}</p>
        ) : data.chest === "opened" ? (
          <p className={`text-sm font-black text-green-700 flex items-center gap-2 ${justOpened ? "celebration-pop" : ""}`}>
            <span className="text-2xl" aria-hidden>
              🎉
            </span>
            {justOpened && <span className="text-[#ea580c]">{t.quests.reward.replace("{xp}", String(CHEST_XP))}</span>}
            <span>{t.quests.chest_done}</span>
          </p>
        ) : data.chest === "ready" ? (
          <button
            type="button"
            onClick={open}
            disabled={opening}
            className="w-full min-h-[52px] rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black flex items-center justify-center gap-2 shadow-[0_5px_0_0_#b45309] active:translate-y-1 active:shadow-none transition-all disabled:opacity-70"
          >
            <span className={`text-2xl ${opening ? "" : "chest-wiggle"}`} aria-hidden>
              🎁
            </span>
            {opening ? t.quests.opening : `${t.quests.chest_ready} ${t.quests.open}`}
          </button>
        ) : (
          <p className="text-xs font-bold text-gray-500 flex items-center gap-2">
            <span className="text-2xl grayscale opacity-60" aria-hidden>
              🎁
            </span>
            {t.quests.chest_locked}
          </p>
        )}
      </div>
    </section>
  );
}
