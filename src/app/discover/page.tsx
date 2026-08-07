"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { calculateLevelProgress } from "@/utils/gamification";
import { getUserAvatar } from "@/utils/userAvatar";
import { useLanguage } from "@/context/LanguageContext";

export default function DiscoverPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.trim().length === 0) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { searchUsers } = await import("@/app/actions/profile");
        const res = await searchUsers(debouncedQuery);
        if (res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      } finally {
        setIsSearching(false);
      }
    };
    if (!userLoading && userId) {
      search();
    }
  }, [debouncedQuery, userId, userLoading]);

  if (userLoading) {
    return (
      <div className="bg-[#f7f9fb] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143867]"></div>
      </div>
    );
  }

  const getAvatarUrl = (id: string) => {
    return getUserAvatar(id);
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen pb-32 font-['Montserrat'] antialiased">
      
      {/* TopAppBar */}
      <header className="sticky top-0 bg-[#f7f9fb] z-40 px-4 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#143867] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ea580c]">travel_explore</span>
          {t.discover.discover_explorers}
        </h1>
      </header>

      <main className="px-4 max-w-2xl mx-auto w-full pt-6">
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-400">search</span>
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus:border-[#143867] focus:ring-4 focus:ring-[#143867]/10 outline-none transition-all text-lg font-medium text-[#143867] placeholder-gray-400"
            placeholder={t.leaderboard.search_placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#143867]"></div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {debouncedQuery.trim().length > 0 && results.length === 0 && !isSearching && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">person_search</span>
              <p className="text-lg font-bold text-gray-500">{t.discover.no_explorers_found}</p>
              <p className="text-sm text-gray-400 mt-1">{t.discover.try_different_username}</p>
            </div>
          )}

          {debouncedQuery.trim().length === 0 && (
            <div className="text-center py-12 bg-transparent">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <span className="material-symbols-outlined text-4xl text-blue-300">group_add</span>
              </div>
              <p className="text-base font-bold text-gray-500">{t.discover.find_your_friends}</p>
              <p className="text-sm text-gray-400 mt-1">{t.discover.search_explorers_desc}</p>
            </div>
          )}

          {results.map((user) => {
            const { level } = calculateLevelProgress(user.xp);
            // Hide current user from search results
            if (user.userId === userId) return null;

            return (
              <Link 
                href={`/profile/${user.userId}`} 
                key={user.userId}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#143867]/30 transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-full border-2 border-gray-200 overflow-hidden flex-shrink-0">
                  <img src={getAvatarUrl(user.userId)} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-[#143867] text-lg">{user.username}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="bg-[#eef2f7] text-[#143867] px-2 py-0.5 rounded text-[10px] font-bold border border-[#d1dbe5] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">military_tech</span>
                      Lvl {level}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
                
                <div className="text-gray-400">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Global 5-Tab BottomNavBar */}
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
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/discover">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
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
