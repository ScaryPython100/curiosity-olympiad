import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  // 1. AUTHENTICATION CHECK (Server-Side)
  // Example logic for when you connect Supabase:
  // const supabase = createClient();
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) {
  //   redirect("/login");
  // }

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat']">
      
      {/* TopAppBar Component */}
      <header className="w-full top-0 sticky bg-[#f7f9fb] border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 py-2 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#143867]">lightbulb</span>
            <h1 className="text-xl text-[#143867] font-bold tracking-tight">Curiosity Olympiad</h1>
          </div>
          <button className="text-gray-600 hover:bg-gray-200 transition-colors p-2 rounded-full active:scale-95 duration-150 ease-in-out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 pt-12 pb-32 max-w-7xl mx-auto w-full">
        
        {/* Welcome Header */}
        <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-2">
            <span className="bg-[#ffe16d] text-[#221b00] px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              Dashboard
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#143867] mb-2">Welcome Back, Explorer!</h2>
          <p className="text-gray-600 text-base">Your intellectual journey continues today. What will you discover?</p>
        </section>

        {/* Feature Grid: Bento-style Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
{/* My Tournaments */}
          <Link 
            href="/tournaments"
            className="block text-left bg-white border border-gray-200 p-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-[#dde3eb] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#ffe16d] transition-colors">
                  <span className="material-symbols-outlined text-[#2f4f7f]">emoji_events</span>
                </div>
                <h3 className="text-xl font-bold text-[#143867] mb-2">My Tournaments</h3>
                <p className="text-gray-600 text-base mb-6">View your active registrations and upcoming academic challenges.</p>
              </div>
              <div className="flex items-center text-[#143867] font-semibold text-sm gap-1">
                <span>Check Status</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Leaderboard Bento Card */}
          <Link 
            href="/leaderboard" 
            className="block text-left bg-white border border-gray-200 p-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group active:scale-[0.98]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-[#dde3eb] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#ffe16d] transition-colors">
                  <span className="material-symbols-outlined text-[#2f4f7f]">leaderboard</span>
                </div>
                <h3 className="text-xl font-bold text-[#143867] mb-2">Leaderboard</h3>
                <p className="text-gray-600 text-base mb-6">See how you rank against fellow explorers worldwide.</p>
              </div>
              <div className="flex items-center text-[#143867] font-semibold text-sm gap-1">
                <span>View Rankings</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>

          {/* Practice Tests */}
          <Link 
            href="/practice" 
            className="block text-left bg-white border border-gray-200 p-6 rounded-xl hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group md:col-span-2 lg:col-span-1 active:scale-[0.98]"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 bg-[#dde3eb] rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#ffe16d] transition-colors">
                  <span className="material-symbols-outlined text-[#2f4f7f]">edit_note</span>
                </div>
                <h3 className="text-xl font-bold text-[#143867] mb-2">Practice Tests</h3>
                <p className="text-gray-600 text-base mb-6">Sharpen your logic and knowledge with curated curiosity quizzes.</p>
              </div>
              <div className="flex items-center text-[#143867] font-semibold text-sm gap-1">
                <span>Start Practicing</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </Link>
        </section>

        {/* Stats / Atmospheric Section */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-[#143867] text-white p-10 flex flex-col justify-center min-h-[200px]">
            <div className="z-10">
              <h4 className="text-xl font-bold mb-2">Academic Streak</h4>
              <p className="text-5xl font-bold mb-2">12 Days</p>
              <p className="text-xs opacity-80">Consistent curiosity leads to breakthroughs.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined text-[180px]">history_edu</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-[#f2f4f6] border border-gray-200 p-6 rounded-xl flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-[#ffe16d] flex items-center justify-center text-[#221b00] shadow-sm">
                <span className="material-symbols-outlined">tips_and_updates</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#191c1e]">Daily Insight</h5>
                <p className="text-xs text-gray-600">The word 'Curiosity' comes from the Latin 'curiosus'.</p>
              </div>
            </div>
            
            <div className="bg-[#f2f4f6] border border-gray-200 p-6 rounded-xl flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-[#dde3eb] flex items-center justify-center text-[#143867] shadow-sm">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-[#191c1e]">Next Tournament</h5>
                <p className="text-xs text-gray-600">Starts in 3 days, 14 hours. Be ready!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Streamlined 3-Tab BottomNavBar Component */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-4 bg-[#f7f9fb] border-t border-gray-200 z-50">
        {/* Active Home Tab */}
        <Link className="flex items-center justify-center bg-[#ffe16d] text-[#221b00] rounded-full w-12 h-12 shadow-[0_0_20px_rgba(255,215,0,0.2)] active:scale-90 duration-200 transition-transform" href="/dashboard">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        </Link>
        
        {/* Profile Tab */}
        <Link className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="/profile">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
        </Link>
        
        {/* Settings Tab */}
        <a className="flex items-center justify-center text-gray-600 hover:text-[#143867] transition-all active:scale-90 duration-200" href="#">
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </a>
      </nav>
    </div>
  );
}