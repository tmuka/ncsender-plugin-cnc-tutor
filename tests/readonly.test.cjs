// CNC Tutor never moves the machine: the dialog only reads ncSender's state
// and settings, saves its own progress and can load (not run) a program.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'config.html'), 'utf8');

test('no controller commands anywhere', () => {
  for (const bad of ['send-command', '/api/cnc', 'jogStart', 'jogStep', 'api/jog', '$J=', 'cnc-command', 'plugin-message', 'G10 ', 'G53 G0']) {
    assert.ok(!html.includes(bad), 'config.html contains ' + bad);
  }
});

test('only the read and progress endpoints are used', () => {
  const used = [...new Set(html.match(/'\/api\/[^']*'/g).map((s) => s.slice(1, -1)))].sort();
  assert.deepStrictEqual(used, ['/api/firmware', '/api/gcode-files/load-temp', '/api/plugins/', '/api/server-state', '/api/settings']);
  assert.match(html, /'\/api\/plugins\/' \+ PLUGIN_ID \+ '\/settings'/);
});

test('the only writes are the progress (PUT) and loading the practice program (POST)', () => {
  const methods = [...html.matchAll(/method: '([A-Z]+)'/g)].map((m) => m[1]).sort();
  assert.deepStrictEqual(methods, ['POST', 'PUT']);
  assert.match(html, /load-temp', \{ method: 'POST'[^]*?filename: CT_SAMPLE_NAME/);
});
