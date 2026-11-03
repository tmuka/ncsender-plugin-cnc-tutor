const test = require('node:test');
const assert = require('node:assert');
const { practiceProgram, explainLine } = require('../lib/tutor-program.cjs');

// A small simulator: modal G0/G1/G2, absolute mm, spindle state.
function run(lines) {
  const s = { x: 0, y: 0, z: 0, mode: 0, spindle: false, units: null, abs: null, feed: 0, events: [] };
  for (const raw of lines) {
    const code = raw.replace(/\([^)]*\)/g, '').trim().toUpperCase();
    if (!code) continue;
    const w = {};
    for (const m of code.matchAll(/([A-Z])([-+]?\d*\.?\d+)/g)) (w[m[1]] = w[m[1]] || []).push(Number(m[2]));
    for (const g of w.G || []) {
      if ([0, 1, 2, 3].includes(g)) s.mode = g;
      if (g === 20 || g === 21) s.units = g;
      if (g === 90 || g === 91) s.abs = g === 90;
      assert.ok(![28, 30, 53, 91, 92].includes(g), 'no machine or relative moves: ' + raw);
    }
    for (const m of w.M || []) { if (m === 3) s.spindle = true; if (m === 5) s.spindle = false; if (m === 30) s.events.push('end'); }
    if (w.F) s.feed = w.F[0];
    const moves = 'XYZ'.split('').some((a) => w[a]) && !(w.G || []).includes(4);
    if (moves) {
      assert.ok((s.units === 21 || s.units === 20) && s.abs === true, 'units and G90 set before moving');
      const to = { x: w.X ? w.X[0] : s.x, y: w.Y ? w.Y[0] : s.y, z: w.Z ? w.Z[0] : s.z };
      if (s.mode === 0) assert.ok(!(to.z < 0 || (s.z < 0 && (to.x !== s.x || to.y !== s.y))), 'no rapid in the stock: ' + raw);
      else {
        assert.ok(s.spindle, 'spindle on before cutting: ' + raw);
        assert.ok(s.feed > 0, 'a feed: ' + raw);
        assert.ok(to.z >= (s.units === 20 ? -0.02 : -0.5), 'no deeper than 0.5 mm or 0.02 in: ' + raw);
      }
      Object.assign(s, to);
    }
  }
  return s;
}

for (const [units, w, h, safe] of [['mm', 40, 30, 15], ['in', 1.5, 1.25, 0.6]]) {
  test('the practice program in ' + units + ' cuts safely and ends', () => {
    const p = practiceProgram(units);
    assert.ok(p.some((l) => l.startsWith(units === 'in' ? 'G20' : 'G21')));
    const s = run(p);
    assert.strictEqual(s.spindle, false);
    assert.deepStrictEqual(s.events, ['end']);
    assert.ok(s.z >= safe, 'ends lifted clear');
  });
  test('the practice program in ' + units + ' stays inside its rectangle from X0 Y0', () => {
    for (const l of practiceProgram(units)) {
      const c = l.replace(/\([^)]*\)/g, '');
      for (const m of c.matchAll(/([XY])(-?[\d.]+)/g)) {
        const v = Number(m[2]);
        assert.ok(v >= 0 && v <= (m[1] === 'X' ? w : h), l);
      }
    }
  });
}

test('explainLine reads a line in words', () => {
  assert.deepStrictEqual(explainLine('G0 Z5 (lift)'), { code: 'G0 Z5', comment: 'lift', parts: ['Rapid move (G0): as fast as the machine goes, never for cutting', 'to Z5'] });
  assert.deepStrictEqual(explainLine('G1 X40 F1000').parts, ['Straight cut (G1) at the feed rate', 'feed rate 1000 per minute (F)', 'to X40']);
  assert.deepStrictEqual(explainLine('M3 S18000').parts, ['Spindle on, clockwise (M3)', 'spindle speed 18000 RPM (S)']);
  assert.match(explainLine('G2 X20 Y8 I0 J7').parts.join(' '), /arc’s center is I0 J7/);
  assert.deepStrictEqual(explainLine('(just a note)').parts, ['A comment: the machine ignores it']);
  assert.deepStrictEqual(explainLine('g21 ; mm').parts, ['Units are millimeters (G21)']);
  assert.strictEqual(explainLine('G43.1 Z-2').parts[0], 'Tool length offset (G43.1): shifts Z by the tool’s length');
});

test('every word in the practice program has a meaning', () => {
  for (const l of practiceProgram('mm').concat(practiceProgram('in'))) for (const p of explainLine(l).parts) assert.ok(!/^[GM]\d/.test(p), l + ': ' + p);
});
