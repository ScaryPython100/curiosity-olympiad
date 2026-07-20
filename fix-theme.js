const fs = require('fs');
const path = require('path');

const replacements = [
  { match: /(?<=['"\s])bg-\[#f7f9fb\](?! dark:bg-gray-900)(?=['"\s])/g, replace: 'bg-[#f7f9fb] dark:bg-gray-900' },
  { match: /(?<=['"\s])text-\[#191c1e\](?! dark:text-gray-100)(?=['"\s])/g, replace: 'text-[#191c1e] dark:text-gray-100' },
  { match: /(?<=['"\s])bg-white(?! dark:bg-gray-800)(?=['"\s])/g, replace: 'bg-white dark:bg-gray-800' },
  { match: /(?<=['"\s])text-\[#143867\](?! dark:text-blue-[34]00)(?=['"\s])/g, replace: 'text-[#143867] dark:text-blue-400' },
  { match: /(?<=['"\s])text-gray-600(?! dark:text-gray-400)(?=['"\s])/g, replace: 'text-gray-600 dark:text-gray-400' },
  { match: /(?<=['"\s])text-gray-500(?! dark:text-gray-400)(?=['"\s])/g, replace: 'text-gray-500 dark:text-gray-400' },
  { match: /(?<=['"\s])text-gray-800(?! dark:text-gray-200)(?=['"\s])/g, replace: 'text-gray-800 dark:text-gray-200' },
  { match: /(?<=['"\s])border-gray-200(?! dark:border-gray-[78]00)(?=['"\s])/g, replace: 'border-gray-200 dark:border-gray-700' },
  { match: /(?<=['"\s])border-gray-100(?! dark:border-gray-700)(?=['"\s])/g, replace: 'border-gray-100 dark:border-gray-700' },
  { match: /(?<=['"\s])border-gray-300(?! dark:border-gray-600)(?=['"\s])/g, replace: 'border-gray-300 dark:border-gray-600' },
  { match: /(?<=['"\s])border-\[#143867\](?! dark:border-blue-400)(?=['"\s])/g, replace: 'border-[#143867] dark:border-blue-400' },
  { match: /(?<=['"\s])hover:bg-gray-50(?! dark:hover:bg-gray-700)(?=['"\s])/g, replace: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
  { match: /(?<=['"\s])hover:bg-gray-100(?! dark:hover:bg-gray-700)(?=['"\s])/g, replace: 'hover:bg-gray-100 dark:hover:bg-gray-700' },
  { match: /(?<=['"\s])hover:bg-gray-200(?! dark:hover:bg-gray-800)(?=['"\s])/g, replace: 'hover:bg-gray-200 dark:hover:bg-gray-800' },
  { match: /(?<=['"\s])bg-\[#dde3eb\](?! dark:bg-gray-700)(?=['"\s])/g, replace: 'bg-[#dde3eb] dark:bg-gray-700' },
  { match: /(?<=['"\s])bg-gray-50(?! dark:bg-gray-800)(?=['"\s])/g, replace: 'bg-gray-50 dark:bg-gray-800' },
  { match: /(?<=['"\s])bg-gray-100(?! dark:bg-gray-700)(?=['"\s])/g, replace: 'bg-gray-100 dark:bg-gray-700' },
  { match: /(?<=['"\s])bg-gray-200(?! dark:bg-gray-800)(?=['"\s])/g, replace: 'bg-gray-200 dark:bg-gray-800' },
  { match: /(?<=['"\s])shadow-sm(?! dark:shadow-none)(?=['"\s])/g, replace: 'shadow-sm dark:shadow-none' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    // Only process these files to avoid touching auth or settings page logic
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('settings/page.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const { match, replace } of replacements) {
        content = content.replace(match, replace);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'app'));
console.log('Theme updates complete.');
