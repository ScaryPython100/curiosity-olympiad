import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

import { checkString, checkQuestionFile, localizeQuestion, TRANSLATED_LANGS } from '../src/utils/questionI18n.ts';

test('translation checks', async (t) => {
  await t.test('accepts a good translation', () => {
    assert.deepEqual(checkString('te', 'Get 7 or more right', '7 లేదా ఎక్కువ సరిగ్గా చెయ్యి'), []);
  });
  await t.test('catches empty, English left over, lost numbers and odd lengths', () => {
    assert.deepEqual(checkString('hi', 'Hello', ''), ['empty']);
    assert.ok(checkString('hi', 'The sun is hot.', 'The sun is hot.').some((p) => p.includes('script')));
    assert.ok(checkString('ta', 'It weighs 45 grams', 'இது கிராம் எடை').some((p) => p.includes('45')));
    assert.ok(checkString('kn', 'A long sentence about light and shadows', 'ಬೆಳಕು').some((p) => p.includes('length')));
  });
  await t.test('falls back to English piece by piece', () => {
    const q = { id: 1, title: 'T', question: 'Q?', options: ['a', 'b', 'c', 'd'], explanation: 'E', correct: 1 };
    assert.equal(localizeQuestion(q, null), q);
    const file = { lang: 'te', reviewed: false, tests: {}, questions: { 1: { title: 'శీర్షిక', question: '', options: ['అ', '', 'ఇ', 'ఈ'], explanation: 'వివరణ' } } };
    const out = localizeQuestion(q, file);
    assert.equal(out.title, 'శీర్షిక');
    assert.equal(out.question, 'Q?', 'missing text stays English');
    assert.deepEqual(out.options, ['అ', 'b', 'ఇ', 'ఈ']);
    assert.equal(out.correct, 1, 'right answer never moves');
  });
});

test('every translated question file is complete and passes the checks', () => {
  const page = readFileSync(new URL('../src/app/practice/page.tsx', import.meta.url), 'utf8');
  const arr = (marker) => {
    const start = page.indexOf(marker);
    return Function(`return ${page.slice(page.indexOf('[', start), page.indexOf('\n];', start) + 2)}`)();
  };
  const qs = arr('const PRACTICE_QUESTIONS: Question[] = [');
  const tests = arr('const MOCK_TESTS: MockTestInfo[] = [');
  const english = {
    questions: Object.fromEntries(qs.map((q) => [String(q.id), q])),
    tests: Object.fromEntries(tests.map((x) => [String(x.id), { name: x.title.split(':').slice(1).join(':').trim(), description: x.description }])),
  };
  let found = 0;
  for (const lang of TRANSLATED_LANGS) {
    const url = new URL(`../public/i18n/questions/${lang}.json`, import.meta.url);
    if (!existsSync(url)) continue;
    found++;
    const file = JSON.parse(readFileSync(url, 'utf8'));
    assert.equal(file.lang, lang);
    assert.deepEqual(checkQuestionFile(lang, english, file), [], `${lang} has problems`);
  }
  assert.ok(found > 0, 'at least one language file exists');
});
