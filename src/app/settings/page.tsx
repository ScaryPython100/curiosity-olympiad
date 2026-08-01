"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Real, functional Agastya learning preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    // Ensure document never has orphaned dark mode class from past sessions
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");

    const savedSound = localStorage.getItem("agastya_sound_enabled");
    if (savedSound !== null) setSoundEnabled(savedSound === "true");

    const savedReminders = localStorage.getItem("agastya_reminders_enabled");
    if (savedReminders !== null) setRemindersEnabled(savedReminders === "true");

    const savedEffects = localStorage.getItem("agastya_effects_enabled");
    if (savedEffects !== null) setEffectsEnabled(savedEffects === "true");
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("agastya_sound_enabled", String(next));
  };

  const toggleReminders = () => {
    const next = !remindersEnabled;
    setRemindersEnabled(next);
    localStorage.setItem("agastya_reminders_enabled", String(next));
  };

  const toggleEffects = () => {
    const next = !effectsEnabled;
    setEffectsEnabled(next);
    localStorage.setItem("agastya_effects_enabled", String(next));
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#143867] min-h-screen pb-32 font-['Montserrat'] antialiased flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#f7f9fb] h-16 flex items-center px-4 border-b border-gray-200">
        <Link
          href="/dashboard"
          className="mr-4 text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center"
        >
          <span className="material-symbols-outlined leading-none">arrow_back</span>
        </Link>
        <h1 className="text-xl font-black text-[#143867]">Settings &amp; Preferences</h1>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-4xl mx-auto w-full flex-grow space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Account &amp; Security</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867]">lock</span>
                <span className="text-sm font-bold text-[#143867]">Change Password</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">chevron_right</span>
            </button>
            <div className="h-px bg-gray-100 mx-5"></div>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867]">shield</span>
                <span className="text-sm font-bold text-[#143867]">Privacy &amp; Data Sharing</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Learning & Lab Preferences Section (Replaced Broken Dark Mode Toggle) */}
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Learning &amp; Lab Preferences</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#f37021]">volume_up</span>
                <div>
                  <h4 className="text-sm font-bold text-[#143867]">Science Van &amp; Lab Sound Effects</h4>
                  <p className="text-[11px] text-gray-500">Audio feedback for the Honk Van 🎺 button and milestone badges</p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  soundEnabled ? "bg-[#143867]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Daily Hypothesis Reminders Toggle */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-500">lightbulb</span>
                <div>
                  <h4 className="text-sm font-bold text-[#143867]">Daily Curiosity Journal Reminders</h4>
                  <p className="text-[11px] text-gray-500">Gentle prompts to log a daily &ldquo;Why?&rdquo; question or hypothesis</p>
                </div>
              </div>
              <button
                onClick={toggleReminders}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  remindersEnabled ? "bg-[#143867]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    remindersEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Confetti & Particle Effects Toggle */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600">celebration</span>
                <div>
                  <h4 className="text-sm font-bold text-[#143867]">Celebration Confetti &amp; Particle Effects</h4>
                  <p className="text-[11px] text-gray-500">Smooth visual celebrations when reaching new levels or earning badges</p>
                </div>
              </div>
              <button
                onClick={toggleEffects}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  effectsEnabled ? "bg-[#143867]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    effectsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Activity Section */}
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Recent Assessment Progress</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#143867]">history</span>
              <span className="text-sm font-bold text-[#143867]">Practice Lab Mastery</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f0f4f8] rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#143867]">science</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Physics</span>
                </div>
                <p className="text-xs font-bold text-[#143867] mb-1">Quantum Physics Mock</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#143867] rounded-full" style={{ width: "88%" }}></div>
                  </div>
                  <span className="text-xs font-black text-[#143867]">88%</span>
                </div>
              </div>
              <div className="bg-[#f0f4f8] rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#143867]">calculate</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Math</span>
                </div>
                <p className="text-xs font-bold text-[#143867] mb-1">Global Mathematics Cup</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#f37021] rounded-full" style={{ width: "94%" }}></div>
                  </div>
                  <span className="text-xs font-black text-[#143867]">94%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Support &amp; Feedback</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867]">feedback</span>
                <span className="text-sm font-bold text-[#143867]">Send Feedback to Agastya Instructors</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">chevron_right</span>
            </button>
            <div className="h-px bg-gray-100 mx-5"></div>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867]">help</span>
                <span className="text-sm font-bold text-[#143867]">Curiosity Olympiad Help Center</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Legal Section */}
        <section>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Legal</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867]">description</span>
                <span className="text-sm font-bold text-[#143867]">Terms of Service</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">open_in_new</span>
            </button>
            <div className="h-px bg-gray-100 mx-5"></div>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867]">policy</span>
                <span className="text-sm font-bold text-[#143867]">Privacy Policy</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-xl">open_in_new</span>
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <section>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white rounded-2xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </section>

        {/* Version Info */}
        <div className="text-center pb-6">
          <p className="text-xs text-gray-500 font-bold">Curiosity Olympiad v2.5.0</p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">Agastya Luminous Scholar Edition</p>
        </div>
      </main>

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
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/profile">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/settings">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
        </Link>
      </nav>
    </div>
  );
}
