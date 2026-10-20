// Drafts the practice questions in the 8 Indian languages with AI, checks
// every string, and writes public/i18n/questions/<lang>.json.
//
//   node scripts/translate-questions.mjs            # all languages, only what is missing or failing
//   node scripts/translate-questions.mjs te hi      # some languages
//   FORCE=1 node scripts/translate-questions.mjs te # redo a language
//
// Needs AI_GATEWAY_API_KEY in .env.local. The output is a DRAFT: teachers
// should review each language (set "reviewed": true in the file afterwards).
import fs from "node:fs";
import path from "node:path";
import { generateText, Output } from "ai";
import { z } from "zod";
import { TRANSLATED_LANGS, checkQuestionFile, checkString } from "../src/utils/questionI18n.ts";

process.loadEnvFile?.(".env.local");
const MODEL = process.env.TRANSLATE_MODEL || "google/gemini-2.5-flash";
const OUT_DIR = "public/i18n/questions";
// The friendly "you" the rest of the app already uses in each language
const INFORMAL_YOU = { hi: "तुम (not आप)", te: "నువ్వు (not మీరు)", ta: "நீ (not நீங்கள்)", kn: "ನೀನು (not ನೀವು)", ml: "നീ (not നിങ്ങൾ)", mr: "तू (not तुम्ही/आपण)", bn: "তুমি (not আপনি)", gu: "તું (not તમે/આપ)" };
const NAMES = { hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", mr: "Marathi", bn: "Bengali", gu: "Gujarati" };

// --- English source, read straight from the practice page ---
const page = fs.readFileSync("src/app/practice/page.tsx", "utf8");
function literalArray(marker) {
  const start = page.indexOf(marker);
  const open = page.indexOf("[", start);
  const end = page.indexOf("\n];", start);
  return Function(`return ${page.slice(open, end + 2)}`)();
}
const QUESTIONS = literalArray("const PRACTICE_QUESTIONS: Question[] = [");
const TESTS = literalArray("const MOCK_TESTS: MockTestInfo[] = [");
// Experiment names (the tabs in the lab and the question headings)
const sandbox = fs.readFileSync("src/components/SandboxEngine/index.tsx", "utf8");
const labelsStart = sandbox.indexOf("export const EXPERIMENT_LABELS");
const EXPERIMENTS = Function(`return ${sandbox.slice(sandbox.indexOf("{", labelsStart), sandbox.indexOf("\n};", labelsStart) + 2)}`)();

const english = {
  questions: Object.fromEntries(QUESTIONS.map((q) => [String(q.id), { title: q.title, question: q.question, options: q.options, explanation: q.explanation }])),
  tests: Object.fromEntries(TESTS.map((t) => [String(t.id), { name: t.title.split(":").slice(1).join(":").trim(), description: t.description }])),
};

const schema = z.object({
  name: z.string(),
  description: z.string(),
  questions: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4),
      explanation: z.string(),
    })
  ),
});

function prompt(lang, test, questions, feedback) {
  return `Translate this science practice test from English into ${NAMES[lang]}.

Who reads it: children in grades 6 to 10 at rural government schools in India. Many read slowly.
Rules:
- Use simple, everyday ${NAMES[lang]} that a 12-year-old in a village school understands. Short sentences.
- Avoid formal, literary or Sanskrit-heavy words when a common spoken word exists. For science words, use the word used in state-board school textbooks; if children usually say the English word (like "TV", "battery", "magnet"), keep it in ${NAMES[lang]} script.
- Keep every number, unit and symbol exactly as written (9, 45°, 50%, 2, km). Use ordinary digits 0-9, not words.
- Keep the 4 options in the SAME ORDER. Translate the wrong options too (they are meant to be silly or wrong; keep that tone).
- Keep the friendly tone and the exclamation marks of the explanations.
- Talk to the student the informal, friendly way a teacher talks to a child: ${INFORMAL_YOU[lang]}. Never the formal or respectful plural "you".
- "name" is the short test name, "description" one sentence about the test.
- Return every question with its id.
${feedback ? `\nYour last answer had these problems, fix them:\n${feedback}\n` : ""}
English (JSON):
${JSON.stringify({ name: test.name, description: test.description, questions: questions.map((q) => ({ id: q.id, title: q.title, question: q.question, options: q.options, explanation: q.explanation })) }, null, 1)}`;
}

