"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExplorerProfilePage() {
  const [progressWidth, setProgressWidth] = useState("0%");

  // Smooth progress bar animation trigger on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth("75%");
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#ffffff] text-[#191c1e] min-h-screen pb-32 font-['Montserrat']">
      
      {/* TopAppBar */}
      <header className="bg-[#f7f9fb] fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 border-b border-gray-200">
        <Link 
          href="/dashboard"
          className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-full active:scale-95 transition-transform flex items-center justify-center"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#143867]">Explorer Profile</h1>
        <div className="w-10"></div> {/* Spacer for centering layout */}
      </header>

      {/* Main Container */}
      <main className="pt-24 px-4 space-y-6 max-w-2xl mx-auto">
        
        {/* Level Progress Card */}
        <section className="border border-gray-200 bg-white rounded-xl p-6 space-y-4 overflow-hidden relative active:scale-[0.99] transition-transform duration-100">
          {/* Decorative Lightbulb Accent */}
          <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-[#705d00]">lightbulb</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2f4f7f] flex items-center justify-center text-white shadow-sm border-2 border-[#143867]">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#143867]">Level 4: Super Scholar</h2>
              <p className="text-sm font-semibold text-gray-500">Advanced Explorer Status</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm font-semibold text-[#143867]">
              <span>Progress</span>
              <span>750 / 1000 XP</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-[#143867] h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: progressWidth }}
              ></div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="inline-flex items-center bg-[#ffe16d] px-3 py-1 rounded-full text-xs font-bold text-[#221b00] shadow-[0_0_15px_0px_rgba(255,215,0,0.2)]">
              <span className="material-symbols-outlined text-base mr-1">auto_awesome</span>
              2,450 Curiosity Points
            </div>
            <button className="text-[#143867] font-bold text-sm flex items-center hover:underline">
              View Benefits <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Achievements Grid */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#143867] flex items-center">
            <span className="material-symbols-outlined mr-2">workspace_premium</span>
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Paradox Popper Badge */}
            <div className="border border-gray-200 bg-white rounded-lg p-4 flex flex-col items-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.99]">
              <div className="w-12 h-12 rounded-full bg-[#ffe16d] flex items-center justify-center text-[#221b00] shadow-[0_0_15px_0px_rgba(255,215,0,0.2)]">
                <span className="material-symbols-outlined text-2xl">extension</span>
              </div>
              <span className="text-sm font-bold text-[#143867]">Paradox Popper</span>
              <span className="text-xs text-gray-500">Solved a Grade-A complexity mystery.</span>
            </div>

            {/* Streak Master Badge */}
            <div className="border border-gray-200 bg-white rounded-lg p-4 flex flex-col items-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer active:scale-[0.99]">
              <div className="w-12 h-12 rounded-full bg-[#ffe16d] flex items-center justify-center text-[#221b00] shadow-[0_0_15px_0px_rgba(255,215,0,0.2)]">
                <span className="material-symbols-outlined text-2xl">local_fire_department</span>
              </div>
              <span className="text-sm font-bold text-[#143867]">Streak Master</span>
              <span className="text-xs text-gray-500">Maintained focus for 10 straight days.</span>
            </div>

            {/* Cosmic Explorer Badge (Locked) */}
            <div className="border border-gray-200 bg-gray-100 rounded-lg p-4 flex flex-col items-center text-center space-y-2 opacity-60 grayscale relative overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <span className="text-sm font-bold text-gray-500">Cosmic Explorer</span>
              <span className="text-xs text-gray-400">Explore 5 outer-space modules.</span>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200/30 backdrop-blur-[1px]">
                <span className="material-symbols-outlined text-[#143867] text-xl">lock</span>
              </div>
            </div>

            {/* Hidden Badge / Unlock More */}
            <div className="border border-dashed border-gray-300 bg-white rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-gray-50 transition-colors cursor-pointer group active:scale-[0.99]">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#143867] transition-colors">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <span className="text-xs text-gray-500">Unlock More</span>
            </div>

          </div>
        </section>

        {/* Activity Log */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-[#143867] flex items-center">
            <span className="material-symbols-outlined mr-2">history_edu</span>
            Scholarly Journey
          </h3>
          <div className="border border-gray-200 bg-white rounded-xl divide-y divide-gray-100 overflow-hidden">
            
            {/* Entry 1 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-2 rounded-lg text-[#143867]">
                  <span className="material-symbols-outlined">neurology</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#143867]">Solved The Fermi Paradox</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#2f4f7f]">+50 XP</span>
            </div>

            {/* Entry 2 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-2 rounded-lg text-[#143867]">
                  <span className="material-symbols-outlined">login</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#143867]">Daily Login Reward</p>
                  <p className="text-xs text-gray-400">Today, 08:30 AM</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#2f4f7f]">+20 XP</span>
            </div>

            {/* Entry 3 */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-50 p-2 rounded-lg text-[#705d00]">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#143867]">5 Day Streak Bonus</p>
                  <p className="text-xs text-gray-400">Yesterday</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#2f4f7f]">+100 XP</span>
            </div>

          </div>

          <div className="text-center pt-2">
            <button className="text-xs font-extrabold text-[#143867] hover:text-[#2f4f7f] transition-colors uppercase tracking-wider">
              Full Log History
            </button>
          </div>
        </section>

      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white flex justify-around items-center px-4 py-2 border-t border-gray-200 shadow-sm">
        <Link 
          href="/dashboard" 
          className="flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-all p-2 rounded-lg scale-95 active:scale-90"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-semibold">Home</span>
        </Link>
        <Link 
          href="/profile" 
          className="flex flex-col items-center justify-center text-[#143867] font-bold p-2 rounded-lg bg-gray-100 scale-95 active:scale-90"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="text-xs font-semibold">Profile</span>
        </Link>
        <a 
          href="#" 
          className="flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-all p-2 rounded-lg scale-95 active:scale-90"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-semibold">Settings</span>
        </a>
      </nav>
      
    </div>
  );
}
=======
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { calculateLevelProgress } from "@/utils/gamification";

export default function ProfilePage() {
  const [userStats, setUserStats] = useState({ xp: 0, points: 0 });
  const [loading, setLoading] = useState(true);

  const { level, progressPercentage } = calculateLevelProgress(userStats.xp);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_gamification")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setUserStats({
            xp: data.xp,
            points: data.curiosity_points
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f4f6] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Placeholder */}
            <div className="w-32 h-32 bg-[#143867] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              JS
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl font-bold text-[#143867]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Junior Scientist
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="bg-[#eef2f7] text-[#143867] px-4 py-1.5 rounded-full text-sm font-bold border border-[#d1dbe5]">
                  Level {level}: {level >= 4 ? 'Super Scholar' : 'Rising Star'}
                </span>
                <span className="bg-[#fff7ed] text-[#ea580c] px-4 py-1.5 rounded-full text-sm font-bold border border-[#ffedd5]">
                  ✨ {userStats.points.toLocaleString()} Curiosity Points
                </span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-10 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Level Progress</span>
              <span className="text-lg font-bold text-[#143867]">{Math.floor(progressPercentage)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#143867] to-[#2f4f7f] rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-400">
              <span>LEVEL {level}</span>
              <span>LEVEL {level + 1}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total XP', value: userStats.xp.toLocaleString(), icon: '🏆', color: 'bg-blue-50 text-blue-600' },
            { label: 'Achievements', value: '12', icon: '🏅', color: 'bg-purple-50 text-purple-600' },
            { label: 'Rank', value: '#42', icon: '🌐', color: 'bg-emerald-50 text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</p>
                <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
>>>>>>> origin/fix/tailwind-v4-compilation-10150342263099661762
