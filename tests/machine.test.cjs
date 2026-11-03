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

test('canLoadProgram: only when idle and nothing running or paused', () => {
  assert.ok(M.canLoadProgram(state({}, { filename: 'a.nc', status: 'completed' })));
  assert.ok(!M.canLoadProgram(state({ status: 'Run' }, { filename: 'a.nc', status: 'running' })));
  assert.ok(!M.canLoadProgram(state({}, { filename: 'a.nc', status: 'paused' })));
  assert.ok(!M.canLoadProgram(state({ status: 'Hold:0' })));
  assert.ok(!M.canLoadProgram(state({ connected: false })));
});

test('hold: Stop after a pause is not a resume', () => {
  const name = M.CT_SAMPLE_NAME;
  const tr = track(M.startTracker(state()), [state({ status: 'Run' }, { filename: name, status: 'running' }), state({ status: 'Hold:0' }), state({}, { filename: name, status: 'stopped' })]);
  assert.ok(!M.runCheck('hold', tr, {}).done);
});

test('airCut: an earlier completed run does not count, and an unraised Z0 is flagged', () => {
  const name = M.CT_SAMPLE_NAME;
  const tr = M.startTracker(state({}, { filename: name, status: 'completed' }));
  track(tr, [state({}, { filename: name, status: 'completed' })]);
  assert.ok(!M.runCheck('airCut', tr, {}).done);
  track(tr, [state({ status: 'Run', WPos: '0,0,0.5,0' }, { filename: name, status: 'running' })]);
  assert.match(M.runCheck('airCut', tr, {}).items[0].detail, /didn’t look raised/);
  track(tr, [state({}, { filename: name, status: 'completed' })]);
  assert.ok(M.runCheck('airCut', tr, {}).done);
});

test('homing, programs and alarms are not jogs', () => {
  const tr = track(M.startTracker(state()), [state({ status: 'Home' }), state({ MPos: '10,20,0,0' })]);
  assert.strictEqual(tr.moves.length, 0);
  track(tr, [state({ status: 'Run' }), state({ MPos: '50,20,0,0' }), state({ status: 'Alarm:2' }), state({ MPos: '60,20,0,0' })]);
  assert.strictEqual(tr.moves.length, 0);
  track(tr, [state({ connected: false }), state({ MPos: '70,20,0,0' })]);
  assert.strictEqual(tr.moves.length, 0);
  track(tr, [state({ MPos: '71,20,0,0' })]);
  assert.strictEqual(tr.moves.length, 1);
});

test('a state without positions or a workspace does not throw', () => {
  const tr = M.startTracker({ machineState: { connected: true, status: 'Idle' } });
  M.trackState(tr, { machineState: { connected: true, status: 'Idle' } });
  for (const id of Object.keys(M.CHECKS)) M.runCheck(id, tr, { units: 'in' });
  assert.ok(M.whereAmI({ machineState: { connected: true, status: 'Idle' } }, { units: 'in' }).length >= 2);
});

test('probeSignal: the probe input P seen', () => {
  const tr = track(M.startTracker(state()), [state({ Pn: 'XP' })]);
  assert.ok(M.runCheck('probeSignal', tr, {}).done);
});

test('probeCycle: a probe that ends without an alarm and moves the zero', () => {
  let tr = track(M.startTracker(state()), [state({ isProbing: true, status: 'Run' }), state({ isProbing: false, g54: '100,50,-30,0' })]);
  assert.ok(M.runCheck('probeCycle', tr, { units: 'mm' }).done);
  tr = track(M.startTracker(state()), [state({ isProbing: true }), state({ isProbing: false, status: 'Alarm:5' })]);
  const r = M.runCheck('probeCycle', tr, { units: 'mm' });
  assert.ok(!r.done);
  assert.match(r.items[0].detail, /alarm/);
  tr = track(M.startTracker(state()), [state({ isProbing: true }), state({ isProbing: false })]);
  assert.ok(!M.runCheck('probeCycle', tr, {}).done, 'no zero change');
});

