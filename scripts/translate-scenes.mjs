// Drafts the text inside the 39 experiments in the 8 Indian languages with AI,
// checks every string, and writes public/i18n/scenes/<lang>.json.
//
//   node scripts/translate-scenes.mjs            # all languages, only what is missing or failing
//   node scripts/translate-scenes.mjs te hi      # some languages
//   FORCE=1 node scripts/translate-scenes.mjs te # redo a language
//
// Needs AI_GATEWAY_API_KEY in .env.local. The output is a DRAFT: teachers
// should review each language (set "reviewed": true in the file afterwards).
import fs from "node:fs";
import path from "node:path";
import { generateText, Output } from "ai";
import { z } from "zod";
import { TRANSLATED_LANGS, checkString } from "../src/utils/questionI18n.ts";
import { checkSceneFile } from "../src/utils/sceneI18n.ts";
import { SCENE_TEXT } from "../src/components/SandboxEngine/sceneStrings.ts";

process.loadEnvFile?.(".env.local");
const MODEL = process.env.TRANSLATE_MODEL || "google/gemini-2.5-flash";
const OUT_DIR = "public/i18n/scenes";
// The friendly "you" the rest of the app already uses in each language
const INFORMAL_YOU = { hi: "तुम (not आप)", te: "నువ్వు (not మీరు)", ta: "நீ (not நீங்கள்)", kn: "ನೀನು (not ನೀವು)", ml: "നീ (not നിങ്ങൾ)", mr: "तू (not तुम्ही/आपण)", bn: "তুমি (not আপনি)", gu: "તું (not તમે/આપ)" };
const NAMES = { hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati" };

// "// Test 8: Paper Boat, Egg in Salt Water, Oil & Water" above each group, for context
const source = fs.readFileSync("src/components/SandboxEngine/sceneStrings.ts", "utf8");
const ABOUT = Object.fromEntries([...source.matchAll(/\/\/ (Test \d+: [^\n]+)\n\s+(\w+): \{/g)].map((m) => [m[2], m[1]]));

const schema = z.object({ strings: z.array(z.object({ key: z.string(), text: z.string() })) });

function prompt(lang, group, keys, feedback) {
  const all = SCENE_TEXT[group];
  return `Translate the text of a science experiment app from English into ${NAMES[lang]}.

The experiments: ${ABOUT[group]}. Children move sliders and press buttons, watch a small picture change, and read one line about what happened.
Who reads it: children in grades 6 to 10 at rural government schools in India. Many read slowly.
Rules:
- Use simple, everyday ${NAMES[lang]} that a 12-year-old in a village school understands. Short sentences.
- Avoid formal, literary or Sanskrit-heavy words when a common spoken word exists. For science words, use the word used in state-board school textbooks; if children usually say the English word (like "TV", "battery", "magnet", "matka", "dal"), write it in ${NAMES[lang]} script.
- Words in curly braces like {n}, {pot} or {planet} are filled in by the app: copy them EXACTLY, in English, inside the braces. Never translate or drop them. You may move them to where they fit the grammar.
- Keep every number, unit and symbol exactly as written (25°, 2, 1,392,700, m, cm, mm, km, °C, s, min, Hz, m³, ₹5). Use ordinary digits 0-9, not words.
- Keep the emojis and arrows (→ ↑ ↓ ⬅ ⬆ ⬇ ↺ ↔ •) and put them in the same place (start or end).
- Many strings are button names or labels on a small picture: keep them as SHORT as the English, or shorter.
- When a sentence names a button or switch (like "Press HIT!" or "Tick “No air”"), use the same words you used for that button.
- English in CAPITALS is just a loud label; write it normally.
- Keys ending in _label, _slider or _pic are read aloud by screen readers; translate them as plain sentences.
- Talk to the student the informal, friendly way a teacher talks to a child: ${INFORMAL_YOU[lang]}. Never the formal or respectful plural "you".
- Return every key you are asked for, with the same key.
${feedback ? `\nYour last answer had these problems, fix them:\n${feedback}\n` : ""}
${keys.length < Object.keys(all).length ? `All the text of these experiments, for context only:\n${JSON.stringify(all, null, 1)}\n\nTranslate ONLY these keys:` : "English (key: text):"}
${JSON.stringify(Object.fromEntries(keys.map((k) => [k, all[k]])), null, 1)}`;
}

function loadFile(lang) {
  const file = path.join(OUT_DIR, `${lang}.json`);
  if (!process.env.FORCE && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  return { lang, reviewed: false, text: {} };
}

function saveFile(lang, file) {
  // Same order as the English, so diffs stay readable
  const text = Object.fromEntries(
    Object.entries(SCENE_TEXT).map(([group, strings]) => [
      group,
      Object.fromEntries(Object.keys(strings).filter((k) => file.text[group]?.[k]).map((k) => [k, file.text[group][k]])),
    ])
  );
  fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), JSON.stringify({ lang, reviewed: false, text }, null, 1) + "\n");
}

const failing = (lang, group, have) =>
  Object.entries(SCENE_TEXT[group]).filter(([key, en]) => checkString(lang, en, have?.[key]).length > 0).map(([key]) => key);

/** Translates what is missing or failing in one group; keeps what passes after each try. */
async function translateGroup(lang, group, have) {
  const out = { ...have };
  let todo = failing(lang, group, out);
  let feedback = "";
  for (let attempt = 1; attempt <= 4 && todo.length; attempt++) {
    try {
      const { output } = await generateText({
        model: MODEL,
        output: Output.object({ schema }),
        prompt: prompt(lang, group, todo, feedback),
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(120000),
      });
      for (const { key, text } of output.strings) {
        if (todo.includes(key) && !checkString(lang, SCENE_TEXT[group][key], text).length) out[key] = text;
      }
      const left = failing(lang, group, out);
      if (left.length) {
        const byKey = Object.fromEntries(output.strings.map((x) => [x.key, x.text]));
        feedback = left
          .slice(0, 25)
          .map((k) => `${k}: ${checkString(lang, SCENE_TEXT[group][k], byKey[k]).join("; ")}`)
          .join("\n");
        console.log(`  ${lang} ${group} attempt ${attempt}: ${left.length} of ${todo.length} still failing`);
      }
      todo = left;
    } catch (err) {
      console.log(`  ${lang} ${group} attempt ${attempt}: ${String(err.message || err).slice(0, 120)}`);
    }
  }
  return { out, left: todo };
}

const langs = process.argv.slice(2).length ? process.argv.slice(2) : TRANSLATED_LANGS;
fs.mkdirSync(OUT_DIR, { recursive: true });
let failed = 0;
for (const lang of langs) {
  if (!NAMES[lang]) throw new Error(`Unknown language ${lang}`);
  const file = loadFile(lang);
  const todo = Object.keys(SCENE_TEXT).filter((g) => failing(lang, g, file.text[g]).length > 0);
  console.log(`${lang}: ${todo.length} of ${Object.keys(SCENE_TEXT).length} experiment groups to translate`);
  // A few groups at a time keeps within the Gateway's rate limits
  for (let i = 0; i < todo.length; i += 4) {
    const batch = todo.slice(i, i + 4);
    const results = await Promise.all(batch.map((g) => translateGroup(lang, g, file.text[g])));
    results.forEach((r, j) => {
      file.text[batch[j]] = r.out;
      if (r.left.length) {
        failed++;
        console.error(`${lang} ${batch[j]}: still failing after 4 tries: ${r.left.join(", ")}`);
      }
    });
    // Save after every batch so a crash never loses finished work
    saveFile(lang, file);
  }
  const left = checkSceneFile(lang, SCENE_TEXT, file);
  console.log(`${lang}: ${left.length ? `${left.length} problems left` : "all checks pass"}`);
}
process.exit(failed ? 1 : 0);
