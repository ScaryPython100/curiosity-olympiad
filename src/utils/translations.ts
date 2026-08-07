export type LanguageCode = "en" | "hi" | "te" | "ta" | "kn" | "ml" | "mr" | "bn" | "gu";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "te", label: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
];
