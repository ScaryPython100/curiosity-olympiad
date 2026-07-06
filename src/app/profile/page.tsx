"use client";

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
