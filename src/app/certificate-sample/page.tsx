"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CertificateModal, { RankCertificateType } from "@/components/CertificateModal";

function CertificateSampleContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [modalState, setModalState] = useState<"unlocked" | "locked">("unlocked");
  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [certType, setCertType] = useState<RankCertificateType>("Daily Rank 1");
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    const stateParam = searchParams.get("state");
    if (stateParam === "locked") {
      setModalState("locked");
    } else {
      setModalState("unlocked");
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="bg-[#f7f9fb] min-h-screen font-['Montserrat'] p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-sm">Loading Certificate Review...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] min-h-screen font-['Montserrat'] p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-xl w-full bg-white rounded-2xl p-6 border border-gray-200 shadow-xs mb-6 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <span className="material-symbols-outlined text-sm text-amber-600">verified</span>
          <span>Certificate Feature Review Harness</span>
        </div>
        <h1 className="text-xl font-black text-[#143867]">
          Agastya Certificate Review &amp; Specimen Verification
        </h1>
        <p className="text-xs text-gray-500">
          Per platform spec, official merit certificates become available to preview/download starting at 12:01 AM the day after achieving Rank #1 in a completed cycle. During active cycles, students see the watermarked specimen preview.
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => {
              setModalState("unlocked");
              setIsModalOpen(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              modalState === "unlocked"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ✓ View Unlocked Certificate
          </button>
          <button
            onClick={() => {
              setModalState("locked");
              setIsModalOpen(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              modalState === "locked"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            🔒 View Locked Specimen (In Progress)
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-[#143867] underline"
          >
            Re-open Certificate Dialog
          </button>
        </div>
      </div>

      <CertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentRealName={studentName}
        achievementType={certType}
        awardDate="September 2026"
        isEligible={true}
        userRank={1}
        isCompletedCycle={modalState === "unlocked"}
      />
    </div>
  );
}

export default function CertificateSamplePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#f7f9fb] min-h-screen font-['Montserrat'] p-4 sm:p-8 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-sm">Loading Certificate Review...</div>
        </div>
      }
    >
      <CertificateSampleContent />
    </Suspense>
  );
}
