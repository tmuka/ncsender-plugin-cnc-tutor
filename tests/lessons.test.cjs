const test = require('node:test');
const assert = require('node:assert');
const { CT_DOCS, CT_LEVELS, CT_LESSONS, CT_GLOSSARY } = require('../lib/tutor-lessons.cjs');
const { CHECKS } = require('../lib/tutor-machine.cjs');
const { CT_FIGS, figure } = require('../lib/tutor-figures.cjs');

const ids = CT_LESSONS.map((l) => l.id);
const LIVE = ['axes', 'homing', 'limits', 'safe', 'offsets', 'zeromap', 'tool', 'gcode', 'feeds'];

test('lessons have unique ids, a level, a title and a body', () => {
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const l of CT_LESSONS) {
    assert.ok(CT_LEVELS.some((v) => v.id === l.level), l.id + ' level');
    assert.ok(l.title && l.body && l.mins > 0, l.id);
    if (l.live) assert.ok(LIVE.includes(l.live), l.id + ' live ' + l.live);
    if (l.fig) assert.ok(CT_FIGS[l.fig], l.id + ' fig ' + l.fig);
    if (l.tryIt) assert.ok(CHECKS[l.tryIt.check], l.id + ' check ' + l.tryIt.check);
    for (const d of l.docs || []) assert.ok(CT_DOCS[d], l.id + ' doc ' + d);
    for (const s of l.steps || []) assert.ok(s.lesson === null || ids.includes(s.lesson), l.id + ' step ' + s.lesson);
  }
  for (const lv of CT_LEVELS) assert.ok(CT_LESSONS.some((l) => l.level === lv.id), 'level ' + lv.id + ' has lessons');
});

test('lessons are in level order', () => {
  const levels = CT_LESSONS.map((l) => l.level);
  assert.deepStrictEqual(levels, [...levels].sort((a, b) => a - b));
});

test('cross links point to lessons', () => {
  for (const l of CT_LESSONS) for (const m of l.body.matchAll(/\[\[([a-z-]+)\]\]/g)) assert.ok(ids.includes(m[1]), l.id + ' links ' + m[1]);
  for (const g of CT_GLOSSARY) assert.ok(ids.includes(g[2]), g[0]);
});

test('quiz answers are valid and explained', () => {
  for (const l of CT_LESSONS) for (const q of l.quiz || []) {
    assert.ok(q.a.length >= 2 && Number.isInteger(q.right) && q.right >= 0 && q.right < q.a.length, l.id + ': ' + q.q);
    assert.ok(q.why && q.why.length > 10, l.id + ': ' + q.q);
  }
});

test('lesson HTML is balanced', () => {
  for (const l of CT_LESSONS) {
    for (const tag of ['p', 'ul', 'ol', 'li', 'strong']) {
      const open = (l.body.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length, close = (l.body.match(new RegExp('</' + tag + '>', 'g')) || []).length;
      assert.strictEqual(open, close, l.id + ' <' + tag + '>');
    }
  }
});

test('docs links are on docs.ncsender.xyz paths', () => {
  for (const [k, d] of Object.entries(CT_DOCS)) assert.match(d.path, /^\/[a-z0-9/-]*\/(#[a-z0-9-]+)?$/, k);
});

test('every figure draws, without NaN', () => {
  for (const name of Object.keys(CT_FIGS)) {
    for (const corner of ['front-left', 'back-right', null]) {
      const svg = figure(name, { homeCorner: corner });
      assert.match(svg, /^<svg[^]*<\/svg>$/, name);
      assert.ok(!/NaN|undefined/.test(svg), name);
    }
  }
});
