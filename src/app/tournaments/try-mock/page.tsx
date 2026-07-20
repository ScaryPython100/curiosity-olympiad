import H5PMockTest from "@/components/H5PMockTest";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function TryMockTestPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Bypass DB insertion for the mock test to avoid RLS schema errors
  const examId = "00000000-0000-0000-0000-000000000000";

  return (
    <div className="h-screen w-full flex flex-col">
      <H5PMockTest 
        examId={examId}
        h5pContentUrl="/mock-h5p-content"
        timeLimitMinutes={3} // Short 3 min timer for testing
      />
    </div>
  );
}
