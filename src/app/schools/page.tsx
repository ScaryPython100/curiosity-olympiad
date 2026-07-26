"use client";

import { useState } from "react";
import Link from "next/link";

interface StudentAccount {
  id: string;
  realName: string;
  grade: string;
  rollNumber: string;
  nickname: string;
  accessCode: string;
}

export default function SchoolsPortalPage() {
  const [schoolName, setSchoolName] = useState("Agastya Kuppam Lab School");
  const [schoolCode, setSchoolCode] = useState("AGS-KUPPAM-101");
  const [grade, setGrade] = useState("8");
  const [csvText, setCsvText] = useState(
    `Aarav Sharma, 8, 01\nAnanya Iyer, 8, 02\nDevi Prasad, 8, 03\nKarthik Rao, 8, 04\nMeera Nair, 8, 05`
  );

  const [generatedAccounts, setGeneratedAccounts] = useState<StudentAccount[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      setSuccess(`Loaded CSV file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const generateAccounts = () => {
    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      const lines = csvText.trim().split("\n");
      const accounts: StudentAccount[] = [];

      lines.forEach((line, index) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 2) return; // skip empty or invalid

        const realName = parts[0];
        const studentGrade = parts[1] || grade;
        const rollNumber = parts[2] || String(index + 1).padStart(2, "0");

        const firstName = realName.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
        const nickname = `${firstName}_${studentGrade}_${rollNumber}`;
        const accessCode = `KUP${studentGrade}${rollNumber}`;

        accounts.push({
          id: `stu-${index + 1}`,
          realName,
          grade: studentGrade,
          rollNumber,
          nickname,
          accessCode,
        });
      });

      if (accounts.length === 0) {
        setError("No valid student rows found. Ensure format is: Name, Grade, Roll Number");
      } else {
        setGeneratedAccounts(accounts);
        setSuccess(`Successfully generated ${accounts.length} student credentials!`);
      }
    } catch (err: any) {
      setError("Error parsing roster data.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCsv = () => {
    if (generatedAccounts.length === 0) return;
    const headers = "Real Name,Nickname (Public),Grade,Roll Number,Access PIN,Login URL\n";
    const rows = generatedAccounts
      .map(
        (a) =>
          `"${a.realName}","${a.nickname}",${a.grade},${a.rollNumber},"${a.accessCode}","https://curiosity-olympiad.vercel.app/login"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${schoolCode}_roster_credentials.csv`;
    link.click();
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-['Montserrat']">
      {/* Top Header */}
      <header className="w-full top-0 sticky bg-[#f7f9fb]/90 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="flex justify-between items-center px-4 py-3 w-full max-w-7xl mx-auto">
          <Link href="/login" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-[#dde3eb] flex items-center justify-center text-[#143867] group-hover:bg-[#ffe16d] transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </div>
            <span className="text-sm font-bold text-[#143867]">Back to Login</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#143867]">school</span>
            <span className="text-sm font-bold text-[#143867] uppercase tracking-wider">
              School Bulk Login & Roster Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-10 pb-28 max-w-6xl mx-auto w-full">
        {/* Banner Section */}
        <section className="mb-10 text-center max-w-3xl mx-auto">
          <span className="bg-[#143867]/10 text-[#143867] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest">
            Partner Schools • Cohort Management
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#143867] mt-3 mb-3 leading-tight">
            Batch Generate Student Accounts
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            Upload your class CSV roster (`Name, Grade, Roll Number`) to generate privacy-protected accounts. Real names are reserved strictly for formal certificates, while nicknames are used on leaderboards.
          </p>
        </section>

        {/* Privacy Highlight Badge */}
        <section className="bg-gradient-to-r from-[#143867] to-[#2f4f7f] text-white rounded-2xl p-5 mb-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ffe16d] text-[#143867] flex items-center justify-center shrink-0 font-bold">
              <span className="material-symbols-outlined text-2xl">privacy_tip</span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#ffe16d]">Agastya Privacy Policy: Real Name vs. Nickname</h4>
              <p className="text-xs text-blue-100 mt-0.5">
                • <strong>Real Names</strong> are stored securely & used <em>exclusively</em> on earned Certificates (Rank 1).<br />
                • <strong>Nicknames</strong> (e.g. <code>Aarav_8_01</code>) are displayed on the public profile & leaderboard.
              </p>
            </div>
          </div>
          <span className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
            COPPA / GDPR Safe
          </span>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: CSV Input & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80">
              <h3 className="text-lg font-bold text-[#143867] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c]">tune</span>
                <span>School & Cohort Info</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                    School / Institution Name
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#143867]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                      School Code
                    </label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#143867]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-700 block mb-1">
                      Default Grade
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#143867]"
                    >
                      <option value="6">Grade 6</option>
                      <option value="7">Grade 7</option>
                      <option value="8">Grade 8</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-[#143867] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2f4f7f]">upload_file</span>
                  <span>Roster CSV Upload / Paste</span>
                </h3>
                <label className="bg-[#eef2f7] hover:bg-[#dde3eb] text-[#143867] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                  Upload .CSV
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Format: <code>Student Real Name, Grade, Roll Number</code> (1 per line).
              </p>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={7}
                className="w-full bg-[#f7f9fb] border border-gray-300 rounded-xl p-3 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#143867]"
                placeholder="e.g. Aarav Sharma, 8, 01&#10;Ananya Iyer, 8, 02"
              />

              <button
                onClick={generateAccounts}
                disabled={isGenerating}
                className="mt-4 w-full bg-[#143867] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1d4d8a] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>{isGenerating ? "Generating Accounts..." : "Generate Bulk Student Accounts"}</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Generated Accounts Roster Table */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-gray-200/80 min-h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-xl font-black text-[#143867]">
                      Generated Credential Roster
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {generatedAccounts.length > 0
                        ? `${generatedAccounts.length} students generated for ${schoolName}`
                        : "No accounts generated yet. Click generate on the left!"}
                    </p>
                  </div>

                  {generatedAccounts.length > 0 && (
                    <button
                      onClick={downloadCsv}
                      className="bg-[#ffe16d] text-[#705d00] font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-[#ffd633] transition-colors shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Download Roster CSV</span>
                    </button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 border border-red-200 p-3 rounded-xl text-xs font-semibold mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-700 border border-green-200 p-3 rounded-xl text-xs font-semibold mb-4">
                    {success}
                  </div>
                )}

                {generatedAccounts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-[11px] font-extrabold uppercase text-gray-400">
                          <th className="py-2.5 px-3">Roll #</th>
                          <th className="py-2.5 px-3">Real Name (Cert Only)</th>
                          <th className="py-2.5 px-3">Public Nickname</th>
                          <th className="py-2.5 px-3">Grade</th>
                          <th className="py-2.5 px-3">Access PIN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {generatedAccounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-gray-500">{acc.rollNumber}</td>
                            <td className="py-3 px-3 font-semibold text-gray-800">{acc.realName}</td>
                            <td className="py-3 px-3">
                              <span className="bg-[#143867]/10 text-[#143867] px-2 py-0.5 rounded font-mono font-bold">
                                {acc.nickname}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold">{acc.grade}</td>
                            <td className="py-3 px-3 font-mono font-bold text-[#ea580c]">{acc.accessCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">groups</span>
                    <p className="text-sm font-bold text-gray-600">No Roster Generated Yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Use the default test data on the left or upload your school's CSV file and click "Generate Bulk Student Accounts".
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions Footer */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>School Portal Version 1.0 • Agastya Roster Sync</span>
                <Link href="/dashboard" className="text-[#143867] font-bold hover:underline">
                  Go to Dashboard →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
