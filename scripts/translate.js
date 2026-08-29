import fs from 'fs';
import path from 'path';

const enData = JSON.parse(fs.readFileSync(path.resolve('./locales/en.json'), 'utf-8'));
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

// List of major Indian languages supported by Sarvam
const TARGET_LANGUAGES = [
  'hi-IN', // Hindi
  'te-IN', // Telugu
  'ta-IN', // Tamil
  'kn-IN', // Kannada
  'ml-IN', // Malayalam
  'mr-IN', // Marathi
  'bn-IN', // Bengali
  'gu-IN'  // Gujarati
];

async function callSarvamAPI(text, targetLangCode) {
  const response = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': SARVAM_API_KEY
    },
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: targetLangCode,
      model: 'sarvam-translate:v1'
    })
  });

  if (!response.ok) {
    console.error(`Failed: "${text}" to ${targetLangCode}`, await response.text());
    return text; // Fallback to English to prevent breaking the UI
  }

  const data = await response.json();
  return data.translated_text;
}

async function translateObject(obj, targetLangCode) {
  const translated = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      translated[key] = await translateObject(value, targetLangCode);
    } else {
      console.log(`Translating to ${targetLangCode}: "${value}"`);
      translated[key] = await callSarvamAPI(value, targetLangCode); 
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit buffer
    }
  }
  return translated;
}

async function run() {
  console.log('Starting Sarvam AI Full Translation Pipeline...');
  
  if (!SARVAM_API_KEY) {
    console.error('ERROR: SARVAM_API_KEY is missing from environment.');
    return;
  }

  for (const lang of TARGET_LANGUAGES) {
    console.log(`\n--- Starting translation for ${lang} ---`);
    const translatedData = await translateObject(enData, lang);
    const prefix = lang.split('-')[0]; // Extracts 'hi', 'te', 'ta', etc.
    fs.writeFileSync(path.resolve(`./locales/${prefix}.json`), JSON.stringify(translatedData, null, 2));
    console.log(`✅ ${lang} generated at locales/${prefix}.json`);
  }
  
  console.log('\n🎉 All major languages translated successfully!');
}

run();