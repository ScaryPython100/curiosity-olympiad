"use client";

import { useState } from "react";
import Link from "next/link";

export default function PracticePage() {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);
    
    setTimeout(() => {
      alert("Safe Exam Browser Simulator Initiated. Simulating Fullscreen Environment Lock...");
      setIsLaunching(false);
    }, 1500);
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      {/* TopAppBar */}
      <header className="bg-[#f7f9fb] border-b border-gray-200 flex items-center justify-between px-4 w-full h-16 fixed top-0 z-50">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-[#143867] hover:bg-gray-100 transition-colors p-2 rounded-full active:scale-95 flex items-center justify-center"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-[#143867]">Exam Environment Simulator</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-md mx-auto px-4 pt-24 pb-32 space-y-6">
        
        {/* Header Illustration/Banner */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img 
            className="w-full h-full object-cover opacity-90" 
            alt="Minimalist academic workspace simulation screen" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtFX9M7vA8sByjQgZhNp4DrtvkLrWH2Yu5leGRQ631Ftjh0VjGsHnhAaDfQMus83OJ5ZE1t-QVzhOalXmn8L_jf4mI8KD5TPPliIY41QqhHBVJTIbYnBIwKaf-7l_QyJkFkcVJZdzbrdun92ZuLkIXLhQpXXUJpEH1i5oGeLr8JMQXPrN67snwsxD4AauotDdVHA7hXzG4fbwKJZ4cWKfcAPL5OmXM3NJG2EIIVfd44bHVMHv9FVF6Omap9rMBe9FUhmWDn0utL0iu"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#143867]/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#ffe16d] text-[#221b00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.15)]">
              CALIBRATION READY
            </span>
          </div>
        </div>

        {/* System & Proctoring Check Card */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#143867]">verified_user</span>
            <h2 className="text-lg font-bold text-[#143867]">System & Proctoring Check</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm font-medium text-gray-800">Browser Compatibility</span>
              </div>
              <span className="text-xs font-bold text-green-700 uppercase">Verified</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm font-medium text-gray-800">Screen Resolution</span>
              </div>
              <span className="text-xs font-bold text-green-700 uppercase">Verified</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm font-medium text-gray-800">Proctoring Permission</span>
              </div>
              <span className="text-xs font-bold text-green-700 uppercase">Allowed</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 flex gap-1 items-start">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Camera and Microphone have been successfully initialized.
          </p>
        </section>

        {/* Exam Rules & Guidelines */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#143867]">description</span>
            <h2 className="text-lg font-bold text-[#143867]">Exam Rules & Guidelines</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#705d00]">
              <p className="text-sm text-gray-700 leading-relaxed">
                This is an exact <span className="font-bold">15-minute calibration mock test</span> simulating the one-time final Olympiad conditions.
              </p>
            </div>
            
            <div className="flex items-start gap-3 text-[#ba1a1a]">
              <span className="material-symbols-outlined mt-0.5">warning</span>
              <p className="text-sm leading-tight">
                <span className="font-bold">Note:</span> Tab-switching or exiting fullscreen will trigger proctoring alerts. Multiple infractions will terminate the session.
              </p>
            </div>
            
            <ul className="space-y-2 pt-2 border-t border-gray-100">
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-1.5 h-1.5 bg-[#143867] rounded-full" />
                <span className="text-xs font-medium">Ensure a stable internet connection.</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-1.5 h-1.5 bg-[#143867] rounded-full" />
                <span className="text-xs font-medium">Find a quiet environment without background chatter.</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <span className="w-1.5 h-1.5 bg-[#143867] rounded-full" />
                <span className="text-xs font-medium">Keep your face clearly visible to the camera at all times.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Launch Button Action Layout */}
        <div className="py-2">
          <button 
            onClick={handleLaunch}
            disabled={isLaunching}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-wider ${
              isLaunching ? 'bg-[#705d00]' : 'bg-[#143867] hover:bg-[#2f4f7f]'
            }`}
          >
            {isLaunching ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Securing Environment...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                Launch Safe Exam Browser Simulator
              </>
            )}
          </button>
          <p className="text-center text-xs font-medium text-gray-400 mt-3">
            By clicking launch, you agree to the proctoring terms.
          </p>
        </div>
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