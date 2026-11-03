const test = require('node:test');
const assert = require('node:assert');
const M = require('../lib/tutor-machine.cjs');
const fw = require('./fixture-firmware.json');

function state(over = {}, job) {
  return { machineState: Object.assign({ connected: true, status: 'Idle', homed: true, workspace: 'G54', MPos: '10.000,20.000,-5.000,0.000', WPos: '-90.000,-30.000,30.000,0.000',
    g54: '100.000,50.000,-35.000,0.000', g55: '200.000,200.000,-10.000,0.000', g56: '0,0,0,0', g57: '0,0,0,0', g58: '0,0,0,0', g59: '0,0,0,0', tool: 4, toolLengthSet: true }, over), jobLoaded: job || null };
}

test('machineFacts reads the firmware and ncSender settings', () => {
  const f = M.machineFacts(fw, { unitsPreference: 'imperial', homeLocation: 'front-left', safeZHeight: -5, parkingLocation: '256.9,791.4,-5' }, {});
  assert.strictEqual(f.units, 'in');
  assert.deepStrictEqual(f.travel, { x: 812, y: 1230, z: 158 });
  assert.strictEqual(f.homing, true);
  assert.strictEqual(f.homingRequired, true);
  assert.strictEqual(f.softLimits, true);
  assert.strictEqual(f.hardLimits, false);
  assert.strictEqual(f.rpm.max, 24000);
  assert.strictEqual(f.spindleType, 'Huanyang v1');
  assert.strictEqual(f.safeZ, -5);
  assert.deepStrictEqual(f.park, { x: 256.9, y: 791.4, z: -5, a: 0 });
});

test('machineFacts without firmware falls back to the machine state', () => {
  const f = M.machineFacts(null, {}, { maxTravelX: 300, maxTravelY: 400, maxTravelZ: 80 });
  assert.strictEqual(f.units, 'mm');
  assert.deepStrictEqual(f.travel, { x: 300, y: 400, z: 80 });
  assert.strictEqual(f.homing, null);
});

test('fmtLen in mm and inches', () => {
  assert.strictEqual(M.fmtLen(10, 'mm'), '10 mm');
  assert.strictEqual(M.fmtLen(0.1, 'mm', 3), '0.1 mm');
  assert.strictEqual(M.fmtLen(25.4, 'in'), '1 in');
  assert.strictEqual(M.fmtLen(-0.0001, 'mm'), '0 mm');
});

test('whereAmI says it in words', () => {
  const w = M.whereAmI(state(), { units: 'mm' }).join(' ');
  assert.match(w, /idle/);
  assert.match(w, /homed/);
  assert.match(w, /left by 90 mm and in front by 30 mm/);
  assert.match(w, /30 mm above Z0/);
  assert.match(w, /Tool 4/);
  assert.match(M.whereAmI({ machineState: { connected: false } }, {})[0], /isn’t connected/);
  assert.match(M.whereAmI(state({ status: 'Alarm:1' }), {})[0], /in alarm/);
});

function track(tr, list) { list.forEach((s) => M.trackState(tr, s)); return tr; }

test('axes: one jog per axis in + is seen; a − jog says so', () => {
  const tr = M.startTracker(state());
  track(tr, [state({ status: 'Jog', MPos: '15,20,-5,0' }), state({ MPos: '20,20,-5,0' })]);
  let r = M.runCheck('axes', tr, { units: 'mm' });
  assert.deepStrictEqual(r.items.map((i) => i.done), [true, false, false]);
  assert.match(r.items[0].detail, /X went up 10 mm/);
  track(tr, [state({ MPos: '20,19,-5,0' })]);
  r = M.runCheck('axes', tr, { units: 'mm' });
  assert.match(r.items[1].detail, /That was Y−/);
  track(tr, [state({ MPos: '20,20,-5,0' }), state({ MPos: '20,20,-4.9,0' })]);
  r = M.runCheck('axes', tr, { units: 'mm' });
  assert.ok(r.done);
});

