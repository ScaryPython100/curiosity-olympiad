"use client";

import Link from "next/link";

export default function TournamentsPage() {
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
          <h1 className="text-xl font-bold text-[#143867]">My Tournaments</h1>
        </div>
        <button className="text-[#143867] hover:opacity-80 transition-opacity p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-32 space-y-6">
        
        {/* Timeline Card */}
        <section>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">Application Progress</h2>
            <div className="space-y-6 relative">
              
              {/* Step 1 */}
              <div className="flex gap-4 relative">
                <div className="z-10 bg-[#4CAF50] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#191c1e]">Registration Submitted</h3>
                  <p className="text-xs text-gray-500">Completed on Aug 12, 2025</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 relative">
                <div className="z-10 bg-[#4CAF50] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#191c1e]">Account Validation</h3>
                  <p className="text-xs text-gray-500">Identity verified via Student ID</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 relative">
                <div className="z-10 bg-[#143867] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 ring-4 ring-blue-100">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#143867]">Entry Ticket</h3>
                  <p className="text-xs text-gray-500">Generated Successfully • Ready for Download</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Button */}
        <section>
          <button className="w-full bg-[#143867] text-white py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform">
            <span className="material-symbols-outlined">download</span>
            <span className="text-sm font-bold">Download Entry Ticket</span>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_activity</span>
          </button>
        </section>

        {/* Details Grid */}
        <section>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Examination Details</h2>
            <div className="grid grid-cols-1 gap-y-4">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#143867]">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Examination Date</p>
                  <p className="text-sm font-bold text-[#191c1e]">October 24, 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#143867]">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Assigned Slot</p>
                  <p className="text-sm font-bold text-[#191c1e]">Batch B (10:00 AM IST)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#705d00]">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cost</p>
                  <p className="text-sm font-bold text-[#191c1e]">Standard Access</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[#143867]">
                  <span className="material-symbols-outlined">laptop_windows</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Environment</p>
                  <p className="text-sm font-bold text-[#191c1e]">Safe Exam Browser Simulator Ready</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Simulation Preview Card */}
        <section>
          <Link href="/practice" className="block relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 active:scale-[0.99] transition-transform">
            <div className="absolute inset-0 bg-[#143867]/10 z-10" />
            <img 
              className="w-full h-full object-cover" 
              alt="Safe examination browser terminal preview" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX17Hg3SuW6zvBrse5uLQm5tM9jEYF7EmRta69_ihHFsjGuvB0cBo9pBUot8UxiX8issmEKAVqvlCtnQ1vBZ96So6tqaj1AxpTF3uSaFNMsWELCaYo-IGOBLKOkeyWyHEXoXjqdpBIuura7pvnSG3VI8XKhvsriOAdumb9fekMKjynwH9IW35EIMml3_qSDkMtPdmFXQmn-n5zUTCTHKNGiCjiyXPsq8AxVGWnjFDa2ttQQVg6iRKWeeaYORRspIaiOf1Q-2MFNM1b"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 z-20">
              <div className="text-white">
                <p className="text-sm font-bold">Practice Module</p>
                <p className="text-xs opacity-80 mt-0.5">Test your system before the big day</p>
              </div>
            </div>
          </Link>
        </section>

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