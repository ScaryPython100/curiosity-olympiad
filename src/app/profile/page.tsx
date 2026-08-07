"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { calculateLevelProgress, BADGES } from "@/utils/gamification";
import { AvatarPickerModal } from "@/components/AvatarPickerModal";
import { useUserAvatar } from "@/utils/userAvatar";
import { CuriosityQuotientCard } from "@/components/CuriosityQuotientCard";
import CertificateModal, { RankCertificateType } from "@/components/CertificateModal";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [userStats, setUserStats] = useState({ xp: 0, points: 0, username: "", avatar_url: "", rank: "-", streak: "-", quests: "-", followers: 0, following: 0 });
  const displayAvatar = useUserAvatar(userId, userStats.avatar_url, userStats.username);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const { level, progressPercentage, unlockedBadges, nextBadge } = calculateLevelProgress(userStats.xp);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const { getProfileStats, getFollowers, getFollowing } = await import("@/app/actions/profile");
        const res = await getProfileStats();
        
        let followersCount = 0;
        let followingCount = 0;
        if (userId) {
          const followersRes = await getFollowers(userId);
          followersCount = followersRes.count;
          const followingRes = await getFollowing(userId);
          followingCount = followingRes.count;
        }

        // Read avatar from localStorage (the DB table lacks an avatar_url column)
        const savedAvatar = typeof window !== "undefined"
          ? localStorage.getItem("curiosity_avatar_url") || ""
          : "";

        if (res.data) {
          setUserStats({
            xp: res.data.xp,
            points: res.data.points,
            username: res.data.username,
            avatar_url: savedAvatar,
            rank: res.data.rank,
            streak: res.data.streak,
            quests: res.data.quests,
            followers: followersCount,
            following: followingCount
          });
        } else {
          setUserStats(prev => ({ ...prev, avatar_url: savedAvatar }));
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
                <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-[#143867] text-white p-2.5 rounded-full shadow-xl hover:bg-[#1d4d8a] transition-all active:scale-90 border-2 border-white group-hover:scale-110"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
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
              <div className="flex justify-center md:justify-start gap-6 mt-4">
                <div className="text-center">
                  <span className="block text-xl font-black text-[#143867]">{userStats.followers}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-black text-[#143867]">{userStats.following}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Following</span>
                </div>
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

        {/* 📊 NEW: Curiosity Quotient (CQ) Analytics Engine Radar Chart */}
        <CuriosityQuotientCard xp={userStats.xp} username={userStats.username || "Explorer"} />



        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total XP', value: userStats.xp.toLocaleString(), icon: 'rocket_launch', color: 'bg-blue-50 text-blue-600' },
            { label: 'Quests', value: userStats.quests, icon: 'quiz', color: 'bg-purple-50 text-purple-600' },
            { label: 'Streak', value: userStats.streak, icon: 'local_fire_department', color: 'bg-orange-50 text-orange-600' },
            { label: 'Ranking', value: userStats.rank, icon: 'leaderboard', color: 'bg-emerald-50 text-emerald-600' },
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
        <AvatarPickerModal
          currentAvatarUrl={userStats.avatar_url}
          onClose={() => setShowAvatarModal(false)}
          onSuccess={(url) => setUserStats(prev => ({ ...prev, avatar_url: url }))}
        />
      )}

      {/* Global Fixed BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/dashboard">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">home</span>
          </div>
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
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/profile">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </Link>
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/settings">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </Link>
      </nav>
      
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        studentRealName={userStats.username || "Student Explorer"}
        achievementType="Olympiad Champion"
        awardDate="July 2026"
        isEligible={true}
        userRank={1}
        isCompletedCycle={true}
      />
    </div>
  );
}
