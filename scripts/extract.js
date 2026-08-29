const fs = require('fs');
const path = require('path');

const EN_JSON_PATH = path.join(__dirname, '../locales/en.json');
const SRC_DIR = path.join(__dirname, '../src');

let enData = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));

// Build reverse map to check if key exists anywhere
const existingKeys = new Set();
function collectKeys(obj) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'object') collectKeys(value);
    else existingKeys.add(value); // well, actually we want to check if the string value exists, or if the key name exists.
  }
}
// Actually, it's easier to check if the old flat key was already mapped. My refactor.js built `keyToPath`. Let's build it again.
const keyToPath = {};
function buildReverseMap(obj, currentPath = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object') buildReverseMap(v, [...currentPath, k]);
    else keyToPath[k] = [...currentPath, k].join('.');
  }
}
buildReverseMap(enData);

function getTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) getTsxFiles(fullPath, fileList);
    else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) fileList.push(fullPath);
  }
  return fileList;
}

const allFiles = getTsxFiles(SRC_DIR);

let newKeysAdded = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // Determine section based on file path
  let section = 'common';
  if (file.includes('/login/')) section = 'auth';
  else if (file.includes('/leaderboard/')) section = 'leaderboard';
  else if (file.includes('/dashboard/')) section = 'dashboard';
  else if (file.includes('/discover/')) section = 'discover';
  else if (file.includes('/practice/')) section = 'practice';
  else if (file.includes('/settings/')) section = 'settings';
  else if (file.includes('/profile/')) section = 'profile';

  if (!enData[section]) enData[section] = {};

  // Match t("key") || "Fallback"
  // Using a regex to find all t("key") or t("key") || "Fallback"
  const regex = /t\(['"]([^'"]+)['"]\)(?:\s*\|\|\s*(['"])(.*?)\2)?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    let fallback = match[3] || key; // If no fallback, use the key itself as fallback text

    if (!keyToPath[key]) {
      // Key is missing!
      // Add it to enData
      // Avoid duplicate keys in the section by appending a number if necessary, but actually the original key was unique.
      if (!enData[section][key]) {
        enData[section][key] = fallback;
        keyToPath[key] = `${section}.${key}`;
        newKeysAdded++;
        console.log(`Added new key [${section}.${key}]: "${fallback}" from ${path.basename(file)}`);
      }
    }
  }
}

if (newKeysAdded > 0) {
  fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enData, null, 2), 'utf8');
  console.log(`Added ${newKeysAdded} new keys to en.json`);
} else {
  console.log('No new keys found.');
}
