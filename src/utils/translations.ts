export type LanguageCode = "en" | "hi" | "kn" | "te" | "ta" | "mr";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // App & Header
    app_title: "Curiosity Olympiad",
    explorer_dashboard: "Explorer Dashboard",
    practice_lab: "Practice Lab",
    tournaments: "Tournaments",
    leaderboard: "Leaderboard",
    profile: "Profile",
    settings: "Settings",
    language: "Language",
    logout: "Logout",

    // Dashboard Stats & Widgets
    curiosity_quotient: "Curiosity Quotient",
    daily_streak: "Daily Streak",
    total_xp: "Total XP",
    expedition_progress: "Expedition Progress",
    partner_schools: "Partner Schools",
    claim_daily_xp: "Claim Daily XP",
    practice_tests: "Practice Tests",
    interactive_sandbox: "Interactive Sandbox",
    try_practice_test: "Try Practice Test",

    // 6 Practice Test Titles
    test_gravity: "Gravity & Air Resistance",
    test_pendulum: "Pendulum Lab",
    test_solar: "Solar System Simulator",
    test_optics: "Light & Optics Bench",
    test_circuit: "DC Circuit Builder",
    test_sound: "Sound Waves & Frequency",

    // Profile & CQ Radar
    cq_spatial: "Spatial Logic",
    cq_pattern: "Pattern Recognition",
    cq_vigilance: "Epistemic Vigilance",
    cq_deductive: "Deductive Reasoning",
    cognitive_profile: "Cognitive Profile",
    total_score: "Total Score",
  },
  hi: {
    // App & Header
    app_title: "जिज्ञासा ओलंपियाड",
    explorer_dashboard: "एक्सप्लोरर डैशबोर्ड",
    practice_lab: "अभ्यास प्रयोगशाला",
    tournaments: "प्रतियोगिताएं",
    leaderboard: "लीडरबोर्ड",
    profile: "प्रोफ़ाइल",
    settings: "सेटिंग्स",
    language: "भाषा",
    logout: "लॉग आउट",

    // Dashboard Stats & Widgets
    curiosity_quotient: "जिज्ञासा भागफल",
    daily_streak: "दैनिक स्ट्रीक",
    total_xp: "कुल XP",
    expedition_progress: "अभियान प्रगति",
    partner_schools: "पार्टनर स्कूल",
    claim_daily_xp: "दैनिक XP प्राप्त करें",
    practice_tests: "अभ्यास परीक्षण",
    interactive_sandbox: "इंटरैक्टिव सैंडबॉक्स",
    try_practice_test: "अभ्यास परीक्षण शुरू करें",

    // 6 Practice Test Titles
    test_gravity: "गुरुत्वाकर्षण और वायु प्रतिरोध",
    test_pendulum: "पेंडुलम प्रयोगशाला",
    test_solar: "सौर मंडल सिम्युलेटर",
    test_optics: "प्रकाश और प्रकाशिकी",
    test_circuit: "डीसी सर्किट बिल्डर",
    test_sound: "ध्वनि तरंगें और आवृत्ति",

    // Profile & CQ Radar
    cq_spatial: "स्थानिक तर्क",
    cq_pattern: "पैटर्न पहचान",
    cq_vigilance: "ज्ञानात्मक सतर्कता",
    cq_deductive: "निगमनात्मक तर्क",
    cognitive_profile: "संज्ञानात्मक प्रोफ़ाइल",
    total_score: "कुल स्कोर",
  },
  kn: {
    // App & Header
    app_title: "ಕುತೂಹಲ ಒಲಂಪಿಯಾಡ್",
    explorer_dashboard: "ಎಕ್ಸ್‌ಪ್ಲೋರರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    practice_lab: "ಅಭ್ಯಾಸ ಪ್ರಯೋಗಾಲಯ",
    tournaments: "ಪಂದ್ಯಾವಳಿಗಳು",
    leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್",
    profile: "ಪ್ರೊಫೈಲ್",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    language: "ಭಾಷೆ",
    logout: "ಲಾಗ್ ಔಟ್",

    // Dashboard Stats & Widgets
    curiosity_quotient: "ಕುತೂಹಲ ಗುಣಾಂಕ",
    daily_streak: "ದೈನಂದಿನ ಸ್ಟ್ರೀಕ್",
    total_xp: "ಒಟ್ಟು XP",
    expedition_progress: "ಅಭಿಯಾನದ ಪ್ರಗತಿ",
    partner_schools: "ಪಾಲುದಾರ ಶಾಲೆಗಳು",
    claim_daily_xp: "ದೈನಂದಿನ XP ಪಡೆಯಿರಿ",
    practice_tests: "ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆಗಳು",
    interactive_sandbox: "ಇಂಟರಾಕ್ಟಿವ್ ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್",
    try_practice_test: "ಅಭ್ಯಾಸ ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ",

    // 6 Practice Test Titles
    test_gravity: "ಗುರುತ್ವಾಕರ್ಷಣೆ ಮತ್ತು ವಾಯು ಪ್ರತಿರೋಧ",
    test_pendulum: "ಲೋಲಕ ಪ್ರಯೋಗಾಲಯ",
    test_solar: "ಸೌರವ್ಯೂಹ ಸಿಮ್ಯುಲೇಟರ್",
    test_optics: "ಬೆಳಕು ಮತ್ತು ದೃಗ್ವಿಜ್ಞಾನ",
    test_circuit: "ಡಿಸಿ ಸರ್ಕ್ಯೂಟ್ ಬಿಲ್ಡರ್",
    test_sound: "ಧ್ವನಿ ತರಂಗಗಳು ಮತ್ತು ಆವರ್ತನ",

    // Profile & CQ Radar
    cq_spatial: "ಸ್ಥಳೀಯ ತರ್ಕ",
    cq_pattern: "ಪ್ಯಾಟರ್ನ್ ಗುರುತಿಸುವಿಕೆ",
    cq_vigilance: "ಜ್ಞಾನಾತ್ಮಕ ಎಚ್ಚರಿಕೆ",
    cq_deductive: "ನಿಗಮನ ತರ್ಕ",
    cognitive_profile: "ಜ್ಞಾನಾತ್ಮಕ ಪ್ರೊಫೈಲ್",
    total_score: "ಒಟ್ಟು ಅಂಕಗಳು",
  },
  te: {
    // App & Header
    app_title: "కుతూహల ఒలంపియాడ్",
    explorer_dashboard: "ఎక్స్‌ప్లోరర్ డాష్‌బోర్డ్",
    practice_lab: "అభ్యాస ప్రయోగశాల",
    tournaments: "టోర్నమెంట్లు",
    leaderboard: "లీడర్‌బోర్డ్",
    profile: "ప్రొఫైల్",
    settings: "సెట్టింగ్‌లు",
    language: "భాష",
    logout: "లాగ్ అవుట్",

    // Dashboard Stats & Widgets
    curiosity_quotient: "కుతూహల గుణకం",
    daily_streak: "దైనందిన స్ట్రీక్",
    total_xp: "మొత్తం XP",
    expedition_progress: "యాత్ర పురోగతి",
    partner_schools: "భాగస్వామ్య పాఠశాలలు",
    claim_daily_xp: "దైనందిన XP పొందండి",
    practice_tests: "అభ్యాస పరీక్షలు",
    interactive_sandbox: "ఇంటరాక్టివ్ శాండ్‌బాక్స్",
    try_practice_test: "అభ్యాస పరీక్ష ప్రారంభించండి",

    // 6 Practice Test Titles
    test_gravity: "గురుత్వాకర్షణ మరియు వాయు నిరోధకత",
    test_pendulum: "లోలకం ప్రయోగశాల",
    test_solar: "సౌర వ్యవస్థ సిమ్యులేటర్",
    test_optics: "కాంతి మరియు ఆప్టిక్స్",
    test_circuit: "డీసీ సర్క్యూట్ బిల్డర్",
    test_sound: "ధ్వని తరంగాలు మరియు పౌనఃపున్యం",

    // Profile & CQ Radar
    cq_spatial: "ప్రాదేశిక తర్కం",
    cq_pattern: "నమూనా గుర్తింపు",
    cq_vigilance: "జ్ఞానాత్మక అప్రమత్తత",
    cq_deductive: "నిగమన తర్కం",
    cognitive_profile: "జ్ఞానాత్మక ప్రొఫైల్",
    total_score: "మొత్తం స్కోరు",
  },
  ta: {
    // App & Header
    app_title: "ஆர்வம் ஒலிம்பியாட்",
    explorer_dashboard: "ஆய்வாளர் டாஷ்போர்டு",
    practice_lab: "பயிற்சி ஆய்வகம்",
    tournaments: "போட்டிகள்",
    leaderboard: "முன்னணி பலகை",
    profile: "சுயவிவரம்",
    settings: "அமைப்புகள்",
    language: "மொழி",
    logout: "வெளியேறு",

    // Dashboard Stats & Widgets
    curiosity_quotient: "ஆர்வ ஈவு",
    daily_streak: "தினசரி தொடர்",
    total_xp: "மொத்த XP",
    expedition_progress: "பயண முன்னேற்றம்",
    partner_schools: "கூட்டாளர் பள்ளிகள்",
    claim_daily_xp: "தினசரி XP பெறுக",
    practice_tests: "பயிற்சி தேர்வுகள்",
    interactive_sandbox: "ஊடாடும் சாண்ட்பாக்ஸ்",
    try_practice_test: "பயிற்சி தேர்வை முயற்சிக்கவும்",

    // 6 Practice Test Titles
    test_gravity: "ஈர்ப்பு மற்றும் காற்று எதிர்ப்பு",
    test_pendulum: "ஊசல் ஆய்வகம்",
    test_solar: "சூரிய குடும்ப சிமுலேட்டர்",
    test_optics: "ஒளி மற்றும் ஒளியியல்",
    test_circuit: "டிசி சர்க்யூட் பில்டர்",
    test_sound: "ஒலி அலைகள் மற்றும் அதிர்வெண்",

    // Profile & CQ Radar
    cq_spatial: "இடஞ்சார்ந்த தர்க்கம்",
    cq_pattern: "மாதிரி அறிதல்",
    cq_vigilance: "அறிவுசார் விழிப்புணர்வு",
    cq_deductive: "அனுமான தர்க்கம்",
    cognitive_profile: "அறிவாற்றல் சுயவிவரம்",
    total_score: "மொத்த மதிப்பெண்",
  },
  mr: {
    // App & Header
    app_title: "जिज्ञासा ऑलिम्पियाड",
    explorer_dashboard: "एक्सप्लोरर डॅशबोर्ड",
    practice_lab: "सराव प्रयोगशाळा",
    tournaments: "स्पर्धा",
    leaderboard: "लीडरबोर्ड",
    profile: "प्रोफाइल",
    settings: "सेटिंग्ज",
    language: "भाषा",
    logout: "लॉग आउट",

    // Dashboard Stats & Widgets
    curiosity_quotient: "जिज्ञासा भागफल",
    daily_streak: "दैनिक स्ट्रीक",
    total_xp: "एकूण XP",
    expedition_progress: "मोहीम प्रगती",
    partner_schools: "भागीदार शाळा",
    claim_daily_xp: "दैनिक XP मिळवा",
    practice_tests: "सराव चाचण्या",
    interactive_sandbox: "इंटरॅक्टिव्ह सँडबॉक्स",
    try_practice_test: "सराव चाचणी सुरू करा",

    // 6 Practice Test Titles
    test_gravity: "गुरुत्वाकर्षण आणि हवा प्रतिकार",
    test_pendulum: "लंबक प्रयोगशाळा",
    test_solar: "सूर्यमाला सिम्युलेटर",
    test_optics: "प्रकाश आणि ऑप्टिक्स",
    test_circuit: "डीसी सर्किट बिल्डर",
    test_sound: "ध्वनी लहरी आणि वारंवारता",

    // Profile & CQ Radar
    cq_spatial: "स्थानिक तर्क",
    cq_pattern: "पॅटर्न ओळख",
    cq_vigilance: "ज्ञानात्मक सतर्कता",
    cq_deductive: "निगमनात्मक तर्क",
    cognitive_profile: "संज्ञानात्मक प्रोफाइल",
    total_score: "एकूण गुण",
  },
};
