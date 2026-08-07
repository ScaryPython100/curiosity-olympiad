"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageCode } from "@/utils/translations";

export function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95 text-xs font-bold text-[#143867] dark:text-[#ffe16d]"
        aria-label="Select Language"
      >
        <span className="material-symbols-outlined text-sm">translate</span>
        <span>{currentLang.nativeName}</span>
        <span className="material-symbols-outlined text-xs">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
            Select Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#ffe16d]/20 dark:hover:bg-gray-800 transition-colors ${
                  isSelected
                    ? "font-bold text-[#143867] dark:text-[#ffe16d] bg-[#ffe16d]/10"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-gray-400">({lang.label})</span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-sm text-[#143867] dark:text-[#ffe16d]">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