function loadFile(lang) {
  const file = path.join(OUT_DIR, `${lang}.json`);
  if (!process.env.FORCE && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  return { lang, reviewed: false, tests: {}, questions: {} };
}

const experimentsSchema = z.object({ experiments: z.array(z.object({ test: z.number(), names: z.array(z.string()).length(3) })) });

/** The 39 short experiment names, in one request. */
async function translateExperiments(lang) {
  let feedback = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema: experimentsSchema }),
      prompt: `Translate these short names of school science experiments into simple ${NAMES[lang]} for children in grades 6-10 (rural government schools). Keep them short (2-4 words). Keep the same order. Everyday words like TV, matka, chapati or cricket can stay as they are, written in ${NAMES[lang]} script.${feedback ? `\nFix these problems from your last answer:\n${feedback}` : ""}\n\n${JSON.stringify(Object.entries(EXPERIMENTS).map(([test, names]) => ({ test: Number(test), names })))}`,
      temperature: 0.2,
    });
    const out = Object.fromEntries(output.experiments.map((e) => [String(e.test), e.names]));
    const problems = Object.entries(EXPERIMENTS).flatMap(([test, names]) =>
      names.flatMap((n, i) => checkString(lang, n, out[test]?.[i]).map((p) => `test ${test} name ${i + 1}: ${p}`))
    );
    if (!problems.length) return out;
    feedback = problems.join("\n");
    console.log(`  ${lang} experiment names attempt ${attempt}: ${problems.length} problems`);
  }
  throw new Error(`${lang} experiment names still failing`);
}

async function translateTest(lang, testId) {
  const test = english.tests[testId];
  const questions = QUESTIONS.filter((q) => String(q.mockTestId) === testId);
  let feedback = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const { output } = await generateText({
        model: MODEL,
        output: Output.object({ schema }),
        prompt: prompt(lang, test, questions, feedback),
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(120000),
      });
      const part = {
        tests: { [testId]: { name: output.name, description: output.description } },
        questions: Object.fromEntries(output.questions.map((q) => [String(q.id), { title: q.title, question: q.question, options: q.options, explanation: q.explanation }])),
      };
      const sub = {
        tests: { [testId]: test },
        questions: Object.fromEntries(questions.map((q) => [String(q.id), english.questions[String(q.id)]])),
      };
      const problems = checkQuestionFile(lang, sub, part);
      if (!problems.length) return part;
      feedback = problems.slice(0, 25).join("\n");
      console.log(`  ${lang} test ${testId} attempt ${attempt}: ${problems.length} problems`);
    } catch (err) {
      console.log(`  ${lang} test ${testId} attempt ${attempt}: ${String(err.message || err).slice(0, 120)}`);
    }
  }
  throw new Error(`${lang} test ${testId} still failing after 4 attempts:\n${feedback}`);
}

const langs = process.argv.slice(2).length ? process.argv.slice(2) : TRANSLATED_LANGS;
fs.mkdirSync(OUT_DIR, { recursive: true });
let failed = 0;
for (const lang of langs) {
  if (!NAMES[lang]) throw new Error(`Unknown language ${lang}`);
  const file = loadFile(lang);
  const todo = Object.keys(english.tests).filter((id) => {
    const qs = QUESTIONS.filter((q) => String(q.mockTestId) === id);
    const sub = { tests: { [id]: english.tests[id] }, questions: Object.fromEntries(qs.map((q) => [String(q.id), english.questions[String(q.id)]])) };
    return checkQuestionFile(lang, sub, file).length > 0;
  });
  console.log(`${lang}: ${todo.length} of ${Object.keys(english.tests).length} tests to translate`);
  // A few tests at a time keeps within the Gateway's rate limits
  for (let i = 0; i < todo.length; i += 4) {
    const results = await Promise.allSettled(todo.slice(i, i + 4).map((id) => translateTest(lang, id)));
    for (const r of results) {
      if (r.status === "fulfilled") {
        Object.assign(file.tests, r.value.tests);
        Object.assign(file.questions, r.value.questions);
      } else {
        failed++;
        console.error(r.reason.message);
      }
    }
    // Save after every batch so a crash never loses finished work
    const sorted = {
      lang,
      reviewed: false,
      ...(file.experiments ? { experiments: file.experiments } : {}),
      tests: Object.fromEntries(Object.entries(file.tests).sort((a, b) => a[0] - b[0])),
      questions: Object.fromEntries(Object.entries(file.questions).sort((a, b) => a[0] - b[0])),
    };
    fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), JSON.stringify(sorted, null, 1) + "\n");
  }
  const namesOk =
    file.experiments &&
    Object.entries(EXPERIMENTS).every(([test, names]) => names.every((n, i) => !checkString(lang, n, file.experiments[test]?.[i]).length));
  if (!namesOk) {
    try {
      file.experiments = await translateExperiments(lang);
      const saved = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `${lang}.json`), "utf8"));
      saved.experiments = file.experiments;
      fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), JSON.stringify(saved, null, 1) + "\n");
    } catch (err) {
      failed++;
      console.error(err.message);
    }
  }
  const left = checkQuestionFile(lang, english, file);
  console.log(`${lang}: ${left.length ? `${left.length} problems left` : "all checks pass"}`);
}
process.exit(failed ? 1 : 0);
