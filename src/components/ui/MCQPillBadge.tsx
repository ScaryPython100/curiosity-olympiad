"use client";

import React from "react";

export interface MCQPillOptionProps {
  index: number;
  label: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isSubmitted?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Standardized Accessible MCQ Option Button with Circular Letter Pill (A, B, C, D)
 * - Minimum touch target >= 44px
 * - Tactile active press state (<100ms)
 * - Accessible high-contrast colors
 */
export function MCQPillOption({
  index,
  label,
  isSelected = false,
  isCorrect = false,
  isSubmitted = false,
  disabled = false,
  onClick,
  className = "",
}: MCQPillOptionProps) {
  const letter = String.fromCharCode(65 + index); // A, B, C, D...

  let containerStyle =
    "bg-gray-50/80 border-gray-200 text-gray-800 hover:bg-gray-100 hover:border-gray-300";
  let pillStyle = "bg-gray-200 text-gray-700";

  if (isSubmitted) {
    if (isCorrect) {
      containerStyle = "bg-green-600 text-white font-bold border-green-700 shadow-sm";
      pillStyle = "bg-white/20 text-white";
    } else if (isSelected && !isCorrect) {
      containerStyle = "bg-red-500 text-white font-bold border-red-600";
      pillStyle = "bg-white/20 text-white";
    } else {
      containerStyle = "bg-gray-100 text-gray-400 border-gray-200";
      pillStyle = "bg-gray-200 text-gray-400";
    }
  } else if (isSelected) {
    containerStyle = "bg-[#143867] text-white font-bold border-[#143867] shadow-sm";
    pillStyle = "bg-white/20 text-white";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isSubmitted}
      className={`min-h-[44px] p-3 sm:p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-transform duration-100 active:scale-[0.98] flex items-center justify-between gap-2.5 cursor-pointer w-full ${containerStyle} ${className}`}
      aria-label={`Option ${letter}: ${label}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${pillStyle}`}
        >
          {letter}
        </span>
        <span className="leading-snug">{label}</span>
      </div>
      {isSelected && !isSubmitted && (
        <span className="material-symbols-outlined text-sm shrink-0">check</span>
      )}
    </button>
  );
}
