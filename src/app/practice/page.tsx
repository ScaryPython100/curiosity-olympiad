"use client";

import { useState } from "react";
import Link from "next/link";

export default function PracticeArenaPage() {
  const [activeFilter, setActiveFilter] = useState("All Puzzles");

  const categories = [
    "All Puzzles",
    "Logic & Riddles",
    "Scientific Mysteries",
    "Historical Anomalies",
    "Thought Experiments"
  ];

  return (
    <div className="flex flex-col min-h-screen text-[#191c1e] bg-white font-['Montserrat']">
      
      {/* TopAppBar */}
      <header className="bg-[#f7f9fb] sticky top-0 z-50 flex items-center justify-between px-4 w-full h-16 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            aria-label="Go back"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[#143867]">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-[#143867]">Practice Arena</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#143867]">notifications</span>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 pb-32">
        
        {/* Search and Filter Section */}
        <section className="space-y-6">
          {/* Search Bar */}
          <div className="relative group max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#143867] transition-colors">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffe16d] focus:border-[#143867] transition-all text-sm text-[#191c1e]"
              placeholder="Search for paradoxes, riddles or mysteries..."
              type="text"
            />
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-3 overflow-x-auto overflow-y-hidden hide-scrollbar pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                  activeFilter === category
                    ? "bg-[#143867] text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Quiz Cards List */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: The Fermi Paradox */}
          <article className="border border-gray-200 p-6 rounded-xl flex flex-col justify-between bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(255,215,0,0.15)]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#143867] text-3xl">rocket_launch</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#2f4f7f] text-[#a3c2f9] text-xs font-medium uppercase tracking-wider">
                  Hard
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#143867] leading-tight">The Fermi Paradox</h3>
                <p className="text-gray-600 text-sm">Where is everybody? Explore the chilling silence of the cosmos.</p>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">quiz</span>
                  <span>15 Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>12 Mins</span>
                </div>
              </div>
            </div>
            <button className="mt-8 w-full py-3 bg-[#143867] text-white text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Start Puzzle
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </article>

          {/* Card 2: Lateral Thinking Escape */}
          <article className="border border-gray-200 p-6 rounded-xl flex flex-col justify-between bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(255,215,0,0.15)]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#143867] text-3xl">extension</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#ffe16d] text-[#221b00] text-xs font-medium uppercase tracking-wider">
                  Medium
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#143867] leading-tight">Lateral Thinking Escape</h3>
                <p className="text-gray-600 text-sm">Solve riddles that require looking at the world from a different angle.</p>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">quiz</span>
                  <span>10 Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>10 Mins</span>
                </div>
              </div>
            </div>
            <button className="mt-8 w-full py-3 bg-[#143867] text-white text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Start Puzzle
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </article>

          {/* Card 3: Classic Thought Experiments */}
          <article className="border border-gray-200 p-6 rounded-xl flex flex-col justify-between bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(255,215,0,0.15)]">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#143867] text-3xl">psychology</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#d6e3ff] text-[#264776] text-xs font-medium uppercase tracking-wider">
                  Easy
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#143867] leading-tight">Classic Thought Experiments</h3>
                <p className="text-gray-600 text-sm">From Schrödinger's Cat to the Trolley Problem, test your ethics and logic.</p>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">quiz</span>
                  <span>12 Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>15 Mins</span>
                </div>
              </div>
            </div>
            <button className="mt-8 w-full py-3 bg-[#143867] text-white text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Start Puzzle
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </article>
        </section>

        {/* "Insight" Chip / Recommendation */}
        <div className="mt-12 bg-[#f7f9fb] p-6 border border-gray-200 rounded-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffe16d] opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#ffe16d] flex items-center justify-center text-[#221b00] shadow-sm">
            <span className="material-symbols-outlined text-3xl">lightbulb</span>
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-[#143867] mb-1">Recommended for You</h4>
            <p className="text-gray-600 text-sm">Based on your interest in Physics, check out our new module on "String Theory Foundations".</p>
          </div>
          <button className="md:ml-auto px-6 py-2 border-2 border-[#143867] text-[#143867] text-sm font-semibold rounded-lg hover:bg-[#143867] hover:text-white transition-all">
            Explore Insight
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-[#f7f9fb] border-t border-gray-200">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-gray-600 p-2 hover:bg-gray-100 transition-colors rounded-xl scale-95 active:scale-90">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs font-semibold">Home</span>
        </Link>
        <a className="flex flex-col items-center justify-center text-gray-600 p-2 hover:bg-gray-100 transition-colors rounded-xl scale-95 active:scale-90" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs font-semibold">Profile</span>
        </a>
        <a className="flex flex-col items-center justify-center text-gray-600 p-2 hover:bg-gray-100 transition-colors rounded-xl scale-95 active:scale-90" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-xs font-semibold">Settings</span>
        </a>
      </nav>
      {/* 1. Verify your top header button matches this Link tag: */}
      <Link 
        href="/dashboard"
        aria-label="Go back" 
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors"
      >
        <span className="material-symbols-outlined text-[#143867]">arrow_back</span>
      </Link>

      {/* ... rest of your practice layout content remains the same ... */}

      {/* 2. Replace the bottom Navigation Bar at the end of the file with this layout: */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">home</span>
          </div>
        </Link>
        <Link 
          href="/profile" 
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        <a 
          href="#" 
          className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </a>
      </nav>
    </div>
  );
}