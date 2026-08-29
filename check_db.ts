import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role to bypass RLS for debugging
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('student_profiles').select('*').limit(5);
  console.log("Profiles:", data);
  if (error) console.error("Error profiles:", error);

  const { data: gam, error: gamError } = await supabase.from('user_gamification').select('*').limit(5);
  console.log("Gamification:", gam);
  if (gamError) console.error("Gamification error:", gamError);

  // let's try to upsert a dummy user to see if "Explorer" fails
  const { data: upsertData, error: upsertError } = await supabase
    .from("student_profiles")
    .upsert([{ id: "00000000-0000-0000-0000-000000000001", username: "Explorer", real_name: "Explorer" }], { onConflict: "id" });
  console.log("Upsert error:", upsertError);
}

check();
