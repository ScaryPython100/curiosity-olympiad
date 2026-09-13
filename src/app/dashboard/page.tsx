"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { awardXP } from "@/app/actions/profile";
import { getBestBadge } from "@/utils/gamification";
import { getUserAvatar } from "@/utils/userAvatar";
import { playLevelUpSound } from "@/utils/audio";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { colors, radii, typography, touchTargets, motion } from "@/design-system/tokens";

const PARTNER_SCHOOLS = [
  { name: "Global Olympiad Partner Academy", location: "Worldwide", icon: "public", badgeColor: "bg-[#143867] text-white border-[#ea580c]", emblem: "🌐" },
  { name: "STEM Excellence Institute", location: "Delhi", icon: "precision_manufacturing", badgeColor: "bg-[#ea580c] text-white border-[#143867]", emblem: "🦾" },
  { name: "Innovation & Curiosity Charter", location: "Bangalore", icon: "lightbulb", badgeColor: "bg-[#1e4a85] text-white border-[#ea580c]", emblem: "💡" },
  { name: "Agastya Campus Creativity Lab", location: "Kuppam", icon: "science", badgeColor: "bg-[#143867] text-amber-300 border-[#ea580c]", emblem: "Å", logo: "/agastya-logo.svg" },
  { name: "National Science Foundation Network", location: "India", icon: "biotech", badgeColor: "bg-emerald-700 text-white border-emerald-300", emblem: "🔬" },
  { name: "Future Explorers Foundation", location: "Mumbai", icon: "rocket_launch", badgeColor: "bg-purple-700 text-white border-purple-300", emblem: "🚀" },
  { name: "Aah! Aha! Ha-ha! Learning Center", location: "Agastya", icon: "auto_awesome", badgeColor: "bg-[#ea580c] text-white border-amber-300", emblem: "✨" },
  { name: "Young Instructors Academy", location: "Hyderabad", icon: "school", badgeColor: "bg-[#143867] text-white border-blue-300", emblem: "🎓" },
];

