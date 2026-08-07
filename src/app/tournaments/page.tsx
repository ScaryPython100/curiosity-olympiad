"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function TournamentsPage() {
  const { t } = useLanguage();
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      {/* Top App Bar */}
      <header className="bg-[#f7f9fb] sticky top-0 z-50 flex items-center justify-between px-4 w-full h-16 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="text-[#143867] hover:opacity-80 transition-opacity p-2 rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-[#143867]">{t("my_tournaments") || "My Tournaments"}</h1>
        </div>
        <button className="text-[#143867] hover:opacity-80 transition-opacity p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-32 pb-32 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-[#143867]">event_available</span>
        </div>
        <h2 className="text-2xl font-black text-[#143867] font-serif">Feature Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-[280px]">
          We are currently refining the tournaments experience. Please check back later for updates on upcoming events and mock tests!
        </p>
      </main>

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
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/settings">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </Link>
      </nav>

    </div>
  );
}