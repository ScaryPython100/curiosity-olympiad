"use client";

import { useEffect, useState } from "react";
import { TRANSLATED_LANGS, type QuestionFile } from "@/utils/questionI18n";

// One download per language per visit (the service worker also caches it for offline use)
const cache = new Map<string, Promise<QuestionFile | null>>();

function fetchFile(lang: string) {
  if (!cache.has(lang)) {
    cache.set(
      lang,
      fetch(`/i18n/questions/${lang}.json`)
        .then((r) => (r.ok ? (r.json() as Promise<QuestionFile>) : null))
        .catch(() => {
          cache.delete(lang); // try again next time (e.g. after the network comes back)
          return null;
        })
    );
  }
  return cache.get(lang)!;
}

/**
 * Practice questions in the student's language, or null for English (or while
 * loading, or offline): the page then shows the English text.
 */
export function useQuestionTranslations(lang: string): QuestionFile | null {
  const [loaded, setLoaded] = useState<{ lang: string; file: QuestionFile | null } | null>(null);
  const wanted = TRANSLATED_LANGS.includes(lang);

  useEffect(() => {
    if (!wanted) return;
    let alive = true;
    fetchFile(lang).then((file) => {
      if (alive) setLoaded({ lang, file });
    });
    return () => {
      alive = false;
    };
  }, [lang, wanted]);

  return wanted && loaded?.lang === lang ? loaded.file : null;
}