export default function DashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [isAwarding, setIsAwarding] = useState(false);
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
    const text = "Join me on Curiosity Olympiad! Experience hands-on science learning inspired by Agastya\x27s Aah! Aha! Ha-ha! philosophy. Spark your curiosity today! 🚀 https://curiosity-olympiad.vercel.app";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = (platform: string) => {
    const text = encodeURIComponent("Join me on Curiosity Olympiad! Experience hands-on science learning inspired by Agastya\x27s Aah! Aha! Ha-ha! philosophy. Spark your curiosity today! 🚀 #CuriosityOlympiad #Agastya");
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
        text: "Join me on Curiosity Olympiad! Experience hands-on science learning inspired by Agastya\x27s Aah! Aha! Ha-ha! philosophy.",
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
      const result = await awardXP(500, "daily_login");
      if (result.success) {
        const newXp = result.newXp || xp + 500;
        const oldBadge = getBestBadge(xp);
        const newBadge = getBestBadge(newXp);

        if (newBadge && oldBadge?.name !== newBadge.name) {
          playLevelUpSound();
          toast.success(`Badge Unlocked: ${newBadge.name}`, {
            description: "Congratulations on reaching a new milestone!",
            duration: 4000,
          });
        } else {
          playLevelUpSound();
          toast.success("+500 XP Claimed!", {
            description: "Daily Explorer reward added to your profile.",
            duration: 3000,
          });
        }

        setXp(newXp);
        setStreak("1 Days");
        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Failed to claim XP:", err);
      toast.error("Could not claim daily XP. Please try again.");
    } finally {
      setIsAwarding(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      {/* TopAppBar: Standardized Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs w-full">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 py-2 min-h-[56px] w-full max-w-7xl mx-auto gap-2">
          {/* Brand & Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 mr-2">
            <div className="w-8 h-8 rounded-lg bg-[#143867] text-amber-300 flex items-center justify-center shadow-xs shrink-0">
              <span className="material-symbols-outlined text-lg">lightbulb</span>
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-black text-[#143867] tracking-tight truncate">
              {t.auth.app_title}
            </h1>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-xs font-black text-[#143867] border-b-2 border-[#143867] pb-1">
              Home
            </Link>
            <Link href="/tournaments" className="text-xs font-bold text-gray-600 hover:text-[#143867] transition-colors pb-1">
              Tournaments
            </Link>
            <Link href="/tournaments" className="text-xs font-bold text-[#ea580c] hover:text-[#c2410c] transition-colors pb-1 flex items-center gap-1">
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
            <button 
              type="button"
              onClick={() => {
                import("@/utils/supabase/client").then(m => {
                  m.createClient().auth.signOut().then(() => router.push("/login"));
                });
              }}
              className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-full active:scale-95 duration-100 flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer" 
              title={t.app.logout}
              aria-label={t.app.logout}
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-3 sm:px-6 md:px-8 pt-6 pb-24 md:pb-12 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Welcome & Daily XP Header */}
        <section className="relative">
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <span className="bg-[#eef2f7] text-[#143867] border border-[#d1dbe5] px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
              {t.app.explorer_dashboard}
            </span>

            {/* Daily XP Button (>=44px touch target) */}
            <button
              type="button"
              onClick={handleClaimXP}
              disabled={isAwarding}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#143867] hover:bg-[#1e4a85] text-white text-xs font-bold active:scale-95 transition-transform duration-100 flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm text-amber-400">auto_awesome</span>
              <span>{isAwarding ? "Exploring..." : t.dashboard.claim_daily_xp}</span>
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#143867] tracking-tight mb-1">
            {t.dashboard.welcome_back_title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            {t.dashboard.welcome_back_subtitle}
          </p>
        </section>

        {/* 🏆 Practice Tournament Series & Leveled Mock Tests Card */}
        <section className="relative overflow-hidden bg-[#143867] text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-blue-900/40">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">science</span>
                Practice Tournament Series
              </span>
              <span className="bg-white/15 text-blue-100 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                8 Mock Tests • 24 Experiments
              </span>
              <span className="bg-white/15 text-blue-100 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                9 Questions per Test
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-snug text-white">
                Curiosity Practice Tournaments
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mt-1 max-w-2xl">
                Prepare for scientific inquiry with hands-on simulations and real-time telemetry. Practice hypothesis testing across two standardized difficulty levels:
              </p>
            </div>

            {/* Unified Level Taxonomy Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-2xl">
              <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-400/20 text-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-base">stairs</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">Level 1: Foundation</h4>
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                    Grades 6–8 • 5 Mins Pacing • 9 Questions
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-base">bolt</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">Level 2: Advanced</h4>
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                    Grades 9–10 • 10 Mins Pacing • 9 Questions
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <Link
                href="/tournaments"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-transform duration-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Select Mock Test</span>
              </Link>
              <Link
                href="/practice?mockTestId=1&start=true"
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95 transition-transform duration-100 cursor-pointer border border-white/15"
              >
                <span className="material-symbols-outlined text-base">science</span>
                <span>Launch Mock Test 1 (Optics)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 🗺️ Campus Map CTA Card */}
        <section>
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs hover:border-gray-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#fff7ed] border border-[#ffedd5] shadow-2xs flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl">🚌</span>
                <span className="text-[9px] font-black text-[#ea580c] uppercase tracking-wider">Kuppam</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white text-[10px] font-black uppercase tracking-wider">
                    Mobile Science Van
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#143867] text-white text-[10px] font-black uppercase tracking-wider">
                    Level {Math.floor((xp || 450) / 100) + 1} • {xp || 450} XP
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#143867] tracking-tight">
                  Agastya Kuppam Creative Campus Map
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Drive your Science Van across official campus landmarks from Entrance to VisionWorks!
                </p>
              </div>
            </div>

            <Link
              href="/campus-map"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-xs sm:text-sm shadow-xs transition-transform duration-100 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 w-full md:w-auto cursor-pointer"
            >
              <span>Open Campus Map</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Agastya Philosophy Card */}
        <section className="rounded-2xl bg-white border border-gray-200/90 p-5 sm:p-7 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] text-[10px] sm:text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              Agastya Philosophy
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#143867] tracking-tight leading-snug">
              &ldquo;Aah! Aha! Ha-ha!&rdquo; — Sparking Wonder & Joy in Science
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Our assessment moves beyond rote memorization. We measure curiosity quotient, inquiry resilience, and investigative initiative across 24 real-world experiments.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap">
            <Link
              href="/tournaments"
              className="min-h-[44px] px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xs sm:text-sm rounded-xl shadow-xs active:scale-95 transition-transform duration-100 flex items-center justify-center gap-2 flex-1 md:flex-initial cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">science</span>
              <span>Try Practice Lab</span>
            </Link>
            <Link
              href="/about"
              className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-gray-50 text-[#143867] border border-gray-300 font-bold text-xs sm:text-sm rounded-xl shadow-2xs active:scale-95 transition-transform duration-100 flex items-center justify-center gap-1 flex-1 md:flex-initial cursor-pointer"
            >
              <span>Our Mission</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </section>

        {/* Institutional Collaborations (Marquee) */}
        <section className="overflow-hidden bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <span className="text-[11px] font-black uppercase text-[#ea580c] tracking-wider">
              Institutional Collaborations
            </span>
            <p className="text-xs text-gray-500 font-medium">
              Official Academic Partners & Olympic Charters Worldwide
            </p>
          </div>
          <div className="flex overflow-hidden relative">
            <div className="animate-marquee flex items-center gap-4 py-1">
              {[...PARTNER_SCHOOLS, ...PARTNER_SCHOOLS].map((school, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl whitespace-nowrap shrink-0 shadow-2xs"
                >
                  <div className={`w-8 h-8 rounded-lg ${school.badgeColor || "bg-[#143867] text-white"} flex items-center justify-center shadow-2xs shrink-0 border border-gray-200`}>
                    {school.logo ? (
                      <img src={school.logo} alt={school.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <span className="text-sm font-bold">{school.emblem || "🏛️"}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#143867] leading-none">{school.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                      {school.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento 1: Tournaments & Mock Tests */}
          <Link 
            href="/tournaments"
            className="block text-left bg-white border border-gray-200/90 p-5 sm:p-6 rounded-2xl hover:border-gray-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] duration-100 cursor-pointer"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <div className="w-11 h-11 bg-[#eef2f7] border border-[#d1dbe5] rounded-xl flex items-center justify-center mb-4 text-[#143867]">
                  <span className="material-symbols-outlined text-2xl">emoji_events</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#143867] mb-1">
                  Tournaments &amp; Tests
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Browse all 8 curriculum mock tests with Level 1 (Grades 6–8) and Level 2 (Grades 9–10).
                </p>
              </div>
              <div className="flex items-center text-[#143867] font-bold text-xs gap-1 pt-2">
                <span>Browse All Tests</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Bento 2: National Leaderboard */}
          <Link 
            href="/leaderboard" 
            className="block text-left bg-white border border-gray-200/90 p-5 sm:p-6 rounded-2xl hover:border-gray-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] duration-100 cursor-pointer"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <div className="w-11 h-11 bg-[#fff7ed] border border-[#ffedd5] rounded-xl flex items-center justify-center mb-4 text-[#ea580c]">
                  <span className="material-symbols-outlined text-2xl">leaderboard</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#143867] mb-1">
                  National Leaderboard
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Compare your curiosity quotient, badges, and experimentation streaks against fellow students.
                </p>
              </div>
              <div className="flex items-center text-[#143867] font-bold text-xs gap-1 pt-2">
                <span>View Rankings</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Bento 3: Curiosity Profile */}
          <Link 
            href="/profile" 
            className="block text-left bg-white border border-gray-200/90 p-5 sm:p-6 rounded-2xl hover:border-gray-300 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] duration-100 cursor-pointer"
          >
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <div className="w-11 h-11 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center mb-4 text-emerald-700">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#143867] mb-1">
                  Curiosity Profile
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Analyze your 5-axis Curiosity Quotient report, superpower strengths, and telemetry history.
                </p>
              </div>
              <div className="flex items-center text-[#143867] font-bold text-xs gap-1 pt-2">
                <span>View Profile &amp; CQ</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Academic Streak & Daily Insights */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Academic Streak Box */}
          <div className="bg-[#143867] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[200px] border border-blue-900/40">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block mb-1">
                Academic Streak
              </span>
              <p className="text-3xl sm:text-4xl font-black">{streak}</p>

              {/* Weekly Day Tracker */}
              <div className="flex items-center gap-2 mt-4 mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                  const streakNum = parseInt(streak.split(" ")[0]) || 0;
                  const isHighlighted = i <= todayIdx && i >= todayIdx - streakNum + 1;
                  const isToday = i === todayIdx;

                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-blue-200 font-bold">{day}</span>
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isHighlighted 
                          ? "bg-amber-400 text-amber-950 font-black shadow-xs" 
                          : "bg-white/10 text-blue-200"
                      } ${isToday ? "ring-2 ring-white" : ""}`}>
                        {isHighlighted ? (
                          <span className="material-symbols-outlined text-sm">local_fire_department</span>
                        ) : (
                          <span className="material-symbols-outlined text-xs opacity-40">remove</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-blue-200 font-medium">Consistent curiosity leads to breakthroughs.</p>
            </div>
          </div>

          {/* Daily Insights & Modules Status */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200/90 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <span className="material-symbols-outlined">tips_and_updates</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#143867]">Daily Scientific Insight</h4>
                <p className="text-xs text-gray-600">The word &lsquo;Curiosity&rsquo; comes from the Latin &lsquo;curiosus&rsquo; — eager to know and investigate.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200/90 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#eef2f7] border border-[#d1dbe5] flex items-center justify-center text-[#143867] shrink-0">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#143867]">Standardized Curriculum Modules</h4>
                <p className="text-xs text-gray-600">8 official curriculum mock tests are calibrated with 9 questions and 3 experiments each.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Friends Activity Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-black text-[#143867] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ea580c] text-xl">group</span>
              Friends Activity
            </h3>
            <Link href="/discover" className="text-xs font-bold text-[#143867] hover:underline">
              See All Friends
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 md:p-6">
            {friendsActivity.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">person_add</span>
                <p className="text-sm font-bold text-gray-700">No recent activity from friends.</p>
                <p className="text-xs text-gray-500 mt-1 mb-4">Follow other explorers to see their progress here!</p>
                <Link 
                  href="/discover" 
                  className="min-h-[44px] inline-flex items-center justify-center bg-[#143867] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1e4a85] transition-transform duration-100 active:scale-95"
                >
                  Find Explorers
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {friendsActivity.map((activity, index) => {
                  const avatarUrl = getUserAvatar(activity.user_id);
                  
                  return (
                    <div key={index} className="flex items-center gap-3.5 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-800 truncate">
                          <Link href={`/profile/${activity.user_id}`} className="font-bold text-[#143867] hover:underline">
                            {activity.username}
                          </Link>
                          {" "}earned <span className="font-black text-[#ea580c]">+{activity.daily_xp} XP</span>
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(activity.last_claimed_date).toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}
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
        <section className="rounded-2xl bg-white border border-gray-200/90 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#143867] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl">share</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-[#143867]">Invite Classmates &amp; Friends</h4>
                <span className="bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  +100 XP
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Share the gift of curiosity! Challenge your classmates to experiential science tests.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              type="button"
              onClick={() => handleShare("whatsapp")}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#1EBE5D] transition-transform duration-100 shadow-xs active:scale-95 cursor-pointer"
              title="Share on WhatsApp"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => handleShare("twitter")}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 bg-[#1DA1F2] text-white rounded-xl text-xs font-bold hover:bg-[#0c85d0] transition-transform duration-100 shadow-xs active:scale-95 cursor-pointer"
              title="Share on X"
            >
              <span className="material-symbols-outlined text-sm">post</span>
              <span>X</span>
            </button>
            <button
              type="button"
              onClick={() => handleShare("native")}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 bg-[#143867] text-white rounded-xl text-xs font-bold hover:bg-[#1e4a85] transition-transform duration-100 shadow-xs active:scale-95 cursor-pointer"
              title="Copy link or share"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>{copied ? "Copied!" : "Share Link"}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Streamlined 5-Tab BottomNavBar Component (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-3 py-1.5 bg-white/95 backdrop-blur-xs border-t border-gray-200 z-50 shadow-lg">
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/dashboard"
          aria-label="Dashboard"
        >
          <div className="w-8 h-8 rounded-full bg-[#eef2f7] flex items-center justify-center text-[#143867]">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          </div>
          <span className="text-[10px] font-bold text-[#143867] mt-0.5">Home</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/tournaments"
          aria-label="Tournaments"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">emoji_events</span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Tests</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/practice?mockTestId=1&start=true"
          aria-label="Practice Lab"
        >
          <div className="w-8 h-8 rounded-full bg-[#ea580c] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-lg">science</span>
          </div>
          <span className="text-[10px] font-bold text-[#ea580c] mt-0.5">Lab</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/leaderboard"
          aria-label="Leaderboard"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">leaderboard</span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Ranks</span>
        </Link>
        <Link 
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] text-gray-500 hover:text-[#143867] active:scale-90 transition-transform duration-100" 
          href="/profile"
          aria-label="Profile"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
