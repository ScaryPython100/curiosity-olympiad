/**
 * Translated practice questions. English stays in the practice page; each
 * other language is a JSON file in public/i18n/questions/<lang>.json, made by
 * scripts/translate-questions.mjs and only downloaded when a student picks
 * that language. Pure helpers so the script and the tests can use them.
 */

export interface QuestionText {
  title: string;
  question: string;
  /** Same order as English, so the right answer index never changes. */
  options: string[];
  explanation: string;
}

export interface TestText {
  name: string;
  description: string;
}

export interface QuestionFile {
  lang: string;
  /** AI-drafted until a teacher has checked it. */
  reviewed: boolean;
  tests: Record<string, TestText>;
  questions: Record<string, QuestionText>;
  /** The 3 experiment names per test, by test number. */
  experiments?: Record<string, string[]>;
}

/** Unicode block of each language's script. */
export const SCRIPT: Record<string, RegExp> = {
  hi: /[\u0900-\u097F]/g,
  mr: /[\u0900-\u097F]/g,
  bn: /[\u0980-\u09FF]/g,
  gu: /[\u0A80-\u0AFF]/g,
  ta: /[\u0B80-\u0BFF]/g,
  te: /[\u0C00-\u0C7F]/g,
  kn: /[\u0C80-\u0CFF]/g,
  ml: /[\u0D00-\u0D7F]/g,
};

export const TRANSLATED_LANGS = Object.keys(SCRIPT);

// Indian-script digits (e.g. Bengali \u09EC, Devanagari \u096C) count as the same numbers.
// Each script's digits 0-9 sit together, starting at its "zero".
const DIGIT_ZEROS = [0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66, 0x0ce6, 0x0d66];
const toAsciiDigits = (s: string) =>
  [...s]
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      const zero = DIGIT_ZEROS.find((z) => cp >= z && cp <= z + 9);
      return zero === undefined ? ch : String(cp - zero);
    })
    .join("");
const numbersIn = (s: string): string[] => [...(toAsciiDigits(s).match(/\d+(?:\.\d+)?/g) ?? [])].sort();

/** Problems with one translated string, compared with its English source. */
export function checkString(lang: string, en: string, tr: string | undefined): string[] {
  if (!tr || !tr.trim()) return ["empty"];
  const problems: string[] = [];
  const script = SCRIPT[lang];
  const letters = (tr.match(/\p{L}/gu) ?? []).length;
  const native = script ? (tr.match(script) ?? []).length : letters;
  // Mostly the target script (a few English science words or letters are fine)
  if (letters > 0 && native / letters < 0.6) problems.push("mostly not in the target script");
  const enNums = numbersIn(en);
  const trNums = numbersIn(tr);
  for (const n of enNums) if (!trNums.includes(n)) problems.push(`number ${n} missing`);
  const ratio = tr.length / Math.max(1, en.length);
  // Short options can be much shorter in another language, so only check longer text
  if (en.length > 30 && (ratio < 0.3 || ratio > 4)) problems.push(`length looks wrong (${ratio.toFixed(1)}x)`);
  return problems;
}

/** All problems in a language file, as "q12.options[2]: number 5 missing". */
export function checkQuestionFile(
  lang: string,
  english: { questions: Record<string, QuestionText>; tests: Record<string, TestText> },
  file: Pick<QuestionFile, "questions" | "tests">
): string[] {
  const out: string[] = [];
  for (const [id, en] of Object.entries(english.questions)) {
    const tr = file.questions[id];
    if (!tr) {
      out.push(`q${id}: missing`);
      continue;
    }
    if (!Array.isArray(tr.options) || tr.options.length !== en.options.length) {
      out.push(`q${id}.options: need ${en.options.length}`);
    }
    for (const field of ["title", "question", "explanation"] as const) {
      for (const p of checkString(lang, en[field], tr[field])) out.push(`q${id}.${field}: ${p}`);
    }
    en.options.forEach((o, i) => {
      for (const p of checkString(lang, o, tr.options?.[i])) out.push(`q${id}.options[${i}]: ${p}`);
    });
  }
  for (const [id, en] of Object.entries(english.tests)) {
    const tr = file.tests[id];
    if (!tr) {
      out.push(`test${id}: missing`);
      continue;
    }
    for (const field of ["name", "description"] as const) {
      for (const p of checkString(lang, en[field], tr[field])) out.push(`test${id}.${field}: ${p}`);
    }
  }
  return out;
}

/** The question in the student's language, falling back to English piece by piece. */
export function localizeQuestion<Q extends QuestionText & { id: number }>(q: Q, file: QuestionFile | null): Q {
  const tr = file?.questions[String(q.id)];
  if (!tr) return q;
  return {
    ...q,
    title: tr.title || q.title,
    question: tr.question || q.question,
    options: q.options.map((o, i) => tr.options?.[i] || o),
    explanation: tr.explanation || q.explanation,
  };
}
