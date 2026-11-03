const test = require('node:test');
const assert = require('node:assert');
const S = require('../lib/tutor-students.cjs');
const { CT_LESSONS, CT_LEVELS } = require('../lib/tutor-lessons.cjs');

const NOW = '2026-11-03T12:00:00.000Z';

test('0.1 progress moves into a first student, and the old keys go', () => {
  const cfg = { done: { safety: true }, ticks: { safety: { 0: true } }, answers: { axes: { 0: 1 } }, feeds: { bit: '6' }, page: 'axes', corner: 'tr' };
  const patches = S.migrateSettings(cfg, NOW);
  assert.deepStrictEqual(Object.keys(cfg.students), ['s1']);
  assert.strictEqual(cfg.current, 's1');
  const s = cfg.students.s1;
  assert.strictEqual(s.name, 'Student 1');
  assert.deepStrictEqual(s.done, { safety: true });
  assert.deepStrictEqual(s.answers, { axes: { 0: 1 } });
  assert.deepStrictEqual(s.firstAnswers, {});
  for (const k of ['done', 'ticks', 'answers', 'feeds', 'page']) assert.ok(!(k in cfg), k + ' removed');
  assert.strictEqual(cfg.corner, 'tr');
  const keys = patches.map((p) => p[0].join('.'));
  assert.ok(keys.includes('students') && keys.includes('current') && keys.includes('done') && keys.includes('page'));
  assert.strictEqual(patches.find((p) => p[0][0] === 'done')[1], undefined);
  // Applying the patches as the dialog's save does gives the same settings.
  const stored = JSON.parse(JSON.stringify(Object.assign({ done: { safety: true }, page: 'axes', corner: 'tr' }, ...patches.map((p) => ({ [p[0][0]]: p[1] })))));
  assert.deepStrictEqual(Object.keys(stored).sort(), ['corner', 'current', 'students']);
});

test('a fresh install has no students and nobody current', () => {
  const cfg = {};
  S.migrateSettings(cfg, NOW);
  assert.deepStrictEqual(cfg.students, {});
  assert.ok(!cfg.current);
  assert.deepStrictEqual(S.openingView(cfg, Date.parse(NOW)), { page: 'students' });
});

test('migrating twice changes nothing', () => {
  const cfg = { done: { safety: true } };
  S.migrateSettings(cfg, NOW);
  const before = JSON.stringify(cfg);
  assert.deepStrictEqual(S.migrateSettings(cfg, NOW), []);
  assert.strictEqual(JSON.stringify(cfg), before);
});

test('a current student who was removed is nobody', () => {
  const cfg = { students: { s1: { name: 'A' } }, current: 's9' };
  S.migrateSettings(cfg, NOW);
  assert.strictEqual(cfg.current, null);
  assert.deepStrictEqual(cfg.students.s1.done, {});
});

test('ids, names and colors', () => {
  const cfg = { students: { s1: { name: 'Sam', color: 'teal' }, s3: { name: 'alex', color: 'blue' } } };
  const id = S.newStudentId(cfg, Date.parse(NOW), 0.5);
  assert.match(id, /^s[0-9a-z]+$/);
  assert.ok(!cfg.students[id]);
  assert.notStrictEqual(S.newStudentId(cfg, Date.parse(NOW)), S.newStudentId(cfg, Date.parse(NOW)) + 'x');
  assert.deepStrictEqual(S.studentIds(cfg), ['s3', 's1']);
  assert.strictEqual(S.cleanName('  Jo   Ann  '), 'Jo Ann');
  assert.strictEqual(S.cleanName('x'.repeat(50)).length, 30);
  assert.ok(S.nameTaken(cfg, ' SAM '));
  assert.ok(!S.nameTaken(cfg, 'Sam', 's1'));
  assert.strictEqual(S.nextColor(cfg), 'purple');
});

test('"Still you?" after a gap of more than 2 hours', () => {
  const cfg = { students: { s1: { name: 'Sam', lastActive: NOW } }, current: 's1' };
  const t = Date.parse(NOW);
  assert.deepStrictEqual(S.openingView(cfg, t + 60 * 60 * 1000), { page: 'lessons', student: 's1' });
  assert.deepStrictEqual(S.openingView(cfg, t + 3 * 60 * 60 * 1000), { page: 'students', ask: 's1' });
  cfg.current = null;
  assert.deepStrictEqual(S.openingView(cfg, t), { page: 'students' });
});

test('class progress counts lessons, Try it steps and first-try answers', () => {
  const axes = CT_LESSONS.find((l) => l.id === 'axes');
  const cfg = { students: {
    s1: { name: 'Sam', done: { safety: true, axes: true, 'axes:try': true }, firstAnswers: { axes: { 0: axes.quiz[0].right, 1: 0 } } },
    s2: { name: 'Alex', done: {}, firstAnswers: {} }
  } };
  S.migrateSettings(cfg, NOW);
  const rows = S.classProgress(cfg, CT_LESSONS, CT_LEVELS);
  assert.deepStrictEqual(rows.map((r) => r.name), ['Alex', 'Sam']);
  const sam = rows[1];
  assert.strictEqual(sam.done, 2);
  assert.deepStrictEqual(sam.perLevel[1], { done: 2, of: 4 });
  assert.strictEqual(sam.tries, 1);
  assert.strictEqual(sam.tryable, CT_LESSONS.filter((l) => l.tryIt).length);
  assert.strictEqual(sam.quizAsked, 2);
  assert.strictEqual(sam.quizRight, axes.quiz[1].right === 0 ? 2 : 1);
  assert.strictEqual(rows[0].done, 0);
});

test('agoText', () => {
  const t = Date.parse(NOW);
  assert.strictEqual(S.agoText(null, t), 'never');
  assert.strictEqual(S.agoText(NOW, t + 30000), 'just now');
  assert.strictEqual(S.agoText(NOW, t + 10 * 60000), '10 minutes ago');
  assert.strictEqual(S.agoText(NOW, t + 3 * 3600000), '3 hours ago');
  assert.strictEqual(S.agoText(NOW, t + 26 * 3600000), 'yesterday');
  assert.strictEqual(S.agoText(NOW, t + 5 * 86400000), '5 days ago');
});

test('applyPatches: merge, delete, and no comeback for a removed student', () => {
  const server = { corner: 'tr', current: 's1', students: { s1: { name: 'Sam', done: { a: true } } } };
  const out = S.applyPatches(JSON.parse(JSON.stringify(server)), [
    [['students', 's1', 'done', 'b'], true],
    [['students', 's2', 'lastActive'], 'x'],
    [['students', 's3'], { name: 'New', done: {} }],
    [['page'], undefined],
    [['current'], null]
  ]);
  assert.deepStrictEqual(out.students.s1.done, { a: true, b: true });
  assert.ok(!('s2' in out.students), 'a late save for a removed student is dropped');
  assert.strictEqual(out.students.s3.name, 'New');
  assert.ok(!('page' in out));
  assert.strictEqual(out.current, null);
  assert.strictEqual(out.corner, 'tr');
  assert.deepStrictEqual(S.applyPatches(null, [[['corner'], 'bl']]), { corner: 'bl' });
});