test('tlsMeasure: the setter touched, or the length newly set', () => {
  let tr = track(M.startTracker(state({ toolLengthSet: true })), [state({ Pn: 'T' }), state({ toolLengthSet: true })]);
  assert.ok(M.runCheck('tlsMeasure', tr, {}).done);
  tr = track(M.startTracker(state({ toolLengthSet: false })), [state({ toolLengthSet: true })]);
  assert.ok(M.runCheck('tlsMeasure', tr, {}).done);
  tr = track(M.startTracker(state({ toolLengthSet: true })), [state({ toolLengthSet: true })]);
  assert.ok(!M.runCheck('tlsMeasure', tr, {}).done, 'already measured, nothing done');
});

test('toolChange: a change that ends with another tool', () => {
  let tr = track(M.startTracker(state({ tool: 4 })), [state({ isToolChanging: true, tool: 4 }), state({ isToolChanging: false, tool: 2 })]);
  assert.ok(M.runCheck('toolChange', tr, {}).done);
  tr = track(M.startTracker(state({ tool: 4 })), [state({ isToolChanging: true }), state({ isToolChanging: false, tool: 4 })]);
  assert.ok(!M.runCheck('toolChange', tr, {}).done);
});

test('probeSignal: P already on at the start only counts after it goes off', () => {
  const tr = track(M.startTracker(state({ Pn: 'P' })), [state({ Pn: 'P' })]);
  const r = M.runCheck('probeSignal', tr, {});
  assert.ok(!r.done);
  assert.match(r.items[0].detail, /on already/);
  track(tr, [state({ Pn: '' }), state({ Pn: 'P' })]);
  assert.ok(M.runCheck('probeSignal', tr, {}).done);
  assert.ok(M.runCheck('probeSignal', track(M.startTracker(state()), [state({ Pn: 'T' })]), {}).done, 'a one-input machine may show T');
});

test('probeCycle: an alarm, then a good retry, counts; a late alarm is caught', () => {
  const tr = track(M.startTracker(state()), [state({ isProbing: true }), state({ isProbing: false, status: 'Alarm:4' })]);
  assert.ok(!M.runCheck('probeCycle', tr, {}).done);
  track(tr, [state({ isProbing: true }), state({ isProbing: false, g54: '100,50,-30,0' })]);
  assert.ok(M.runCheck('probeCycle', tr, {}).done);
  const late = track(M.startTracker(state()), [state({ isProbing: true }), state({ isProbing: false, g54: '100,50,-30,0' }), state({ status: 'Alarm:5', g54: '100,50,-30,0' })]);
  assert.ok(!M.runCheck('probeCycle', late, {}).done);
});

test('tlsMeasure: a TLS run as a tool change with the length already set', () => {
  const tr = track(M.startTracker(state({ toolLengthSet: true })), [state({ isToolChanging: true, toolLengthSet: true }), state({ isToolChanging: false, toolLengthSet: true })]);
  assert.ok(M.runCheck('tlsMeasure', tr, {}).done);
});

test('toolChange: to tool 0 is not a new tool; numbers and strings compare alike', () => {
  let tr = track(M.startTracker(state({ tool: 4 })), [state({ isToolChanging: true }), state({ isToolChanging: false, tool: 0 })]);
  assert.ok(!M.runCheck('toolChange', tr, {}).done);
  tr = track(M.startTracker(state({ tool: 4 })), [state({ isToolChanging: true }), state({ isToolChanging: false, tool: '4' })]);
  assert.ok(!M.runCheck('toolChange', tr, {}).done);
});

test('moves are capped', () => {
  const tr = M.startTracker(state());
  for (let i = 1; i <= 150; i++) M.trackState(tr, state({ MPos: (10 + i) + ',20,-5,0' }));
  assert.strictEqual(tr.moves.length, 100);
});
