const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== 1. AUDITING STUDENT PROFILES ===");
  const { data: profiles, error: profErr } = await supabase
    .from('student_profiles')
    .select('*');
  
  if (profErr) {
    console.error("Error fetching profiles:", profErr);
  } else {
    console.log(`Total student_profiles: ${profiles.length}`);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$|^\+?\d{7,15}$/;
    
    const flagged = [];
    profiles.forEach(p => {
      const username = p.username || '';
      const isEmail = emailPattern.test(username) || username.includes('@');
      const isPhone = phonePattern.test(username.replace(/[\s-]/g, ''));
      if (isEmail || isPhone) {
        flagged.push({
          id: p.id,
          username: p.username,
          real_name: p.real_name,
          issue: isEmail ? "Looks like Email" : "Looks like Phone Number",
          created_at: p.created_at
        });
      }
    });

    console.log(`FLAGGED PROFILES WITH PRIVACY ISSUES (${flagged.length}):`);
    console.log(JSON.stringify(flagged, null, 2));

    console.log("\nALL PROFILES SUMMARY:");
    profiles.forEach(p => {
      console.log(`- ID: ${p.id} | username: "${p.username}" | real_name: "${p.real_name}" | school_code: "${p.school_code || 'NONE'}"`);
    });
  }

  console.log("\n=== 2. AUDITING USER_GAMIFICATION ===");
  const { data: gam, error: gamErr } = await supabase
    .from('user_gamification')
    .select('*')
    .order('xp', { ascending: false });
  
  if (gamErr) {
    console.error("Error fetching gamification:", gamErr);
  } else {
    console.log(`Total user_gamification rows: ${gam.length}`);
    gam.forEach(g => {
      console.log(`- user_id: ${g.user_id} | xp: ${g.xp} | points: ${g.curiosity_points} | weekly: ${g.weekly_xp} | last_claimed: ${g.last_claimed_date}`);
    });
  }

  console.log("\n=== 3. CHECKING EXAM_SUBMISSIONS ===");
  const { data: subs, error: subErr } = await supabase
    .from('exam_submissions')
    .select('*');
  if (subErr) {
    console.log("exam_submissions query:", subErr.message);
  } else {
    console.log(`Total exam_submissions: ${subs.length}`);
    subs.slice(0, 5).forEach(s => {
      console.log(`- id: ${s.id} | user_id: ${s.user_id} | score: ${s.score} | submitted_at: ${s.submitted_at || s.created_at}`);
    });
  }

  console.log("\n=== 4. CHECKING TELEMETRY_LOGS ===");
  const { data: tel, error: telErr } = await supabase
    .from('telemetry_logs')
    .select('*');
  if (telErr) {
    console.log("telemetry_logs query:", telErr.message);
  } else {
    console.log(`Total telemetry_logs: ${tel.length}`);
    tel.slice(0, 5).forEach(t => {
      console.log(`- id: ${t.id} | user_id: ${t.user_id} | exp: ${t.experiment_id} | score: ${t.total_score} | time: ${t.created_at}`);
    });
  }

  console.log("\n=== 5. CHECKING OTHER RELEVANT TABLES ===");
  const tables = ['mock_test_attempts', 'student_levels', 'exams', 'follows'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(2);
    if (error) {
      console.log(`Table '${t}': DOES NOT EXIST or error (${error.message})`);
    } else {
      console.log(`Table '${t}': EXISTS, sample rows: ${data.length}`);
    }
  }

  console.log("\n=== 6. CHECKING AUTH USERS METADATA ===");
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error("Auth users error:", authErr);
  } else {
    console.log(`Total auth.users: ${authData.users.length}`);
    authData.users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Phone: ${u.phone || 'NONE'} | Metadata:`, u.user_metadata);
    });
  }
}

run().catch(console.error);
