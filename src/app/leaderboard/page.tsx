"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { getLeaderboard } from "@/app/actions/profile";
import { BADGES, AVATARS, getBestBadge } from "@/utils/gamification";
import CertificateModal, { RankCertificateType } from "@/components/CertificateModal";
import RoamingKuppuMascot from "@/components/RoamingKuppuMascot";
import { getUserAvatar, useUserAvatar } from "@/utils/userAvatar";

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  all_time_xp: number;
  curiosity_points: number;
  student_profiles: {
    username: string;
  } | null;
}



export default function LeaderboardPage() {
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
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/agastya-logo.svg" alt="Agastya Logo" className="w-6 h-6 object-contain" />
          <h1 className="text-lg sm:text-xl font-bold text-[#143867]">Global Standings</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="fixed top-16 w-full bg-[#f7f9fb] z-40 border-b border-gray-200 px-4 py-2 flex justify-center gap-2 shadow-sm">
        {(['daily', 'weekly', 'friends'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold capitalize transition-all duration-300 ${
              timeframe === t 
                ? "bg-[#143867] text-white shadow-md scale-105" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <main className="flex-grow pt-32 pb-32 overflow-y-auto max-w-md mx-auto w-full hide-scrollbar">
        {/* 🐵 NEW: Free-Floating Celebratory Kuppu Mascot */}
        <RoamingKuppuMascot initialMood="haha" userName="Champion" />

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
                      <span className="material-symbols-outlined text-[#221b00] opacity-20 text-4xl">school</span>
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
              Top Explorers <span className="text-[10px] bg-[#143867] text-white px-2 py-0.5 rounded-full font-extrabold">Top 25</span>
            </h2>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>

          {/* Leaderboard Search Input */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search explorer by nickname..."
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
                <h3 className="text-lg font-bold text-[#143867]">The stage is empty!</h3>
                <p className="text-sm text-gray-500 max-w-[200px]">Be the first explorer to claim your spot on the standings.</p>
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
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider mb-2">Your Live Standings Spot</p>
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
                      You ({userEntry.student_profiles?.username || "Explorer"})
                      <span className="text-xs">{getBestBadge(userEntry.all_time_xp)?.icon}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#f37021] text-white font-extrabold uppercase tracking-tighter inline-block mt-0.5">
                      {userRank && userRank <= 25 ? "Top 25 Member" : `Rank #${userRank}`}
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
                    Agastya Champion Awards
                  </span>
                  <span className="text-xs text-[#ea580c] font-extrabold flex items-center gap-1">
                    <span>•</span>
                    <span>Curiosity • Creativity • Confidence under Care</span>
                  </span>
                </div>

                <h5 className="text-lg md:text-xl font-black tracking-tight text-[#143867]">
                  {userRank === 1
                    ? "🏆 You are currently #1 on the Leaderboard!"
                    : userRank === 2
                    ? "🥈 You are currently #2 on the Leaderboard!"
                    : userRank === 3
                    ? "🥉 You are currently #3 on the Leaderboard!"
                    : userRank && userRank <= 5
                    ? `⭐ You are currently #${userRank} in the Top 5!`
                    : userRank && userRank <= 10
                    ? `🔥 You are currently #${userRank} in the Top 10!`
                    : userRank && userRank <= 20
                    ? `⚡ You are currently #${userRank} in the Top 20!`
                    : userRank && userRank <= 50
                    ? `🎯 You are currently #${userRank} in the Top 50!`
                    : "🚀 Every experiment and lab brings you closer to the top!"}
                </h5>

                <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed max-w-xl">
                  {userRank === 1
                    ? "🏆 Undisputed Champion! Your relentless curiosity and scientific spirit lead the entire Olympiad. Keep experimenting to protect your crown!"
                    : userRank === 2
                    ? "🥈 So close to the top! You're sitting right on the podium in 2nd place. Just one more breakthrough lab can launch you into 1st!"
                    : userRank === 3
                    ? "🥉 Outstanding Podium Performance! 3rd Place is a massive achievement. Push your limits in practice labs to climb higher!"
                    : userRank && userRank <= 5
                    ? "⭐ Elite Top 5 Contender! Your creative problem-solving is inspiring. A quick practice test could leapfrog you into the top 3!"
                    : userRank && userRank <= 10
                    ? "🔥 Official Top 10 Scholar! You are among the sharpest minds this week. Keep testing hypotheses to storm into the Top 5!"
                    : userRank && userRank <= 20
                    ? "⚡ Top 20 Trailblazer! You're rapidly climbing the ranks. Complete a few more interactive modules to break into the Top 10!"
                    : userRank && userRank <= 50
                    ? "🎯 Solid Rising Star! You're in the Top 50. Every daily lab and practice test brings you closer to the leaderboard spotlight!"
                    : "🚀 Curiosity Unleashed! Every experiment you conduct builds your confidence. Explore practice labs to claim your spot on the leaderboard!"}
                </p>



                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setCertType(timeframe === "daily" ? "Daily Rank 1" : "Weekly Rank 1");
                      setSelectedCertIsCompleted(false);
                      setIsCertModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-[#143867] hover:bg-[#1e4a85] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm text-[#f37021]">preview</span>
                    <span>Preview {timeframe === "daily" ? "Daily" : "Weekly"} Specimen</span>
                  </button>

                  <Link
                    href="/practice"
                    className="px-4 py-2.5 bg-[#f37021] hover:bg-[#d95e16] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">science</span>
                    <span>Earn XP in Practice Labs</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
             EARNED MERIT CERTIFICATES & NOTIFICATIONS SECTION
             ========================================================= */}
          {!isLoading && (
            <div className="mt-6 mb-8 p-4 sm:p-6 bg-white rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 max-w-full overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    📜
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#143867]">
                    Finalized Merit Certificates & Notifications
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Official Issue Center
                </span>
              </div>

              {/* Notice for Mid-Cycle Live Rank 1 Holders */}
              {userRank === 1 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 w-full">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">schedule</span>
                  <div className="space-y-1 text-xs text-amber-900 min-w-0">
                    <h5 className="font-bold text-amber-950">
                      {timeframe === "daily" ? "⏳ Active Daily Cycle Notice for #1 Leader" : "⏳ Active Weekly Cycle Notice for #1 Leader"}
                    </h5>
                    <p className="leading-relaxed text-[11px] sm:text-xs">
                      {timeframe === "daily" ? (
                        <>You are currently sitting at <strong>Daily Rank #1</strong>! Today's daily cycle is active until <strong>11:59 PM tonight</strong>. Please return after midnight to claim your official unblurred Daily Certificate.</>
                      ) : (
                        <>You are currently sitting at <strong>Weekly Rank #1</strong>! This week's cycle is active until <strong>Sunday at 11:59 PM</strong>. Please return after Sunday midnight to claim your official unblurred Weekly Certificate.</>
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
                      {timeframe === "daily" ? "COMPLETED DAILY CYCLES" : "COMPLETED WEEKLY CYCLES"}
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      {timeframe === "daily" ? "Past Daily Rank #1 Records" : "Past Weekly Rank #1 Records"}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                      {timeframe === "daily" ? "Official Daily Merit Certificate Center" : "Official Weekly Merit Certificate Center"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed mt-1">
                      {timeframe === "daily"
                        ? "Official finalized certificates for ending past daily cycles in 1st Place. Resets every night at 11:59 PM!"
                        : "Official finalized certificates for ending past weekly cycles in 1st Place. Resets every Sunday at 11:59 PM!"}
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
                    <span>Claim & Download {timeframe === "daily" ? "Daily" : "Weekly"} Certificate 📜</span>
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
        studentRealName={studentRealName || userEntry?.student_profiles?.username || "Student Explorer"}
        achievementType={certType}
        awardDate="July 2026"
        isEligible={isPastChampion || userRank === 1}
        userRank={userRank}
        isCompletedCycle={selectedCertIsCompleted && isPastChampion}
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
