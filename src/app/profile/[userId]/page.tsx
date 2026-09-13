"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getUserProfile, getFollowStatus, followUser, unfollowUser, getFollowers, getFollowing } from "@/app/actions/profile";
import { getBestBadge, BADGES, AVATARS } from "@/utils/gamification";
import { useUserAvatar } from "@/utils/userAvatar";
import Link from "next/link";
import { CuriosityQuotientCard } from "@/components/CuriosityQuotientCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const { t } = useLanguage();
  const unwrappedParams = use(params);
  const userId = unwrappedParams.userId;
  
  const { userId: currentUserId, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile(userId);
        if (res.data) {
          setProfile(res.data);
        } else if (res.error) {
          console.error(res.error);
        }

        const followers = await getFollowers(userId);
        setFollowersCount(followers.count);

        const following = await getFollowing(userId);
        setFollowingCount(following.count);

      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId || currentUserId === userId) return;
      const res = await getFollowStatus(userId);
      setIsFollowing(res.isFollowing);
    };
    if (!userLoading) checkFollowStatus();
  }, [currentUserId, userId, userLoading]);

  const handleFollowToggle = async () => {
    if (followLoading || !currentUserId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await unfollowUser(userId);
        if (res.success) {
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const res = await followUser(userId);
        if (res.success) {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex items-center justify-center font-['Montserrat']">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#143867] border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col items-center justify-center font-['Montserrat'] px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">person_off</span>
        </div>
        <h2 className="text-xl font-black text-[#143867] mb-2">Explorer Not Found</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">This explorer profile could not be found or has been deactivated.</p>
        <button 
          onClick={() => router.back()} 
          className="px-6 py-2.5 rounded-xl bg-[#143867] text-white text-xs font-bold hover:bg-[#1e4a85] transition-all active:scale-95 min-h-[44px]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isSelf = currentUserId === userId;
  const displayAvatar = useUserAvatar(userId, profile?.avatar_url, profile?.username);
  const badge = getBestBadge(profile.xp);
  const currentLevel = Math.floor(profile.xp / 1000) + 1;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      {/* TopAppBar: Standardized Global Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs w-full">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 py-2 min-h-[56px] w-full max-w-7xl mx-auto gap-2">
          {/* Back button & Brand Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            <button 
              onClick={() => router.back()}
              className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-xl active:scale-95 duration-100 flex items-center justify-center min-w-[44px] min-h-[44px] border border-gray-200"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
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
            <Link href="/profile" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Profile
            </Link>
          </nav>

          {/* Actions: Language & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
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
                <img src={displayAvatar} alt={profile.username} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0 space-y-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#143867] tracking-tight truncate">
                  {profile.username}
                </h2>
              </div>

              {/* Badges & Level */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <span className="bg-[#ffe16d] text-[#221b00] px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs flex items-center gap-1.5">
                  <span>{badge?.icon || "🌱"}</span> {badge?.name || "Novice"} (Lvl {currentLevel})
                </span>
                <span className="bg-[#eef2f7] text-[#143867] px-3.5 py-1.5 rounded-full text-xs font-black border border-[#d1dbe5] flex items-center gap-1.5 shadow-2xs">
                  <span className="material-symbols-outlined text-sm">military_tech</span>
                  {profile.xp.toLocaleString()} XP
                </span>
                <span className="bg-[#fff7ed] text-[#ea580c] px-3.5 py-1.5 rounded-full text-xs font-black border border-[#ffedd5] flex items-center gap-1.5 shadow-2xs">
                  <span className="material-symbols-outlined text-sm">leaderboard</span>
                  Rank #{profile.rank}
                </span>
              </div>

              {/* Followers / Following */}
              <div className="flex justify-center sm:justify-start items-center gap-6 pt-1">
                <div className="text-center sm:text-left">
                  <span className="block text-xl font-black text-[#143867]">{followersCount}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Followers</span>
                </div>
                <div className="w-px h-8 bg-gray-200 my-auto"></div>
                <div className="text-center sm:text-left">
                  <span className="block text-xl font-black text-[#143867]">{followingCount}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Following</span>
                </div>
              </div>

              {/* Follow / Unfollow Button */}
              {!isSelf && currentUserId && (
                <div className="pt-2">
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-8 py-2.5 rounded-xl font-black text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer ${
                      isFollowing 
                        ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200" 
                        : "bg-[#143867] text-white hover:bg-[#1e4a85]"
                    }`}
                  >
                    {isFollowing ? (followLoading ? "Updating..." : "Following") : (followLoading ? "Updating..." : "Follow Explorer")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 📊 Curiosity Quotient (CQ) Analytics Engine Radar Chart */}
        <div className="mb-6">
          <CuriosityQuotientCard xp={profile.xp} username={profile.username || "Explorer"} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">military_tech</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Total Experience</p>
              <p className="text-base sm:text-lg font-black text-[#143867]">{profile.xp.toLocaleString()} XP</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">leaderboard</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">Global Rank</p>
              <p className="text-base sm:text-lg font-black text-[#143867]">#{profile.rank}</p>
            </div>
          </div>
        </div>

      </main>

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
