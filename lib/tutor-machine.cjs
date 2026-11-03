// What CNC Tutor knows about the machine, read from GET /api/firmware
// (grblHAL's $ settings), GET /api/settings (ncSender's) and the server
// state ncSender sends the dialog. Nothing here talks to the controller:
// the lessons tell the operator what to do in ncSender and watch the state.

// The $ settings as { id: { value, format, name } }, from either shape
// /api/firmware gives (a list, or an object keyed by id).
function fwSettings(fw) {
  var out = {}, s = fw && fw.settings;
  if (!s) return out;
  var list = Array.isArray(s) ? s : Object.keys(s).map(function(k) { var v = s[k]; return v && v.id == null ? Object.assign({ id: k }, v) : v; });
  list.forEach(function(v) {
    if (!v || v.id == null) return;
    out[String(v.id)] = { value: v.value, format: String(v.format || ''), name: String(v.name || '') };
  });
  return out;
}
function ctNum(v) { var n = v === null || v === '' || v === undefined ? NaN : Number(v); return isFinite(n) ? n : null; }
function ctBit(v, i) { var n = ctNum(v); return n != null && (n & (1 << i)) !== 0; }
// "1.000,2.000,-3.000,0.000" (mm, as ncSender reports positions) as { x, y, z, a }.
function ctVec(s) {
  var p = String(s || '').split(',').map(Number);
  if (p.length < 3 || p.slice(0, 3).some(function(n) { return !isFinite(n); })) return null;
  return { x: p[0], y: p[1], z: p[2], a: isFinite(p[3]) ? p[3] : 0 };
}

var CT_AXES = ['x', 'y', 'z'];
var CT_WORKSPACES = ['G54', 'G55', 'G56', 'G57', 'G58', 'G59'];

// The machine as the lessons talk about it. ncs: ncSender's settings;
// ms: the server state's machineState.
function machineFacts(fw, ncs, ms) {
  var S = fwSettings(fw), n = ncs || {}, m = ms || {};
  function setting(id) { return S[id] ? S[id].value : undefined; }
  function travel(id, key) { var v = ctNum(setting(id)); return v != null ? Math.abs(v) : ctNum(m[key]); }
  var spindleType = null, d = S['395'];
  if (d) spindleType = String(d.format).split(',').map(function(t) { return t.trim(); })[ctNum(d.value)] || null;
  var safeZ = ctNum(n.safeZHeight);
  return {
    units: n.unitsPreference === 'imperial' ? 'in' : 'mm',
    known: Object.keys(S).length > 0,
    travel: { x: travel('130', 'maxTravelX'), y: travel('131', 'maxTravelY'), z: travel('132', 'maxTravelZ') },
    maxRate: { x: ctNum(setting('110')), y: ctNum(setting('111')), z: ctNum(setting('112')) },
    homing: S['22'] ? ctBit(setting('22'), 0) : null,
    homingRequired: S['22'] ? ctBit(setting('22'), 2) : null,
    homeCorner: typeof n.homeLocation === 'string' ? n.homeLocation : null,
    softLimits: S['20'] ? ctNum(setting('20')) === 1 : null,
    hardLimits: S['21'] ? ctBit(setting('21'), 0) : null,
    pullOff: ctNum(setting('27')),
    rpm: { min: ctNum(setting('31')), max: ctNum(setting('30')) },
    laserMode: S['32'] ? ctNum(setting('32')) === 1 : null,
    spindleType: spindleType,
    safeZ: safeZ,
    park: ctVec(n.parkingLocation),
    tlsAfterHome: !!n.tlsAfterHome,
    axes: String(m.axes || 'XYZ')
  };
}

// A length in mm shown in the operator's units.
function fmtLen(mm, units, digits) {
  if (mm == null || !isFinite(mm)) return '?';
  var v = units === 'in' ? mm / 25.4 : mm;
  var dg = digits != null ? digits : units === 'in' ? 3 : 2;
  var s = v.toFixed(dg);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s + (units === 'in' ? ' in' : ' mm');
}
// A feed in mm/min shown in the operator's units.
function fmtFeed(mmMin, units) {
  if (mmMin == null || !isFinite(mmMin)) return '?';
  return units === 'in' ? (mmMin / 25.4).toFixed(1).replace(/\.0$/, '') + ' in/min' : Math.round(mmMin) + ' mm/min';
}

