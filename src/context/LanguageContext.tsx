"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES, LanguageOption } from "@/utils/translations";

import enDictionary from "../../locales/en.json";
import hiDictionary from "../../locales/hi.json";
import teDictionary from "../../locales/te.json";
import taDictionary from "../../locales/ta.json";
import knDictionary from "../../locales/kn.json";
import mlDictionary from "../../locales/ml.json";
import mrDictionary from "../../locales/mr.json";
import bnDictionary from "../../locales/bn.json";
import guDictionary from "../../locales/gu.json";

// We use the English dictionary as the source of truth for types
export type DictionaryType = typeof enDictionary;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: DictionaryType;
  languages: LanguageOption[];
}

const dictionaries: Record<LanguageCode, DictionaryType> = {
  en: enDictionary,
  hi: hiDictionary as unknown as DictionaryType,
  te: teDictionary as unknown as DictionaryType,
  ta: taDictionary as unknown as DictionaryType,
  kn: knDictionary as unknown as DictionaryType,
  ml: mlDictionary as unknown as DictionaryType,
  mr: mrDictionary as unknown as DictionaryType,
  bn: bnDictionary as unknown as DictionaryType,
  gu: guDictionary as unknown as DictionaryType,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [dictionary, setDictionary] = useState<DictionaryType>(enDictionary);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = (localStorage.getItem("curiosity_language") as LanguageCode) || "en";
      if (SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
        setLanguageState(savedLang);
        setDictionary(dictionaries[savedLang] || enDictionary);
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setDictionary(dictionaries[lang] || enDictionary);
    if (typeof window !== "undefined") {
      localStorage.setItem("curiosity_language", lang);
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
