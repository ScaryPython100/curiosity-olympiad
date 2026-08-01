"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { awardXP } from "@/app/actions/profile";
import { getBestBadge, BADGES } from "@/utils/gamification";
import { getUserAvatar, useUserAvatar } from "@/utils/userAvatar";
import { playLevelUpSound } from "@/utils/audio";
import KuppuMascot from "@/components/KuppuMascot";

const PARTNER_SCHOOLS = [
  { name: "Global Olympiad Partner Academy", location: "Worldwide", icon: "public", badgeColor: "bg-[#143867] text-white border-[#f37021]", emblem: "🌐" },
  { name: "STEM Excellence Institute", location: "Delhi", icon: "precision_manufacturing", badgeColor: "bg-[#f37021] text-white border-[#143867]", emblem: "🦾" },
  { name: "Innovation & Curiosity Charter", location: "Bangalore", icon: "lightbulb", badgeColor: "bg-[#2f4f7f] text-white border-[#f37021]", emblem: "💡" },
  { name: "Agastya Campus Creativity Lab", location: "Kuppam", icon: "science", badgeColor: "bg-[#143867] text-[#ffe16d] border-[#f37021]", emblem: "Å", logo: "/agastya-logo.svg" },
  { name: "National Science Foundation Network", location: "India", icon: "biotech", badgeColor: "bg-emerald-700 text-white border-emerald-300", emblem: "🔬" },
  { name: "Future Explorers Foundation", location: "Mumbai", icon: "rocket_launch", badgeColor: "bg-purple-700 text-white border-purple-300", emblem: "🚀" },
  { name: "Aah! Aha! Ha-ha! Learning Center", location: "Agastya", icon: "auto_awesome", badgeColor: "bg-[#f37021] text-white border-[#ffe16d]", emblem: "✨" },
  { name: "Young Instructors Academy", location: "Hyderabad", icon: "school", badgeColor: "bg-[#143867] text-white border-blue-300", emblem: "🎓" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [isAwarding, setIsAwarding] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<{name: string, icon: string} | null>(null);
  const [streak, setStreak] = useState("0 Days");
  const [xp, setXp] = useState(0);
  const [friendsActivity, setFriendsActivity] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

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

  const handleCopyInvite = () => {
    const text = "Join me on Curiosity Olympiad! Experience hands-on science learning inspired by Agastya's Aah! Aha! Ha-ha! philosophy. Spark your curiosity today! 🚀 https://curiosity-olympiad.vercel.app";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = (platform: string) => {
    const text = encodeURIComponent("Join me on Curiosity Olympiad! Experience hands-on science learning inspired by Agastya's Aah! Aha! Ha-ha! philosophy. Spark your curiosity today! 🚀 #CuriosityOlympiad #Agastya");
    const url = encodeURIComponent("https://curiosity-olympiad.vercel.app");
    
    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, "_blank");
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    } else if (platform === "native" && typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: "Curiosity Olympiad x Agastya",
        text: "Join me on Curiosity Olympiad! Experience hands-on science learning inspired by Agastya's Aah! Aha! Ha-ha! philosophy.",
        url: "https://curiosity-olympiad.vercel.app"
      }).catch(() => {});
    } else {
      handleCopyInvite();
    }
  };

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

        {/* 🐵 NEW: Interactive, Free-Floating Kuppu Mascot Component Restricted to Dashboard */}
        <KuppuMascot userName="Explorer" />

        {/* 🗺️ NEW: Beautifully Styled CTA Card for Full Campus Map (11 Milestones) */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-[#eaf6ff] via-[#f7fbff] to-[#fff7ed] rounded-3xl p-6 sm:p-8 border-2 border-[#143867]/15 shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md flex flex-col items-center justify-center border-2 border-amber-400 shrink-0 p-2">
                <span className="text-3xl sm:text-4xl">🚌</span>
                <span className="text-[10px] font-black text-[#143867] uppercase tracking-tighter mt-0.5">Kuppam</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f37021] text-white text-[10px] font-black uppercase tracking-wider">
                    <span>🚌 Mobile Science Van Highway</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#143867] text-[#ffe16d] text-[10px] font-black uppercase tracking-wider">
                    <span>Level {Math.floor((xp || 450) / 100) + 1} • {xp || 450} / 10000 XP</span>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#143867] tracking-tight">
                  Agastya Kuppam Creative Campus Map
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Drive your Science Van across 11 official campus landmarks from <strong className="text-[#143867]">Entrance</strong> to <strong className="text-[#143867]">VisionWorks</strong>!
                </p>
              </div>
            </div>

            <Link
              href="/campus-map"
              className="px-6 py-3.5 rounded-full bg-[#143867] hover:bg-[#1e4a85] text-[#ffe16d] font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 border-2 border-[#ffe16d]/30"
            >
              <span>Open Full Campus Map (11 Milestones) ➔</span>
            </Link>
          </div>
        </section>

        {/* Agastya Promotional Hero Banner */}
        <section className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#143867] via-[#1b4a8e] to-[#0d2340] text-white shadow-[0_12px_40px_rgba(20,56,103,0.3)] relative border border-blue-400/20">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#ffe16d]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="p-6 md:p-10 relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 text-white leading-tight">
                "Aah! Aha! Ha-ha!" <br className="hidden sm:inline" />
                <span className="text-[#ffe16d]">Curiosity, Discovery & Joy in Science.</span>
              </h3>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed opacity-95 mb-6">
                Our platform replaces rote memorization with experiential simulations, leveled practice, and hands-on scientific discovery. Spark your inner scientist today!
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-[#ffe16d] text-[#221b00] font-bold px-6 py-3 rounded-full text-xs md:text-sm shadow-lg hover:bg-[#ffd73e] hover:scale-105 transition-all active:scale-95"
                >
                  <span>Explore Agastya Mission</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full text-xs md:text-sm backdrop-blur-sm border border-white/20 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">science</span>
                  <span>Try Interactive Lab</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center gap-3 bg-white/10 border border-white/20 p-5 rounded-2xl backdrop-blur-md min-w-[260px]">
              <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md">
                <img src="/agastya-logo.svg" alt="Agastya Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-[#f37021] uppercase tracking-wider">The Agastya Way</p>
                <p className="text-[11px] text-blue-100 mt-1 font-bold">
                  Curiosity • Creativity • Confidence
                </p>
                <p className="text-[10px] text-[#ffe16d] italic mt-0.5">
                  Under the Umbrella of Care
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-100 font-bold bg-[#143867]/60 px-3 py-1 rounded-full border border-blue-400/30">
                <span className="material-symbols-outlined text-sm text-[#f37021]">verified</span>
                <span>1.5M+ Young Minds Sparked</span>
              </div>
            </div>
          </div>
        </section>

        {/* Rolling Partner School Logo Carousel - Official Insignia Badges */}
        <section className="mb-10 overflow-hidden bg-white border-2 border-[#f37021]/30 rounded-3xl py-6 px-6 shadow-md relative">
          <div className="flex flex-col items-center justify-center mb-5 text-center">
            <span className="bg-orange-50 text-[#f37021] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-orange-200 tracking-widest mb-1.5">
              Institutional Collaborations
            </span>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#143867]">
              Official Academic Partners & Olympic Charters Worldwide
            </p>
          </div>
          <div className="flex overflow-hidden relative">
            <div className="animate-marquee flex items-center gap-6 py-2">
              {[...PARTNER_SCHOOLS, ...PARTNER_SCHOOLS].map((school, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200/80 rounded-2xl whitespace-nowrap hover:border-[#f37021] hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${school.badgeColor || "bg-[#143867] text-white"} flex items-center justify-center shadow-xs shrink-0 border`}>
                    {school.logo ? (
                      <img src={school.logo} alt={school.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-lg font-bold">{school.emblem || "🏛️"}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold text-[#143867] leading-none group-hover:text-[#f37021] transition-colors">{school.name}</p>
                      <span className="material-symbols-outlined text-xs text-[#f37021]">verified</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                      {school.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                  const avatarUrl = getUserAvatar(activity.user_id);
                  
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

        {/* Social Media Invite / Share Card */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-[#143867]/5 to-[#ffe16d]/10 border border-gray-200/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#143867] text-[#ffe16d] flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-2xl">share</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-[#143867]">Invite Classmates & Friends</h4>
                <span className="bg-[#ea580c]/10 text-[#ea580c] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  +100 XP per Friend
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Share the gift of curiosity! Challenge your classmates to experiential science tests.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white rounded-full text-xs font-bold hover:bg-[#1EBE5D] transition-all shadow-sm active:scale-95"
              title="Share on WhatsApp"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1DA1F2] text-white rounded-full text-xs font-bold hover:bg-[#0c85d0] transition-all shadow-sm active:scale-95"
              title="Share on X"
            >
              <span className="material-symbols-outlined text-sm">post</span>
              <span>X (Twitter)</span>
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white rounded-full text-xs font-bold hover:bg-[#0d65d9] transition-all shadow-sm active:scale-95"
              title="Share on Facebook"
            >
              <span className="material-symbols-outlined text-sm">thumb_up</span>
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShare("native")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#143867] text-white rounded-full text-xs font-bold hover:bg-[#1d4d8a] transition-all shadow-sm active:scale-95"
              title="Copy link or share"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
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
