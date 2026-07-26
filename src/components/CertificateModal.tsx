"use client";

import { useState } from "react";

export type RankCertificateType = 
  | "Daily Rank 1"
  | "Weekly Rank 1" 
  | "Monthly Rank 1" 
  | "Olympiad Champion" 
  | "National Finalist";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentRealName: string;
  achievementType: RankCertificateType;
  awardDate: string;
  certificateId?: string;
  isEligible?: boolean;
  userRank?: number | null;
  onUpdateRealName?: (name: string) => void;
}

export default function CertificateModal({
  isOpen,
  onClose,
  studentRealName,
  achievementType,
  awardDate,
  certificateId = "AGY-OLY-2026-0001",
  isEligible = false,
  userRank,
  onUpdateRealName,
}: CertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [customRealName, setCustomRealName] = useState("");
  const [nameInput, setNameInput] = useState("");

  const displayName = customRealName || studentRealName || "Student Champion";

  const handleSaveRealName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setCustomRealName(trimmed);
      if (typeof window !== "undefined") {
        localStorage.setItem("curiosity_real_name", trimmed);
      }
      if (onUpdateRealName) onUpdateRealName(trimmed);
    }
    setIsEditingName(false);
  };

  if (!isOpen) return null;

  // Strict unlocking criteria: User MUST be Rank #1 AND eligible
  const isUnlocked = Boolean(isEligible && userRank === 1);

  const handlePrint = () => {
    if (!isUnlocked) return;
    window.print();
  };

  const shareText = encodeURIComponent(
    `Proud to earn the ${achievementType} Certificate of Excellence in the @AgastyaOrg Curiosity Olympiad! 🚀✨ Exploring experiential science and discovery. #AahAhaHaha #CuriosityOlympiad`
  );

  const shareUrl = encodeURIComponent("https://curiosity-olympiad.vercel.app");

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;

  const handleCopyLink = () => {
    if (!isUnlocked) return;
    navigator.clipboard.writeText(
      `https://curiosity-olympiad.vercel.app/verify-certificate/${certificateId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl sm:max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200 my-auto max-h-[90vh] flex flex-col relative">
        {/* Modal Top Bar with prominent Back to Leaderboard button */}
        <div className="bg-[#143867] px-4 sm:px-6 py-3 flex items-center justify-between text-white shrink-0 border-b border-blue-900/40">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-xs font-bold text-white transition-all border border-white/20 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Leaderboard</span>
          </button>
          
          <div className="hidden xs:flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-sm sm:text-base">workspace_premium</span>
            <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">
              {isUnlocked ? "Official Agastya Merit Certificate" : "Specimen Preview"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full transition-colors hover:bg-white/10 flex items-center justify-center"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Certificate Display Container - Scrollable if screen height is constrained */}
        <div className="p-3 sm:p-6 bg-[#fefdfa] relative overflow-y-auto flex-1">
          
          {/* Locked Watermark Banner Overlay for non-Rank 1 */}
          {!isUnlocked && (
            <div className="absolute inset-2 sm:inset-4 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#143867]/80 backdrop-blur-md text-white text-center rounded-xl border-2 sm:border-4 border-[#f37021] overflow-y-auto max-h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#f37021] text-white flex items-center justify-center mb-2 shadow-xl ring-4 ring-white/20 shrink-0">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">lock</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase text-[#ffe16d] tracking-wide">
                WATERMARKED PREVIEW SPECIMEN
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-gray-100 max-w-md mt-1.5 leading-relaxed">
                Official printable certificates are watermarked and blurred during preview. Full unblurred access, PDF download, printing, and social sharing unlock <span className="text-[#ffe16d]">EXCLUSIVELY for the Rank #1 Champion at the end of the week</span>.
              </p>
              <div className="mt-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20 text-xs font-mono font-bold text-amber-200">
                Your Current Leaderboard Spot: {userRank ? `#${userRank}` : "Unranked"}
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-1.5 bg-[#f37021] hover:bg-[#ea580c] text-white font-bold text-xs rounded-full shadow-lg transition-all flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Return to Leaderboard</span>
              </button>
            </div>
          )}

          {/* Certificate Inner Card (Blurred if locked) */}
          <div className={`border-4 sm:border-8 border-double border-[#143867] p-4 sm:p-8 rounded-xl bg-white relative overflow-hidden shadow-inner transition-all ${!isUnlocked ? "filter blur-sm select-none pointer-events-none opacity-40" : ""}`}>
            {/* Corner Decorative Elements */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#d97706]" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#d97706]" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#d97706]" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#d97706]" />

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[200px] sm:text-[260px] text-[#143867]">
                school
              </span>
            </div>

            <div className="relative z-10 text-center space-y-4">
              {/* Seal and Organization Name */}
              <div className="space-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fff7ed] border-2 border-[#f37021] text-[#143867] mb-1 shadow-xs p-2">
                  <img src="/agastya-logo.svg" alt="Agastya Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Agastya International Foundation • Curiosity Olympiad
                </h3>
                <h2 className="text-xl sm:text-3xl font-black text-[#143867] tracking-tight font-serif">
                  CERTIFICATE OF EXCELLENCE
                </h2>
              </div>

              {/* Recipient Section */}
              <div className="py-2 space-y-1">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This formal certificate is proudly presented to
                </p>
                <div className="py-1 border-b-2 border-[#143867]/30 max-w-md mx-auto flex items-center justify-center gap-2 group">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 w-full max-w-xs">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your Full Real Name..."
                        className="w-full px-2.5 py-1 border-2 border-[#f37021] rounded-lg text-center text-lg font-serif font-extrabold text-[#143867] focus:outline-none bg-orange-50"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveRealName}
                        className="px-2.5 py-1 bg-[#143867] text-white text-xs font-bold rounded-lg hover:bg-[#1d4d8a]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-4xl font-extrabold text-[#143867] font-serif tracking-tight">
                        {displayName}
                      </h1>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-gray-400 hover:text-[#f37021] transition-colors p-1 rounded-full opacity-60 group-hover:opacity-100"
                        title="Edit Full Real Name on Certificate"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Achievement Specification Text */}
              <div className="max-w-xl mx-auto space-y-2">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  For achieving top standing on the national leaderboard and demonstrating exceptional analytical inquiry, experimental rigor, and scientific mastery to earn the rank of:
                </p>

                {/* Exclusive Rank Achievement Banner */}
                <div className="inline-block bg-[#fff7ed] border-2 border-[#f37021] px-5 py-2 rounded-xl shadow-xs">
                  <span className="text-sm sm:text-lg font-black text-[#f37021] uppercase tracking-wider block">
                    ★ {achievementType === "Daily Rank 1" ? "DAILY RANK #1 CHAMPION" : "WEEKLY RANK #1 CHAMPION"} ★
                  </span>
                  <span className="text-[10px] font-bold text-[#9a3412] uppercase tracking-wide">
                    Awarded Exclusively for Leaderboard Rank #1 Standing
                  </span>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed pt-1">
                  This certificate validates outstanding completion of Experiential Science Assessments guided by the 3 Pillars of Curiosity, Creativity & Confidence under the umbrella of Care.
                </p>
              </div>

              {/* Signatures and Certificate ID Footer */}
              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-4 items-end text-left">
                <div>
                  <p className="text-[11px] font-bold text-[#143867]">
                    Dr. Ramji Narayanan
                  </p>
                  <p className="text-[9px] text-gray-500">
                    Chair, Academic Assessment Council
                  </p>
                  <p className="text-[9px] text-gray-400">Agastya Foundation</p>
                </div>

                <div className="hidden sm:block text-center">
                  <span className="inline-block px-2.5 py-0.5 bg-gray-100 rounded text-[9px] font-mono font-bold text-gray-600">
                    ID: {certificateId}
                  </span>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    Verify online at agastya.org/verify
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-bold text-[#143867]">
                    Date of Award
                  </p>
                  <p className="text-[11px] text-gray-600">{awardDate}</p>
                  <p className="text-[9px] text-gray-400">Official Release</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="bg-[#f7f9fb] border-t border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
              Share:
            </span>
            {isUnlocked ? (
              <>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  <span>𝕏 Post</span>
                </a>
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  <span>LinkedIn</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">link</span>
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">lock</span>
                Sharing locked during preview
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print / PDF</span>
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-gray-200 text-gray-400 font-bold text-xs rounded-lg cursor-not-allowed flex items-center gap-1.5"
                title="🔒 Unlocks exclusively for Rank #1 at the end of the week"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Print Locked</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
