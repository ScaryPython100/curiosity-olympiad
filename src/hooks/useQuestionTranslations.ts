"use client";

import { useEffect, useState } from "react";
import { TRANSLATED_LANGS, type QuestionFile } from "@/utils/questionI18n";
import type { SceneFile } from "@/utils/sceneI18n";

type Kind = "questions" | "scenes";

// One download per file per visit (the service worker also caches it for offline use)
const cache = new Map<string, Promise<unknown>>();

function fetchFile(kind: Kind, lang: string) {
  const url = `/i18n/${kind}/${lang}.json`;
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => {
          cache.delete(url); // try again next time (e.g. after the network comes back)
          return null;
        })
    );
  }
  return cache.get(url)!;
}

function useTranslationFile<T>(kind: Kind, lang: string): T | null {
  const [loaded, setLoaded] = useState<{ lang: string; file: T | null } | null>(null);
  const wanted = TRANSLATED_LANGS.includes(lang);

  useEffect(() => {
    if (!wanted) return;
    let alive = true;
    fetchFile(kind, lang).then((file) => {
      if (alive) setLoaded({ lang, file: file as T | null });
    });
    return () => {
      alive = false;
    };
  }, [kind, lang, wanted]);

  return wanted && loaded?.lang === lang ? loaded.file : null;
}

/**
 * Practice questions in the student's language, or null for English (or while
 * loading, or offline): the page then shows the English text.
 */
export function useQuestionTranslations(lang: string): QuestionFile | null {
  return useTranslationFile<QuestionFile>("questions", lang);
}

/** Text inside the experiments in the student's language, or null for English. */
export function useSceneTranslations(lang: string): SceneFile | null {
  return useTranslationFile<SceneFile>("scenes", lang);
}