function ctStatus(ms) { return String((ms && ms.status) || '').split(':')[0]; }

// The six work offsets with the active one marked.
function workOffsets(ms) {
  var m = ms || {}, active = String(m.workspace || 'G54').toUpperCase();
  return CT_WORKSPACES.map(function(w) { return { name: w, offset: ctVec(m[w.toLowerCase()]), active: w === active }; });
}
function activeOffset(ms) {
  var w = String((ms && ms.workspace) || 'G54').toLowerCase();
  return ctVec(ms && ms[w]);
}

// The live state in a few plain sentences ("Where am I").
function whereAmI(state, facts) {
  var ms = (state && state.machineState) || {}, u = (facts && facts.units) || 'mm', out = [];
  if (!ms.connected) return ['ncSender isn’t connected to the controller, so there’s nothing to read yet.'];
  var status = ctStatus(ms);
  var words = { Idle: 'idle, ready for a command', Run: 'running a move or a program', Hold: 'on hold (paused): Resume continues, Stop ends it',
    Jog: 'jogging', Alarm: 'in alarm: it stopped and won’t move until the alarm is cleared', Door: 'stopped because the safety door is open',
    Home: 'homing', Check: 'in check mode (reading G-code without moving)', Sleep: 'asleep', Tool: 'changing tools' };
  out.push('The machine is ' + (words[status] || (status || 'in an unknown state').toLowerCase()) + '.');
  out.push(ms.homed ? 'It’s homed, so its machine coordinates are true.' : 'It isn’t homed yet, so its machine coordinates may not be where they read.');
  var wpos = ctVec(ms.WPos), ws = String(ms.workspace || 'G54').toUpperCase();
  if (wpos) {
    var parts = [];
    function side(v, plus, minus) { return Math.abs(v) < 0.0005 ? null : (v > 0 ? plus : minus) + ' by ' + fmtLen(Math.abs(v), u); }
    var px = side(wpos.x, 'right', 'left'), py = side(wpos.y, 'behind', 'in front');
    if (px) parts.push(px);
    if (py) parts.push(py);
    out.push(parts.length ? 'The spindle is off X0 Y0 of ' + ws + ': ' + parts.join(' and ') + '.' : 'The spindle is right over X0 Y0 of ' + ws + '.');
    if (Math.abs(wpos.z) < 0.0005) out.push('The bit’s tip is at Z0.');
    else out.push('The bit’s tip is ' + fmtLen(Math.abs(wpos.z), u) + (wpos.z > 0 ? ' above' : ' below') + ' Z0' + (wpos.z < 0 ? ' (into the stock, if Z0 is its top).' : '.'));
  }
  if (ms.tool != null && ms.tool !== '') out.push('Tool ' + ms.tool + ' is in the spindle' + (ms.toolLengthSet ? ', and its length is measured.' : ', and its length isn’t measured since it went in.'));
  var job = state && state.jobLoaded;
  if (job && job.filename) out.push('Program loaded: ' + job.filename + (job.status && job.status !== 'idle' ? ' (' + job.status + ')' : '') + '.');
  return out;
}

