const test = require('node:test');
const assert = require('node:assert');
const { CT_FEEDS_COMMON, ctFlutesFromText, ctFeedsBits, ctFeedsRows } = require('../lib/tutor-feeds.cjs');

const tools = [
  { toolNumber: 3, name: 'Jenny Compression Spiral Bit 1/4"', diameter: 6.35, type: 'flat', metadata: { flutes: 2 }, dimensions: { flute_length: 25.4 } },
  { toolNumber: 8, name: 'Upcut 1/4"', diameter: 6.35, type: 'flat', metadata: { flutes: 2 }, dimensions: { flute_length: 25.4 } },
  { name: 'O Flute Bit 1/8"', diameter: 3.175, type: 'flat', metadata: {}, dimensions: {} },
  { name: 'Mystery 1/8"', diameter: 3.175, type: 'flat' },
  { toolNumber: 2, name: '90 deg V-bit', diameter: 6.35, type: 'v-bit' },
  { toolNumber: 4, name: '4mm drill', diameter: 4, type: 'drill' }
];

test('flutes from a name', () => {
  assert.strictEqual(ctFlutesFromText('O Flute Bit'), 1);
  assert.strictEqual(ctFlutesFromText('3 flute end mill'), 3);
  assert.strictEqual(ctFlutesFromText('double flute bowl'), 2);
  assert.strictEqual(ctFlutesFromText('Upcut 1/4'), null);
});

test('only cutting bits, with where their flutes came from', () => {
  const bits = ctFeedsBits(tools);
  assert.deepStrictEqual(bits.map((b) => b.name), ['T3 Jenny Compression Spiral Bit 1/4"', 'T8 Upcut 1/4"', 'O Flute Bit 1/8"', 'Mystery 1/8"']);
  assert.deepStrictEqual(bits.map((b) => [b.flutes, b.flutesFrom, b.compression]), [[2, '', true], [2, '', false], [1, 'name', false], [2, 'guess', false]]);
});

test('three styles, slowest to fastest; a compression bit cuts 3/4" ply in one pass', () => {
  const rows = ctFeedsRows(ctFeedsBits(tools), 'mdf', 19.05, {});
  for (const r of rows) {
    assert.ok(r.styles.conservative.feedMm <= r.styles.average.feedMm && r.styles.average.feedMm <= r.styles.aggressive.feedMm, r.name);
    assert.ok(r.rpm > 0);
  }
  assert.strictEqual(rows[0].styles.average.passes, 1);
  assert.ok(rows[0].notes.some((n) => /one pass/.test(n.text)));
  assert.ok(rows[1].styles.average.passes > 1);
  assert.ok(rows[3].odd && rows[3].notes.some((n) => n.flag && /2 assumed/.test(n.text)));
});

test('Total Depth past the flutes is flagged only well past them', () => {
  const bit = [{ name: 'b', mm: 3.175, flutes: 2, fluteMm: 19.05 }];
  assert.ok(!ctFeedsRows(bit, 'mdf', 19.6, {})[0].notes.some((n) => /past its flutes/.test(n.text)));
  assert.ok(ctFeedsRows(bit, 'mdf', 22, {})[0].notes.some((n) => /past its flutes/.test(n.text)));
});

test('common sizes all give feeds within the machine\'s max', () => {
  const rows = ctFeedsRows(CT_FEEDS_COMMON, 'hardwood', 12, { maxFeed: 2500 });
  for (const r of rows) for (const s of Object.values(r.styles)) assert.ok(s.feedMm <= 2500 && s.feedMm >= 150, r.name);
});
