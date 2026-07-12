"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { awardXP } from "@/app/actions/profile";
import { getBestBadge, BADGES } from "@/utils/gamification";
import { playLevelUpSound } from "@/utils/audio";

export default function DashboardPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [isAwarding, setIsAwarding] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{name: string, icon: string} | null>(null);
  const [streak, setStreak] = useState("0 Days");
  const [xp, setXp] = useState(0);
  const [friendsActivity, setFriendsActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!userId) return;
      try {
        const { getProfileStats, getFriendsActivity } = await import("@/app/actions/profile");
        const [res, activityRes] = await Promise.all([
          getProfileStats(),
          getFriendsActivity()
        ]);
        
        if (res.data) {
          setStreak(res.data.streak);
          setXp(res.data.xp);
        }
        if (activityRes.data) {
          setFriendsActivity(activityRes.data);
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
        const newXp = result.newXp || xp + 500;
        const oldBadge = getBestBadge(xp);
        const newBadge = getBestBadge(newXp);

        if (newBadge && oldBadge?.name !== newBadge.name) {
          setUnlockedBadge(newBadge);
          playLevelUpSound();
          setTimeout(() => setUnlockedBadge(null), 4000);
        } else {
          // Play a softer default sound if we want, or just rely on visual
          playLevelUpSound();
        }

        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
        setXp(newXp);
        
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
            <div className="absolute top-0 right-0 mt-12 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in zoom-in slide-in-from-top-4 duration-300 flex items-center gap-2 z-50">
              <span className="material-symbols-outlined">workspace_premium</span>
              <span className="font-bold">+500 XP Earned!</span>
            </div>
          )}

          {/* Toast Notification for Badge Unlock */}
          {unlockedBadge && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#ffe16d] text-[#221b00] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(255,215,0,0.4)] animate-in fade-in zoom-in slide-in-from-top-8 duration-500 flex items-center gap-4 z-50 border-2 border-yellow-400">
              <span className="text-4xl animate-bounce">{unlockedBadge.icon}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#705d00]">Badge Unlocked!</p>
                <p className="text-lg font-black">{unlockedBadge.name}</p>
              </div>
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
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-[#143867] text-white p-8 flex flex-col justify-between min-h-[220px]">
            <div className="z-10">
              <h4 className="text-lg font-bold mb-1 opacity-90 text-blue-200 uppercase tracking-widest text-xs">Academic Streak</h4>
              <p className="text-4xl font-bold mb-4">{streak}</p>
              
              {/* Mini Calendar Row */}
              <div className="flex items-center gap-2 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  const streakNum = parseInt(streak.split(' ')[0]) || 0;
                  // Highlight if it's within the streak leading up to today
                  const isHighlighted = i <= todayIdx && i >= todayIdx - streakNum + 1;
                  const isToday = i === todayIdx;

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-blue-200 font-bold">{day}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-[#ffe16d] text-[#221b00] shadow-[0_0_10px_rgba(255,215,0,0.4)]' 
                          : 'bg-[#1d4d8a] text-blue-300'
                      } ${isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-[#143867]' : ''}`}>
                        {isHighlighted ? <span className="material-symbols-outlined text-sm">local_fire_department</span> : <span className="material-symbols-outlined text-sm opacity-50">remove</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-blue-200 opacity-80 mt-2 font-medium tracking-wide">Consistent curiosity leads to breakthroughs.</p>
            </div>
            <div className="absolute -right-4 -bottom-10 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[160px]">history_edu</span>
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

        {/* Friends Activity Section */}
        <section className="mt-12 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#143867] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ea580c]">group</span>
              Friends Activity
            </h3>
            <Link href="/discover" className="text-xs font-bold text-[#143867] hover:underline">
              See All Friends
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
            {friendsActivity.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">person_add</span>
                <p className="text-sm font-bold text-gray-600">No recent activity from friends.</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Follow other explorers to see their progress here!</p>
                <Link href="/discover" className="inline-block bg-[#143867] text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-[#1d4d8a] transition-all">
                  Find Explorers
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {friendsActivity.map((activity, index) => {
                  // Fallback avatar based on user_id
                  let hash = 0;
                  for (let i = 0; i < activity.user_id.length; i++) {
                    hash = activity.user_id.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  // We know there are 6 avatars
                  const avatarIndex = Math.abs(hash) % 6;
                  const avatars = [
                    '/avatars/abdul_kalam_1783786598184.png',
                    '/avatars/albert_einstein_1783786524612.png',
                    '/avatars/marie_curie_1783786533839.png',
                    '/avatars/ada_lovelace_1783786544449.png',
                    '/avatars/isaac_newton_1783786553524.png',
                    '/avatars/grace_hopper_1783786562459.png'
                  ];
                  const avatarUrl = avatars[avatarIndex];
                  
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          <Link href={`/profile/${activity.user_id}`} className="font-bold text-[#143867] hover:underline">
                            {activity.username}
                          </Link>
                          {" "}earned <span className="font-bold text-[#ea580c]">{activity.daily_xp} XP</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.last_claimed_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Streamlined 5-Tab BottomNavBar Component */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/leaderboard">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">emoji_events</span>
          </div>
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