// ---------- watching for what a lesson asks ----------
// A tracker remembers the state when a "Try it" started and every move
// since: a move is the change in machine position from one Idle to the next.
function startTracker(state) {
  var ms = (state && state.machineState) || {};
  var offsets = {};
  workOffsets(ms).forEach(function(w) { offsets[w.name] = w.offset; });
  return {
    start: { homed: !!ms.homed, workspace: String(ms.workspace || 'G54').toUpperCase(), offsets: offsets,
      job: state && state.jobLoaded ? { filename: state.jobLoaded.filename, status: state.jobLoaded.status } : null, tool: ms.tool, toolLengthSet: !!ms.toolLengthSet },
    lastIdle: ctStatus(ms) === 'Idle' ? ctVec(ms.MPos) : null,
    pins: {}, probing: false, probeDone: false, probeAlarm: false, toolChanging: false, toolChangeDone: false,
    seen: {}, jobSeen: {}, runAfterHold: false, airZ: null, workspaces: [String(ms.workspace || 'G54').toUpperCase()], moves: [], state: state || {}
  };
}
function trackState(tr, state) {
  var ms = (state && state.machineState) || {}, status = ctStatus(ms);
  tr.state = state || {};
  if (status) tr.seen[status] = true;
  if (status === 'Run' && tr.seen.Hold) tr.runAfterHold = true;
  // Probe input P, tool setter T (ncSender normalizes grblHAL's pins);
  // isProbing is set while ncSender's Probe dialog runs a probe.
  String(ms.Pn || '').split('').forEach(function(c) { tr.pins[c] = true; });
  if (ms.isProbing) { tr.probing = true; if (status === 'Alarm') tr.probeAlarm = true; }
  else if (tr.probing) { tr.probing = false; tr.probeDone = true; if (status === 'Alarm') tr.probeAlarm = true; }
  if (ms.isToolChanging) tr.toolChanging = true;
  else if (tr.toolChanging) { tr.toolChanging = false; tr.toolChangeDone = true; }
  var job = state && state.jobLoaded;
  if (job && job.status) {
    var key = (job.filename || '') + '|' + job.status;
    // A completed job only counts once it was seen running since the start.
    if (job.status !== 'completed' || tr.jobSeen[(job.filename || '') + '|running']) tr.jobSeen[key] = true;
    if (job.status === 'running' && tr.airZ == null) { var wz = ctVec(ms.WPos); if (wz) tr.airZ = wz.z; }
  }
  var ws = String(ms.workspace || '').toUpperCase();
  if (ws && tr.workspaces.indexOf(ws) < 0) tr.workspaces.push(ws);
  // Homing, programs and alarms move the machine too: only Idle-to-Idle moves
  // with nothing else in between count as jogs.
  if (!ms.connected || /^(Home|Run|Alarm|Check|Door|Hold|Tool)$/.test(status)) { tr.lastIdle = null; return tr; }
  if (status !== 'Idle') return tr;
  var pos = ctVec(ms.MPos);
  if (!pos) return tr;
  if (tr.lastIdle) {
    var d = { x: pos.x - tr.lastIdle.x, y: pos.y - tr.lastIdle.y, z: pos.z - tr.lastIdle.z };
    if (CT_AXES.some(function(k) { return Math.abs(d[k]) > 0.0005; })) tr.moves.push(d);
  }
  tr.lastIdle = pos;
  return tr;
}
// The axis a move went along, when only one moved: { axis: 'x', d: 10 }.
function singleAxis(d) {
  var moved = CT_AXES.filter(function(k) { return Math.abs(d[k]) > 0.0005; });
  return moved.length === 1 ? { axis: moved[0], d: d[moved[0]] } : null;
}

