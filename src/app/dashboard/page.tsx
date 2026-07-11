"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { awardXP } from "@/app/actions/profile";

export default function DashboardPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [isAwarding, setIsAwarding] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [streak, setStreak] = useState("0 Days");

  useEffect(() => {
    const fetchStreak = async () => {
      if (!userId) return;
      try {
        const { getProfileStats } = await import("@/app/actions/profile");
        const res = await getProfileStats();
        if (res.data) {
          setStreak(res.data.streak);
        }
      } catch (err) {
        console.error("Error fetching streak:", err);
      }
    };
    if (!userLoading) fetchStreak();
  }, [userId, userLoading]);

  const handleClaimXP = async () => {
    if (isAwarding) return;
    setIsAwarding(true);
    try {
      const result = await awardXP(500, "Daily Exploration Bonus");
      if (result.success) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
        // Optimistically update the streak if they just claimed
        setStreak("1 Days");
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err) {
      console.error("Failed to claim XP:", err);
    } finally {
      setIsAwarding(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat']">
      
      {/* TopAppBar Component */}
      <header className="w-full top-0 sticky bg-[#f7f9fb] border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 py-2 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#143867]">lightbulb</span>
            <h1 className="text-xl text-[#143867] font-bold tracking-tight">Curiosity Olympiad</h1>
          </div>
          <button className="text-gray-600 hover:bg-gray-200 transition-colors p-2 rounded-full active:scale-95 duration-150 ease-in-out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-12 pb-32 max-w-7xl mx-auto w-full">
        
        {/* Welcome Header */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
          <div className="mb-2 flex items-center justify-between">
            <span className="bg-[#ffe16d] text-[#221b00] px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              Explorer Dashboard
            </span>

            {/* Gamification Testing Button */}
            <button
              onClick={handleClaimXP}
              disabled={isAwarding}
              className="flex items-center gap-2 bg-[#143867] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#1d4d8a] transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {isAwarding ? "Exploring..." : "Claim Daily XP"}
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#143867] mb-2">Welcome Back!</h2>
          <p className="text-gray-600 text-base">Your intellectual journey continues today. What will you discover?</p>

          {/* Toast Notification for XP */}
          {showReward && (
            <div className="absolute top-0 right-0 mt-12 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in zoom-in slide-in-from-top-4 duration-300 flex items-center gap-2">
              <span className="material-symbols-outlined">workspace_premium</span>
              <span className="font-bold">+500 XP Earned!</span>
            </div>
          )}
        </section>

        {/* Feature Grid: Bento-style Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* My Tournaments */}
          <Link 
            href="/tournaments"
            className="block text-left bg-white border border-gray-200 p-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-[#dde3eb] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#ffe16d] transition-colors">
                  <span className="material-symbols-outlined text-[#2f4f7f]">emoji_events</span>
                </div>
                <h3 className="text-xl font-bold text-[#143867] mb-2">My Tournaments</h3>
                <p className="text-gray-600 text-base mb-6">View your active registrations and upcoming academic challenges.</p>
              </div>
              <div className="flex items-center text-[#143867] font-semibold text-sm gap-1">
                <span>Check Status</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Leaderboard Bento Card */}
          <Link 
            href="/leaderboard" 
            className="block text-left bg-white border border-gray-200 p-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-[#dde3eb] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#ffe16d] transition-colors">
                  <span className="material-symbols-outlined text-[#2f4f7f]">leaderboard</span>
                </div>
                <h3 className="text-xl font-bold text-[#143867] mb-2">Leaderboard</h3>
                <p className="text-gray-600 text-base mb-6">See how you rank against fellow explorers worldwide.</p>
              </div>
              <div className="flex items-center text-[#143867] font-semibold text-sm gap-1">
                <span>View Rankings</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Practice Tests */}
          <Link 
            href="/practice" 
            className="block text-left bg-white border border-gray-200 p-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group md:col-span-2 lg:col-span-1 active:scale-[0.98]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-[#dde3eb] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#ffe16d] transition-colors">
                  <span className="material-symbols-outlined text-[#2f4f7f]">edit_note</span>
                </div>
                <h3 className="text-xl font-bold text-[#143867] mb-2">Practice Tests</h3>
                <p className="text-gray-600 text-base mb-6">Sharpen your logic and knowledge with curated curiosity quizzes.</p>
              </div>
              <div className="flex items-center text-[#143867] font-semibold text-sm gap-1">
                <span>Start Practicing</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Stats / Atmospheric Section */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-[#143867] text-white p-10 flex flex-col justify-center min-h-[200px]">
            <div className="z-10">
              <h4 className="text-xl font-bold mb-2">Academic Streak</h4>
              <p className="text-5xl font-bold mb-2">{streak}</p>
              <p className="text-xs opacity-80">Consistent curiosity leads to breakthroughs.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[180px]">history_edu</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-[#f2f4f6] border border-gray-200 p-6 rounded-xl flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-[#ffe16d] flex items-center justify-center text-[#221b00] shadow-sm">
                <span className="material-symbols-outlined">tips_and_updates</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#191c1e]">Daily Insight</h5>
                <p className="text-xs text-gray-600">The word 'Curiosity' comes from the Latin 'curiosus'.</p>
              </div>
            </div>
            
            <div className="bg-[#f2f4f6] border border-gray-200 p-6 rounded-xl flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-[#dde3eb] flex items-center justify-center text-[#143867] shadow-sm">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#191c1e]">Next Tournament</h5>
                <p className="text-xs text-gray-600">Starts in 3 days, 14 hours. Be ready!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Streamlined 3-Tab BottomNavBar Component */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/profile">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/leaderboard">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">emoji_events</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
