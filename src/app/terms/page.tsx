"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat'] antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[#143867] hover:bg-gray-100 p-2 rounded-full active:scale-95 transition-all flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#143867] text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">description</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-[#143867] leading-tight">
                  Terms of Service
                </h1>
                <p className="text-[10px] text-gray-500 font-semibold">
                  Agastya International Foundation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 flex-1">
        {/* Hero Card */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <span className="material-symbols-outlined text-sm text-amber-600">lightbulb</span>
            <span>Educational Practice Guidelines</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#143867] tracking-tight">
            Terms of Use for Students &amp; Educators
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Welcome to the <strong>Agastya Curiosity Olympiad &amp; Practice Lab</strong>. These Terms
            govern access to and participation in our non-profit educational simulations and practice tournaments.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            By creating an account or accessing the lab, students, guardians, and participating teachers
            agree to these terms, which are intended to maintain a safe, inspiring, and respectful learning community.
          </p>
        </section>

        {/* Section 1: Non-Profit Mission */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#143867] border border-blue-200 flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Purpose: Non-Commercial Science Learning
            </h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              This platform is an experiential educational tool provided free of charge by Agastya International Foundation. Its mission is to encourage creative scientific thinking through Agastya&apos;s <em>Aah! Aha! Ha-ha!</em> philosophy.
            </p>
            <p>
              The Practice Lab and its mock tests are strictly educational simulations. Performance scores, Curiosity Quotients, and practice certificates celebrate scientific inquiry and do not guarantee admission, formal academic credit, or qualification for external examinations.
            </p>
          </div>
        </section>

        {/* Section 2: Eligibility & Parental Consent */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#143867] border border-blue-200 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Student Eligibility &amp; Guardian Consent
            </h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              The platform is tailored for school students in Grades 6 through 10.
            </p>
            <p>
              Because our users are primarily minors, any student creating an account must have the explicit permission of a parent, legal guardian, or authorized school educator. Account holders are responsible for maintaining the confidentiality of their login credentials.
            </p>
          </div>
        </section>

        {/* Section 3: Safe & Respectful Community */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#143867] border border-blue-200 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Community Conduct &amp; Fair Play
            </h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>To ensure a positive environment for all learners, users agree to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Choose a respectful, child-friendly nickname that contains no offensive language or personal contact details.</li>
              <li>Engage with the virtual simulations authentically without using automated bots, scripts, or score manipulation tools.</li>
              <li>Treat fellow students with respect in social features (such as following friends on the leaderboard).</li>
            </ul>
            <p className="text-xs text-gray-500 pt-1">
              Agastya reserves the right to reset scores or deactivate accounts that violate fair-play standards.
            </p>
          </div>
        </section>

        {/* Section 4: Intellectual Property */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#143867] border border-blue-200 flex items-center justify-center font-black text-sm">
              4
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Intellectual Property &amp; Content
            </h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              All curriculum modules, experiment designs, physics and chemistry engines, graphics, audio, Kuppu the mascot, and the Agastya logo are the intellectual property of Agastya International Foundation.
            </p>
            <p>
              Students and educators are granted a non-exclusive license to use these materials for personal learning and classroom teaching. Commercial redistribution or reverse-engineering is strictly prohibited.
            </p>
          </div>
        </section>

        {/* Section 5: Disclaimers & Contact */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#143867] border border-blue-200 flex items-center justify-center font-black text-sm">
              5
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Privacy &amp; Contact Information
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              Our collection and handling of personal data is governed by our{" "}
              <Link href="/privacy" className="font-bold text-[#143867] underline">
                Student Privacy Policy
              </Link>
              , which forms part of these Terms.
            </p>
            <p>
              For questions, school partnerships, or support:
            </p>
            <div className="p-4 bg-[#f7f9fb] border border-gray-200 rounded-xl space-y-1">
              <p className="font-bold text-[#143867]">Agastya International Foundation</p>
              <p className="text-gray-600">Email: <a href="mailto:curiosity@agastya.org" className="underline font-semibold">curiosity@agastya.org</a></p>
              <p className="text-gray-600">Website: <a href="https://www.agastya.org" target="_blank" rel="noopener noreferrer" className="underline font-semibold">www.agastya.org</a></p>
            </div>
          </div>
        </section>

        {/* Footer Navigation Links */}
        <div className="pt-4 pb-8 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200">
          <Link href="/privacy" className="font-bold text-[#143867] hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            <span>View Student Privacy Policy</span>
          </Link>
          <Link href="/dashboard" className="font-bold text-gray-600 hover:text-[#143867] transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
