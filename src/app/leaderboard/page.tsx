"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { getLeaderboard } from "@/app/actions/profile";
import { BADGES } from "@/utils/gamification";

interface LeaderboardEntry {
  user_id: string;
  xp: number;
  curiosity_points: number;
  student_profiles: {
    username: string;
    avatar_url: string;
  } | null;
}

export default function LeaderboardPage() {
  const { userId, loading: userLoading } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const result = await getLeaderboard();
        if (result.data) {
          setLeaderboardData(result.data as unknown as LeaderboardEntry[]);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const topThree = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);

  const userRankIndex = leaderboardData.findIndex(entry => entry.user_id === userId);
  const userEntry = userRankIndex !== -1 ? leaderboardData[userRankIndex] : null;
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  const isLoading = loading || userLoading;

  const getBestBadge = (xp: number) => {
    const unlocked = BADGES.filter(b => xp >= b.minXp);
    return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      <header className="fixed top-0 z-50 w-full bg-[#f7f9fb] h-16 flex items-center px-4 border-b border-gray-200">
        <Link 
          href="/dashboard"
          className="mr-4 text-[#143867] active:scale-95 duration-150 transition-colors hover:bg-gray-100 rounded-full p-2 flex items-center justify-center"
        >
          <span className="material-symbols-outlined leading-none">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#143867]">Global Standings</h1>
      </header>

      <main className="flex-grow pt-20 pb-32 overflow-y-auto max-w-md mx-auto w-full hide-scrollbar">
        
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
                  <div className="flex flex-col items-center flex-1 order-1">
                    <div className="relative mb-2">
                      <div className="w-20 h-20 rounded-full border-4 border-gray-200 overflow-hidden bg-white shadow-sm">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 2"
                          src={topThree[1].student_profiles?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/500px-A._P._J._Abdul_Kalam.jpg"}
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">2nd</div>
                    </div>
                    <p className="text-sm font-semibold text-[#143867] text-center truncate w-full">
                      {topThree[1].student_profiles?.username || "Scholar"}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] grayscale brightness-125">{getBestBadge(topThree[1].xp)?.icon}</span>
                      <p className="text-xs text-gray-500 font-bold">{topThree[1].xp.toLocaleString()} pts</p>
                    </div>
                    <div className="w-full h-16 bg-gray-200 rounded-t-lg mt-4 opacity-40 shadow-inner"></div>
                  </div>
                )}

                {/* Rank 1 */}
                {topThree[0] && (
                  <div className="flex flex-col items-center flex-1 order-2 z-10 scale-110 -translate-y-4 filter drop-shadow(0_10px_15px_rgba(20,56,103,0.1))">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 rounded-full border-4 border-[#ffe16d] overflow-hidden bg-white shadow-[0_0_15px_rgba(255,215,0,0.25)]">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 1"
                          src={topThree[0].student_profiles?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/500px-Albert_Einstein_Head_cleaned.jpg"}
                        />
                      </div>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#705d00] text-4xl animate-bounce">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#ffe16d] text-[#221b00] text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-md">1st</div>
                    </div>
                    <p className="text-sm font-bold text-[#143867] text-center truncate w-full">
                      {topThree[0].student_profiles?.username || "Newton"}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{getBestBadge(topThree[0].xp)?.icon}</span>
                      <p className="text-xs text-[#705d00] font-extrabold">{topThree[0].xp.toLocaleString()} pts</p>
                    </div>
                    <div className="w-full h-24 bg-[#ffe16d] rounded-t-lg mt-4 shadow-sm flex items-center justify-center relative overflow-hidden">
                      <span className="material-symbols-outlined text-[#221b00] opacity-20 text-4xl">school</span>
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {/* Rank 3 */}
                {topThree[2] && (
                  <div className="flex flex-col items-center flex-1 order-3">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-300 overflow-hidden bg-white shadow-sm">
                        <img
                          className="w-full h-full object-cover"
                          alt="Rank 3"
                          src={topThree[2].student_profiles?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png/500px-Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png"}
                        />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">3rd</div>
                    </div>
                    <p className="text-sm font-semibold text-[#143867] text-center truncate w-full">
                      {topThree[2].student_profiles?.username || "Ada"}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] grayscale brightness-110">{getBestBadge(topThree[2].xp)?.icon}</span>
                      <p className="text-xs text-gray-500 font-bold">{topThree[2].xp.toLocaleString()} pts</p>
                    </div>
                    <div className="w-full h-12 bg-gray-200 rounded-t-lg mt-4 opacity-20 shadow-inner"></div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="bg-white rounded-t-[32px] pt-8 px-4 min-h-[400px] border-t border-gray-200 transition-all duration-700 ease-out shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Top Explorers</h2>
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
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
              remaining.map((entry, index) => {
                const rank = index + 4;
                const isCurrentUser = entry.user_id === userId;
                const badge = getBestBadge(entry.xp);

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
                          src={entry.student_profiles?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg/500px-Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg"}
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
                        <p className="text-[10px] uppercase font-bold opacity-70">Points</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={entry.user_id} className="flex items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all group cursor-pointer active:scale-[0.98] duration-75 hover:shadow-sm">
                    <span className="w-8 text-xl font-bold text-gray-300 group-hover:text-[#143867] transition-colors italic">{rank}</span>
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mx-3 border border-gray-200">
                      <img
                        className="w-full h-full object-cover"
                        alt="Explorer"
                        src={entry.student_profiles?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/500px-Marie_Curie_c._1920s.jpg"}
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
                      <p className="text-[10px] text-gray-400 font-bold uppercase">pts</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!isLoading && userEntry && (
            <div className="mt-8 mb-6 p-5 bg-gradient-to-br from-[#ffe16d] to-[#ffd700] rounded-[24px] border border-yellow-400 flex items-start gap-4 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <span className="material-symbols-outlined text-4xl">emoji_events</span>
              </div>
              <div className="bg-[#221b00] rounded-full p-2 flex items-center justify-center text-yellow-400 shadow-md">
                <span className="material-symbols-outlined text-xl">lightbulb</span>
              </div>
              <div>
                <h5 className="text-sm font-black text-[#221b00] uppercase tracking-wider">Strategic Insight</h5>
                <p className="text-xs text-[#544600] leading-relaxed font-semibold mt-1">
                  {userRank && userRank > 1 ? (
                    <>You're at Rank #{userRank}. {leaderboardData[userRank - 2] && `Only ${(leaderboardData[userRank - 2].xp - userEntry.xp).toLocaleString()} XP away from Rank #${userRank - 1}.`} Keep exploring!</>
                  ) : (
                    <>You're leading the expedition at Rank #1! The title of Logic Grandmaster awaits.</>
                  )}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">home</span>
          </div>
        </Link>
        <Link 
          href="/profile" 
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        <a 
          href="#" 
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </a>
      </nav>
      
    </div>
  );
}
