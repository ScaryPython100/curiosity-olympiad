import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id: examId } = await params; // Next.js 15 requires unwrapping async params
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 1. Fetch Exam Meta (release dates)
  const { data: exam, error: examError } = await supabase
    .from("exams")
    .select("title, results_release_date, is_results_published")
    .eq("id", examId)
    .single();

  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Exam Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400">This test does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  const releaseDate = new Date(exam.results_release_date);
  const now = new Date();
  
  // 2. TIME GATE LOGIC
  const isReleased = (now >= releaseDate) || exam.is_results_published;

  if (!isReleased) {
    // LOCKED UI
    return (
      <div className="bg-[#f7f9fb] dark:bg-gray-900 min-h-screen flex flex-col font-['Montserrat'] items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-[#143867]/10 dark:bg-blue-400/10 text-[#143867] dark:text-blue-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">lock_clock</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#143867] dark:text-blue-400 mb-2">
            Results Coming Soon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The results for <strong>{exam.title}</strong> are securely locked.
            They will be revealed on:
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-8">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {releaseDate.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {releaseDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <Link href="/tournaments" className="text-sm font-bold text-[#143867] dark:text-blue-400 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 3. UNLOCKED UI
  // Fetch submission only if unlocked
  const { data: submission, error: subError } = await supabase
    .from("exam_submissions")
    .select("score, max_score, submitted_at")
    .eq("exam_id", examId)
    .eq("user_id", user.id)
    .single();

  if (subError || !submission) {
     return (
      <div className="min-h-screen bg-[#f7f9fb] dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Results Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">We couldn't find a submission for you for this exam.</p>
          <Link href="/tournaments" className="bg-[#143867] text-white px-6 py-2 rounded-full text-sm font-bold">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((submission.score / submission.max_score) * 100);

  return (
    <div className="bg-[#f7f9fb] dark:bg-gray-900 min-h-screen flex flex-col font-['Montserrat'] items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-500">
        
        <div className="bg-[#ffe16d] text-[#221b00] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,215,0,0.4)] relative">
           <span className="text-3xl font-black">{percentage}%</span>
           {percentage >= 90 && (
             <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🏆</span>
           )}
        </div>
        
        <h1 className="text-2xl font-extrabold text-[#143867] dark:text-blue-400 mb-1">
          {exam.title} Results
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
        </p>

        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl mb-8 border border-gray-200 dark:border-gray-700">
          <div className="text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Raw Score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{submission.score}</p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Max Points</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{submission.max_score}</p>
          </div>
        </div>

        <Link 
          href="/tournaments"
          className="bg-[#143867] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#143867]/30 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 inline-block w-full"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
