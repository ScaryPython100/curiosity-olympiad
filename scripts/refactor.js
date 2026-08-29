const fs = require('fs');
const path = require('path');

const EN_JSON_PATH = path.join(__dirname, '../locales/en.json');
const SRC_DIR = path.join(__dirname, '../src');

// 1. Build Reverse Map
const enData = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));
const keyToPath = {};

function buildReverseMap(obj, currentPath = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      buildReverseMap(value, [...currentPath, key]);
    } else {
      keyToPath[key] = [...currentPath, key].join('.');
    }
  }
}

buildReverseMap(enData);

console.log(`Built reverse map with ${Object.keys(keyToPath).length} keys.`);

// 2. Find all TSX files
function getTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getTsxFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getTsxFiles(SRC_DIR);

// 3. Process each file
let filesModified = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Regex to match t("key") or t('key') and optionally || "fallback text"
  // It matches: {t("key") || "default"} or t("key") || "default"
  // Note: we'll just replace t("key") first, then maybe clean up the || "default"
  
  // Replace t("key") with t.section.key
  content = content.replace(/\bt\(['"]([^'"]+)['"]\)/g, (match, key) => {
    if (keyToPath[key]) {
      // Some keys might be reserved words or need bracket notation, but for this project dot notation should be fine.
      return `t.${keyToPath[key]}`;
    }
    return match; // If not found, leave as is
  });

  // Now, try to clean up the fallbacks: t.auth.login_btn || "Login" -> t.auth.login_btn
  // We can use a regex that looks for t.something.something || "string"
  // Example match: t.auth.login_btn || "fallback"
  content = content.replace(/t\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\|\|\s*["'][^"']*["']/g, (match, section, key) => {
    return `t.${section}.${key}`;
  });

  // Also clean up {t.section.key || "string"} to {t.section.key}
  content = content.replace(/\{t\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\|\|\s*["'][^"']*["']\}/g, (match, section, key) => {
    return `{t.${section}.${key}}`;
  });
  
  // Sometimes it's inside parens: (t.section.key || "string")
  content = content.replace(/\(t\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\|\|\s*["'][^"']*["']\)/g, (match, section, key) => {
    return `(t.${section}.${key})`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    filesModified++;
  }
}

console.log(`Refactoring complete. Modified ${filesModified} files.`);