test('axes: a diagonal move counts for neither axis', () => {
  const tr = track(M.startTracker(state()), [state({ MPos: '20,30,-5,0' })]);
  assert.deepStrictEqual(M.runCheck('axes', tr, { units: 'mm' }).items.map((i) => i.done), [false, false, false]);
});

test('home: seen homing, or homed after starting unhomed', () => {
  let tr = track(M.startTracker(state()), [state({ status: 'Home' })]);
  assert.ok(!M.runCheck('home', tr, {}).done, 'not done while homing');
  track(tr, [state({ MPos: '0,0,0,0' })]);
  assert.ok(M.runCheck('home', tr, {}).done);
  tr = track(M.startTracker(state({ homed: false, status: 'Alarm:11' })), [state()]);
  assert.ok(M.runCheck('home', tr, {}).done);
  tr = track(M.startTracker(state()), [state({ MPos: '11,20,-5,0' })]);
  assert.ok(!M.runCheck('home', tr, {}).done, 'already homed and only jogged');
});

test('jogSizes: three different step sizes', () => {
  const tr = track(M.startTracker(state()), [state({ MPos: '20,20,-5,0' }), state({ MPos: '21,20,-5,0' }), state({ MPos: '21,20.1,-5,0' })]);
  const r = M.runCheck('jogSizes', tr, { units: 'mm' });
  assert.ok(r.done);
  assert.deepStrictEqual(r.items.map((i) => i.detail), ['Moved 10 mm.', 'Moved 1 mm.', 'Moved 0.1 mm.']);
  const same = track(M.startTracker(state()), [state({ MPos: '20,20,-5,0' }), state({ MPos: '30,20,-5,0' }), state({ MPos: '30,30,-5,0' })]);
  assert.ok(!M.runCheck('jogSizes', same, { units: 'mm' }).done);
});

test('zeroXY and zeroZ: the active offset changed', () => {
  const tr = track(M.startTracker(state()), [state({ g54: '10.000,20.000,-35.000,0', WPos: '0,0,30,0' })]);
  const r = M.runCheck('zeroXY', tr, { units: 'mm' });
  assert.ok(r.done);
  assert.match(r.items[0].detail, /X0 is now at machine X 10 mm, right where the spindle is/);
  assert.ok(!M.runCheck('zeroZ', tr, { units: 'mm' }).done);
  track(tr, [state({ g54: '10,20,-40,0' })]);
  assert.ok(M.runCheck('zeroZ', tr, { units: 'mm' }).done);
});

test('zero checks compare the offset that is active now', () => {
  const tr = track(M.startTracker(state()), [state({ workspace: 'G55' })]);
  assert.ok(!M.runCheck('zeroXY', tr, { units: 'mm' }).done, 'switching offsets is not zeroing');
});

test('workspace: switched away and back', () => {
  const tr = track(M.startTracker(state()), [state({ workspace: 'G55' })]);
  assert.ok(!M.runCheck('workspace', tr, {}).done);
  track(tr, [state({ workspace: 'G54' })]);
  assert.ok(M.runCheck('workspace', tr, {}).done);
});

test('loadSample, airCut and hold', () => {
  const name = M.CT_SAMPLE_NAME;
  const tr = M.startTracker(state());
  assert.ok(!M.runCheck('loadSample', tr, {}).done);
  track(tr, [state({}, { filename: name, status: 'idle' })]);
  assert.ok(M.runCheck('loadSample', tr, {}).done);
  track(tr, [state({ status: 'Run' }, { filename: name, status: 'running' }), state({ status: 'Hold:0' }, { filename: name, status: 'paused' })]);
  assert.ok(!M.runCheck('hold', tr, {}).done, 'still held');
  track(tr, [state({ status: 'Run' }, { filename: name, status: 'running' })]);
  assert.ok(M.runCheck('hold', tr, {}).done);
  assert.ok(!M.runCheck('airCut', tr, {}).done);
  track(tr, [state({}, { filename: name, status: 'completed' })]);
  assert.ok(M.runCheck('airCut', tr, {}).done);
});
