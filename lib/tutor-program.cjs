// The practice program the G-code, Check before you cut and Air cut lessons
// load into ncSender (nothing runs until the operator presses Start), and
// a plain-words reading of a G-code line.

// A 40 x 30 mm rectangle and a circle, 0.5 mm deep, in mm (G21) whatever the
// operator's units: X0 Y0 is the rectangle's front-left corner, Z0 the stock top.
function practiceProgram() {
  return [
    '(CNC Tutor practice program: a 40 x 30 mm rectangle and a circle, 0.5 mm deep)',
    '(X0 Y0 is the front-left corner of the rectangle, Z0 the top of the stock)',
    'G21 (millimeters)',
    'G90 (absolute positions)',
    'G17 (arcs in the XY plane)',
    'G0 Z5 (up to 5 mm above the stock)',
    'M3 S18000 (spindle on, clockwise, 18000 RPM)',
    'G4 P3 (wait 3 seconds for the spindle)',
    'G0 X0 Y0 (rapid over the start corner)',
    'G1 Z-0.5 F300 (plunge 0.5 mm into the stock)',
    'G1 X40 F1000 (cut along the front)',
    'G1 Y30 (cut up the right side)',
    'G1 X0 (cut along the back)',
    'G1 Y0 (cut down the left side, back to the start)',
    'G0 Z5 (lift out of the cut)',
    'G0 X20 Y8 (rapid to the bottom of the circle)',
    'G1 Z-0.5 F300 (plunge)',
    'G2 X20 Y8 I0 J7 F1000 (a full clockwise circle around X20 Y15)',
    'G0 Z5 (lift out)',
    'M5 (spindle off)',
    'G0 X0 Y0 (back over X0 Y0)',
    'M30 (end of the program)'
  ];
}

var CT_G = {
  0: 'Rapid move (G0): as fast as the machine goes, never for cutting',
  1: 'Straight cut (G1) at the feed rate',
  2: 'Clockwise arc (G2)', 3: 'Counterclockwise arc (G3)',
  4: 'Pause (G4) for P seconds',
  17: 'Arcs in the XY plane (G17)', 18: 'Arcs in the XZ plane (G18)', 19: 'Arcs in the YZ plane (G19)',
  20: 'Units are inches (G20)', 21: 'Units are millimeters (G21)',
  28: 'Go to the stored G28 position (G28)',
  40: 'Cutter compensation off (G40)',
  43.1: 'Tool length offset (G43.1): shifts Z by the tool’s length',
  49: 'Tool length offset off (G49)',
  53: 'This line’s position is in machine coordinates (G53)',
  54: 'Use work offset G54', 55: 'Use work offset G55', 56: 'Use work offset G56', 57: 'Use work offset G57', 58: 'Use work offset G58', 59: 'Use work offset G59',
  80: 'Canned cycle off (G80)', 81: 'Drill cycle (G81)', 83: 'Peck drill cycle (G83)',
  90: 'Positions are absolute (G90): measured from zero',
  91: 'Positions are relative (G91): measured from where the bit is',
  94: 'Feed is per minute (G94)'
};
var CT_M = {
  0: 'Program pause (M0)', 1: 'Optional pause (M1)', 2: 'End of the program (M2)',
  3: 'Spindle on, clockwise (M3)', 4: 'Spindle on, counterclockwise (M4)', 5: 'Spindle off (M5)',
  6: 'Tool change (M6)', 7: 'Mist coolant on (M7)', 8: 'Flood coolant on (M8)', 9: 'Coolant off (M9)',
  30: 'End of the program (M30)'
};

// One line in plain words: { code, comment, parts: [ 'Rapid move…', 'to X0 Y0' ] }.
function explainLine(line) {
  var s = String(line || ''), comments = [], m;
  var code = s.replace(/\(([^)]*)\)|;(.*)$/g, function(all, a, b) { comments.push((a != null ? a : b).trim()); return ' '; }).trim().toUpperCase();
  var words = [], re = /([A-Z])\s*([-+]?\d*\.?\d+)/g;
  while ((m = re.exec(code))) words.push({ l: m[1], v: Number(m[2]), raw: m[1] + m[2] });
  var parts = [], axes = [], arc = [];
  words.forEach(function(w) {
    if (w.l === 'G') parts.push(CT_G[w.v] || 'G' + w.v);
    else if (w.l === 'M') parts.push(CT_M[w.v] || 'M' + w.v);
    else if (w.l === 'X' || w.l === 'Y' || w.l === 'Z' || w.l === 'A') axes.push(w.raw);
    else if (w.l === 'I' || w.l === 'J' || w.l === 'K') arc.push(w.raw);
    else if (w.l === 'F') parts.push('feed rate ' + w.v + ' per minute (F)');
    else if (w.l === 'S') parts.push('spindle speed ' + w.v + ' RPM (S)');
    else if (w.l === 'T') parts.push('tool ' + w.v + ' (T)');
    else if (w.l === 'P') parts.push('P' + w.v);
    else if (w.l === 'N') parts.push('line number ' + w.v + ' (N)');
    else parts.push(w.raw);
  });
  if (axes.length) parts.push('to ' + axes.join(' '));
  if (arc.length) parts.push('the arc’s center is ' + arc.join(' ') + ' from its start (I, J)');
  if (!words.length && comments.length) parts.push('A comment: the machine ignores it');
  return { code: code, comment: comments.join(' '), parts: parts };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { practiceProgram: practiceProgram, explainLine: explainLine };
}
