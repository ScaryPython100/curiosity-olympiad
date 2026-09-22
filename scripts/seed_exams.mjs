import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const SYSTEM_EXAMS = [
  {
    id: "00000000-0000-0000-0000-000000000000",
    title: "Curiosity Sandbox Mock Test",
    description: "An interactive sandbox to measure curiosity without academic boundaries.",
    category: "physics",
    difficulty: "medium",
    duration_minutes: 90,
    max_score: 100,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-07-18T16:51:30.545Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Mock Test 1: Light & Sight",
    description: "Agastya Curiosity Practice Lab - Mock Test 1: Light & Sight (Optics & Reflections)",
    category: "Optics",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "Mock Test 2: Forces & Motion",
    description: "Agastya Curiosity Practice Lab - Mock Test 2: Forces & Motion (Gravity & Trajectory)",
    category: "Gravity",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "Mock Test 3: Heat & Fire",
    description: "Agastya Curiosity Practice Lab - Mock Test 3: Heat & Fire (Thermodynamics & Combustion)",
    category: "Chemistry",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    title: "Mock Test 4: Sensory Physics",
    description: "Agastya Curiosity Practice Lab - Mock Test 4: Sensory Physics",
    category: "Sensory",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    title: "Mock Test 5: Hypothesis Testing",
    description: "Agastya Curiosity Practice Lab - Mock Test 5: Hypothesis Testing",
    category: "Scientific Inquiry",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    title: "Mock Test 6: Sound & Vibration",
    description: "Agastya Curiosity Practice Lab - Mock Test 6: Sound & Vibration (Acoustics & Frequency)",
    category: "Sound",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    title: "Mock Test 7: Electricity & Magnetism",
    description: "Agastya Curiosity Practice Lab - Mock Test 7: Electricity & Magnetism (Circuits & Fields)",
    category: "Electricity",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    title: "Mock Test 8: Water & Buoyancy",
    description: "Agastya Curiosity Practice Lab - Mock Test 8: Water & Buoyancy (Fluids & Density)",
    category: "Buoyancy",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    title: "Mock Test 9: Kitchen Chemistry",
    description: "Agastya Curiosity Practice Lab - Mock Test 9: Kitchen Chemistry (Indicators & Solutions)",
    category: "Chemistry",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    title: "Mock Test 10: The Human Body",
    description: "Agastya Curiosity Practice Lab - Mock Test 10: The Human Body (Physiology & Reflexes)",
    category: "Sensory",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000011",
    title: "Mock Test 11: Plants & Growth",
    description: "Agastya Curiosity Practice Lab - Mock Test 11: Plants & Growth (Photosynthesis & Systems)",
    category: "Botany",
    difficulty: "all-levels",
    duration_minutes: 15,
    max_score: 9,
    status: "published",
    is_results_published: false,
    results_release_date: "2026-12-31T23:59:59.000Z",
  },
];

async function seed() {
  console.log(`--> Seeding ${SYSTEM_EXAMS.length} system exams to ${supabaseUrl}...`);
  const { data, error } = await supabase
    .from("exams")
    .upsert(SYSTEM_EXAMS, { onConflict: "id" })
    .select("id, title");

  if (error) {
    console.error("❌ Failed to seed exams:", error);
    process.exit(1);
  }

  console.log("✅ Successfully seeded system exams:");
  data.forEach((e) => console.log(`   - [${e.id}] ${e.title}`));
}

seed();
