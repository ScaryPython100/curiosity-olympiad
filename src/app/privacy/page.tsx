"use client";

import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function PrivacyPolicyPage() {
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
                <span className="material-symbols-outlined text-lg">shield</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-[#143867] leading-tight">
                  Student Privacy Policy
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#143867] text-xs font-bold">
            <span className="material-symbols-outlined text-sm text-blue-600">verified_user</span>
            <span>Written for Parents, Students &amp; Teachers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#143867] tracking-tight">
            Our Commitment to Student Privacy &amp; Safety
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            The <strong>Agastya Curiosity Olympiad &amp; Practice Lab</strong> is built by the{" "}
            <strong>Agastya International Foundation</strong>, an Indian educational trust dedicated
            to sparking curiosity and hands-on science learning among school students.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Because this platform is designed for young learners (primarily Grades 6 through 10),
            protecting student privacy is our top priority. We wrote this policy in plain, honest
            language so students, parents, and educators know exactly how data is handled.
          </p>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-700 text-xl shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="text-xs text-emerald-900 leading-relaxed space-y-1">
              <p className="font-bold">Our 3 Core Safety Guarantees:</p>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                <li>We <strong>never sell, rent, or trade</strong> student data to anyone.</li>
                <li>There are <strong>zero third-party advertisements</strong> on this platform.</li>
                <li>Public rankings show <strong>student nicknames only</strong>—never personal phone numbers or email addresses.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 1: What Data We Collect */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              What Information We Collect
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700">
            <p>We collect only the minimum information necessary to run the interactive practice lab:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[#143867] font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span>Student Nickname / Username</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A public handle chosen by the student (e.g., <em>CuriousCheetah42</em>). We strictly block email addresses or phone numbers as usernames to prevent accidental public disclosure.
                </p>
              </div>

              <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[#143867] font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">phonelink_lock</span>
                  <span>Email or Mobile Number (Private)</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Used solely to send one-time passcodes (OTP) for login and password recovery. This information is encrypted and never displayed publicly on leaderboards or profiles.
                </p>
              </div>

              <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[#143867] font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">school</span>
                  <span>School Code (Optional)</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Identifies the student's school so teachers and school administrators can view aggregate progress reports across their classes.
                </p>
              </div>

              <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[#143867] font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">how_to_reg</span>
                  <span>Parent / Teacher Consent Record</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A confirmation timestamp recording that a parent, guardian, or teacher approved the student's registration in compliance with child safety policies.
                </p>
              </div>

              <div className="bg-[#f7f9fb] border border-gray-200 rounded-xl p-4 space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 text-[#143867] font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">science</span>
                  <span>Practice Lab Activity &amp; Curiosity Telemetry</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  When students interact with virtual physics, optics, or chemistry simulations, we record experimental actions (e.g., trials attempted, variable adjustments, hypothesis reversals, dwell time, and answers). This data is analyzed to measure the student's <strong>Curiosity Quotient</strong> and award practice XP.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Why We Collect It */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Why We Collect This Data &amp; How It Is Used
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>We use student data exclusively to provide an educational experience:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong>Powering the Interactive Simulations:</strong> Enabling students to launch mock tests, record observations, and review results.
              </li>
              <li>
                <strong>Measuring Curiosity:</strong> Calculating the student's Curiosity Quotient based on how deeply they explore experiments rather than just memorizing answers.
              </li>
              <li>
                <strong>Tracking Growth &amp; Streaks:</strong> Showing students their accumulated XP, streaks, completed curriculum modules, and progress over time.
              </li>
              <li>
                <strong>School Roster Insights:</strong> Providing participating schools with aggregate reports (e.g., number of students who completed optics or gravity labs).
              </li>
              <li>
                <strong>Account Security:</strong> Allowing students or their guardians to safely log in and recover their passwords using verified OTPs.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Data Sharing & Protection */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              We Do Not Sell or Monetize Student Data
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              Agastya International Foundation is a non-profit educational institution. <strong>We do not sell, rent, commercialize, or share student data with advertisers or data brokers.</strong>
            </p>
            <p>
              We only work with trusted technical infrastructure providers (such as Supabase for secure cloud database hosting and Descope for authentication) bound by strict confidentiality and security agreements.
            </p>
          </div>
        </section>

        {/* Section 4: Public Leaderboard & Display Names */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              4
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Public Leaderboard Privacy
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              To celebrate effort and scientific exploration, our platform features national, daily, and weekly leaderboards.
            </p>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
              <p className="font-bold text-[#143867]">What is visible publicly on the leaderboard:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Student Nickname / Username (e.g. <em>QuantumExplorer99</em>)</li>
                <li>Curiosity Level &amp; XP points earned</li>
                <li>Streak days and achievement badges</li>
              </ul>
              <p className="font-bold text-[#ea580c] pt-1">What is NEVER visible publicly:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Real student name (unless a student explicitly generates an unshared certificate)</li>
                <li>Email address or phone number</li>
                <li>School affiliation code</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: Parental & Teacher Rights (Data Access & Deletion) */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              5
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Parent &amp; Educator Rights: Access and Deletion
            </h3>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              Parents, legal guardians, and school administrators have full authority over their children's accounts. At any time, you may:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Review the personal data and test history associated with your child's account.</li>
              <li>Request correction of any account details.</li>
              <li>
                <strong>Request complete and permanent deletion</strong> of the student's account, test submissions, and telemetry history.
              </li>
            </ul>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <h4 className="font-black text-xs sm:text-sm text-[#143867] flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-blue-600">delete_forever</span>
                How to Request Account or Data Deletion
              </h4>
              <p className="text-xs text-blue-900 leading-relaxed">
                Send an email to{" "}
                <a
                  href="mailto:privacy@agastya.org?subject=Curiosity%20Olympiad%20Data%20Deletion%20Request"
                  className="font-bold underline text-[#143867]"
                >
                  privacy@agastya.org
                </a>{" "}
                or{" "}
                <a
                  href="mailto:curiosity@agastya.org?subject=Curiosity%20Olympiad%20Data%20Deletion%20Request"
                  className="font-bold underline text-[#143867]"
                >
                  curiosity@agastya.org
                </a>{" "}
                mentioning:
              </p>
              <ol className="list-decimal list-inside text-xs text-blue-950 font-medium space-y-0.5 pl-2">
                <li>The student's username / nickname</li>
                <li>The registered email address or mobile number used at signup</li>
              </ol>
              <p className="text-[11px] text-blue-800 pt-1">
                We will verify the guardian or educator identity and completely purge the student record within <strong>7 business days</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Contact Information */}
        <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black text-sm">
              6
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#143867]">
              Contact Information
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              If you have any questions or feedback regarding our privacy practices, please contact us:
            </p>

            <div className="bg-[#f7f9fb] border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-2">
              <h4 className="font-black text-[#143867] text-sm">
                Agastya International Foundation
              </h4>
              <p className="text-xs text-gray-600">
                <strong>Head Office:</strong> #306, 2nd Floor, Embassy Square, 148 Infantry Road, Bengaluru, Karnataka 560001, India.
              </p>
              <p className="text-xs text-gray-600">
                <strong>Creativity Campus:</strong> Kuppam, Chittoor District, Andhra Pradesh 517425, India.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#143867]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">email</span>
                  <a href="mailto:curiosity@agastya.org" className="underline">curiosity@agastya.org</a>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">mail_lock</span>
                  <a href="mailto:privacy@agastya.org" className="underline">privacy@agastya.org</a>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">language</span>
                  <a href="https://www.agastya.org" target="_blank" rel="noopener noreferrer" className="underline">www.agastya.org</a>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation Links */}
        <div className="pt-4 pb-8 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200">
          <Link href="/terms" className="font-bold text-[#143867] hover:underline flex items-center gap-1">
            <span>View Terms of Service</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
          <Link href="/dashboard" className="font-bold text-gray-600 hover:text-[#143867] transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
