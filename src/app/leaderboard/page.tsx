"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getLeaderboard } from "@/app/actions/profile";
import { BADGES, AVATARS, getBestBadge } from "@/utils/gamification";
import CertificateModal, { RankCertificateType } from "@/components/CertificateModal";
import { getUserAvatar, useUserAvatar } from "@/utils/userAvatar";
import { LanguageSelector } from "@/components/LanguageSelector";
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
  const router = useRouter();
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
      
      {/* TopAppBar: Standardized Global Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs w-full">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 py-2 min-h-[56px] w-full max-w-7xl mx-auto gap-2">
          {/* Back button & Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            <Link 
              href="/dashboard"
              className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-xl active:scale-95 duration-100 flex items-center justify-center min-w-[44px] min-h-[44px] border border-gray-200"
              aria-label={t.leaderboard.back}
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-[#143867] text-amber-300 hidden min-[380px]:flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-[#143867] tracking-tight whitespace-nowrap">
                {t.app.leaderboard}
              </h1>
              <p className="text-[10px] text-gray-500 font-bold hidden sm:block">
                Agastya Curiosity Practice Lab
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Home
            </Link>
            <Link href="/tournaments" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Tournaments
            </Link>
            <Link href="/practice" className="text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors pb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">science</span>
              Practice Lab
            </Link>
            <Link href="/leaderboard" className="text-xs font-black text-[#143867] border-b-2 border-[#143867] pb-1">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Profile
            </Link>
          </nav>

          {/* Actions: Language & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
            <button 
              type="button"
              onClick={() => {
                import("@/utils/supabase/client").then(m => {
                  m.createClient().auth.signOut().then(() => router.push("/login"));
                });
              }}
              className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-xl active:scale-95 duration-100 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer" 
              title={t.app.logout}
              aria-label={t.app.logout}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-32 max-w-4xl mx-auto w-full px-3 sm:px-6 pt-6">

        {/* Timeframe Filter Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex gap-1.5 sm:gap-2 mb-8 max-w-md mx-auto">
          {(['daily', 'weekly', 'friends'] as const).map(timeVal => (
            <button
              key={timeVal}
              onClick={() => setTimeframe(timeVal)}
              className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-extrabold capitalize transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer ${
                timeframe === timeVal 
                  ? "bg-[#143867] text-white shadow-xs" 
                  : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {timeVal === "daily" ? "today" : timeVal === "weekly" ? "date_range" : "group"}
              </span>
              <span>
                {timeVal === "daily" ? t.leaderboard.timeframe_daily : timeVal === "weekly" ? t.leaderboard.timeframe_weekly : t.leaderboard.timeframe_friends}
              </span>
            </button>
          ))}
        </div>

        {/* Top 3 Podium Section */}
        <section className="mb-8 px-1 sm:px-2">
          <div className="flex items-end justify-center gap-2 sm:gap-4 min-h-[240px] max-w-xl mx-auto">
            {isLoading ? (
              <div className="flex items-end justify-center gap-3 w-full animate-pulse">
                {/* Skeleton Rank 2 */}
                <div className="flex flex-col items-center flex-1 order-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
                  <div className="w-full h-20 bg-gray-200 rounded-t-2xl"></div>
                </div>
                {/* Skeleton Rank 1 */}
                <div className="flex flex-col items-center flex-1 order-2 -translate-y-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-300 mb-2"></div>
                  <div className="h-4 bg-gray-300 w-20 rounded mb-2"></div>
                  <div className="w-full h-28 bg-gray-300 rounded-t-2xl"></div>
                </div>
                {/* Skeleton Rank 3 */}
                <div className="flex flex-col items-center flex-1 order-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-14 rounded mb-2"></div>
                  <div className="w-full h-14 bg-gray-200 rounded-t-2xl"></div>
                </div>
              </div>
            ) : (
              <>
                {/* Rank 2 (Silver) */}
                {topThree[1] && (
                  <Link 
                    href={topThree[1].user_id === userId ? "/profile" : `/profile/${topThree[1].user_id}`} 
                    className="flex flex-col items-center flex-1 order-1 group transition-transform duration-150 active:scale-[0.98] min-w-0"
                  >
                    <div className="relative mb-2 shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 overflow-hidden bg-white shadow-xs group-hover:border-[#143867] transition-colors">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 2"
                          src={getAvatar(topThree[1])}
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-xs">
                        2nd
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-[#143867] text-center truncate w-full px-1">
                      {topThree[1].student_profiles?.username || "Explorer"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs">{getBestBadge(topThree[1].all_time_xp)?.icon}</span>
                      <p className="text-[11px] sm:text-xs text-gray-600 font-bold">{topThree[1].xp.toLocaleString()} XP</p>
                    </div>
                    {/* Pedestal */}
                    <div className="w-full h-20 sm:h-24 bg-gradient-to-b from-slate-200 to-slate-300/80 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-slate-300 shadow-inner">
                      <span className="text-slate-400 font-black text-2xl sm:text-3xl">2</span>
                    </div>
                  </Link>
                )}

                {/* Rank 1 (Gold) */}
                {topThree[0] && (
                  <Link 
                    href={topThree[0].user_id === userId ? "/profile" : `/profile/${topThree[0].user_id}`} 
                    className="flex flex-col items-center flex-1 order-2 z-10 -translate-y-3 group transition-transform duration-150 active:scale-[0.98] min-w-0"
                  >
                    <div className="relative mb-2 shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 overflow-hidden bg-white shadow-[0_0_15px_rgba(251,191,36,0.35)] group-hover:border-amber-500 transition-colors">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 1"
                          src={getAvatar(topThree[0])}
                        />
                      </div>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 text-3xl">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-xs">
                        1st
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-[#143867] text-center truncate w-full px-1">
                      {topThree[0].student_profiles?.username || "Explorer"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs">{getBestBadge(topThree[0].all_time_xp)?.icon}</span>
                      <p className="text-[11px] sm:text-xs text-amber-700 font-black">{topThree[0].xp.toLocaleString()} XP</p>
                    </div>
                    {/* Pedestal */}
                    <div className="w-full h-28 sm:h-32 bg-gradient-to-b from-amber-200 via-amber-300/80 to-amber-300 rounded-t-2xl mt-3 flex flex-col items-center justify-center border-t-2 border-amber-400 shadow-sm relative overflow-hidden">
                      <span className="text-amber-700/60 font-black text-3xl sm:text-4xl">1</span>
                      <span className="material-symbols-outlined text-amber-800/20 text-4xl absolute -bottom-1">
                        military_tech
                      </span>
                    </div>
                  </Link>
                )}

                {/* Rank 3 (Bronze) */}
                {topThree[2] && (
                  <Link 
                    href={topThree[2].user_id === userId ? "/profile" : `/profile/${topThree[2].user_id}`} 
                    className="flex flex-col items-center flex-1 order-3 group transition-transform duration-150 active:scale-[0.98] min-w-0"
                  >
                    <div className="relative mb-2 shrink-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-orange-300 overflow-hidden bg-white shadow-xs group-hover:border-[#143867] transition-colors">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 3"
                          src={getAvatar(topThree[2])}
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-xs">
                        3rd
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-black text-[#143867] text-center truncate w-full px-1">
                      {topThree[2].student_profiles?.username || "Explorer"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs">{getBestBadge(topThree[2].all_time_xp)?.icon}</span>
                      <p className="text-[11px] sm:text-xs text-gray-600 font-bold">{topThree[2].xp.toLocaleString()} XP</p>
                    </div>
                    {/* Pedestal */}
                    <div className="w-full h-16 sm:h-20 bg-gradient-to-b from-orange-100 to-orange-200/80 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-orange-300 shadow-inner">
                      <span className="text-orange-400 font-black text-xl sm:text-2xl">3</span>
                    </div>
                  </Link>
                )}
              </>
            )}
          </div>
        </section>

        {/* Top Explorers List Card */}
        <section className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xs sm:text-sm font-black text-[#143867] uppercase tracking-wider flex items-center gap-2">
              <span>{t.leaderboard.top_explorers}</span>
              <span className="text-[10px] bg-[#143867] text-white px-2 py-0.5 rounded-md font-extrabold">Top 25</span>
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {t.leaderboard.live}
            </span>
          </div>

          {/* Search Input */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder={t.leaderboard.search_placeholder || "Search explorer by username..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 min-h-[44px] bg-[#f8fafc] border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#143867]/20 focus:border-[#143867] transition-all font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* List Items */}
          <div className="space-y-2">
            {!isLoading && leaderboardData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-3xl text-gray-400">group_off</span>
                </div>
                <h3 className="text-base font-bold text-[#143867]">{t.leaderboard.stage_empty}</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">{t.leaderboard.stage_empty_desc}</p>
              </div>
            )}

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 rounded-xl border border-gray-100 animate-pulse min-h-[56px]">
                  <div className="w-8 h-6 bg-gray-100 rounded mr-2"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 mx-2"></div>
                  <div className="flex-grow">
                    <div className="h-4 bg-gray-100 w-28 rounded mb-1"></div>
                    <div className="h-3 bg-gray-100 w-16 rounded"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-100 rounded"></div>
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
                    <div 
                      key={entry.user_id} 
                      className="flex items-center p-3.5 sm:p-4 rounded-2xl bg-amber-50 text-amber-950 border-2 border-amber-300 shadow-xs relative overflow-hidden my-2"
                    >
                      <span className="w-8 sm:w-10 text-base sm:text-lg font-black text-amber-800 italic shrink-0">
                        #{rank}
                      </span>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-500 overflow-hidden mx-2 sm:mx-3 shrink-0 shadow-xs">
                        <img
                          className="w-full h-full object-cover"
                          alt="You"
                          src={avatarSrc}
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-xs sm:text-sm font-black flex items-center gap-1.5 truncate">
                          <span>You</span>
                          <span className="text-xs">{badge?.icon}</span>
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black uppercase tracking-wider inline-block mt-0.5">
                          {badge?.name || "Rising Genius"}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm sm:text-base font-black text-amber-900">{entry.xp.toLocaleString()}</p>
                        <p className="text-[10px] uppercase font-bold text-amber-700">XP</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link 
                    href={`/profile/${entry.user_id}`} 
                    key={entry.user_id} 
                    className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group cursor-pointer active:scale-[0.99] duration-100 min-h-[52px]"
                  >
                    <span className="w-8 sm:w-10 text-sm sm:text-base font-bold text-gray-400 group-hover:text-[#143867] transition-colors italic shrink-0">
                      #{rank}
                    </span>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 overflow-hidden mx-2 sm:mx-3 border border-gray-200 shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        alt="Explorer"
                        src={avatarSrc}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#143867] flex items-center gap-1 truncate">
                        <span className="truncate">{entry.student_profiles?.username || "Explorer"}</span>
                        <span className="text-xs opacity-80 shrink-0">{badge?.icon}</span>
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-wider group-hover:bg-[#143867] group-hover:text-white transition-colors inline-block mt-0.5">
                        {badge?.name || "Logic Master"}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-black text-[#143867]">{entry.xp.toLocaleString()}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">XP</p>
                    </div>
                  </Link>
                );
              })
            )}

            {/* In-Line "Your Rank" Card */}
            {!isLoading && userEntry && (
              <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2">
                  {t.leaderboard.your_live_spot}
                </p>
                <div className="flex items-center p-3.5 sm:p-4 rounded-2xl bg-[#143867] text-white border-2 border-[#ea580c] shadow-xs relative overflow-hidden">
                  <div className="w-10 text-base sm:text-lg font-black text-amber-300 italic shrink-0">
                    #{userRank}
                  </div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-amber-300 overflow-hidden bg-white mx-2.5 shrink-0 shadow-xs">
                    <img
                      className="w-full h-full object-cover"
                      alt="You"
                      src={getAvatar(userEntry)}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs sm:text-sm font-black flex items-center gap-1 text-white truncate">
                      <span>{t.leaderboard.you} ({userEntry.student_profiles?.username || "Explorer"})</span>
                      <span className="text-xs">{getBestBadge(userEntry.all_time_xp)?.icon}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#ea580c] text-white font-extrabold uppercase tracking-wider inline-block mt-0.5">
                      {userRank && userRank <= 25 ? (t.leaderboard.top_25_member) : `${t.leaderboard.rank} #${userRank}`}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm sm:text-base font-black text-amber-300">{userEntry.xp.toLocaleString()}</p>
                    <p className="text-[9px] uppercase font-bold text-gray-300">XP</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Agastya Awards & Weekly Champion Guide */}
          {!isLoading && (
            <div className="mt-8 p-5 sm:p-6 bg-[#fff7ed] rounded-3xl border-2 border-[#ea580c] text-[#143867] shadow-xs relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-[#ea580c] text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">emoji_events</span>
                    {t.leaderboard.agastya_awards}
                  </span>
                  <span className="text-xs text-[#ea580c] font-black flex items-center gap-1">
                    <span>•</span>
                    <span>{t.leaderboard.agastya_motto}</span>
                  </span>
                </div>

                <h5 className="text-base sm:text-lg font-black tracking-tight text-[#143867]">
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

                <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                  {userRank === 1
                    ? (t.leaderboard.rank_desc_1)
                    : userRank === 2
                    ? (t.leaderboard.rank_desc_2)
                    : userRank === 3
                    ? (t.leaderboard.rank_desc_3)
                    : (t.leaderboard.rank_desc_explore)}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {timeframe !== "friends" && (
                    <button
                      onClick={() => {
                        setCertType(timeframe === "daily" ? "Daily Rank 1" : "Weekly Rank 1");
                        setSelectedCertIsCompleted(false);
                        setIsCertModalOpen(true);
                      }}
                      className="min-h-[44px] px-4 py-2.5 bg-[#143867] hover:bg-[#1e4a85] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-amber-300">preview</span>
                      <span>{t.leaderboard.preview} {timeframe === "daily" ? t.leaderboard.timeframe_daily : t.leaderboard.timeframe_weekly} {t.leaderboard.specimen}</span>
                    </button>
                  )}

                  <Link
                    href="/practice"
                    className="min-h-[44px] px-4 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">science</span>
                    <span>{t.leaderboard.earn_xp_practice}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Earned Merit Certificates Section */}
          {!isLoading && timeframe !== "friends" && (
            <div className="mt-6 p-4 sm:p-6 bg-white rounded-3xl border-2 border-emerald-500 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    📜
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-[#143867] uppercase tracking-wider">
                    {t.leaderboard.finalized_merit}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                  {t.leaderboard.official_issue_center}
                </span>
              </div>

              {/* Notice for Mid-Cycle Live Rank 1 Holders */}
              {userRank === 1 && (
                <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">schedule</span>
                  <div className="space-y-1 text-xs text-amber-950">
                    <h5 className="font-bold">
                      {timeframe === "daily" ? "⏳ " + (t.leaderboard.active_daily_notice) : "⏳ " + (t.leaderboard.active_weekly_notice)}
                    </h5>
                    <p className="leading-relaxed text-[11px] sm:text-xs text-amber-900">
                      {timeframe === "daily" ? (
                        <>{t.leaderboard.daily_cycle_progress}</>
                      ) : (
                        <>{t.leaderboard.weekly_cycle_progress}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Claim Button for Past Champions */}
              {isPastChampion && (
                <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
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
                      setSelectedCertIsCompleted(true);
                      setIsCertModalOpen(true);
                    }}
                    className="w-full min-h-[44px] py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
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

      {/* Certificate Modal */}
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

      {/* Global BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-3 bg-white border-t border-gray-200 z-50 shadow-xs">
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/dashboard"
          aria-label="Dashboard"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
        </Link>
        <Link 
          className="flex items-center justify-center bg-[#143867] text-amber-300 rounded-2xl w-11 h-11 shadow-xs active:scale-90 duration-150 transition-transform" 
          href="/leaderboard"
          aria-label="Leaderboard"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
        </Link>
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/tournaments"
          aria-label="Practice Lab"
        >
          <span className="material-symbols-outlined text-2xl">science</span>
        </Link>
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/profile"
          aria-label="Profile"
        >
          <span className="material-symbols-outlined text-2xl">person</span>
        </Link>
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/settings"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
        </Link>
      </nav>
      
    </div>
  );
}
