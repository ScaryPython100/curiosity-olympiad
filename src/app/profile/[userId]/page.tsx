"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { getUserProfile, getFollowStatus, followUser, unfollowUser, getFollowers, getFollowing } from "@/app/actions/profile";
import { getBestBadge, BADGES, AVATARS } from "@/utils/gamification";
import { useUserAvatar } from "@/utils/userAvatar";
import Link from "next/link";
import { CuriosityQuotientCard } from "@/components/CuriosityQuotientCard";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
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
      <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col items-center justify-center font-['Montserrat']">
        <h2 className="text-2xl font-bold mb-4">Explorer Not Found</h2>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline">Go Back</button>
      </div>
    );
  }

  const isSelf = currentUserId === userId;
  const displayAvatar = useUserAvatar(userId, profile?.avatar_url, profile?.username);
  const badge = getBestBadge(profile.xp);
  const currentLevel = Math.floor(profile.xp / 1000) + 1;

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] pb-32">
      
      {/* TopAppBar Component */}
      <header className="w-full top-0 sticky bg-[#f7f9fb]/90 backdrop-blur-md border-b border-gray-200 z-40 transition-colors duration-300">
        <div className="flex items-center px-4 py-3 w-full max-w-2xl mx-auto gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Public Profile</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-8 w-full max-w-2xl mx-auto">
        
        {/* Avatar Section */}
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#143867] to-[#2f4f7f] p-1 shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img src={displayAvatar} alt={profile.username} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Username & Level */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black mb-2">{profile.username}</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="bg-[#ffe16d] text-[#221b00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
              <span>{badge?.icon || "🌱"}</span> {badge?.name || "Novice"} (Lvl {currentLevel})
            </div>
          </div>
        </div>

        {/* Follow / Unfollow Button */}
        {!isSelf && currentUserId && (
          <button 
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`mb-8 px-8 py-2 rounded-full font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${
              isFollowing 
                ? "bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-600" 
                : "bg-[#143867] text-white hover:bg-[#1d4d8a]"
            }`}
          >
            {isFollowing ? (followLoading ? "..." : "Following") : (followLoading ? "..." : "Follow")}
          </button>
        )}

        {/* Followers / Following Counts */}
        <div className="flex gap-8 mb-8 text-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full justify-center">
          <div>
            <div className="text-2xl font-bold">{followersCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Followers</div>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <div className="text-2xl font-bold">{followingCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Following</div>
          </div>
        </div>

        {/* 📊 NEW: Curiosity Quotient (CQ) Analytics Engine Radar Chart */}
        <div className="w-full mb-6">
          <CuriosityQuotientCard xp={profile.xp} username={profile.username || "Explorer"} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[#143867] text-3xl mb-2">military_tech</span>
            <div className="text-xl font-bold text-[#143867]">{profile.xp.toLocaleString()} XP</div>
            <div className="text-xs text-gray-500 font-medium">Total Experience</div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[#143867] text-3xl mb-2">leaderboard</span>
            <div className="text-xl font-bold text-[#143867]">{profile.rank}</div>
            <div className="text-xs text-gray-500 font-medium">Global Rank</div>
          </div>
        </div>

      </main>

    </div>
  );
}
