"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat']">
      {/* Header */}
      <header className="w-full top-0 sticky bg-[#f7f9fb]/90 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 py-3 w-full max-w-7xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-[#dde3eb] flex items-center justify-center text-[#143867] group-hover:bg-[#ffe16d] transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </div>
            <span className="text-sm font-bold text-[#143867]">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/agastya-logo.svg" alt="Agastya" className="w-5 h-5 object-contain" />
            <span className="text-sm font-bold text-[#143867] uppercase tracking-wider">Curiosity Olympiad</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-10 pb-28 max-w-5xl mx-auto w-full">
        {/* Hero Section */}
        <section className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 bg-[#ffe16d]/30 border border-[#ffe16d]/80 text-[#705d00] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-xs">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Inspired by Agastya International Foundation</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#143867] tracking-tight leading-tight mb-6">
            "Aah! Aha! Ha-ha!"
          </h1>
          <p className="text-lg md:text-xl font-bold text-[#2f4f7f] max-w-3xl mx-auto mb-4">
            Transforming Science Education from Rote Memorization into Experiential Wonder, Discovery & Joy.
          </p>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The Curiosity Olympiad is built on the revolutionary philosophy pioneered by the Agastya International Foundation — nurturing creative thinkers, problem solvers, and lifelong learners.
          </p>
        </section>

        {/* The 3 Pillars Section under the Umbrella of Care */}
        <div className="mb-6 bg-gradient-to-r from-[#f37021]/15 via-[#f37021]/20 to-[#f37021]/15 border-2 border-[#f37021] rounded-3xl p-6 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 bg-[#f37021] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-2 shadow-xs">
            <span className="material-symbols-outlined text-sm">favorite</span>
            <span>Under the Umbrella of Care</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#143867]">
            The 3 Pillars: Curiosity • Creativity • Confidence
          </h2>
          <p className="text-xs md:text-sm text-gray-700 max-w-2xl mx-auto mt-1 font-medium">
            Agastya&apos;s holistic educational framework nurtures the whole student—fostering deep scientific inquiry through genuine care and hands-on joy.
          </p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Curiosity Pillar */}
          <div className="bg-white border-2 border-[#f37021]/30 rounded-3xl p-8 shadow-xs hover:shadow-lg hover:border-[#f37021] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#f37021] text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
              </div>
              <span className="text-xs font-extrabold text-[#f37021] uppercase tracking-widest">Pillar 01 • Wonder</span>
              <h3 className="text-2xl font-black text-[#143867] mt-1 mb-3">&quot;Aah!&quot; — Curiosity</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sparking initial awe and questioning by confronting the mystery of natural phenomena. Before asking <em>how</em>, we celebrate the amazement of <em>why</em>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-[#143867]">
              <span className="material-symbols-outlined text-sm text-[#f37021]">verified</span>
              <span>Interactive Simulations</span>
            </div>
          </div>

          {/* Creativity Pillar */}
          <div className="bg-white border-2 border-[#f37021]/30 rounded-3xl p-8 shadow-xs hover:shadow-lg hover:border-[#f37021] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#143867] text-[#ffe16d] flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-3xl">lightbulb</span>
              </div>
              <span className="text-xs font-extrabold text-[#f37021] uppercase tracking-widest">Pillar 02 • Insight</span>
              <h3 className="text-2xl font-black text-[#143867] mt-1 mb-3">&quot;Aha!&quot; — Creativity</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Achieving sudden flashes of insight by innovating, actively experimenting with variables, observing cause-and-effect, and discovering scientific laws firsthand.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-[#143867]">
              <span className="material-symbols-outlined text-sm text-[#f37021]">verified</span>
              <span>Leveled Challenge Logic</span>
            </div>
          </div>

          {/* Confidence Pillar */}
          <div className="bg-white border-2 border-[#f37021]/30 rounded-3xl p-8 shadow-xs hover:shadow-lg hover:border-[#f37021] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#2f4f7f] text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-3xl">sentiment_very_satisfied</span>
              </div>
              <span className="text-xs font-extrabold text-[#f37021] uppercase tracking-widest">Pillar 03 • Mastery</span>
              <h3 className="text-2xl font-black text-[#143867] mt-1 mb-3">&quot;Ha-ha!&quot; — Confidence</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Celebrating discovery with self-belief, joyful mastery, and collaboration. Education becomes an empowering journey where students experiment without fear.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-[#143867]">
              <span className="material-symbols-outlined text-sm text-[#f37021]">verified</span>
              <span>Gamified Exploration XP</span>
            </div>
          </div>
        </section>

        {/* Experiential vs MCQ Section */}
        <section className="bg-gradient-to-br from-[#143867] to-[#0d2340] text-white rounded-3xl p-8 md:p-12 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#ffe16d]/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl relative z-10">
            <span className="bg-[#ffe16d] text-[#221b00] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Why Experiential Learning?
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold mt-4 mb-4 leading-tight">
              Beyond Standard MCQs: Hands-On Science for Every Grade
            </h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6">
              Traditional exams test memory; the Curiosity Olympiad tests intuitive reasoning and real-world scientific thinking. By interacting with virtual optical prisms, gravitational fields, and chemistry labs, students build genuine mental models.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-[#ffe16d] font-bold text-sm mb-1">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Leveled Difficulty</span>
                </div>
                <p className="text-xs text-blue-100">
                  Adaptive challenges tailored for multiple grade bands so every student finds their learning edge.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                <div className="flex items-center gap-2 text-[#ffe16d] font-bold text-sm mb-1">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Interactive Sandbox</span>
                </div>
                <p className="text-xs text-blue-100">
                  Manipulate lenses, test chemical reactions, and explore orbital physics in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Agastya Campus & Creativity Lab Spotlight */}
        <section className="bg-white border border-gray-200/80 rounded-3xl p-8 md:p-12 shadow-xs mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Our Foundation</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#143867] mt-1 mb-3">
                Agastya Campus Creativity Lab
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Operating one of the world's largest hands-on science education programs for economically disadvantaged children, Agastya's 172-acre campus in Kuppam, Andhra Pradesh, houses dedicated creativity labs, astronomy domes, and innovation centers.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                We bring this visionary Kuppam spirit to digital screens worldwide—partnering with progressive schools to cultivate scientific curiosity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
              <div className="bg-[#f7f9fb] border border-gray-200/60 p-5 rounded-2xl text-center">
                <p className="text-3xl font-black text-[#143867]">1.5M+</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Children Reached Yearly</p>
              </div>
              <div className="bg-[#f7f9fb] border border-gray-200/60 p-5 rounded-2xl text-center">
                <p className="text-3xl font-black text-[#ea580c]">172</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Acre Campus in Kuppam</p>
              </div>
              <div className="bg-[#f7f9fb] border border-gray-200/60 p-5 rounded-2xl text-center">
                <p className="text-3xl font-black text-[#2f4f7f]">500+</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Mobile Science Labs</p>
              </div>
              <div className="bg-[#f7f9fb] border border-gray-200/60 p-5 rounded-2xl text-center">
                <p className="text-3xl font-black text-[#143867]">100%</p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Experiential Focus</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Buttons */}
        <section className="text-center">
          <h4 className="text-xl font-extrabold text-[#143867] mb-4">Ready to Spark Your Inner Scientist?</h4>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 bg-[#143867] text-white font-bold px-8 py-4 rounded-full text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">science</span>
              <span>Start Interactive Practice Lab</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-[#143867] border border-gray-300 font-bold px-8 py-4 rounded-full text-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
