const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('exams').select('*').limit(1);
  if (error) {
    console.error("Error exams:", error);
  } else if (data && data.length > 0) {
    console.log("Exam columns:", Object.keys(data[0]));
  } else {
    // If empty, let's try inserting a bare minimum to see what columns fail
    const { data: insData, error: insError } = await supabase.from('exams').insert([{ id: '00000000-0000-0000-0000-000000000000' }]);
    console.log("Insert error:", insError);
  }
}

check();
