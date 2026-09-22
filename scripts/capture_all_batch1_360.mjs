import { execSync } from "child_process";
import path from "path";

const ARTIFACT_DIR = "/Users/kishanalamuri/.gemini/antigravity/brain/5c495604-6431-4521-8827-d2f2b694636f";
const CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const EXPERIMENTS = [
  { id: 9, exp: 0, filename: "test9_exp1_turmeric_360.png", desc: "Test 9 Exp 1: Turmeric Indicator" },
  { id: 9, exp: 1, filename: "test9_exp2_soda_balloon_360.png", desc: "Test 9 Exp 2: Soda & Vinegar Balloon" },
  { id: 9, exp: 2, filename: "test9_exp3_sugar_saturation_360.png", desc: "Test 9 Exp 3: Sugar Saturation" },
  { id: 10, exp: 0, filename: "test10_exp1_pulse_heartbeat_360.png", desc: "Test 10 Exp 1: Pulse Rate & Heartbeat" },
  { id: 10, exp: 1, filename: "test10_exp2_diaphragm_lungs_360.png", desc: "Test 10 Exp 2: Diaphragm & Lungs" },
  { id: 10, exp: 2, filename: "test10_exp3_pupil_reflex_360.png", desc: "Test 10 Exp 3: Pupil Dilation Reflex" },
  { id: 11, exp: 0, filename: "test11_exp1_oxygen_bubbles_360.png", desc: "Test 11 Exp 1: Photosynthesis Oxygen Bubbles" },
  { id: 11, exp: 1, filename: "test11_exp2_leaf_transpiration_360.png", desc: "Test 11 Exp 2: Leaf Transpiration" },
  { id: 11, exp: 2, filename: "test11_exp3_phototropism_360.png", desc: "Test 11 Exp 3: Phototropism Stem Bending" },
];

console.log("--> Starting 360px mobile screenshot capture for all 9 experiments...");

for (const exp of EXPERIMENTS) {
  const targetFile = path.join(ARTIFACT_DIR, exp.filename);
  const url = `http://localhost:3000/practice?mockTestId=${exp.id}&exp=${exp.exp}&start=true&review=true`;
  const cmd = `"${CHROME_BIN}" --headless --disable-gpu --virtual-time-budget=2500 --window-size=360,780 --screenshot="${targetFile}" "${url}"`;
  console.log(`Capturing: ${exp.desc} -> ${exp.filename}`);
  try {
    execSync(cmd, { stdio: "ignore" });
    console.log(`  ✓ Saved: ${exp.filename}`);
  } catch (err) {
    console.error(`  ✗ Failed: ${exp.desc}`, err.message);
  }
}

// Also capture Streak Expiry Alert at 360px
console.log("Capturing: In-App Evening Streak Expiry Alert...");
const streakFile = path.join(ARTIFACT_DIR, "streak_expiry_alert_360.png");
const streakUrl = "http://localhost:3000/dashboard?testStreak=true&review=true";
const streakCmd = `"${CHROME_BIN}" --headless --disable-gpu --virtual-time-budget=2500 --window-size=360,780 --screenshot="${streakFile}" "${streakUrl}"`;
try {
  execSync(streakCmd, { stdio: "ignore" });
  console.log(`  ✓ Saved: streak_expiry_alert_360.png`);
} catch (err) {
  console.error(`  ✗ Failed streak alert capture:`, err.message);
}

console.log("--> All 10 screenshots captured successfully!");
