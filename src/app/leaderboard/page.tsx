"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { getLeaderboard } from "@/app/actions/profile";
import { BADGES, AVATARS, getBestBadge } from "@/utils/gamification";
import CertificateModal, { RankCertificateType } from "@/components/CertificateModal";
import { getUserAvatar, useUserAvatar } from "@/utils/userAvatar";
import { useLanguage } from "@/context/LanguageContext";

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  all_time_xp: number;
  curiosity_points: number;
  student_profiles: {
    username: string;
    real_name?: string;
  } | null;
}



export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { userId, loading: userLoading } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'friends'>('weekly');
  const [searchQuery, setSearchQuery] = useState("");
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certType, setCertType] = useState<RankCertificateType>("Weekly Rank 1");
  const [selectedCertIsCompleted, setSelectedCertIsCompleted] = useState(false);
  const [pastDailyChampionId, setPastDailyChampionId] = useState<string | null>(null);
  const [pastWeeklyChampionId, setPastWeeklyChampionId] = useState<string | null>(null);

  const myAvatar = useUserAvatar(userId);
  const [studentRealName, setStudentRealName] = useState("Student Champion");

  useEffect(() => {
    const storedRealName = localStorage.getItem("curiosity_real_name");
    if (storedRealName && storedRealName.trim()) {
      setStudentRealName(storedRealName.trim());
    }
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const result = await getLeaderboard(timeframe);
        if (result.data) {
          setLeaderboardData(result.data as unknown as LeaderboardEntry[]);
        }
        if (result.pastDailyChampionId !== undefined) {
          setPastDailyChampionId(result.pastDailyChampionId);
        }
        if (result.pastWeeklyChampionId !== undefined) {
          setPastWeeklyChampionId(result.pastWeeklyChampionId);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [timeframe]);

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3, 25);
  const filteredRemaining = remaining.filter(entry => {
    if (!searchQuery.trim()) return true;
    const name = entry.student_profiles?.username || "Explorer";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const userRankIndex = leaderboardData.findIndex(entry => entry.user_id === userId);
  const userEntry = userRankIndex !== -1 ? leaderboardData[userRankIndex] : null;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;
  const isPastChampion = timeframe === "daily"
    ? Boolean(userId && pastDailyChampionId && userId === pastDailyChampionId)
    : Boolean(userId && pastWeeklyChampionId && userId === pastWeeklyChampionId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRealName = localStorage.getItem("curiosity_real_name");
      const storedUsername = localStorage.getItem("curiosity_username");
      if (storedRealName) {
        setStudentRealName(storedRealName);
      } else if (userEntry?.student_profiles?.username) {
        setStudentRealName(userEntry.student_profiles.username);
      } else if (storedUsername) {
        setStudentRealName(storedUsername);
      }
    }
  }, [userEntry]);

  const isLoading = loading || userLoading;

  // Resolve avatar: for the current user use localStorage hook, for others use unified getUserAvatar
  const getAvatar = (entry: LeaderboardEntry) => {
    return getUserAvatar(entry.user_id, null, entry.student_profiles?.username);
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      <header className="fixed top-0 z-50 w-full bg-[#f7f9fb] h-16 flex items-center px-4 border-b border-gray-200">
        <Link 
          href="/dashboard"
          className="mr-3 text-[#143867] active:scale-95 duration-150 transition-colors hover:bg-gray-200/80 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-300 shadow-xs"
        >
          <span className="material-symbols-outlined text-sm leading-none">arrow_back</span>
          <span>{t.leaderboard.back}</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/agastya-logo.svg" alt="Agastya Logo" className="w-6 h-6 object-contain" />
          <h1 className="text-lg sm:text-xl font-bold text-[#143867]">{t.app.leaderboard}</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="fixed top-16 w-full bg-[#f7f9fb] z-40 border-b border-gray-200 px-4 py-2 flex justify-center gap-2 shadow-sm">
        {(['daily', 'weekly', 'friends'] as const).map(timeVal => (
          <button
            key={timeVal}
            onClick={() => setTimeframe(timeVal)}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-300 ${
              timeframe === timeVal 
                ? "bg-[#143867] text-white shadow-md scale-105" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
            }`}
          >
            {timeVal === "daily" ? t.leaderboard.timeframe_daily : timeVal === "weekly" ? t.leaderboard.timeframe_weekly : t.leaderboard.timeframe_friends}
          </button>
        ))}
      </div>

      <main className="flex-grow pt-32 pb-32 overflow-y-auto max-w-md mx-auto w-full hide-scrollbar">

        <section className="px-4 mb-10 pt-4 transition-all duration-700 ease-out">
          <div className="flex items-end justify-center gap-2 mb-6 min-h-[220px]">
            {isLoading ? (
              <div className="flex items-end justify-center gap-2 w-full animate-pulse">
                <div className="flex flex-col items-center flex-1 order-1">
                  <div className="w-20 h-20 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
                  <div className="w-full h-16 bg-gray-200 rounded-t-lg opacity-40"></div>
                </div>
                <div className="flex flex-col items-center flex-1 order-2 scale-110 -translate-y-4">
                  <div className="w-24 h-24 rounded-full bg-gray-300 mb-3"></div>
                  <div className="h-4 bg-gray-300 w-20 rounded mb-2"></div>
                  <div className="w-full h-24 bg-gray-300 rounded-t-lg"></div>
                </div>
                <div className="flex flex-col items-center flex-1 order-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
                  <div className="w-full h-12 bg-gray-200 rounded-t-lg opacity-20"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Rank 2 */}
                {topThree[1] && (
                  <Link href={topThree[1].user_id === userId ? "/profile" : `/profile/${topThree[1].user_id}`} className="flex flex-col items-center flex-1 order-1 hover:scale-105 transition-transform">
                    <div className="relative mb-2">
                      <div className="w-20 h-20 rounded-full border-4 border-gray-200 overflow-hidden bg-white shadow-sm">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 2"
                          src={getAvatar(topThree[1])}
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">2nd</div>
                    </div>
                    <p className="text-sm font-semibold text-[#143867] text-center truncate w-full">
                      {topThree[1].student_profiles?.username || "Explorer"}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] grayscale brightness-125">{getBestBadge(topThree[1].all_time_xp)?.icon}</span>
                      <p className="text-xs text-gray-500 font-bold">{topThree[1].xp.toLocaleString()} XP</p>
                    </div>
                    <div className="w-full h-16 bg-gray-200 rounded-t-lg mt-4 opacity-40 shadow-inner"></div>
                  </Link>
                )}

                {/* Rank 1 */}
                {topThree[0] && (
                  <Link href={topThree[0].user_id === userId ? "/profile" : `/profile/${topThree[0].user_id}`} className="flex flex-col items-center flex-1 order-2 z-10 scale-110 -translate-y-4 filter drop-shadow(0_10px_15px_rgba(20,56,103,0.1)) hover:scale-[1.15] transition-transform">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 rounded-full border-4 border-[#ffe16d] overflow-hidden bg-white shadow-[0_0_15px_rgba(255,215,0,0.25)]">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 1"
                          src={getAvatar(topThree[0])}
                        />
                      </div>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#705d00] text-4xl animate-bounce">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#ffe16d] text-[#221b00] text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-md">1st</div>
                    </div>
                    <p className="text-sm font-bold text-[#143867] text-center truncate w-full">
                      {topThree[0].student_profiles?.username || "Explorer"}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{getBestBadge(topThree[0].all_time_xp)?.icon}</span>
                      <p className="text-xs text-[#705d00] font-extrabold">{topThree[0].xp.toLocaleString()} XP</p>
                    </div>
                    <div className="w-full h-24 bg-[#ffe16d] rounded-t-lg mt-4 shadow-sm flex items-center justify-center relative overflow-hidden">
                      <span className="material-symbols-outlined text-[#221b00] opacity-20 text-4xl">
                        {timeframe === "friends" ? "emoji_events" : "school"}
                      </span>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </Link>
                )}

                {/* Rank 3 */}
                {topThree[2] && (
                  <Link href={topThree[2].user_id === userId ? "/profile" : `/profile/${topThree[2].user_id}`} className="flex flex-col items-center flex-1 order-3 hover:scale-105 transition-transform">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-300 overflow-hidden bg-white shadow-sm">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 3"
                          src={getAvatar(topThree[2])}
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">3rd</div>
                    </div>
                    <p className="text-sm font-semibold text-[#143867] text-center truncate w-full">
                      {topThree[2].student_profiles?.username || "Explorer"}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] grayscale brightness-110">{getBestBadge(topThree[2].all_time_xp)?.icon}</span>
                      <p className="text-xs text-gray-500 font-bold">{topThree[2].xp.toLocaleString()} XP</p>
                    </div>
                    <div className="w-full h-12 bg-gray-200 rounded-t-lg mt-4 opacity-20 shadow-inner"></div>
                  </Link>
                )}
              </>
            )}
          </div>
        </section>

        <section className="bg-white rounded-t-[32px] pt-8 px-4 min-h-[400px] border-t border-gray-200 transition-all duration-700 ease-out shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              {t.leaderboard.top_explorers} <span className="text-[10px] bg-[#143867] text-white px-2 py-0.5 rounded-full font-extrabold">Top 25</span>
            </h2>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {t.leaderboard.live}
            </span>
          </div>

          {/* Leaderboard Search Input */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder={t.leaderboard.search_placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#143867]/20 focus:border-[#143867] transition-all"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {!isLoading && leaderboardData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-gray-300">group_off</span>
                </div>
                <h3 className="text-lg font-bold text-[#143867]">{t.leaderboard.stage_empty}</h3>
                <p className="text-sm text-gray-500 max-w-[200px]">{t.leaderboard.stage_empty_desc}</p>
              </div>
            )}
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 rounded-xl border border-gray-100 animate-pulse">
                  <div className="w-8 h-6 bg-gray-100 rounded italic mr-3"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 mx-3"></div>
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-100 w-24 rounded mb-1"></div>
                    <div className="h-3 bg-gray-100 w-16 rounded"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-100 rounded"></div>
                </div>
              ))
            ) : (
              filteredRemaining.map((entry, index) => {
                const rank = index + 4;
                const isCurrentUser = entry.user_id === userId;
                const badge = getBestBadge(entry.all_time_xp);
                const avatarSrc = getAvatar(entry);

                if (isCurrentUser) {
                  return (
                    <div key={entry.user_id} className="flex items-center p-4 rounded-2xl bg-[#ffe16d] text-[#221b00] border border-yellow-400 shadow-[0_4px_15px_rgba(255,215,0,0.25)] relative overflow-hidden mb-4">
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]">star</span>
                      </div>
                      <span className="w-8 text-xl font-black italic">{rank}</span>
                      <div className="w-12 h-12 rounded-full border-2 border-[#221b00] overflow-hidden mx-3 ring-4 ring-white/50 shadow-md">
                        <img
                          className="w-full h-full object-cover"
                          alt="You"
                          src={avatarSrc}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-black flex items-center gap-1">
                          You
                          <span className="text-xs">{badge?.icon}</span>
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#221b00] text-[#ffe16d] font-black uppercase tracking-tighter">
                          {badge?.name || "Rising Genius"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black">{entry.xp.toLocaleString()}</p>
                        <p className="text-[10px] uppercase font-bold opacity-70">XP</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link href={`/profile/${entry.user_id}`} key={entry.user_id} className="flex items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all group cursor-pointer active:scale-[0.98] duration-75 hover:shadow-sm">
                    <span className="w-8 text-xl font-bold text-gray-300 group-hover:text-[#143867] transition-colors italic">{rank}</span>
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mx-3 border border-gray-200">
                      <img
                        className="w-full h-full object-cover"
                        alt="Explorer"
                        src={avatarSrc}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-[#143867] flex items-center gap-1">
                        {entry.student_profiles?.username || "Explorer"}
                        <span className="text-xs opacity-70 grayscale group-hover:grayscale-0 transition-all">{badge?.icon}</span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-bold uppercase tracking-tighter group-hover:bg-[#143867] group-hover:text-white transition-colors">
                        {badge?.name || "Logic Master"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#143867]">{entry.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">XP</p>
                    </div>
                  </Link>
                );
              })
            )}

            {/* In-Line "Your Rank" Card right below the Top Explorers list */}
            {!isLoading && userEntry && (
              <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">{t.leaderboard.your_live_spot}</p>
                <div className="flex items-center p-3.5 rounded-2xl bg-[#143867] text-white border-2 border-[#f37021] shadow-md relative overflow-hidden">
                  <div className="w-9 text-lg font-black text-[#ffe16d] italic shrink-0">
                    #{userRank}
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#ffe16d] overflow-hidden bg-white mx-3 shrink-0 shadow-xs">
                    <img
                      className="w-full h-full object-cover"
                      alt="You"
                      src={getAvatar(userEntry)}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-black flex items-center gap-1 text-white truncate">
                      {t.leaderboard.you} ({userEntry.student_profiles?.username || "Explorer"})
                      <span className="text-xs">{getBestBadge(userEntry.all_time_xp)?.icon}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#f37021] text-white font-extrabold uppercase tracking-tighter inline-block mt-0.5">
                      {userRank && userRank <= 25 ? (t.leaderboard.top_25_member) : `${t.leaderboard.rank} #${userRank}`}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-base font-black text-[#ffe16d]">{userEntry.xp.toLocaleString()}</p>
                    <p className="text-[9px] uppercase font-bold text-gray-300">XP</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Human-Friendly Agastya Awards & Weekly Champion Guide */}
          {!isLoading && (
            <div className="mt-8 mb-6 p-6 bg-gradient-to-br from-[#fff8f3] via-white to-[#fff8f3] rounded-3xl border-2 border-[#f37021] text-[#143867] shadow-lg relative overflow-hidden">
              <div className="absolute top-3 right-4 opacity-10 pointer-events-none">
                <img src="/agastya-logo.svg" alt="Agastya" className="w-40 h-40 object-contain" />
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-[#f37021] text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">emoji_events</span>
                    {t.leaderboard.agastya_awards}
                  </span>
                  <span className="text-xs text-[#ea580c] font-extrabold flex items-center gap-1">
                    <span>•</span>
                    <span>{t.leaderboard.agastya_motto}</span>
                  </span>
                </div>

                <h5 className="text-lg md:text-xl font-black tracking-tight text-[#143867]">
                  {userRank === 1
                    ? "🏆 " + (t.leaderboard.rank_greetings_1)
                    : userRank === 2
                    ? "🥈 " + (t.leaderboard.rank_greetings_2)
                    : userRank === 3
                    ? "🥉 " + (t.leaderboard.rank_greetings_3)
                    : userRank && userRank <= 5
                    ? "⭐ " + (t.leaderboard.rank_greetings_top5 || `You are currently #${userRank} in the Top 5!`)
                    : userRank && userRank <= 10
                    ? "🔥 " + (t.leaderboard.rank_greetings_top10 || `You are currently #${userRank} in the Top 10!`)
                    : "🚀 " + (t.leaderboard.rank_greetings_explore)}
                </h5>

                <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed max-w-xl">
                  {userRank === 1
                    ? (t.leaderboard.rank_desc_1)
                    : userRank === 2
                    ? (t.leaderboard.rank_desc_2)
                    : userRank === 3
                    ? (t.leaderboard.rank_desc_3)
                    : (t.leaderboard.rank_desc_explore)}
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  {timeframe !== "friends" && (
                    <button
                      onClick={() => {
                        setCertType(timeframe === "daily" ? "Daily Rank 1" : "Weekly Rank 1");
                        setSelectedCertIsCompleted(false);
                        setIsCertModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-[#143867] hover:bg-[#1e4a85] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm text-[#f37021]">preview</span>
                      <span>{t.leaderboard.preview} {timeframe === "daily" ? t.leaderboard.timeframe_daily : t.leaderboard.timeframe_weekly} {t.leaderboard.specimen}</span>
                    </button>
                  )}

                  <Link
                    href="/practice"
                    className="px-4 py-2.5 bg-[#f37021] hover:bg-[#d95e16] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">science</span>
                    <span>{t.leaderboard.earn_xp_practice}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
             EARNED MERIT CERTIFICATES & NOTIFICATIONS SECTION (ONLY FOR DAILY & WEEKLY)
             ========================================================= */}
          {!isLoading && timeframe !== "friends" && (
            <div className="mt-6 mb-8 p-4 sm:p-6 bg-white rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 max-w-full overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    📜
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#143867]">
                    {t.leaderboard.finalized_merit}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                  {t.leaderboard.official_issue_center}
                </span>
              </div>

              {/* Notice for Mid-Cycle Live Rank 1 Holders */}
              {userRank === 1 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 w-full">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">schedule</span>
                  <div className="space-y-1 text-xs text-amber-900 min-w-0">
                    <h5 className="font-bold text-amber-950">
                      {timeframe === "daily" ? "⏳ " + (t.leaderboard.active_daily_notice) : "⏳ " + (t.leaderboard.active_weekly_notice)}
                    </h5>
                    <p className="leading-relaxed text-[11px] sm:text-xs">
                      {timeframe === "daily" ? (
                        <>{t.leaderboard.daily_cycle_progress}</>
                      ) : (
                        <>{t.leaderboard.weekly_cycle_progress}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Ready to Download Notification Card for Completed Past Cycles */}
              {isPastChampion && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-xs">
                      {timeframe === "daily" ? (t.leaderboard.completed_daily_cycles) : (t.leaderboard.completed_weekly_cycles)}
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      {timeframe === "daily" ? (t.leaderboard.past_daily_records) : (t.leaderboard.past_weekly_records)}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                      {timeframe === "daily" ? (t.leaderboard.daily_cert_center) : (t.leaderboard.weekly_cert_center)}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed mt-1">
                      {timeframe === "daily"
                        ? (t.leaderboard.daily_cert_center_desc)
                        : (t.leaderboard.weekly_cert_center_desc)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const targetCert = timeframe === "daily" ? "Daily Rank 1" : "Weekly Rank 1";
                      setCertType(targetCert);
                      setSelectedCertIsCompleted(true); // Unlock finalized certificate for download!
                      setIsCertModalOpen(true);
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-1"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    <span>{t.leaderboard.claim_certificate} 📜</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        studentRealName={userEntry?.student_profiles?.real_name || studentRealName || userEntry?.student_profiles?.username || "Student Explorer"}
        achievementType={certType}
        awardDate="July 2026"
        isEligible={isPastChampion || userRank === 1 || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'cert')}
        userRank={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'cert' ? 1 : userRank}
        isCompletedCycle={typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'cert' ? true : (selectedCertIsCompleted && isPastChampion)}
      />



      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/dashboard">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">home</span>
          </div>
        </Link>
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/leaderboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/discover">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </div>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/profile">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/settings">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </Link>
      </nav>
      
    </div>
  );
}
