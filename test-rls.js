import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://kckgegettxocnnelcgjm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja2dlZ2V0dHhvY25uZWxjZ2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODkwODYsImV4cCI6MjA5ODE2NTA4Nn0.tpwgQSaxNp2ApMSBmA6hqIj2bY_HioIqpCkGxeD7avE"
);

async function check() {
  const { data, error } = await supabase.from("student_profiles").select("*").limit(5);
  console.log("Student Profiles Data:", data);
  console.log("Error:", error);
}

check();
