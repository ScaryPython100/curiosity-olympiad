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
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { userId, loading: userLoading } = useUser();
  const [userStats, setUserStats] = useState({ xp: 0, points: 0, username: "", avatar_url: "", rank: "-", streak: "-", quests: "-", followers: 0, following: 0 });
  const [realName, setRealName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const displayAvatar = useUserAvatar(userId, userStats.avatar_url, userStats.username);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const { level, progressPercentage, unlockedBadges, nextBadge } = calculateLevelProgress(userStats.xp);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Read avatar, real name, school code, and username from localStorage
        const savedAvatar = typeof window !== "undefined"
          ? localStorage.getItem("curiosity_avatar_url") || ""
          : "";
        const savedRealName = typeof window !== "undefined"
          ? localStorage.getItem("curiosity_real_name") || ""
          : "";
        const savedSchoolCode = typeof window !== "undefined"
          ? localStorage.getItem("curiosity_school_code") || ""
          : "";
        const savedUsername = typeof window !== "undefined"
          ? localStorage.getItem("curiosity_username") || ""
          : "";
        if (savedRealName) setRealName(savedRealName);
        if (savedSchoolCode) setSchoolCode(savedSchoolCode);

        let followersCount = 0;
        let followingCount = 0;

        if (userId) {
          const { getProfileStats, getFollowers, getFollowing } = await import("@/app/actions/profile");
          const res = await getProfileStats();
          
          try {
            const followersRes = await getFollowers(userId);
            followersCount = followersRes.count;
            const followingRes = await getFollowing(userId);
            followingCount = followingRes.count;
          } catch (e) {}

          if (res?.data) {
            setUserStats({
              xp: res.data.xp,
              points: res.data.points,
              username: res.data.username || savedUsername || "Explorer",
              avatar_url: savedAvatar,
              rank: res.data.rank,
              streak: res.data.streak,
              quests: res.data.quests,
              followers: followersCount,
              following: followingCount
            });
          } else {
            setUserStats(prev => ({ 
              ...prev, 
              username: savedUsername || prev.username || "Explorer",
              avatar_url: savedAvatar 
            }));
          }
        } else {
          setUserStats(prev => ({
            ...prev,
            username: savedUsername || prev.username || "Explorer",
            avatar_url: savedAvatar
          }));
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
      <div className="bg-[#f7f9fb] min-h-screen flex items-center justify-center font-['Montserrat']">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#143867] border-t-transparent"></div>
      </div>
    );
  }

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
              aria-label="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-[#143867] text-amber-300 hidden min-[380px]:flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-[#143867] tracking-tight whitespace-nowrap">
                Explorer Profile
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
            <Link href="/leaderboard" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-xs font-black text-[#143867] border-b-2 border-[#143867] pb-1">
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

      {/* Main Container */}
      <main className="flex-grow pb-32 max-w-4xl mx-auto w-full px-3 sm:px-6 pt-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#ffe16d]/20 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#ffe16d] shadow-md">
                <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-[#143867] text-white p-2.5 rounded-full shadow-lg hover:bg-[#1e4a85] transition-all active:scale-90 border-2 border-white min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Change profile avatar"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 space-y-3">
              <div>
                {realName ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#143867] tracking-tight truncate">
                      {realName}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-gray-500">
                      @{userStats.username}
                    </p>
                  </>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-black text-[#143867] tracking-tight truncate">
                    {userStats.username || "Explorer"}
                  </h2>
                )}
              </div>

              {/* Badges & Tags */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <span className="bg-[#eef2f7] text-[#143867] px-3.5 py-1.5 rounded-full text-xs font-black border border-[#d1dbe5] flex items-center gap-1.5 shadow-2xs">
                  <span className="material-symbols-outlined text-sm">military_tech</span>
                  Level {level}
                </span>
                <span className="bg-[#fff7ed] text-[#ea580c] px-3.5 py-1.5 rounded-full text-xs font-black border border-[#ffedd5] flex items-center gap-1.5 shadow-2xs">
                  <span>✨</span>
                  {userStats.points.toLocaleString()} Points
                </span>
                {schoolCode && (
                  <span className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-black border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-sm">school</span>
                    {schoolCode}
                  </span>
                )}
              </div>

              {/* Followers / Following */}
              <div className="flex justify-center sm:justify-start gap-6 pt-1">
                <div className="text-center sm:text-left">
                  <span className="block text-xl font-black text-[#143867]">{userStats.followers}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Followers</span>
                </div>
                <div className="w-px h-8 bg-gray-200 my-auto"></div>
                <div className="text-center sm:text-left">
                  <span className="block text-xl font-black text-[#143867]">{userStats.following}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Section */}
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 relative z-10">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">Level Progress</span>
                <span className="text-xs sm:text-sm font-bold text-[#143867]">{userStats.xp % 1000} / 1000 XP</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#143867]">{Math.floor(progressPercentage)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#143867] via-[#2f4f7f] to-[#143867] rounded-full transition-all duration-1000 shadow-xs"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <span>LVL {level}</span>
              <span>LVL {level + 1}</span>
            </div>
          </div>
        </div>

        {/* 📊 Curiosity Quotient (CQ) Analytics Engine Radar Chart */}
        <div className="mb-6">
          <CuriosityQuotientCard xp={userStats.xp} username={realName || userStats.username || "Explorer"} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total XP', value: userStats.xp.toLocaleString(), icon: 'rocket_launch', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Quests', value: userStats.quests, icon: 'quiz', color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { label: 'Streak', value: userStats.streak, icon: 'local_fire_department', color: 'bg-orange-50 text-orange-700 border-orange-100' },
            { label: 'Ranking', value: userStats.rank, icon: 'leaderboard', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col items-center text-center gap-2">
              <div className={`w-10 h-10 ${stat.color} border rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{stat.label}</p>
                <p className="text-base sm:text-lg font-black text-[#143867]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Specimen Certificate Preview Action */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">workspace_premium</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-[#143867]">Curiosity Practice Lab Certificate</h3>
              <p className="text-xs text-gray-500 font-medium">Preview your verified performance credential and specimen certificate</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCertModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#143867] text-white text-xs font-bold hover:bg-[#1e4a85] transition-colors active:scale-98 min-h-[44px] flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            View Certificate
          </button>
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
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-3 bg-white border-t border-gray-200 z-50 shadow-xs">
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/dashboard"
          aria-label="Dashboard"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
        </Link>
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/leaderboard"
          aria-label="Leaderboard"
        >
          <span className="material-symbols-outlined text-2xl">emoji_events</span>
        </Link>
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/tournaments"
          aria-label="Practice Lab"
        >
          <span className="material-symbols-outlined text-2xl">science</span>
        </Link>
        <Link 
          className="flex items-center justify-center bg-[#143867] text-amber-300 rounded-2xl w-11 h-11 shadow-xs active:scale-90 duration-150 transition-transform" 
          href="/profile"
          aria-label="Profile"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </Link>
        <Link 
          className="flex items-center justify-center text-gray-500 hover:text-[#143867] transition-all active:scale-90 duration-150 min-w-[44px] min-h-[44px]" 
          href="/settings"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-2xl">settings</span>
        </Link>
      </nav>
      
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        studentRealName={realName || userStats.username || "Student Explorer"}
        achievementType="Practice Lab Top Performer"
        awardDate="July 2026"
        isEligible={true}
        userRank={1}
        isCompletedCycle={true}
      />
    </div>
  );
}
