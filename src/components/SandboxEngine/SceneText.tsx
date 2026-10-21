"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useRef, type ReactNode, type SVGProps } from "react";
import { SCENE_TEXT, type SceneGroup } from "./sceneStrings";
import { fillText } from "@/utils/questionI18n";
import { sceneString, type SceneFile } from "@/utils/sceneI18n";
import { useSceneTranslations } from "@/hooks/useQuestionTranslations";
import type { SpeechLang } from "@/utils/speech";

type Vars = Record<string, string | number>;

const SceneTextContext = createContext<{ lang: SpeechLang; file: SceneFile | null }>({ lang: "en", file: null });

/** Gives the experiments their text in `lang` (English until the file loads, or offline). */
export function SceneTextProvider({ lang, children }: { lang: string; children: ReactNode }) {
  const file = useSceneTranslations(lang);
  const value = useMemo(() => ({ lang: (file ? lang : "en") as SpeechLang, file }), [file, lang]);
  return <SceneTextContext.Provider value={value}>{children}</SceneTextContext.Provider>;
}

/** The language the experiment text is shown in, so read-aloud uses the right voice. */
export const useSceneLang = () => useContext(SceneTextContext).lang;

/**
 * `s(key, vars)` is the text in the student's language, `en(key, vars)` the
 * English (FitText uses it to know how much room a label has).
 */
export function useSceneText<G extends SceneGroup>(group: G) {
  const { file } = useContext(SceneTextContext);
  return useMemo(() => {
    const strings = SCENE_TEXT[group] as Record<string, string>;
    type Key = keyof (typeof SCENE_TEXT)[G] & string;
    const en = (key: Key, vars?: Vars) => fillText(strings[key], vars);
    const s = (key: Key, vars?: Vars) => fillText(sceneString(file, group, key, strings[key]), vars);
    return { s, en };
  }, [file, group]);
}

let measureCanvas: HTMLCanvasElement | null = null;
function englishWidth(el: SVGTextElement, text: string) {
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return Infinity;
  const style = getComputedStyle(el);
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return ctx.measureText(text).width;
}

/**
 * SVG label that never gets much wider than its English text: a longer
 * translation is squeezed a little so it cannot run off the picture or into
 * another label. `children` is the shown text, `en` the English; `maxWidth`
 * (SVG units) also caps a label that sits next to the picture's edge.
 */
export function FitText({
  en,
  maxWidth,
  children,
  ...props
}: Omit<SVGProps<SVGTextElement>, "children" | "ref"> & { en: string; maxWidth?: number; children: string }) {
  const ref = useRef<SVGTextElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.removeAttribute("textLength");
    el.removeAttribute("lengthAdjust");
    const room = Math.min(maxWidth ?? Infinity, children === en ? Infinity : englishWidth(el, en) * 1.15 + 6);
    if (room < Infinity && el.getComputedTextLength() > room) {
      el.setAttribute("textLength", room.toFixed(1));
      el.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
  }, [children, en, maxWidth]);
  return (
    <text ref={ref} {...props}>
      {children}
    </text>
  );
}