// Each check: (tracker, facts) -> { items: [{ label, done, detail }], done }.
var CHECKS = {
  axes: function(tr, f) {
    var u = f.units, items = CT_AXES.map(function(k) {
      var A = k.toUpperCase(), plus = null, minus = null;
      tr.moves.forEach(function(d) { var s = singleAxis(d); if (s && s.axis === k) { if (s.d > 0) plus = s.d; else minus = s.d; } });
      return { label: 'Jog ' + A + '+ once', done: plus != null,
        detail: plus != null ? A + ' went up ' + fmtLen(plus, u, u === 'in' ? 4 : 3) + ': that’s ' + A + '+.' : minus != null ? 'That was ' + A + '−: the number went down ' + fmtLen(-minus, u, u === 'in' ? 4 : 3) + '. Try the ' + A + '+ button.' : '' };
    });
    return { items: items, done: items.every(function(i) { return i.done; }) };
  },
  home: function(tr) {
    var ms = tr.state.machineState || {};
    var did = !!tr.seen.Home || (!tr.start.homed && !!ms.homed);
    return { items: [{ label: 'Home the machine', done: did && !!ms.homed && ctStatus(ms) === 'Idle',
      detail: tr.seen.Home && ctStatus(ms) === 'Home' ? 'Homing now…' : did ? 'Homed: every axis found its switch.' : tr.seen.Alarm ? 'An alarm came up. The Limits and alarms lesson explains it.' : '' }],
      get done() { return this.items[0].done; } };
  },
  jogSizes: function(tr, f) {
    var sizes = [];
    tr.moves.forEach(function(d) { var s = singleAxis(d); if (!s) return; var r = Math.round(Math.abs(s.d) * 1000) / 1000; if (sizes.indexOf(r) < 0) sizes.push(r); });
    var items = [0, 1, 2].map(function(i) {
      return { label: i === 0 ? 'A jog with one step size' : i === 1 ? 'A jog with a second step size' : 'A jog with a third step size', done: sizes[i] != null,
        detail: sizes[i] != null ? 'Moved ' + fmtLen(sizes[i], f.units, f.units === 'in' ? 4 : 3) + '.' : '' };
    });
    return { items: items, done: sizes.length >= 3 };
  },
  workspace: function(tr) {
    var ms = tr.state.machineState || {}, now = String(ms.workspace || 'G54').toUpperCase(), other = tr.workspaces.filter(function(w) { return w !== tr.start.workspace; });
    return { items: [
      { label: 'Switch to another work offset', done: other.length > 0, detail: other.length ? 'Seen ' + other.join(', ') + '.' : '' },
      { label: 'Switch back to ' + tr.start.workspace, done: other.length > 0 && now === tr.start.workspace, detail: other.length && now !== tr.start.workspace ? now + ' is active.' : '' }
    ], get done() { return this.items[0].done && this.items[1].done; } };
  },
  zeroXY: function(tr, f) { return zeroCheck(tr, f, ['x', 'y']); },
  zeroZ: function(tr, f) { return zeroCheck(tr, f, ['z']); },
  loadSample: function(tr) {
    var job = tr.state.jobLoaded || {}, ok = job.filename === CT_SAMPLE_NAME;
    return { items: [{ label: 'Load the practice program', done: ok, detail: ok ? 'It’s in the visualizer.' : job.filename ? 'Loaded now: ' + job.filename + '.' : '' }], done: ok };
  },
  hold: function(tr) {
    var held = !!tr.seen.Hold, ms = tr.state.machineState || {};
    return { items: [
      { label: 'Pause a running program (Pause, or Feed Hold)', done: held, detail: held ? 'Seen: the machine stopped in Hold.' : '' },
      { label: 'Resume it', done: held && tr.runAfterHold, detail: '' }
    ], get done() { return this.items[0].done && this.items[1].done; } };
  },
  probeSignal: function(tr) {
    var ms = tr.state.machineState || {}, now = String(ms.Pn || '').indexOf('P') >= 0;
    return { items: [{ label: 'Touch the plate to the bit', done: !!tr.pins.P, detail: now ? 'Touching now: the probe input is on.' : tr.pins.P ? 'Seen: the probe input came on.' : '' }], done: !!tr.pins.P };
  },
  probeCycle: function(tr, f) {
    var ms = tr.state.machineState || {}, ws = String(ms.workspace || 'G54').toUpperCase(), was = tr.start.offsets[ws], now = activeOffset(ms);
    var moved = !!(was && now && CT_AXES.some(function(k) { return Math.abs(now[k] - was[k]) > 0.0005; }));
    var ok = tr.probeDone && !tr.probeAlarm;
    return { items: [
      { label: 'Run a probe from ncSender’s Probe dialog', done: tr.probeDone || tr.probing, detail: tr.probing ? 'Probing…' : tr.probeAlarm ? 'It ended in an alarm: check the clip and the plate, unlock, and try again.' : '' },
      { label: 'It finishes and sets the zero', done: ok && moved, detail: ok && moved ? 'The zero of ' + ws + ' moved to where the plate said.' : '' }
    ], get done() { return this.items[1].done; } };
  },
  tlsMeasure: function(tr) {
    var ms = tr.state.machineState || {}, measured = !!ms.toolLengthSet;
    var did = !!tr.pins.T || (!tr.start.toolLengthSet && measured);
    return { items: [
      { label: 'Measure the bit on the tool length setter', done: did, detail: tr.pins.T ? 'Seen: the tool setter was touched.' : '' },
      { label: 'Its length is set', done: did && measured, detail: did && measured ? 'Tool ' + (ms.tool != null ? ms.tool : '') + ' is measured.' : '' }
    ], get done() { return this.items[1].done; } };
  },
  toolChange: function(tr) {
    var ms = tr.state.machineState || {}, changed = ms.tool != null && ms.tool !== tr.start.tool;
    return { items: [
      { label: 'Change tools from ncSender', done: tr.toolChanging || tr.toolChangeDone, detail: tr.toolChanging ? 'Changing tools…' : '' },
      { label: 'The new tool is in', done: tr.toolChangeDone && changed, detail: tr.toolChangeDone && changed ? 'Tool ' + ms.tool + ' is in the spindle.' : '' }
    ], get done() { return this.items[1].done; } };
  },
  airCut: function(tr) {
    var ran = !!tr.jobSeen[CT_SAMPLE_NAME + '|running'], done = !!tr.jobSeen[CT_SAMPLE_NAME + '|completed'];
    return { items: [
      { label: 'Start the practice program with Z0 raised', done: ran || done,
        detail: tr.airZ != null && tr.airZ <= 1 ? 'Z0 didn’t look raised when it started (the bit was ' + (tr.airZ <= 0 ? 'at or below' : 'just above') + ' Z0). Stop it if it’s cutting.' : '' },
      { label: 'Watch it run to the end', done: done, detail: done ? 'Finished.' : ran ? 'Running…' : '' }
    ], done: done };
  }
};
// Did the active work offset's zero change on these axes since the start?
function zeroCheck(tr, f, axes) {
  var ms = tr.state.machineState || {}, ws = String(ms.workspace || 'G54').toUpperCase();
  var was = tr.start.offsets[ws], now = activeOffset(ms), wpos = ctVec(ms.WPos);
  var items = axes.map(function(k) {
    var A = k.toUpperCase(), changed = !!(was && now && Math.abs(now[k] - was[k]) > 0.0005);
    return { label: 'Zero ' + A + ' (in ' + ws + ')', done: changed,
      detail: changed ? A + '0 is now at machine ' + A + ' ' + fmtLen(now[k], f.units) + (wpos && Math.abs(wpos[k]) < 0.0005 ? ', right where the spindle is.' : '.') : '' };
  });
  return { items: items, done: items.every(function(i) { return i.done; }) };
}
// Loading a program while one runs would replace it under ncSender's feet.
function canLoadProgram(state) {
  var ms = (state && state.machineState) || {}, job = (state && state.jobLoaded) || {};
  return !!ms.connected && ctStatus(ms) === 'Idle' && job.status !== 'running' && job.status !== 'paused';
}
function runCheck(id, tr, facts) {
  var r = CHECKS[id](tr, facts || {});
  return { items: r.items, done: !!r.done };
}

var CT_SAMPLE_NAME = 'CNC Tutor practice.nc';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fwSettings: fwSettings, ctVec: ctVec, machineFacts: machineFacts, fmtLen: fmtLen, fmtFeed: fmtFeed, workOffsets: workOffsets,
    activeOffset: activeOffset, canLoadProgram: canLoadProgram, whereAmI: whereAmI, startTracker: startTracker, trackState: trackState, singleAxis: singleAxis, runCheck: runCheck,
    CHECKS: CHECKS, CT_SAMPLE_NAME: CT_SAMPLE_NAME };
}
