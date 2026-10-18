import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { MATERIAL_ICON_NAMES } from "../src/config/iconSubset.ts";

// Collects icon names written literally in src/: the text or quoted strings
// inside <span className="material-symbols-outlined">…</span>, and icon: "…" props.
function collectUsedIcons(dir) {
  const used = new Map();
  const add = (name, file) => { if (!used.has(name)) used.set(name, file); };

  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) scan(p);
    }
  };

  const scan = (file) => {
    const src = fs.readFileSync(file, "utf8");
    let i = 0;
    while ((i = src.indexOf("material-symbols-outlined", i)) !== -1) {
      const open = src.indexOf(">", i);
      const close = src.indexOf("</span>", open);
      const inner = src.slice(open + 1, close === -1 ? open + 400 : close).trim();
      if (/^[a-z][a-z0-9_]*$/.test(inner)) add(inner, file);
      // Skip values being compared (timeVal === "daily"); keep ones being rendered (? "today" : "group").
      for (const m of inner.matchAll(/(?<![=!]==?\s*)["'`]([a-z][a-z0-9_]*)["'`]/g)) add(m[1], file);
      i = open;
    }
    for (const m of src.matchAll(/\bicon\s*[:=]\s*["'`]([a-z][a-z0-9_]*)["'`]/g)) add(m[1], file);
  };

  walk(dir);
  return used;
}

test("Icon font subset", async (t) => {
  await t.test("every icon used in src/ is in the subset list", () => {
    const allowed = new Set(MATERIAL_ICON_NAMES);
    const missing = [...collectUsedIcons("src")].filter(([name]) => !allowed.has(name));
    assert.deepEqual(
      missing.map(([name, file]) => `${name} (${file})`),
      [],
      "Add these names to src/config/iconSubset.ts or they will render as plain text"
    );
  });

  await t.test("names are sorted and unique (Google Fonts requires sorted icon_names)", () => {
    const sorted = [...new Set(MATERIAL_ICON_NAMES)].sort();
    assert.deepEqual(MATERIAL_ICON_NAMES, sorted);
  });
});
