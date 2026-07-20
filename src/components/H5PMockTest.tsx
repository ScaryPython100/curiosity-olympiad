"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitExamScore } from "@/app/actions/exams";

interface H5PMockTestProps {
  examId: string;
  h5pContentUrl: string; // E.g., WordPress iframe embed URL or Standalone bundle URL
  timeLimitMinutes?: number; // Capped timer (1.5x original time)
}

export default function H5PMockTest({ 
  examId, 
  h5pContentUrl, 
  timeLimitMinutes = 90 // Default to 90 mins if not provided
}: H5PMockTestProps) {
  const router = useRouter();
  
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          // Auto-submit or handle timeout here if needed.
          // For now, we just let it hit 0.
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // H5P xAPI Interceptor Effect
  useEffect(() => {
    const handleScoreSubmit = async (score: number, maxScore: number, telemetryData?: any) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      
      try {
        const res = await submitExamScore(examId, score, maxScore, telemetryData);
        if (res.success) {
          router.push("/tournaments/mock-success");
        } else {
          console.error("Submission failed:", res.error);
          alert(res.error || "Failed to submit test. Please contact support.");
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error("Error submitting:", err);
        alert("A network error occurred while submitting.");
        setIsSubmitting(false);
      }
    };

    // 1. Listen for cross-origin H5P iframe xAPI messages
    const handleMessage = (event: MessageEvent) => {
      try {
        // H5P standardizes xAPI statements in postMessage payload under event.data.statement
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.statement && data.statement.result) {
          const result = data.statement.result;
          const telemetryData = data.statement.extensions ? data.statement.extensions["http://telemetry.org"] : null;
          
          // Check if it's a 'completed' or 'answered' verb that carries a score
          if (result.score && typeof result.score.raw === "number" && typeof result.score.max === "number") {
             if (data.statement.verb && data.statement.verb.display && (
                 data.statement.verb.display["en-US"] === "completed" || 
                 data.statement.verb.display["en-US"] === "answered"
             )) {
               handleScoreSubmit(result.score.raw, result.score.max, telemetryData);
             }
          }
        }
      } catch (e) {
        // Ignore unparseable messages
      }
    };

    window.addEventListener("message", handleMessage);

    // 2. Listen for native window.H5P events (if rendered in same window without iframe)
    // @ts-ignore
    if (typeof window !== "undefined" && window.H5P && window.H5P.externalDispatcher) {
      // @ts-ignore
      window.H5P.externalDispatcher.on("xAPI", (event: any) => {
        if (event.getScore() !== null && event.getMaxScore() > 0) {
          // If it's a completion event
          const verb = event.getVerb();
          if (verb === "completed" || verb === "answered") {
            handleScoreSubmit(event.getScore(), event.getMaxScore());
          }
        }
      });
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [examId, isSubmitting, router]);

  // Format time remaining
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Show popup warning when 30 minutes or less remain
  const showWarning = timeLeft > 0 && timeLeft <= 30 * 60;

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Soft Capped Timer UI */}
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 shadow-lg flex items-center gap-4">
            <div className="bg-red-500 text-white p-2 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">timer</span>
            </div>
            <div>
              <p className="text-red-500 dark:text-red-400 font-bold text-sm uppercase tracking-wider">
                Time Remaining
              </p>
              <p className="text-gray-900 dark:text-white font-mono text-2xl font-bold">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shrink-0 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-[#143867] dark:text-blue-400">Curiosity Assessment</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Note: This test has a capped timer of {timeLimitMinutes} minutes to simulate testing conditions. 
            A warning will appear during the final 30 minutes. Take your time and think critically!
          </p>
        </div>
        
        {/* Subtle timer before the 30 min mark */}
        {!showWarning && (
          <div className="text-gray-500 dark:text-gray-400 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* H5P Iframe Container */}
      <div className="flex-1 w-full bg-gray-50 dark:bg-gray-900 relative">
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143867] dark:border-blue-400 mb-4"></div>
             <p className="text-lg font-bold text-gray-900 dark:text-white">Securely submitting your score...</p>
          </div>
        )}
        <iframe 
          src={h5pContentUrl} 
          className="w-full h-full border-0"
          title="H5P Interactive Content"
          allowFullScreen
          allow="geolocation *; microphone *; camera *; midi *; encrypted-media *"
        />
      </div>
    </div>
  );
}
