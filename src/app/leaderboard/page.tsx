"use client";

import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      
      {/* TopAppBar Section */}
      <header className="fixed top-0 z-50 w-full bg-[#f7f9fb] h-16 flex items-center px-4 border-b border-gray-200">
        <Link 
          href="/dashboard"
          className="mr-4 text-[#143867] active:scale-95 duration-150 transition-colors hover:bg-gray-100 rounded-full p-2 flex items-center justify-center"
        >
          <span className="material-symbols-outlined leading-none">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold text-[#143867]">Global Standings</h1>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-20 pb-32 overflow-y-auto max-w-md mx-auto w-full hide-scrollbar">
        
        {/* Podium Section */}
        <section className="px-4 mb-10 pt-4 transition-all duration-700 ease-out">
          <div className="flex items-end justify-center gap-2 mb-6">
            
            {/* Rank 2 */}
            <div className="flex flex-col items-center flex-1 order-1">
              <div className="relative mb-2">
                <div className="w-20 h-20 rounded-full border-4 border-gray-200 overflow-hidden bg-white">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Scholar explorer"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP57RuXi2x5Oi-N6FJbYRupRRXvVm_KtcYT0HvUro2sl6D3VvjGuiJmgamB_bQu8-1nfS3AE5rwpsRmtb3zgody9KeS9jg_7nkd8NE2zrrd08c6cxj2gJkdaqSnOP02zMQ705jficGIloi34z7gC9C_fMItoys2EmQUYebVKU_Ss27Gob9Zzjf_YsscceVXX9wiaWHkZSER0oaiypYdtnSp-h4Bk42TFPWNmHQAgJm1ohSyXdDBnvenPVJFPE9KLTkdod3B_AXCtH9"
                  />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">2nd</div>
              </div>
              <p className="text-sm font-semibold text-[#143867] text-center truncate w-full">Hypatia_Q</p>
              <p className="text-xs text-gray-500 font-bold">14,820 pts</p>
              <div className="w-full h-16 bg-gray-200 rounded-t-lg mt-4 opacity-40"></div>
            </div>

            {/* Rank 1 */}
            <div className="flex flex-col items-center flex-1 order-2 z-10 scale-110 -translate-y-4 filter drop-shadow(0_10px_15px_rgba(20,56,103,0.1))">
              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full border-4 border-[#ffe16d] overflow-hidden bg-white shadow-[0_0_15px_rgba(255,215,0,0.25)]">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Senior researcher" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcmLovT--8_XlQTazvWKBCOfc0dSS5_1bCSrSpFh9Jmd09HI126PUu6RkERIyR6fZZj6O-ISPTe2QKjvIyEzJdmw_pVc4kJl0CS23C2aIbYpgaXFjbLyrqYu89g8Ni9-BluII1Z8q646xX8pkpaZfrecQrC5ftJLZJfJ-jOG1v9phLTfi8vV15qU_etbTZp1dGXlQsX9IVok7J6n0vkvNX_a9vESmKIMUnTvShWkV9As9HpULZxa740Gio0E5NJkRr5-Fdn0ix10Ye"
                  />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#705d00] text-4xl animate-bounce">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#ffe16d] text-[#221b00] text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">1st</div>
              </div>
              <p className="text-sm font-bold text-[#143867] text-center truncate w-full">Newton_II</p>
              <p className="text-xs text-[#705d00] font-extrabold">16,540 pts</p>
              <div className="w-full h-24 bg-[#ffe16d] rounded-t-lg mt-4 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[#221b00] opacity-20 text-4xl">school</span>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="flex flex-col items-center flex-1 order-3">
              <div className="relative mb-2">
                <div className="w-16 h-16 rounded-full border-4 border-gray-300 overflow-hidden bg-white">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Computer scientist" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2PGNFWl5qfR0NHVUZQ06W8-99rCeuDkAAOmAeci4Lf_zeVSq98O-IFSsnxE0yAhZVTYIBEfaEmmt6AsbHstoS3Gu36OYJFTxtJ4pxdAWoNGWdrRB_H4GKnzGMxIbM-E0GOhx4VmFcuu9wYQIcA4P_MRb7YEUdN-Y6KChtCRPmZBtFD07DrlS7OnbrnmrrS1E0S5bmEaiSFuJ_wqZGaUc-E0RVgLjcmeYtVzM7P_t7bsZ8fqeva-yIrAwYfyKpZgdhdsblowkAaPRK"
                  />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold">3rd</div>
              </div>
              <p className="text-sm font-semibold text-[#143867] text-center truncate w-full">Ada_Logic</p>
              <p className="text-xs text-gray-500 font-bold">13,100 pts</p>
              <div className="w-full h-12 bg-gray-200 rounded-t-lg mt-4 opacity-20"></div>
            </div>
          </div>
        </section>

        {/* Ranking List Section */}
        <section className="bg-white rounded-t-[32px] pt-8 px-4 min-h-[400px] border-t border-gray-200 transition-all duration-700 ease-out">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Top Explorers</h2>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-500 font-medium">Updated 2m ago</span>
          </div>
          
          <div className="space-y-2">
            
            {/* Rank 4 */}
            <div className="flex items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer active:scale-[0.98] duration-75">
              <span className="w-8 text-xl font-bold text-gray-300 group-hover:text-[#143867] transition-colors italic">4</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mx-3">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Scholar icon" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZSYWU27g4pkV0bkpRC3qzjSh5niW_Ixg-wHXvPPLEO-B4iYH2K_oP5VVA2QlXZ3zInK6DJ3_ix8Aen8sb8kjHpoTcjrQU57bOzZKAtclc_TWKS2bs5rRIBuT6Z0NCSM8PwXhFtq6ZH77mDLouTOXrpcdMA6PrFpHPUTo3W36zmHLcnYOCXoyMNsUMFWal6Jgd64pQdC2N-aAhoqUDI3prj7jAFnHA39T5PC3plKYB_sniWysIGDB7lwa9tM8M0wQdqgNsQ6gFUBzm"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-[#143867]">Curie_Spark</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">Logic Master</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#143867]">12,450</p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </div>

            {/* Rank 5 */}
            <div className="flex items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer active:scale-[0.98] duration-75">
              <span className="w-8 text-xl font-bold text-gray-300 italic">5</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mx-3">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Student" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgDdgIj2kgZ4Z1A5fyEXkvpJRFv8E2o6MhS6MkVDnTw_8H8oNvWKKMKM074Qxcl-aVQmS6K6mSx2W7Hm0tQBfbQlfiCIkLF38NODKq19TzBJkxD-oqAi-NdQxvQTQGLjlkFy9BGvFjvua83d880Pwq9gNGvnqgmGqS-LEibm3BKl8LKLpIKEQ0S5H1s74iAg0JcWaUD_btDHHyPQy9rRF93kCS1W_72ygMkSZWwIBJBxXOqn--2XPMJvV_YmUBmluH1FwlvDOOJJNo"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-[#143867]">Darwin_X</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">Silver Sage</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#143867]">11,920</p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </div>

            {/* Rank 6 */}
            <div className="flex items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer active:scale-[0.98] duration-75">
              <span className="w-8 text-xl font-bold text-gray-300 italic">6</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mx-3">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Researcher illustration" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTHj7OG-NoH7O7DQt5Mz7Hdngq2sTgICnBT9szI9FjE0L6himNTBFWflhcJWfywqSoZ0kJQiMCZpYU6CdJ8H_TSYxdw2XRnwDBAP-HD9iMjXZKrimKnc4unD6HFfSEfifCQrBm_1yf6Tw6b58pYLMf2UEty2vbSDUlhM3IsUGgj6PgL01TPSdVT6FWCHgdMxiCb1pWQHOKLFJhrr0XRduxNy4BxPb6VLY-ZfkjpHSnccacKEmf4jtjohc0CVK3otpvQAI3nnKP9DpF"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-[#143867]">Galileo_Eye</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">Logic Master</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#143867]">10,800</p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </div>

            {/* CURRENT USER: Rank 7 */}
            <div className="flex items-center p-4 rounded-xl bg-[#ffe16d] text-[#221b00] border border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.25)] relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[100px]">star</span>
              </div>
              <span className="w-8 text-xl font-black italic">7</span>
              <div className="w-12 h-12 rounded-full border-2 border-[#221b00] overflow-hidden mx-3 ring-2 ring-white">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Self portrait" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOUd8Wi9a5h1TV9-1SJu8O10qPztkjnel2zaVFZU_RhnWsfH4xAB5gxqt0v6vsZgJLej2op28pwg6uYf4-bl2IGBpISNmQyWTh1dn64DiJ57_EdLdka-5ze8LleOGNWHRhbwUB5yvjRss7OQBwp_I_3LPiorT4dtBEFlCZrnxeyjY6gVLGh30Vsd75ge82nUXBcydscRRCiaA-N4_ahHAh3NOKrksBE78w2bBTxit2JUusvfTo2icM0P6nK0TUrGzxpo3iTGL99KDZ"
                />
              </div>
              <div className="flex-grow">
                <h4 className="text-sm font-bold">You</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#221b00] text-[#ffe16d] font-bold uppercase tracking-tighter">Rising Genius</span>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">9,420</p>
                <p className="text-[10px] uppercase font-bold opacity-70">Points</p>
              </div>
            </div>

            {/* Rank 8 */}
            <div className="flex items-center p-3 rounded-xl border border-gray-100 opacity-60">
              <span className="w-8 text-xl font-bold text-gray-300 italic">8</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mx-3"></div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-[#143867]">Mendel_Pea</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">Silver Sage</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#143867]">8,100</p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </div>

            {/* Rank 9 */}
            <div className="flex items-center p-3 rounded-xl border border-gray-100 opacity-60">
              <span className="w-8 text-xl font-bold text-gray-300 italic">9</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mx-3"></div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-[#143867]">Tesla_Spark</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">Initiate</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#143867]">7,940</p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </div>

            {/* Rank 10 */}
            <div className="flex items-center p-3 rounded-xl border border-gray-100 opacity-60">
              <span className="w-8 text-xl font-bold text-gray-300 italic">10</span>
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mx-3"></div>
              <div className="flex-grow">
                <h4 className="text-sm font-semibold text-[#143867]">Hopper_Bug</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-tighter">Initiate</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#143867]">6,200</p>
                <p className="text-[10px] text-gray-400">pts</p>
              </div>
            </div>

          </div>

          {/* Insight Chip */}
          <div className="mt-8 mb-6 p-4 bg-[#ffe16d] rounded-xl border border-yellow-400 flex items-start gap-3 shadow-[0_0_15px_rgba(255,215,0,0.25)]">
            <span className="material-symbols-outlined text-[#221b00] mt-1">lightbulb</span>
            <div>
              <h5 className="text-sm font-bold text-[#221b00]">Eureka!</h5>
              <p className="text-xs text-[#544600] leading-relaxed">
                You're only 580 points away from Rank #6. Complete today's logic quest to climb higher!
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Clean 3-Tab BottomNavBar Component */}
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