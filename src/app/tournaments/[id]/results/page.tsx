import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { OFFICIAL_MOCK_TESTS } from "@/data/mockTestsData";
import { ResultsClientView, ExamMeta, SubmissionMeta } from "./ResultsClientView";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id: examId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch user profile metadata & gamification XP if user exists
  let username = "Student Explorer";
  let userXp = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    const { data: gamification } = await supabase
      .from("user_gamification")
      .select("xp")
      .eq("user_id", user.id)
      .maybeSingle();

    username =
      profile?.username ||
      user.user_metadata?.full_name ||
      user.user_metadata?.username ||
      "Explorer";
    userXp = gamification?.xp || 0;
  }

  // 2. Resolve Exam Meta (Support both DB UUID exams & Mock Test IDs 1-8)
  let examMeta: ExamMeta | null = null;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    examId
  );

  if (isUUID) {
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("id, title, results_release_date, is_results_published")
      .eq("id", examId)
      .maybeSingle();

    if (exam) {
      const releaseDate = exam.results_release_date
        ? new Date(exam.results_release_date)
        : new Date();
      const now = new Date();
      const isReleased = now >= releaseDate || !!exam.is_results_published;

      examMeta = {
        id: exam.id,
        title: exam.title,
        subtitle: "Standardized Practice Tournament",
        module: "Science",
        isReleased,
        resultsReleaseDate: exam.results_release_date,
        questionCount: 9,
      };
    }
  }

  // If not found in DB exams or not a UUID, match in OFFICIAL_MOCK_TESTS
  if (!examMeta) {
    const mockNumber = parseInt(examId.replace(/\D/g, ""), 10);
    const mock =
      OFFICIAL_MOCK_TESTS.find((m) => m.id === mockNumber) ||
      OFFICIAL_MOCK_TESTS.find((m) => String(m.id) === examId) ||
      OFFICIAL_MOCK_TESTS[0];

    examMeta = {
      id: String(mock.id),
      title: mock.title,
      subtitle: mock.subtitle,
      description: mock.description,
      module: mock.module,
      icon: mock.icon,
      badge: mock.badge,
      questionCount: mock.questionCount || 9,
      isReleased: true, // Practice mock tests are released immediately
      resultsReleaseDate: null,
    };
  }

  // 3. Fetch server submission if exists
  let initialSubmission: SubmissionMeta | null = null;
  if (examMeta && user) {
    const { data: sub } = await supabase
      .from("exam_submissions")
      .select("score, max_score, submitted_at, telemetry_data")
      .eq("exam_id", examId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub) {
      const percentage = Math.round(
        (sub.score / (sub.max_score || examMeta.questionCount || 9)) * 100
      );
      initialSubmission = {
        score: sub.score,
        maxScore: sub.max_score || examMeta.questionCount || 9,
        percentage,
        submittedAt: sub.submitted_at,
        telemetryData: sub.telemetry_data,
        totalXP: sub.score * 100 + 210,
        telemetryBonusXP: 210,
      };
    }
  }

  return (
    <ResultsClientView
      exam={examMeta}
      initialSubmission={initialSubmission}
      username={username}
      userXp={userXp}
    />
  );
}
