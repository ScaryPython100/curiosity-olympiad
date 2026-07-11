"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Check initial state
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
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
    <div className="bg-[#f7f9fb] dark:bg-gray-900 text-[#191c1e] dark:text-gray-100 min-h-screen pb-32 font-['Montserrat'] antialiased flex flex-col transition-colors duration-300">

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#f7f9fb] dark:bg-gray-900 h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <Link
          href="/dashboard"
          className="mr-4 text-[#143867] dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center"
        >
          <span className="material-symbols-outlined leading-none">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#143867] dark:text-blue-400 transition-colors duration-300">Settings</h1>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-4xl mx-auto w-full flex-grow">

        {/* Account Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1 transition-colors duration-300">Account</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">lock</span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Change Password</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl transition-colors duration-300">chevron_right</span>
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-5 transition-colors duration-300"></div>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">shield</span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Privacy Settings</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl transition-colors duration-300">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1 transition-colors duration-300">Appearance</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">
                  {isDarkMode ? "dark_mode" : "light_mode"}
                </span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Theme</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                  isDarkMode ? "bg-[#143867] dark:bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="px-5 pb-4">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium transition-colors duration-300">
                {isDarkMode ? "Dark mode enabled" : "Light mode enabled"}
              </span>
            </div>
          </div>
        </section>

        {/* Activity Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1 transition-colors duration-300">Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-5 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">history</span>
              <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Tournament History</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f0f4f8] dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#143867] dark:text-blue-400 transition-colors duration-300">science</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Physics</span>
                </div>
                <p className="text-xs font-bold text-[#143867] dark:text-gray-200 mb-1 transition-colors duration-300">Quantum Physics Mock</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden transition-colors duration-300">
                    <div className="h-full bg-[#143867] dark:bg-blue-400 rounded-full transition-colors duration-300" style={{ width: "88%" }}></div>
                  </div>
                  <span className="text-xs font-bold text-[#143867] dark:text-blue-400 transition-colors duration-300">88%</span>
                </div>
              </div>
              <div className="bg-[#f0f4f8] dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#143867] dark:text-blue-400 transition-colors duration-300">calculate</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Math</span>
                </div>
                <p className="text-xs font-bold text-[#143867] dark:text-gray-200 mb-1 transition-colors duration-300">Global Mathematics Cup</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden transition-colors duration-300">
                    <div className="h-full bg-[#ffe16d] dark:bg-yellow-400 rounded-full transition-colors duration-300" style={{ width: "94%" }}></div>
                  </div>
                  <span className="text-xs font-bold text-[#143867] dark:text-yellow-400 transition-colors duration-300">94%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1 transition-colors duration-300">Support</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">feedback</span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Send Feedback</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl transition-colors duration-300">chevron_right</span>
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-5 transition-colors duration-300"></div>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">help</span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Help Center</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl transition-colors duration-300">chevron_right</span>
            </button>
          </div>
        </section>

        {/* Legal Section */}
        <section className="mb-6">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1 transition-colors duration-300">Legal</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">description</span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Terms of Service</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl transition-colors duration-300">open_in_new</span>
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700 mx-5 transition-colors duration-300"></div>
            <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors active:bg-gray-100 dark:active:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#143867] dark:text-blue-400 transition-colors duration-300">policy</span>
                <span className="text-sm font-semibold text-[#143867] dark:text-gray-200 transition-colors duration-300">Privacy Policy</span>
              </div>
              <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 text-xl transition-colors duration-300">open_in_new</span>
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <section className="mb-6">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </section>

        {/* Version Info */}
        <div className="text-center mb-8">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold transition-colors duration-300">Curiosity Olympiad v2.4.1</p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 font-medium mt-0.5 transition-colors duration-300">Luminous Scholar Edition</p>
        </div>

      </main>

      {/* Global Fixed BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 bg-[#f7f9fb] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pb-2 z-50 transition-colors duration-300">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#143867] dark:hover:text-blue-400 transition-all"
        >
          <span className="material-symbols-outlined mb-1">home</span>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link
          href="/leaderboard"
          className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#143867] dark:hover:text-blue-400 transition-all"
        >
          <span className="material-symbols-outlined mb-1">emoji_events</span>
          <span className="text-[10px] font-semibold">Rankings</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#143867] dark:hover:text-blue-400 transition-all"
        >
          <span className="material-symbols-outlined mb-1">person</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </Link>
        <Link
          href="/settings"
          className="flex flex-col items-center justify-center bg-[#ffe16d] dark:bg-blue-600 text-[#221b00] dark:text-white rounded-full px-6 py-2 shadow-[0_0_15px_rgba(255,215,0,0.2)] dark:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="text-[10px] font-bold mt-0.5">Settings</span>
        </Link>
      </nav>

    </div>
  );
}
