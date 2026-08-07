"use client";

import { useState, useEffect } from "react";
import { downloadCertificateAsPNG } from "@/utils/certificateCanvas";
import { updateRealName } from "@/app/actions/profile";

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
  isCompletedCycle?: boolean;
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
  isCompletedCycle = false,
}: CertificateModalProps) {
  const [copied, setCopied] = useState(false);
  const [officialRealName, setOfficialRealName] = useState(studentRealName || "Student Champion");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [hasRegisteredName, setHasRegisteredName] = useState(true); // Default true to avoid hydration flash

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setOfficialRealName(trimmed);
      setIsEditingName(false);
      setHasRegisteredName(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("curiosity_real_name", trimmed);
      }
      if (onUpdateRealName) {
        onUpdateRealName(trimmed);
      }
      // Save to Supabase for future use
      try {
        await updateRealName(trimmed);
      } catch (err) {
        console.error("Failed to save real name to database:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("curiosity_real_name");
      if (storedName && storedName.trim()) {
        setOfficialRealName(storedName.trim());
        setHasRegisteredName(true);
      } else {
        setHasRegisteredName(false);
        if (studentRealName && studentRealName.trim()) {
          setOfficialRealName(studentRealName.trim());
        }
      }
    }
  }, [studentRealName, isOpen]);

  const displayName = officialRealName || "Student Champion";

  if (!isOpen) return <div style={{ display: 'none' }} data-testid="certificate-modal-hidden" />;

  // Unlocking criteria: Must be Rank #1 AND the cycle MUST be completed (isCompletedCycle)
  const isRankOne = Boolean(isEligible || userRank === 1);
  const isUnlocked = isRankOne && isCompletedCycle;
  const isPendingCycleEnd = isRankOne && !isCompletedCycle;

  const handlePrint = () => {
    if (!isUnlocked) return;
    window.print();
  };

  const handleDownloadPNG = () => {
    if (!isUnlocked) return;
    downloadCertificateAsPNG({
      studentRealName: displayName,
      achievementType,
      awardDate,
      certificateId,
    });
  };

  const shareText = `Proud to earn the ${achievementType} Certificate of Excellence in the @AgastyaOrg Curiosity Olympiad! 🚀✨ Exploring experiential science and discovery. #AahAhaHaha #CuriosityOlympiad`;
  const shareUrl = "https://curiosity-olympiad.vercel.app";

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;

  const handleCopyLink = () => {
    if (!isUnlocked) return;
    navigator.clipboard.writeText(
      `https://curiosity-olympiad.vercel.app/verify-certificate/${certificateId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto pb-16 sm:pb-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl sm:max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 my-auto flex flex-col relative max-h-[85vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-[#143867] px-4 py-3 flex items-center justify-between text-white shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-xs font-bold text-white transition-all border border-white/20"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Leaderboard</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">workspace_premium</span>
            <span>{isUnlocked ? "Merit Certificate" : isPendingCycleEnd ? "Rank #1 (Cycle Pending)" : "Specimen Preview"}</span>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full transition-colors flex items-center justify-center"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 bg-[#f7f9fb] overflow-y-auto flex-1">
          {!isUnlocked ? (
            /* =========================================================
               LOCKED / PENDING CYCLE END PREVIEW
               ========================================================= */
            <div className="space-y-4 text-center max-w-md mx-auto">
              
              {/* Specimen Header Badge */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs ${isPendingCycleEnd ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5]"}`}>
                <span className="material-symbols-outlined text-sm">{isPendingCycleEnd ? "hourglass_top" : "lock"}</span>
                <span>{isPendingCycleEnd ? "Cycle In Progress — Unlocks at Midnight" : "Watermarked Specimen Preview"}</span>
              </div>

              {/* Compact Framed Mini-Certificate Card */}
              <div className="bg-white border-2 border-dashed border-[#143867]/30 rounded-2xl p-4 sm:p-6 shadow-md relative overflow-hidden text-center space-y-3">
                
                {/* Diagonal Watermark Text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none transform -rotate-12 select-none">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#143867] uppercase tracking-widest text-center">
                    {isPendingCycleEnd ? "RANK 1 STANDING • UNLOCKS AT CYCLE END" : "SPECIMEN PREVIEW • NOT FOR DISTRIBUTION"}
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#fff7ed] border border-[#f37021] flex items-center justify-center p-1.5 shadow-xs">
                    <img src="/agastya-logo.svg" alt="Agastya Logo" className="w-full h-full object-contain" />
                  </div>
                  
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Agastya Curiosity Olympiad
                  </h4>
                  
                  <h3 className="text-base sm:text-xl font-black text-[#143867] font-serif">
                    CERTIFICATE OF EXCELLENCE
                  </h3>

                  <div className="py-1">
                    <p className="text-[10px] font-medium text-gray-500 uppercase">Presented to</p>
                    <p className="text-lg sm:text-2xl font-extrabold text-[#143867] font-serif">{displayName}</p>
                  </div>

                  <div className="inline-block bg-[#fff7ed] border border-[#f37021] px-3 py-1 rounded-lg">
                    <span className="text-xs font-extrabold text-[#f37021] uppercase">
                      ★ {achievementType === "Daily Rank 1" ? "DAILY RANK #1 CHAMPION" : "WEEKLY RANK #1 CHAMPION"} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement Alert Callout */}
              <div className="bg-[#143867] text-white rounded-2xl p-3.5 sm:p-4 text-left shadow-sm space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-400 text-lg shrink-0 mt-0.5">
                    {isPendingCycleEnd ? "schedule" : "info"}
                  </span>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-amber-300">
                      {isPendingCycleEnd 
                        ? (achievementType === "Daily Rank 1" ? "⏳ Daily Rank #1 Standing (Cycle Pending)" : "⏳ Weekly Rank #1 Standing (Cycle Pending)")
                        : (achievementType === "Daily Rank 1" ? "Daily Rank #1 Champion Exclusive" : "Weekly Rank #1 Champion Exclusive")}
                    </h5>
                    <p className="text-[11px] text-gray-200 leading-relaxed">
                      {isPendingCycleEnd
                        ? (achievementType === "Daily Rank 1"
                            ? "You are currently holding Daily Rank #1! Today's daily cycle closes tonight at 11:59 PM. Please return after midnight to claim your unblurred Daily Certificate!"
                            : "You are currently holding Weekly Rank #1! This week's cycle closes Sunday at 11:59 PM. Please return after Sunday midnight to claim your unblurred Weekly Certificate!")
                        : (achievementType === "Daily Rank 1"
                            ? "Official Daily Rank #1 Certificates unlock EXCLUSIVELY for today's top daily champion after the daily cycle ends at 11:59 PM tonight."
                            : "Official Weekly Rank #1 Certificates unlock EXCLUSIVELY for the top weekly champion at the end of the week (Sunday 11:59 PM).")}
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-gray-300 font-medium">Your Live Standing:</span>
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full font-mono font-bold text-amber-200">
                    {userRank ? `Rank #${userRank}` : "Unranked"}
                  </span>
                </div>
              </div>

              {/* Primary Direct Return Action Button */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#f37021] hover:bg-[#ea580c] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Return to Leaderboard</span>
              </button>
            </div>
          ) : (
            /* =========================================================
               UNLOCKED FULL MERIT CERTIFICATE (For Rank #1 Champion)
               ========================================================= */
            <div className="space-y-6">
              {!hasRegisteredName || isEditingName ? (
                <div className="bg-white border-2 border-[#143867] p-6 rounded-2xl shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-2xl">person_edit</span>
                  </div>
                  <h3 className="text-lg font-black text-[#143867]">Register Your Official Name</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Your official real name hasn't been registered yet. Please enter exactly how you want your name to appear on the Certificate of Excellence.
                  </p>
                  <div className="flex items-center gap-2 max-w-sm mx-auto">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#f37021] focus:ring-1 focus:ring-[#f37021]"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={!nameInput.trim()}
                      className="px-4 py-2 bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-sm rounded-lg disabled:opacity-50 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-4 sm:border-[6px] border-double border-[#143867] p-6 sm:p-10 rounded-xl bg-white relative overflow-hidden shadow-sm text-center space-y-4 antialiased">
                    <div className="space-y-1">
                      <div className="w-14 h-14 mx-auto rounded-full bg-[#fff7ed] border-2 border-[#f37021] p-2">
                        <img src="/agastya-logo.svg" alt="Agastya Logo" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">
                        Agastya International Foundation • Curiosity Olympiad
                      </h3>
                      <h2 className="text-2xl sm:text-4xl font-black text-[#143867] font-serif tracking-wide pt-1">
                        CERTIFICATE OF EXCELLENCE
                      </h2>
                    </div>

                    <div className="py-4 space-y-2">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        This formal certificate is proudly presented to
                      </p>
                      <div className="flex items-center justify-center gap-2 max-w-md mx-auto border-b border-[#143867]/30 pb-2 relative group">
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#143867] font-serif">
                          {displayName}
                        </h1>
                        <button 
                          onClick={() => {
                            setNameInput(officialRealName);
                            setIsEditingName(true);
                          }}
                          className="absolute -right-8 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#f37021] transition-all p-1"
                          title="Edit Name"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="max-w-md mx-auto space-y-3">
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed px-4">
                        For achieving top standing on the national leaderboard and demonstrating scientific inquiry mastery:
                      </p>
                      <div className="inline-block bg-[#fff7ed] border-2 border-[#f37021] px-5 py-2 rounded-xl mt-2 shadow-xs">
                        <span className="text-sm sm:text-lg font-black text-[#f37021] uppercase tracking-wide block">
                          ★ {achievementType === "Daily Rank 1" ? "DAILY RANK #1 CHAMPION" : "WEEKLY RANK #1 CHAMPION"} ★
                        </span>
                      </div>
                    </div>

                    <div className="pt-8 flex justify-between items-end text-xs text-left px-2 sm:px-6">
                      <div className="border-t border-gray-400 pt-2 w-32 sm:w-48">
                        <p className="font-bold text-[#143867] text-[11px] sm:text-xs">Dr. Ramji Narayanan</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500">Chief Mentor, Agastya Foundation</p>
                      </div>
                      <div className="text-right border-t border-gray-400 pt-2 w-28 sm:w-40">
                        <p className="font-bold text-[#143867] text-[11px] sm:text-xs">Award Date</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-600">{awardDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Sharing Bar (Moved OUTSIDE Certificate) */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <span className="text-xs font-bold text-gray-600">Share Your Achievement:</span>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>💬 WhatsApp</span>
                      </a>
                      <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#143867] hover:bg-[#1e4a85] text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>𝕏 Share</span>
                      </a>
                      <a
                        href={linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>in LinkedIn</span>
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>{copied ? "✓ Copied!" : "🔗 Copy Link"}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-[#143867] hover:bg-[#1e4a85] active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Leaderboard</span>
          </button>

          {isUnlocked && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPNG}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download Certificate (PNG Image)</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-[#f37021] hover:bg-[#ea580c] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Print / PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
