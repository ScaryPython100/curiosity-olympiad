"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES, LanguageOption } from "@/utils/translations";

import enDictionary from "../../locales/en.json";

// We use the English dictionary as the source of truth for types
export type DictionaryType = typeof enDictionary;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: DictionaryType;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [dictionary, setDictionary] = useState<DictionaryType>(enDictionary);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = (localStorage.getItem("curiosity_language") as LanguageCode) || "en";
      if (SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
        setLanguageState(savedLang);
        if (savedLang !== "en") {
          import(`../../locales/${savedLang}.json`)
            .then((mod) => setDictionary(mod.default as unknown as DictionaryType))
            .catch((err) => {
              console.error(`Failed to load dictionary for ${savedLang}:`, err);
              setDictionary(enDictionary);
            });
        }
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("curiosity_language", lang);
    }
    if (lang === "en") {
      setDictionary(enDictionary);
    } else {
      import(`../../locales/${lang}.json`)
        .then((mod) => setDictionary(mod.default as unknown as DictionaryType))
        .catch((err) => {
          console.error(`Failed to load dictionary for ${lang}:`, err);
          setDictionary(enDictionary);
        });
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: dictionary,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
