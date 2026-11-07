const test = require('node:test');
const assert = require('node:assert');
const { CT_DOCS, CT_LEVELS, CT_LESSONS, CT_GLOSSARY } = require('../lib/tutor-lessons.cjs');
const { CHECKS } = require('../lib/tutor-machine.cjs');
const { CT_FIGS, figure } = require('../lib/tutor-figures.cjs');

const ids = CT_LESSONS.map((l) => l.id);
const LIVE = ['axes', 'homing', 'limits', 'safe', 'offsets', 'zeromap', 'tool', 'gcode', 'feeds', 'probe', 'touchplate', 'tls', 'atc', 'probe3d'];
const NEEDS = ['tls', 'atc', 'probe3d'];

test('lessons have unique ids, a level, a title and a body', () => {
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const l of CT_LESSONS) {
    assert.ok(CT_LEVELS.some((v) => v.id === l.level), l.id + ' level');
    assert.ok(l.title && l.body && l.mins > 0, l.id);
    if (l.live) assert.ok(LIVE.includes(l.live), l.id + ' live ' + l.live);
    [].concat(l.fig || []).forEach((f) => assert.ok(CT_FIGS[f], l.id + ' fig ' + f));
    if (l.tryIt) assert.ok(CHECKS[l.tryIt.check], l.id + ' check ' + l.tryIt.check);
    if (l.needs) assert.ok(NEEDS.includes(l.needs), l.id + ' needs ' + l.needs);
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

test('figure animations are well formed and have a still frame', () => {
  for (const name of Object.keys(CT_FIGS)) {
    const svg = figure(name, { homeCorner: 'front-right' });
    assert.match(svg, /data-still="[\d.]+"/, name + ' still frame');
    for (const m of svg.matchAll(/<animate(?:Transform|Motion)?\b([^>]*)\/?>/g)) {
      const a = m[1], values = /values="([^"]*)"/.exec(a), times = /keyTimes="([^"]*)"/.exec(a), splines = /keySplines="([^"]*)"/.exec(a);
      assert.match(a, /dur="[\d.]+s"/, name);
      if (!times) continue;
      const t = times[1].split(';').map(Number);
      assert.strictEqual(t[0], 0, name + ' starts at 0');
      assert.strictEqual(t[t.length - 1], 1, name + ' ends at 1');
      for (let i = 1; i < t.length; i++) assert.ok(t[i] >= t[i - 1], name + ' keyTimes increase: ' + times[1]);
      if (values) assert.strictEqual(values[1].split(';').length, t.length, name + ' values vs keyTimes');
      if (splines) assert.strictEqual(splines[1].split(';').length, t.length - 1, name + ' keySplines');
    }
  }
});

test('unit pairs: every {mm|in} renders with no braces left, either way', () => {
  const { ctUnits } = require('../lib/tutor-lessons.cjs');
  assert.strictEqual(ctUnits('up {25 mm|1 in}', 'in'), 'up 1 in');
  assert.strictEqual(ctUnits('up {25 mm|1 in}', 'mm'), 'up 25 mm');
  for (const l of CT_LESSONS) {
    const texts = [l.body, l.tryIt && l.tryIt.text, ...(l.ticks || []), ...(l.steps || []).map((s) => s.text), ...(l.quiz || []).flatMap((q) => [q.q, q.why, ...q.a])].filter(Boolean);
    for (const t of texts) for (const u of ['mm', 'in']) assert.ok(!/[{}|]/.test(ctUnits(t, u)), l.id + ': ' + t.slice(0, 60));
  }
});
