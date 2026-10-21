/**
 * Text inside the 39 experiments in the student's language. English lives in
 * src/components/SandboxEngine/sceneStrings.ts; each other language is
 * public/i18n/scenes/<lang>.json with the same keys, made by
 * scripts/translate-scenes.mjs and downloaded only for the student's language.
 * Pure helpers so the scenes, the script and the tests can share them.
 */
import { checkString, samePlaceholders } from "./questionI18n.ts";

/** Experiment group (e.g. "buoyancy") → key → text. */
export type SceneStrings = Record<string, Record<string, string>>;

export interface SceneFile {
  lang: string;
  /** AI-drafted until a teacher has checked it. */
  reviewed: boolean;
  text: SceneStrings;
}

/** The translated text, or English when it is missing or lost a {placeholder}. */
export function sceneString(file: SceneFile | null, group: string, key: string, en: string): string {
  const tr = file?.text?.[group]?.[key];
  return tr && tr.trim() && samePlaceholders(en, tr) ? tr : en;
}

/** All problems in a scene file, as "buoyancy.boat_sank: number 4 missing". */
export function checkSceneFile(lang: string, english: SceneStrings, file: Pick<SceneFile, "text">): string[] {
  const out: string[] = [];
  for (const [group, strings] of Object.entries(english)) {
    for (const [key, en] of Object.entries(strings)) {
      for (const p of checkString(lang, en, file.text?.[group]?.[key])) out.push(`${group}.${key}: ${p}`);
    }
  }
  return out;
}
