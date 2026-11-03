// The lessons' figures as inline SVG, colored by the dialog's CSS (ct-fig
// classes), so they follow ncSender's light and dark themes.
// Axis colors as ncSender's visualizer: X red, Y green, Z blue.

function ctSvg(body, w, h, label) {
  return '<svg class="ct-fig" viewBox="0 0 ' + (w || 320) + ' ' + (h || 200) + '" role="img" aria-label="' + label + '">' +
    body + '</svg>';
}
// A line with a filled head at (x2, y2), in the line's class (cls-head fills it).
function ctHead(x1, y1, x2, y2, cls) {
  var a = Math.atan2(y2 - y1, x2 - x1), L = 9, W = 4.5;
  var bx = x2 - L * Math.cos(a), by = y2 - L * Math.sin(a);
  var p = [[x2, y2], [bx + W * Math.sin(a), by - W * Math.cos(a)], [bx - W * Math.sin(a), by + W * Math.cos(a)]];
  return '<polygon class="' + cls + '-head" points="' + p.map(function(q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ') + '"/>';
}
function ctArrow(x1, y1, x2, y2, cls) { return '<line class="' + cls + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>' + ctHead(x1, y1, x2, y2, cls); }
function ctText(x, y, t, cls, anchor) { return '<text class="' + (cls || 'f-txt') + '" x="' + x + '" y="' + y + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + t + '</text>'; }

var CT_FIGS = {
  estop: function() {
    return ctSvg(
      '<rect class="f-box" x="110" y="95" width="100" height="80" rx="8"/>' +
      '<rect class="f-warn-fill" x="130" y="110" width="60" height="50" rx="4"/>' +
      '<ellipse class="f-red-fill" cx="160" cy="88" rx="44" ry="14"/>' +
      '<path class="f-red-fill" d="M116 88v-22a44 14 0 0 1 88 0v22a44 14 0 0 1-88 0z"/>' +
      '<ellipse class="f-red-top" cx="160" cy="66" rx="44" ry="14"/>' +
      ctText(160, 196, 'Press to stop. Twist to release.', 'f-txt', 'middle'), 320, 205, 'An emergency stop button');
  },
  axes: function() {
    return ctSvg(
      '<path class="f-box" d="M60 150 L200 150 L260 100 L120 100 Z"/>' +
      '<rect class="f-line" x="140" y="35" width="26" height="58" rx="4"/>' +
      '<line class="f-line" x1="153" y1="93" x2="153" y2="112"/>' +
      ctArrow(153, 125, 225, 125, 'f-x') + ctText(232, 129, 'X+ right', 'f-x-txt') +
      ctArrow(153, 125, 193, 92, 'f-y') + ctText(200, 88, 'Y+ back', 'f-y-txt') +
      ctArrow(115, 90, 115, 30, 'f-z') + ctText(70, 24, 'Z+ up', 'f-z-txt') +
      '<circle class="f-dot" cx="153" cy="125" r="3"/>' +
      ctText(130, 180, 'You stand here', 'f-txt', 'middle') + ctArrow(130, 186, 130, 194, 'f-line'), 320, 200, 'X goes right, Y goes back, Z goes up');
  },
  home: function(f) {
    var c = (f && f.homeCorner) || 'back-left', back = c.indexOf('back') === 0, left = /left$/.test(c);
    var hx = left ? 62 : 258, hy = back ? 42 : 158;
    return ctSvg(
      '<rect class="f-box" x="50" y="30" width="220" height="140" rx="6"/>' +
      ctText(160, 24, 'back', 'f-txt', 'middle') + ctText(160, 188, 'front (you)', 'f-txt', 'middle') +
      '<circle class="f-acc-fill" cx="' + hx + '" cy="' + hy + '" r="8"/>' +
      ctText(hx + (left ? 14 : -14), hy + 4, 'home', 'f-acc-txt', left ? 'start' : 'end') +
      '<circle class="f-line" cx="160" cy="100" r="8"/>' + ctArrow(160, 100, hx + (left ? 14 : -14), hy + (back ? 10 : -10), 'f-acc') +
      ctText(160, 128, 'homing finds the switches', 'f-txt', 'middle'), 320, 195, 'Homing moves to the home corner');
  },
  jog: function() {
    var b = '';
    [['10', 40], ['1', 120], ['0.1', 200]].forEach(function(s, i) {
      b += '<rect class="f-box" x="' + s[1] + '" y="40" width="70" height="40" rx="8"/>' + ctText(s[1] + 35, 66, s[0] + ' mm', 'f-txt', 'middle');
    });
    b += '<line class="f-line" x1="40" y1="140" x2="280" y2="140"/>';
    b += ctArrow(40, 120, 280, 120, 'f-x') + ctText(160, 112, '10 mm: travel', 'f-txt', 'middle');
    b += ctArrow(40, 155, 64, 155, 'f-y') + ctText(70, 159, '1 mm: getting close', 'f-txt');
    b += ctArrow(40, 175, 43, 175, 'f-z') + ctText(50, 179, '0.1 mm: touching', 'f-txt');
    return ctSvg(b, 320, 190, 'Step sizes');
  },
  safez: function() {
    return ctSvg(
      '<rect class="f-stock" x="40" y="130" width="240" height="30"/>' + '<rect class="f-clamp" x="150" y="112" width="30" height="18"/>' +
      ctText(165, 108, 'clamp', 'f-txt', 'middle') +
      '<path class="f-bad" d="M60 125 L270 125"/>' + ctText(280, 122, '✕', 'f-bad-txt') +
      '<path class="f-acc" d="M60 125 L60 60 L260 60 L260 118"/>' + ctHead(260, 100, 260, 125, 'f-acc') +
      ctText(160, 52, 'lift to Safe Z, move, then lower', 'f-acc-txt', 'middle'), 320, 175, 'Lift first, then move across');
  },
  wcs: function() {
    return ctSvg(
      '<rect class="f-box" x="20" y="20" width="280" height="150" rx="6"/>' +
      '<rect class="f-stock" x="170" y="45" width="110" height="75"/>' +
      ctArrow(40, 155, 166, 122, 'f-acc') + ctText(48, 128, 'work offset (G54)', 'f-acc-txt') +
      '<circle class="f-acc-fill" cx="40" cy="155" r="6"/>' + ctText(30, 190, 'home (machine 0)', 'f-txt') +
      '<circle class="f-dot" cx="170" cy="120" r="6"/>' + ctText(176, 140, 'work zero X0 Y0', 'f-txt'), 320, 200, 'The work offset is the distance from home to work zero');
  },
  xyzero: function() {
    return ctSvg(
      '<rect class="f-stock" x="30" y="40" width="120" height="100"/>' + '<circle class="f-dot" cx="30" cy="140" r="6"/>' +
      ctText(90, 165, 'corner', 'f-txt', 'middle') + ctArrow(30, 140, 70, 140, 'f-x') + ctArrow(30, 140, 30, 100, 'f-y') +
      '<rect class="f-stock" x="180" y="40" width="120" height="100"/>' + '<circle class="f-dot" cx="240" cy="90" r="6"/>' +
      '<line class="f-dash" x1="180" y1="40" x2="300" y2="140"/><line class="f-dash" x1="300" y1="40" x2="180" y2="140"/>' +
      ctText(240, 165, 'center', 'f-txt', 'middle'), 320, 180, 'X0 Y0 on a corner or in the center');
  },
  zzero: function() {
    return ctSvg(
      '<rect class="f-spoil" x="20" y="150" width="280" height="22"/>' + ctText(160, 166, 'spoilboard', 'f-txt', 'middle') +
      '<rect class="f-stock" x="40" y="105" width="240" height="45"/>' +
      '<rect class="f-line" x="70" y="30" width="20" height="50" rx="3"/><path class="f-bit" d="M75 80 h10 v22 l-5 3 l-5 -3 z"/>' +
      '<line class="f-paper" x1="55" y1="104" x2="110" y2="104"/>' + ctText(118, 100, 'paper: lower until it drags', 'f-txt') +
      ctText(296, 102, 'Z0 = top', 'f-acc-txt', 'end') + '<line class="f-acc" x1="40" y1="105" x2="300" y2="105"/>', 320, 180, 'Zero Z on the stock top');
  },
  tlo: function() {
    return ctSvg(
      '<rect class="f-stock" x="20" y="140" width="280" height="30"/>' + '<line class="f-acc" x1="20" y1="140" x2="300" y2="140"/>' + ctText(296, 134, 'Z0', 'f-acc-txt', 'end') +
      '<rect class="f-line" x="70" y="20" width="24" height="50" rx="3"/><path class="f-bit" d="M76 70 h12 v68 l-6 2 l-6 -2 z"/>' + ctText(82, 160, 'zeroed bit', 'f-txt', 'middle') +
      '<rect class="f-line" x="190" y="20" width="24" height="50" rx="3"/><path class="f-bit" d="M196 70 h12 v88 l-6 2 l-6 -2 z"/>' +
      '<line class="f-bad" x1="180" y1="140" x2="224" y2="160"/>' + ctText(230, 120, 'longer bit:', 'f-bad-txt') + ctText(230, 134, 'cuts deeper', 'f-bad-txt'), 320, 180, 'A longer bit cuts deeper with the same Z0');
  },
  aircut: function() {
    return ctSvg(
      '<rect class="f-stock" x="30" y="140" width="260" height="30"/>' + '<line class="f-dash" x1="30" y1="140" x2="290" y2="140"/>' + ctText(286, 134, 'real Z0', 'f-txt', 'end') +
      '<line class="f-acc" x1="30" y1="80" x2="290" y2="80"/>' + ctText(286, 74, 'air cut Z0: +25 mm', 'f-acc-txt', 'end') +
      ctArrow(60, 138, 60, 84, 'f-z') +
      '<path class="f-path" d="M90 70 L90 95 L250 95 L250 70"/>' + ctText(170, 112, 'the program cuts in the air', 'f-txt', 'middle'), 320, 180, 'Raise Z0 to run the program above the stock');
  },
  bits: function() {
    function shank(x) { return '<rect class="f-line" x="' + (x - 8) + '" y="20" width="16" height="50"/>'; }
    return ctSvg(
      shank(50) + '<path class="f-bit" d="M42 70 h16 v70 h-16 z"/>' + ctText(50, 160, 'flat', 'f-txt', 'middle') +
      shank(130) + '<path class="f-bit" d="M122 70 h16 v62 a8 8 0 0 1 -16 0 z"/>' + ctText(130, 160, 'ball', 'f-txt', 'middle') +
      shank(210) + '<path class="f-bit" d="M202 70 h16 v20 l-8 50 l-8 -50 z"/>' + ctText(210, 160, 'V', 'f-txt', 'middle') +
      shank(280) + '<path class="f-bit" d="M272 70 h16 v70 h-16 z"/><path class="f-line" d="M272 80 l16 10 M272 95 l16 10 M272 110 l16 10 M272 125 l16 10"/>' + ctText(280, 160, 'spiral', 'f-txt', 'middle'), 320, 175, 'Flat, ball, V and spiral bits');
  },
  chip: function() {
    return ctSvg(
      '<rect class="f-stock" x="20" y="110" width="280" height="50"/>' +
      '<circle class="f-line" cx="110" cy="110" r="40"/>' + ctArrow(160, 70, 220, 70, 'f-acc') + ctText(190, 62, 'feed', 'f-acc-txt', 'middle') +
      '<path class="f-chip" d="M150 110 q 8 -6 16 -2 l-14 6 z"/>' + ctText(170, 100, 'chip load', 'f-txt') +
      '<path class="f-acc" d="M80 82 a 40 40 0 0 1 60 0"/>' + ctHead(132, 74, 140, 82, 'f-acc') + ctText(110, 58, 'RPM', 'f-acc-txt', 'middle'), 320, 175, 'Chip load is the chip each edge takes');
  },
  stepover: function() {
    return ctSvg(
      '<rect class="f-stock" x="20" y="40" width="130" height="100"/>' +
      '<path class="f-cutfill" d="M20 40 h130 v25 h-130 z"/><path class="f-cutfill2" d="M20 65 h130 v25 h-130 z"/>' + ctText(85, 160, 'depth per pass', 'f-txt', 'middle') +
      '<rect class="f-stock" x="170" y="40" width="130" height="100"/>' +
      '<circle class="f-line" cx="200" cy="90" r="22"/><circle class="f-line" cx="230" cy="90" r="22"/>' + ctArrow(200, 125, 230, 125, 'f-acc') + ctText(235, 160, 'stepover', 'f-txt', 'middle'), 320, 175, 'Depth per pass and stepover');
  },
  climb: function() {
    return ctSvg(
      '<rect class="f-stock" x="90" y="60" width="140" height="80"/>' + ctText(160, 104, 'part', 'f-txt', 'middle') +
      '<rect class="f-acc" x="70" y="40" width="180" height="120" rx="4" fill="none"/>' +
      ctArrow(110, 40, 190, 40, 'f-acc') + ctArrow(250, 80, 250, 130, 'f-acc') +
      ctText(160, 30, 'outside, clockwise = conventional', 'f-acc-txt', 'middle') +
      ctText(160, 182, 'outside, counterclockwise = climb', 'f-txt', 'middle') + ctText(160, 196, '(spindle clockwise, M3, seen from above)', 'f-txt', 'middle'), 320, 205, 'Climb and conventional around a part');
  },
  clamps: function() {
    return ctSvg(
      '<rect class="f-spoil" x="10" y="20" width="300" height="160"/>' + '<rect class="f-stock" x="60" y="50" width="200" height="100"/>' +
      '<rect class="f-clamp" x="40" y="80" width="30" height="40"/><rect class="f-clamp" x="250" y="80" width="30" height="40"/>' +
      '<rect class="f-path" x="100" y="70" width="120" height="60" rx="4"/>' +
      '<rect class="f-tab" x="155" y="66" width="10" height="8"/><rect class="f-tab" x="155" y="126" width="10" height="8"/>' +
      ctText(160, 104, 'cut, with tabs', 'f-txt', 'middle') + ctText(55, 72, 'clamp', 'f-txt', 'middle'), 320, 195, 'Clamps clear of the path, tabs on the part');
  }
};

function figure(name, facts) { return CT_FIGS[name] ? CT_FIGS[name](facts || {}) : ''; }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { figure: figure, CT_FIGS: CT_FIGS };
}
