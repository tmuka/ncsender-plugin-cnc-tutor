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

test('no other ways to reach the machine', () => {
  for (const bad of ['WebSocket', 'sendWebSocketMessage', 'XMLHttpRequest', 'sendBeacon', '"/api', '`/api', 'type: \'plugin', 'type: "plugin']) {
    assert.ok(!html.includes(bad), 'config.html contains ' + bad);
  }
  assert.deepStrictEqual([...new Set(html.match(/window\.ncSender\.\w+/g))], ['window.ncSender.getApiBaseUrl']);
  const posts = [...html.matchAll(/window\.postMessage\(\{ type: '([a-z-]+)'/g)].map((m) => m[1]);
  assert.deepStrictEqual([...new Set(posts)], ['close-plugin-dialog']);
});

test('every fetch goes to an allowed endpoint', () => {
  const calls = [...html.matchAll(/fetch\(([^,)]*)/g)].map((m) => m[1].trim());
  assert.ok(calls.length >= 3);
  for (const c of calls) {
    assert.ok(c === 'BASE_URL + path' || /^BASE_URL \+ '\/api\/(plugins\/' \+ PLUGIN_ID \+ '\/settings'|gcode-files\/load-temp')$/.test(c), 'fetch(' + c + ')');
  }
  const gets = [...html.matchAll(/getJson\('([^']*)'/g)].map((m) => m[1]);
  for (const g of gets) assert.ok(['/api/firmware', '/api/settings', '/api/server-state', '/api/plugins/'].includes(g), 'getJson ' + g);
});

test('the practice program only loads when nothing is running', () => {
  assert.match(html, /async function loadSample\(\) \{[^]*?if \(!canLoadProgram\(st\.state\)\)[^]*?return;[^]*?load-temp/);
});
