import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

import { checkString, fillText, placeholdersOf, samePlaceholders, TRANSLATED_LANGS } from '../src/utils/questionI18n.ts';
import { checkSceneFile, sceneString } from '../src/utils/sceneI18n.ts';
import { SCENE_TEXT } from '../src/components/SandboxEngine/sceneStrings.ts';

test('experiment text helpers', async (t) => {
  await t.test('fills {placeholders} and leaves unknown ones alone', () => {
    assert.equal(fillText('Floating with {n} stones', { n: 3 }), 'Floating with 3 stones');
    assert.equal(fillText('{pot} in the sun: {n}°C', { pot: 'Matka', n: 22 }), 'Matka in the sun: 22°C');
    assert.equal(fillText('Speed {n}', {}), 'Speed {n}');
    assert.equal(fillText('No slots'), 'No slots');
  });
  await t.test('compares placeholders in any order', () => {
    assert.deepEqual(placeholdersOf('{n} of {total}'), ['n', 'total']);
    assert.ok(samePlaceholders('{a} and {b}', '{b} ఇంకా {a}'));
    assert.ok(!samePlaceholders('{n} stones', 'రాళ్లు'));
    assert.ok(!samePlaceholders('{n} stones', '{N} రాళ్లు'), 'names must stay in English');
  });
  await t.test('a translation that lost or renamed a placeholder fails the check', () => {
    assert.deepEqual(checkString('te', 'Speed {n}', 'వేగం {n}'), []);
    assert.ok(checkString('te', 'Speed {n}', 'వేగం').some((p) => p.includes('placeholders')));
    assert.ok(checkString('te', 'Speed {n}', 'వేగం {సంఖ్య}').some((p) => p.includes('placeholders')));
  });
  await t.test('falls back to English when a string is missing or broken', () => {
    const file = { lang: 'te', reviewed: false, text: { buoyancy: { boat_floating: '{n} రాళ్లతో తేలుతోంది', boat_sank: '', boat_reset: 'రీసెట్ {x}' } } };
    assert.equal(sceneString(file, 'buoyancy', 'boat_floating', 'Floating with {n} stones'), '{n} రాళ్లతో తేలుతోంది');
    assert.equal(sceneString(file, 'buoyancy', 'boat_sank', 'Too heavy'), 'Too heavy', 'empty stays English');
    assert.equal(sceneString(file, 'buoyancy', 'boat_reset', '↺ Reset'), '↺ Reset', 'extra placeholder stays English');
    assert.equal(sceneString(file, 'gravity', 'fan_speed', 'Fan Speed'), 'Fan Speed', 'missing group stays English');
    assert.equal(sceneString(null, 'buoyancy', 'boat_floating', 'Floating'), 'Floating');
  });
});

test('every experiment string is used by its experiment file', () => {
  const dir = new URL('../src/components/SandboxEngine/levels/', import.meta.url);
  const code = readdirSync(dir).map((f) => readFileSync(new URL(f, dir), 'utf8')).join('\n');
  for (const [group, strings] of Object.entries(SCENE_TEXT)) {
    assert.ok(code.includes(`useSceneText("${group}")`), `${group} is used`);
    for (const key of Object.keys(strings)) {
      // Some keys are built from a prefix, e.g. `matka_sound_${pitchWord}`
      const prefix = key.replace(/_[a-z]+$/, '_');
      assert.ok(code.includes(`"${key}"`) || code.includes(`\`${prefix}\${`), `${group}.${key} is used`);
    }
  }
});

test('every translated experiment file passes the checks', () => {
  let found = 0;
  for (const lang of TRANSLATED_LANGS) {
    const url = new URL(`../public/i18n/scenes/${lang}.json`, import.meta.url);
    if (!existsSync(url)) continue;
    found++;
    const file = JSON.parse(readFileSync(url, 'utf8'));
    assert.equal(file.lang, lang);
    assert.deepEqual(checkSceneFile(lang, SCENE_TEXT, file), [], `${lang} has problems`);
  }
  assert.ok(found > 0, 'at least one language file exists');
});

test('placeholders do not count against the script check', () => {
  assert.deepEqual(checkString('te', 'Choose {activity}', '{activity} ఎంచుకో'), []);
});
