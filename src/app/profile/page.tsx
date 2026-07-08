"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { calculateLevelProgress, AVATARS, BADGES } from "@/utils/gamification";
import { updateAvatar } from "@/app/actions/profile";

export default function ProfilePage() {
  const { userId, loading: userLoading } = useUser();
  const [userStats, setUserStats] = useState({ xp: 0, points: 0, username: "", avatar_url: "" });
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { level, progressPercentage, unlockedBadges, nextBadge } = calculateLevelProgress(userStats.xp);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        const { data: gamificationData } = await supabase
          .from("user_gamification")
          .select("xp, curiosity_points")
          .eq("user_id", userId)
          .single();

        const { data: profileData } = await supabase
          .from("student_profiles")
          .select("username, avatar_url")
          .eq("id", userId)
          .single();

        if (gamificationData || profileData) {
          setUserStats({
            xp: gamificationData?.xp || 0,
            points: gamificationData?.curiosity_points || 0,
            username: profileData?.username || "Explorer",
            avatar_url: profileData?.avatar_url || ""
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchStats();
    }
  }, [userId, userLoading]);

  const handleAvatarSelect = async (url: string) => {
    setIsUpdating(true);
    try {
      const result = await updateAvatar(url);
      if (result.success) {
        setUserStats(prev => ({ ...prev, avatar_url: url }));
        setShowAvatarModal(false);
      }
    } catch (err) {
      console.error("Failed to update avatar:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="bg-[#f7f9fb] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143867]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen pb-32 font-['Montserrat'] antialiased flex flex-col">
      
      {/* TopAppBar Section */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#f7f9fb] h-16 flex items-center px-4 border-b border-gray-200">
        <Link 
          href="/dashboard"
          className="mr-4 text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center"
        >
          <span className="material-symbols-outlined leading-none">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#143867]">Explorer Profile</h1>
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 max-w-4xl mx-auto w-full flex-grow">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffe16d] opacity-10 rounded-bl-full -mr-10 -mt-10"></div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#ffe16d] shadow-lg">
                {userStats.avatar_url ? (
                  <img src={userStats.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-[#143867] uppercase">
                    {userStats.username.substring(0, 2)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-[#143867] text-white p-2 rounded-full shadow-md hover:bg-[#1d4d8a] transition-all active:scale-90"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-[#143867]">
                {userStats.username}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-[#eef2f7] text-[#143867] px-4 py-1.5 rounded-full text-sm font-bold border border-[#d1dbe5] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">military_tech</span>
                  Level {level}
                </span>
                <span className="bg-[#fff7ed] text-[#ea580c] px-4 py-1.5 rounded-full text-sm font-bold border border-[#ffedd5] flex items-center gap-2">
                  <span>✨</span>
                  {userStats.points.toLocaleString()} Points
                </span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-10 space-y-3 relative z-10">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Level Progress</span>
                <span className="text-sm font-bold text-[#143867]">{userStats.xp % 1000} / 1000 XP</span>
              </div>
              <span className="text-2xl font-black text-[#143867]">{Math.floor(progressPercentage)}%</span>
            </div>
            <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-1 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#143867] via-[#2f4f7f] to-[#143867] rounded-full transition-all duration-1000 shadow-sm relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>LVL {level}</span>
              <span>LVL {level + 1}</span>
            </div>
          </div>
        </div>

        {/* Badges Section - New Playful UI */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-[#143867] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ea580c]">stars</span>
              Achievements
            </h2>
            <span className="text-xs font-bold text-gray-400 uppercase">{unlockedBadges.length} / {BADGES.length} Unlocked</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = userStats.xp >= badge.minXp;
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-white border-yellow-200 shadow-md scale-100'
                      : 'bg-gray-50 border-gray-100 grayscale opacity-40 scale-95'
                  }`}
                >
                  <span className="text-3xl mb-2">{badge.icon}</span>
                  <span className="text-[10px] font-bold text-center leading-tight text-[#143867]">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: userStats.xp.toLocaleString(), icon: 'rocket_launch', color: 'bg-blue-50 text-blue-600' },
            { label: 'Quests', value: '24', icon: 'quiz', color: 'bg-purple-50 text-purple-600' },
            { label: 'Streak', value: '7 Days', icon: 'local_fire_department', color: 'bg-orange-50 text-orange-600' },
            { label: 'Ranking', value: '#12', icon: 'leaderboard', color: 'bg-emerald-50 text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                <p className="text-lg font-extrabold text-[#143867]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#143867]">Choose your Legend</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  disabled={isUpdating}
                  onClick={() => handleAvatarSelect(avatar.url)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${
                    userStats.avatar_url === avatar.url
                      ? 'bg-[#ffe16d] ring-2 ring-yellow-400'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold text-[#143867] text-center">{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Fixed BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-[#f7f9fb] border-t border-gray-200 px-4 pb-2 z-50">
        <Link 
          href="/dashboard" 
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#143867] transition-all"
        >
          <span className="material-symbols-outlined mb-1">home</span>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link 
          href="/leaderboard" 
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#143867] transition-all"
        >
          <span className="material-symbols-outlined mb-1">emoji_events</span>
          <span className="text-[10px] font-semibold">Rankings</span>
        </Link>
        <Link 
          href="/profile" 
          className="flex flex-col items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full px-6 py-2 shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
        <a 
          href="#" 
          className="flex flex-col items-center justify-center text-gray-500 hover:text-[#143867] transition-all"
        >
          <span className="material-symbols-outlined mb-1">settings</span>
          <span className="text-[10px] font-semibold">Settings</span>
        </a>
      </nav>
      
    </div>
  );
}
