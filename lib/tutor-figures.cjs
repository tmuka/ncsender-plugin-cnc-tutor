// The lessons' figures as inline SVG, colored by the dialog's CSS (ct-fig
// classes), so they follow ncSender's light and dark themes. Axis colors as
// ncSender's visualizer: X red, Y green, Z blue.
// Figures that show motion are animated with SVG's own animation (SMIL):
// each loops on one clock per figure, so the parts stay in step, and the
// dialog can pause one (svg.pauseAnimations) or show its still frame
// (data-still, in seconds) when the operator prefers reduced motion.

function ctSvg(body, w, h, label, still) {
  return '<svg class="ct-fig" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '"' +
    (still != null ? ' data-still="' + still + '"' : '') + '>' + body + '</svg>';
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

// ---------- animation helpers: values at keyTimes (0..1) over dur seconds, eased ----------
function ctKeys(times) { return ' keyTimes="' + times.join(';') + '" calcMode="spline" keySplines="' + times.slice(1).map(function() { return '.45 0 .25 1'; }).join(';') + '"'; }
function ctMove(points, times, dur) {
  return '<animateTransform attributeName="transform" type="translate" values="' + points.map(function(p) { return p[0] + ' ' + p[1]; }).join(';') + '"' + ctKeys(times) + ' dur="' + dur + 's" repeatCount="indefinite"/>';
}
function ctAnim(attr, values, times, dur) {
  return '<animate attributeName="' + attr + '" values="' + values.join(';') + '"' + ctKeys(times) + ' dur="' + dur + 's" repeatCount="indefinite"/>';
}
function ctFade(values, times, dur) { return ctAnim('opacity', values, times, dur); }
function ctSpin(cx, cy, secs) {
  return '<animateTransform attributeName="transform" type="rotate" from="0 ' + cx + ' ' + cy + '" to="360 ' + cx + ' ' + cy + '" dur="' + secs + 's" repeatCount="indefinite"/>';
}
// An element drawn along its own path: dash = the path's length.
function ctDraw(len, end, dur) {
  return ' stroke-dasharray="' + len + ' ' + len + '"><animate attributeName="stroke-dashoffset" values="' + len + ';0;0" keyTimes="0;' + end + ';1" dur="' + dur + 's" repeatCount="indefinite"/>';
}

// A router spindle seen from the side, the bit's tip at (x, tip).
function ctSpindle(x, tip, len) {
  var top = tip - len, flutes = '';
  for (var y = top + 3; y < tip - 4; y += 6) flutes += '<line class="f-flute" x1="' + (x - 3.5) + '" y1="' + (y + 4) + '" x2="' + (x + 3.5) + '" y2="' + y + '"/>';
  return '<rect class="f-motor" x="' + (x - 12) + '" y="' + (top - 50) + '" width="24" height="42" rx="4"/>' +
    '<rect class="f-motor-band" x="' + (x - 12) + '" y="' + (top - 40) + '" width="24" height="5"/>' +
    '<path class="f-collet" d="M' + (x - 8) + ' ' + (top - 8) + 'h16l-3 8h-10z"/>' +
    '<path class="f-bit" d="M' + (x - 3.5) + ' ' + top + 'h7v' + (len - 3) + 'l-3.5 3l-3.5 -3z"/>' + flutes;
}
// A bit seen from above: its end with two flute gullets, spinning clockwise (M3).
function ctBitTop(cx, cy, r, spin) {
  var e = r - 1.5;
  function pt(deg) { var a = deg * Math.PI / 180; return (cx + e * Math.cos(a)).toFixed(1) + ' ' + (cy + e * Math.sin(a)).toFixed(1); }
  function gullet(a) { return 'M' + cx + ' ' + cy + 'L' + pt(a) + 'A' + e + ' ' + e + ' 0 0 1 ' + pt(a + 50) + 'Z'; }
  return '<circle class="f-bitface" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
    '<g><path class="f-gullet" d="' + gullet(0) + gullet(180) + '"/>' + (spin ? ctSpin(cx, cy, spin) : '') + '</g>' +
    '<circle class="f-hub" cx="' + cx + '" cy="' + cy + '" r="' + Math.max(1.5, r * .15).toFixed(1) + '"/>';
}

var CT_FIGS = {
  estop: function() {
    var D = 6;
    return ctSvg(
      '<rect class="f-box" x="100" y="96" width="120" height="78" rx="10"/>' +
      '<rect class="f-warn-fill" x="106" y="138" width="108" height="22" rx="3"/>' + ctText(160, 153, 'EMERGENCY STOP', 'f-warn-txt', 'middle') +
      '<ellipse class="f-glow" cx="160" cy="70" rx="64" ry="30" opacity="0">' + ctFade([0, 0, .6, .6, 0, 0], [0, .16, .22, .5, .58, 1], D) + '</ellipse>' +
      '<rect class="f-red-fill" x="142" y="80" width="36" height="16"/>' +
      '<g>' + ctMove([[0, 0], [0, 0], [0, 9], [0, 9], [0, 0], [0, 0]], [0, .12, .2, .58, .68, 1], D) +
      '<path class="f-red-fill" d="M118 72v-14a42 13 0 0 1 84 0v14a42 13 0 0 1-84 0z"/><ellipse class="f-red-top" cx="160" cy="58" rx="42" ry="13"/>' +
      '<g><animateTransform attributeName="transform" type="rotate" values="0 160 58;0 160 58;25 160 58;0 160 58;0 160 58" keyTimes="0;.6;.66;.72;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      '<path class="f-red-ridge" d="M138 58h44"/></g></g>' +
      '<g>' + ctFade([1, 1, 0, 0, 1], [0, .55, .6, .95, 1], D) + ctText(160, 196, 'Press: the motors and spindle stop.', 'f-txt', 'middle') + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0], [0, .58, .63, .92, 1], D) + ctText(160, 196, 'Twist to release it once it’s safe.', 'f-txt', 'middle') +
      '<path class="f-acc" d="M214 44a52 16 0 0 1 -14 22"/>' + ctHead(208, 60, 200, 67, 'f-acc') + '</g>', 320, 206, 'An emergency stop button pressed and released', 2);
  },

  axes: function() {
    var D = 10;
    function hl(t0) { return ctFade([.3, .3, 1, 1, .3, .3], [0, t0, t0 + .04, t0 + .18, t0 + .22, 1], D); }
    function show(t0) { return ctFade([0, 0, 1, 1, 0, 0], [0, t0, t0 + .04, t0 + .18, t0 + .22, 1], D); }
    return ctSvg(
      '<polygon class="f-box" points="20,176 210,176 270,126 80,126"/>' +
      '<polygon class="f-stock" points="92,166 172,166 194,148 114,148"/>' +
      '<line class="f-rail" x1="20" y1="176" x2="80" y2="126"/><line class="f-rail" x1="210" y1="176" x2="270" y2="126"/>' +
      '<g opacity="0">' + show(.28) + ctArrow(236, 176, 266, 151, 'f-y') + '</g>' +
      '<g>' + ctMove([[0, 0], [0, 0], [24, -20], [24, -20], [0, 0], [0, 0]], [0, .3, .44, .84, .96, 1], D) +
      '<rect class="f-gantry" x="26" y="92" width="12" height="74"/><rect class="f-gantry" x="216" y="92" width="12" height="74"/>' +
      '<rect class="f-gantry" x="22" y="84" width="210" height="14" rx="2"/>' +
      '<g opacity="0">' + show(.04) + ctArrow(118, 76, 180, 76, 'f-x') + '</g>' +
      '<g>' + ctMove([[0, 0], [0, 0], [70, 0], [70, 0], [0, 0], [0, 0]], [0, .06, .2, .84, .96, 1], D) +
      '<rect class="f-carriage" x="80" y="80" width="30" height="26" rx="3"/>' +
      '<g opacity="0">' + show(.52) + ctArrow(124, 146, 124, 112, 'f-z') + '</g>' +
      '<g>' + ctMove([[0, 0], [0, 0], [0, -16], [0, -16], [0, 0], [0, 0]], [0, .54, .66, .84, .96, 1], D) + ctSpindle(95, 158, 18) + '</g>' +
      '</g></g>' +
      '<g>' + hl(.04) + ctText(244, 30, 'X+ right', 'f-x-txt') + '</g>' +
      '<g>' + hl(.28) + ctText(244, 48, 'Y+ back', 'f-y-txt') + '</g>' +
      '<g>' + hl(.52) + ctText(244, 66, 'Z+ up', 'f-z-txt') + '</g>' +
      ctText(115, 196, 'You stand here, in front', 'f-txt', 'middle'), 320, 204, 'The spindle moving X+ to the right, Y+ to the back and Z+ up', 7.5);
  },

  home: function(f) {
    var D = 9, c = (f && f.homeCorner) || 'back-left', back = c.indexOf('back') === 0, left = /left$/.test(c);
    var hx = left ? 56 : 264, hy = back ? 44 : 152, dx = hx - 160, dy = hy - 98;
    return ctSvg(
      '<rect class="f-box" x="40" y="28" width="240" height="140" rx="6"/>' +
      ctText(160, 20, 'back', 'f-txt', 'middle') + ctText(160, 186, 'front (you)', 'f-txt', 'middle') +
      '<rect class="f-switch" x="' + (left ? 34 : 280) + '" y="' + (hy - 8) + '" width="6" height="16"/>' +
      '<rect class="f-switch" x="' + (hx - 8) + '" y="' + (back ? 22 : 168) + '" width="16" height="6"/>' +
      '<line class="f-dash" x1="160" y1="98" x2="' + hx + '" y2="' + hy + '"/>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .58, .62, .86, .9, 1], D) +
      '<circle class="f-acc" cx="' + hx + '" cy="' + hy + '" r="16"/>' + ctText(hx + (left ? 24 : -24), hy + 4, 'home: the switches are pressed', 'f-acc-txt', left ? 'start' : 'end') + '</g>' +
      '<g>' + ctMove([[0, 0], [0, 0], [dx, dy], [dx, dy], [0, 0], [0, 0]], [0, .3, .58, .86, .97, 1], D) +
      '<circle class="f-spindle-top" cx="160" cy="98" r="11"/><path class="f-line" d="M152 98h16M160 90v16"/>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .06, .1, .24, .28, 1], D) + ctArrow(180, 110, 180, 84, 'f-z') + ctText(188, 102, 'Z up first', 'f-z-txt') + '</g>' +
      '</g>', 320, 194, 'Homing lifts Z, then moves to the home corner until the switches are pressed', 6.5);
  },

  jog: function(f) {
    var inch = f && f.units === 'in';
    var D = 11, tips = [80, 100, 120, 140, 146, 152, 158, 164, 166, 168, 170], at = [.05, .13, .21, .32, .38, .44, .5, .6, .66, .72];
    var pts = [[0, 0]], times = [0];
    at.forEach(function(t, i) { pts.push([0, tips[i] - 80]); times.push(t); pts.push([0, tips[i + 1] - 80]); times.push(+(t + .03).toFixed(2)); });
    pts.push([0, 90], [0, 0], [0, 0]); times.push(.9, .98, 1);
    function label(t0, t1, text) { return '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, t0, +(t0 + .02).toFixed(2), t1, +(t1 + .02).toFixed(2), 1], D) + ctText(306, 46, text, 'f-acc-txt', 'end') + '</g>'; }
    return ctSvg(
      '<rect class="f-stock" x="40" y="170" width="240" height="32"/>' + ctText(270, 191, 'stock', 'f-stock-txt', 'end') +
      '<g>' + ctMove(pts, times, D) + ctSpindle(120, 80, 20) + '</g>' +
      label(.03, .28, (inch ? '1 in' : '10 mm') + ' steps: travel') + label(.3, .56, (inch ? '0.1 in' : '1 mm') + ' steps: getting close') + label(.58, .88, (inch ? '0.01 in' : '0.1 mm') + ' steps: touching') +
      ctText(306, 66, 'one press, one step', 'f-txt', 'end'), 320, 208, 'Big steps to travel, then small steps to touch the stock', 8);
  },

  safez: function() {
    var D = 9;
    return ctSvg(
      '<rect class="f-stock" x="30" y="150" width="260" height="36"/>' +
      '<rect class="f-clamp" x="150" y="128" width="34" height="22" rx="2"/><line class="f-line" x1="167" y1="116" x2="167" y2="150"/>' + ctText(196, 140, 'clamp', 'f-txt') +
      '<path class="f-bad" d="M70 144H146"/><path class="f-bad-solid" d="M140 132l14 14M154 132l-14 14"/>' + ctText(30, 206, '✕ straight across hits the clamp', 'f-bad-txt') +
      '<path class="f-path" d="M60 147V96H260V147"/>' + ctText(160, 16, 'lift to Safe Z, move across, then lower', 'f-acc-txt', 'middle') +
      '<g>' + ctFade([1, 1, 0, 0, 1, 1], [0, .84, .88, .93, .97, 1], D) +
      ctMove([[0, 0], [0, 0], [0, -51], [200, -51], [200, 0], [200, 0], [0, 0], [0, 0]], [0, .08, .24, .56, .72, .88, .9, 1], D) + ctSpindle(60, 147, 18) + '</g>',
      320, 214, 'Lift first, move across, then lower: a straight move would hit the clamp', 4);
  },

  wcs: function() {
    var D = 9, L = 134;
    return ctSvg(
      '<rect class="f-box" x="20" y="20" width="280" height="150" rx="6"/>' +
      '<rect class="f-stock" x="170" y="44" width="112" height="74"/>' +
      '<circle class="f-acc-fill" cx="36" cy="154" r="6"/>' + ctText(30, 190, 'home (machine 0)', 'f-txt') +
      '<line class="f-acc" x1="36" y1="154" x2="166" y2="121"' + ctDraw(L, .35, D) + '</line>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1], [0, .33, .37, 1], D) + ctHead(36, 154, 168, 120.5, 'f-acc') + ctText(40, 106, 'work offset (G54)', 'f-acc-txt') + '</g>' +
      '<circle class="f-dot" cx="170" cy="118" r="5"/>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0], [0, .62, .68, .94, 1], D) + '<path class="f-zero" d="M158 118h24M170 106v24"/>' + ctText(186, 138, 'work zero X0 Y0', 'f-acc-txt') + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .38, .42, .66, .7, 1], D) + ctMove([[0, 0], [0, 0], [134, -36], [134, -36]], [0, .42, .66, 1], D) +
      '<circle class="f-spindle-top" cx="36" cy="154" r="9"/></g>', 320, 198, 'The work offset is the distance from home to work zero', 7);
  },

  xyzero: function() {
    var D = 8, diag = 142;
    return ctSvg(
      '<rect class="f-stock" x="30" y="40" width="110" height="90"/>' + ctText(85, 150, 'on a corner', 'f-txt', 'middle') +
      '<g>' + ctMove([[0, 0], [0, 0], [-120, 110], [-120, 110]], [0, .08, .4, 1], D) + ctBitTop(150, 20, 12, .5) + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0], [0, .4, .45, .94, 1], D) + '<path class="f-zero" d="M12 130h36M30 112v36"/></g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0], [0, .45, .5, .94, 1], D) + ctText(18, 182, 'the bit’s center on the corner: half hangs off', 'f-acc-txt') + '</g>' +
      '<rect class="f-stock" x="180" y="40" width="110" height="90"/>' + ctText(235, 150, 'in the center', 'f-txt', 'middle') +
      '<line class="f-dash-acc" x1="180" y1="40" x2="290" y2="130"' + ctDraw(diag, .3, D) + '</line>' +
      '<line class="f-dash-acc" x1="290" y1="40" x2="180" y2="130"' + ctDraw(diag, .3, D) + '</line>' +
      '<g>' + ctMove([[0, 0], [0, 0], [-65, 65], [-65, 65]], [0, .32, .62, 1], D) + ctBitTop(300, 20, 12, .5) + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0], [0, .62, .67, .94, 1], D) + '<path class="f-zero" d="M217 85h36M235 67v36"/></g>',
      320, 192, 'Zero X and Y with the bit’s center on a corner or in the center', 7);
  },

  zzero: function() {
    var D = 10, wig = [], wt = [];
    for (var i = 0; i <= 8; i++) { wig.push(i % 2 ? (i % 4 === 1 ? -5 : 5) : 0); wt.push(+(i * .06).toFixed(2)); }
    wig.push(0); wt.push(1);
    return ctSvg(
      '<rect class="f-spoil" x="20" y="158" width="280" height="20"/>' + ctText(160, 172, 'spoilboard', 'f-txt', 'middle') +
      '<rect class="f-stock" x="40" y="120" width="240" height="38"/>' +
      '<rect class="f-paper" x="80" y="116" width="96" height="4"><animateTransform attributeName="transform" type="translate" values="' + wig.map(function(v) { return v + ' 0'; }).join(';') +
        '" keyTimes="' + wt.join(';') + '" dur="' + D + 's" repeatCount="indefinite"/></rect>' +
      '<g>' + ctMove([[0, 0], [0, 0], [0, 20], [0, 20], [0, 30], [0, 30], [0, 36], [0, 36], [0, 39], [0, 39], [0, 40], [0, 40], [0, 0], [0, 0]],
        [0, .05, .08, .15, .18, .25, .28, .35, .38, .45, .48, .92, .98, 1], D) + ctSpindle(128, 76, 20) + '</g>' +
      '<g>' + ctFade([1, 1, 0, 0, 1], [0, .44, .48, .95, 1], D) + ctText(300, 40, 'lower in small steps…', 'f-txt', 'end') + ctText(300, 56, 'the paper still slides', 'f-txt', 'end') + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .5, .54, .92, .96, 1], D) + ctText(300, 40, 'the paper drags:', 'f-acc-txt', 'end') + ctText(300, 56, 'zero Z here', 'f-acc-txt', 'end') +
      '<line class="f-acc" x1="40" y1="120" x2="280" y2="120"/>' + ctText(276, 112, 'Z0 = top of the stock', 'f-acc-txt', 'end') + '</g>',
      320, 184, 'Lower the bit onto paper until it just drags, then zero Z', 6);
  },

  tlo: function(f) {
    var D = 10;
    function bit(len) {
      var flutes = '';
      for (var y = 74; y < 66 + len; y += 6) flutes += '<line class="f-flute" x1="156.5" y1="' + (y + 4) + '" x2="163.5" y2="' + y + '"/>';
      return '<path class="f-bit" d="M156.5 70h7v' + (len - 3) + 'l-3.5 3l-3.5 -3z"/>' + flutes;
    }
    return ctSvg(
      '<rect class="f-stock" x="20" y="130" width="280" height="44"/>' +
      '<line class="f-acc" x1="20" y1="130" x2="300" y2="130"/>' + ctText(296, 124, 'Z0', 'f-acc-txt', 'end') +
      '<g>' + ctFade([1, 1, 0, 0, 1], [0, .44, .48, .96, 1], D) + bit(60) + ctText(182, 100, 'Z0 was set', 'f-txt') + ctText(182, 114, 'with this bit', 'f-txt') + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .48, .52, .94, .98, 1], D) + bit(82) + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .6, .64, .94, .98, 1], D) + '<rect class="f-danger" x="140" y="130" width="40" height="22"/>' +
      ctText(182, 100, 'a longer bit,', 'f-bad-txt') + ctText(182, 114, 'same Z0', 'f-bad-txt') + ctText(160, 194, 'the longer bit cuts ' + (f && f.units === 'in' ? '7/8 in' : '22 mm') + ' too deep', 'f-bad-txt', 'middle') + '</g>' +
      '<rect class="f-motor" x="148" y="20" width="24" height="42" rx="4"/><rect class="f-motor-band" x="148" y="30" width="24" height="5"/><path class="f-collet" d="M152 62h16l-3 8h-10z"/>',
      320, 202, 'A longer bit with the same Z0 cuts deeper', 8);
  },

  aircut: function(f) {
    var D = 10;
    return ctSvg(
      '<rect class="f-stock" x="20" y="160" width="280" height="30"/>' +
      '<line class="f-dash" x1="20" y1="160" x2="300" y2="160"/>' + ctText(196, 154, 'real Z0: the stock top', 'f-txt') +
      '<line class="f-acc" x1="20" y1="100" x2="300" y2="100"/>' + ctText(196, 94, 'air cut Z0', 'f-acc-txt') + ctText(196, 116, (f && f.units === 'in' ? '1 in' : '25 mm') + ' up', 'f-acc-txt') +
      ctArrow(30, 158, 30, 104, 'f-z') +
      '<path class="f-path" d="M60 70V112H170V70"/>' + ctText(118, 140, 'the path runs in the air', 'f-txt', 'middle') +
      '<g>' + ctFade([1, 1, 0, 0, 1, 1], [0, .84, .88, .93, .97, 1], D) +
      ctMove([[0, 0], [0, 0], [0, 42], [110, 42], [110, 0], [110, 0], [0, 0], [0, 0]], [0, .08, .22, .6, .72, .88, .9, 1], D) + ctSpindle(60, 70, 16) + '</g>',
      320, 196, 'An air cut: the program runs above the stock', 4.5);
  },

  bits: function() {
    var D = 1.2, xs = [36, 108, 180, 252, 324], names = ['flat', 'ball', 'V', 'upcut', 'downcut'], subs = ['', '', '', 'chips up', 'chips down'];
    var shapes = [
      function(x) { return 'M' + (x - 9) + ' 62h18v78h-18z'; },
      function(x) { return 'M' + (x - 9) + ' 62h18v69a9 9 0 0 1 -18 0z'; },
      function(x) { return 'M' + (x - 9) + ' 62h18v30l-9 48l-9 -48z'; },
      function(x) { return 'M' + (x - 9) + ' 62h18v78h-18z'; },
      function(x) { return 'M' + (x - 9) + ' 62h18v78h-18z'; }
    ];
    var b = '<defs>' + xs.map(function(x, i) { return '<clipPath id="ct-bitclip-' + i + '"><path d="' + shapes[i](x) + '"/></clipPath>'; }).join('') + '</defs>';
    xs.forEach(function(x, i) {
      var down = i === 4, stripes = '';
      for (var y = 50; y < 160; y += 12) stripes += '<line class="f-helix" x1="' + (x - 10) + '" y1="' + (down ? y : y + 8) + '" x2="' + (x + 10) + '" y2="' + (down ? y + 8 : y) + '"/>';
      b += '<rect class="f-shank" x="' + (x - 7) + '" y="14" width="14" height="50" rx="2"/>' +
        '<path class="f-bit" d="' + shapes[i](x) + '"/>' +
        '<g clip-path="url(#ct-bitclip-' + i + ')"><g><animateTransform attributeName="transform" type="translate" values="0 0;0 ' + (down ? 12 : -12) + '" dur="' + D + 's" repeatCount="indefinite"/>' + stripes + '</g></g>' +
        ctText(x, 160, names[i], 'f-txt', 'middle') + (subs[i] ? ctText(x, 176, subs[i], 'f-acc-txt', 'middle') : '');
      if (i >= 3) {
        [[-1, 0], [1, .4], [-1, .8]].forEach(function(c) {
          var y0 = down ? 132 : 70, ty = down ? 22 : -34, tx = c[0] * 18;
          b += '<path class="f-chip" d="M' + (x - 3) + ' ' + y0 + 'q5 -6 10 -1q-5 3 -10 1z" opacity="0">' +
            '<animateTransform attributeName="transform" type="translate" values="0 0;' + tx + ' ' + ty + '" dur="1.2s" begin="' + c[1] + 's" repeatCount="indefinite"/>' +
            '<animate attributeName="opacity" values="1;0" dur="1.2s" begin="' + c[1] + 's" repeatCount="indefinite"/></path>';
        });
      }
    });
    return ctSvg(b, 360, 184, 'Flat, ball, V, upcut and downcut bits', 1);
  },

  chip: function() {
    var D = 6;
    function fly(shape, cls, to, dur, begin, turn) {
      return '<g opacity="0"><animateTransform attributeName="transform" type="translate" values="0 0;' + to + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="1;1;0" keyTimes="0;.6;1" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' +
        '<g' + (turn ? '><animateTransform attributeName="transform" type="rotate" values="0;' + turn + '" dur="' + dur + 's" begin="' + begin + 's" repeatCount="indefinite"/>' : '>') +
        shape.replace('/>', ' class="' + cls + '"/>') + '</g></g>';
    }
    var cases = [
      { head: 'feed too slow', cls: 'f-bad-txt', dist: 22, lines: ['dust, heat,', 'burn marks'],
        flying: [[14, -10], [22, 6], [9, -22], [28, -3], [17, 16], [6, -30], [25, -18], [12, 24], [30, 10]].map(function(t, k) {
          return fly('<circle cx="' + (k % 2 ? -9 : 9) + '" cy="-3" r="1.6"/>', 'f-dust', (k % 2 ? -t[0] : t[0]) + ' ' + t[1], 1.6, (k * .18).toFixed(2), 0);
        }).join(''),
        sample: function(cx) { return [[-14, 140], [-7, 136], [0, 142], [7, 137], [13, 141], [-3, 135], [18, 136]].map(function(d) { return '<circle class="f-dust" cx="' + (cx + d[0]) + '" cy="' + d[1] + '" r="1.4"/>'; }).join(''); },
        walls: function(cx, top) { return '<path class="f-burn" d="M' + (cx - 12) + ' 124V' + top + 'M' + (cx + 12) + ' 124V' + top + '"/>'; },
        extra: '<circle class="f-heat" r="18">' + '<animate attributeName="opacity" values=".45;1;.45" dur="1s" repeatCount="indefinite"/></circle>' },
      { head: 'just right', cls: 'f-acc-txt', dist: 46, lines: ['curled chips,', 'even sound'],
        flying: [[26, -4, 0], [-26, 2, .23], [24, 8, .46]].map(function(t) {
          return fly('<path d="M' + (t[0] > 0 ? 8 : -8) + ' -4q3 -5 7 -1q-3 3 -7 1z"/>', 'f-chip', t[0] + ' ' + t[1], .7, t[2], 220);
        }).join(''),
        sample: function(cx) { return '<path class="f-curl-edge" d="M' + (cx - 12) + ' 146a12 9 0 1 1 18 -4"/><path class="f-curl" d="M' + (cx - 12) + ' 146a12 9 0 1 1 18 -4"/>'; },
        walls: function() { return ''; }, extra: '' },
      { head: 'feed too fast', cls: 'f-bad-txt', dist: 72, lines: ['thick chunks,', 'chatter'],
        flying: [[30, -2, 0], [-30, 6, .45]].map(function(t) {
          return fly('<path d="M' + (t[0] > 0 ? 9 : -14) + ' -2l3 -8l9 1l1 8z"/>', 'f-chip', t[0] + ' ' + t[1], .9, t[2], 140);
        }).join(''),
        sample: function(cx) { return '<path class="f-chip" d="M' + (cx - 14) + ' 147l7 -15l19 2l2 13z"/><path class="f-crack" d="M' + (cx - 2) + ' 134l2 6l-3 4"/>'; },
        walls: function(cx, top) {
          var d = '';
          [-12, 12].forEach(function(o) { d += 'M' + (cx + o) + ' 124'; for (var y = 121, k = 0; y > top; y -= 3, k++) d += 'L' + (cx + o + (k % 2 ? 2.5 : -2.5) * (o < 0 ? -1 : 1)) + ' ' + y; });
          return '<path class="f-rough" d="' + d + '"/>';
        },
        extra: '<path class="f-shake" d="M17 -7q4 7 0 14M21 -9q5 9 0 18M-17 -7q-4 7 0 14M-21 -9q-5 9 0 18">' + '<animate attributeName="opacity" values="1;0;1" dur=".3s" repeatCount="indefinite"/></path>',
        shake: '<animateTransform attributeName="transform" type="translate" values="0 0;1.6 .4;-1.4 -.3;.8 .5;0 0" dur=".16s" repeatCount="indefinite"/>' }
    ];
    var body = '';
    cases.forEach(function(c, i) {
      var x0 = i * 120, cx = x0 + 60, y0 = 118, top = y0 - c.dist;
      var grow = function(attr, a, b) { return '<animate attributeName="' + attr + '" values="' + a + ';' + a + ';' + b + ';' + b + '" keyTimes="0;.05;.85;1" dur="' + D + 's" repeatCount="indefinite"/>'; };
      body += '<clipPath id="ct-chipclip-' + i + '"><rect x="' + (x0 + 8) + '" y="' + y0 + '" width="104" height="6">' + grow('y', y0, top) + grow('height', 6, 6 + c.dist) + '</rect></clipPath>' +
        ctText(cx, 20, c.head, c.cls, 'middle') +
        '<rect class="f-stock" x="' + (x0 + 8) + '" y="30" width="104" height="94"/>' +
        '<rect class="f-slot" x="' + (cx - 12) + '" y="' + y0 + '" width="24" height="6">' + grow('y', y0, top) + grow('height', 6, 6 + c.dist) + '</rect>' +
        '<g clip-path="url(#ct-chipclip-' + i + ')">' + c.walls(cx, top) + '</g>' +
        ctArrow(x0 + 100, 116, x0 + 100, 116 - 10 - c.dist / 2.2, 'f-acc') +
        '<g transform="translate(' + cx + ' ' + y0 + ')"><g>' + ctFade([1, 1, 0, 0, 1], [0, .86, .9, .96, 1], D) +
        '<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 ' + -c.dist + ';0 ' + -c.dist + '" keyTimes="0;.05;.85;1" dur="' + D + 's" repeatCount="indefinite"/>' +
        c.extra + '<g>' + (c.shake || '') + ctBitTop(0, 0, 12, .3) + '</g>' + c.flying + '</g></g>' +
        c.sample(cx) + ctText(cx, 172, c.lines[0], 'f-txt', 'middle') + ctText(cx, 186, c.lines[1], 'f-txt', 'middle');
    });
    return ctSvg(body + ctText(180, 208, 'same RPM, seen from above; the arrow is the feed', 'f-txt', 'middle'),
      360, 214, 'The same bit at three feed rates: too slow makes dust and heat, just right makes curled chips, too fast makes thick chunks and chatter', 3.6);
  },

  stepover: function() {
    var D = 10, d = 'M192 54';
    for (var y = 54, k = 0; y <= 131; y += 11, k++) d += (k ? 'V' + y : '') + 'H' + (k % 2 ? 192 : 288);
    var len = 8 * 96 + 7 * 11;
    function layer(y0, t0, t1, fromRight) {
      var y = y0 + 20;
      return '<rect class="f-cleared" x="' + (fromRight ? 140 : 20) + '" y="' + y + '" width="0" height="20">' +
        ctAnim('width', [0, 0, 120, 120, 0], [0, t0, t1, .94, 1], D) + (fromRight ? ctAnim('x', [140, 140, 20, 20, 140], [0, t0, t1, .94, 1], D) : '') + '</rect>';
    }
    return ctSvg(
      '<rect class="f-stock" x="20" y="80" width="120" height="90"/>' +
      layer(60, .05, .3, false) + layer(80, .35, .6, true) + layer(100, .65, .9, false) +
      '<g>' + ctFade([1, 1, 0, 0, 1], [0, .9, .93, .97, 1], D) +
      ctMove([[0, 0], [0, 20], [100, 20], [100, 40], [0, 40], [0, 60], [100, 60], [100, 60], [0, 0], [0, 0]], [0, .05, .3, .35, .6, .65, .9, .94, .96, 1], D) + ctSpindle(30, 80, 14) + '</g>' +
      '<path class="f-line" d="M146 80h6v20h-6"/>' + ctText(80, 190, 'depth per pass', 'f-txt', 'middle') +
      '<rect class="f-stock" x="180" y="40" width="120" height="108"/>' +
      '<path class="f-trail" d="' + d + '"' + ctDraw(len, .9, D) + '</path>' + '<path class="f-rowline" d="' + d + '"/>' +
      '<g><animateMotion path="' + d + '" dur="' + D + 's" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.9;1" calcMode="linear"/>' + ctBitTop(0, 0, 12, .45) + '</g>' +
      '<path class="f-line" d="M304 54h6v11h-6"/>' + ctText(240, 168, 'stepover:', 'f-txt', 'middle') + ctText(240, 184, 'about 45 % of the bit', 'f-txt', 'middle'), 320, 198, 'Depth per pass seen from the side, stepover from above', 8);
  },

  climb: function() {
    var D = 8, path = 'M98 58H222V142H98Z';
    return ctSvg(
      '<rect class="f-stock" x="110" y="70" width="100" height="60"/>' + ctText(160, 104, 'part', 'f-stock-txt', 'middle') +
      '<path class="f-path" d="' + path + '"/>' +
      ctHead(150, 58, 160, 58, 'f-acc') + ctHead(222, 96, 222, 106, 'f-acc') + ctHead(170, 142, 160, 142, 'f-acc') + ctHead(98, 104, 98, 94, 'f-acc') +
      '<g><animateMotion path="' + path + '" dur="' + D + 's" repeatCount="indefinite"/>' + ctBitTop(0, 0, 12, .4) + '</g>' +
      ctText(160, 30, 'outside, clockwise = climb', 'f-acc-txt', 'middle') +
      ctText(160, 176, 'outside, counterclockwise = conventional', 'f-txt', 'middle') + ctText(160, 194, 'spindle clockwise (M3), seen from above', 'f-txt', 'middle') + ctText(160, 212, 'inside a pocket it’s the reverse', 'f-txt', 'middle'),
      320, 220, 'Climb milling: clockwise around the outside of a part', 1);
  },

  clamps: function() {
    var D = 9, path = 'M106 70H214A6 6 0 0 1 220 76V124A6 6 0 0 1 214 130H106A6 6 0 0 1 100 124V76A6 6 0 0 1 106 70Z';
    var len = (2 * 108 + 2 * 48 + 4 * 9.42).toFixed(1);
    return ctSvg(
      '<rect class="f-spoil" x="10" y="16" width="300" height="164"/>' + '<rect class="f-stock" x="56" y="40" width="208" height="120"/>' +
      '<rect class="f-clamp" x="40" y="80" width="34" height="40" rx="3"/><rect class="f-clamp" x="246" y="80" width="34" height="40" rx="3"/>' +
      '<circle class="f-screw" cx="68" cy="52" r="4"/><circle class="f-screw" cx="252" cy="52" r="4"/><circle class="f-screw" cx="68" cy="148" r="4"/><circle class="f-screw" cx="252" cy="148" r="4"/>' +
      ctText(57, 136, 'clamp', 'f-stock-txt', 'middle') +
      '<path class="f-trail-thin" d="' + path + '"' + ctDraw(len, .9, D) + '</path>' +
      '<rect class="f-tab" x="155" y="66" width="10" height="8"/><rect class="f-tab" x="155" y="126" width="10" height="8"/>' + ctText(160, 90, 'tabs', 'f-stock-txt', 'middle') +
      '<g><animateMotion path="' + path + '" dur="' + D + 's" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.9;1" calcMode="linear"/>' + ctBitTop(0, 0, 6, .4) + '</g>' +
      ctText(160, 112, 'the part', 'f-stock-txt', 'middle') + ctText(160, 196, 'clamps and screws clear of the path; tabs hold the part', 'f-txt', 'middle'),
      320, 202, 'Clamps clear of the path, tabs on the part', 8.5);
  },
  collet: function() {
    var D = 12;
    function step(t0, t1, text) { return '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, t0, t0 + .03, t1, t1 + .03, 1], D) + ctText(206, 120, text[0], 'f-acc-txt') + ctText(206, 136, text[1], 'f-txt') + '</g>'; }
    var flutes = '';
    for (var y = 108; y < 126; y += 6) flutes += '<line class="f-flute" x1="154" y1="' + (y + 4) + '" x2="166" y2="' + y + '"/>';
    return ctSvg(
      '<rect class="f-motor" x="128" y="6" width="64" height="50" rx="5"/><rect class="f-motor-band" x="128" y="18" width="64" height="6"/>' +
      '<rect class="f-collet" x="142" y="56" width="36" height="14"/>' + ctText(124, 40, 'spindle', 'f-txt', 'end') +
      '<g>' + ctMove([[0, 56], [0, 56], [0, 56], [0, 0], [0, 0], [0, 56]], [0, .45, .5, .64, .92, 1], D) +
      '<g>' + ctMove([[0, -30], [0, -30], [0, 0], [0, 0], [0, -30]], [0, .04, .18, .92, 1], D) +
      '<path class="f-collet" d="M144 60h32l-4 36h-24z"/><path class="f-line" d="M152 62v30M160 62v32M168 62v30"/></g>' +
      '<rect class="f-nut" x="136" y="66" width="48" height="26" rx="3"/><path class="f-line" d="M148 66v26M172 66v26"/>' +
      '<g>' + ctMove([[0, 46], [0, 46], [0, 46], [0, 0], [0, 0], [0, 46]], [0, .2, .25, .4, .92, 1], D) +
      '<rect class="f-shank" x="154" y="72" width="12" height="36"/><path class="f-bit" d="M154 108h12v20l-6 4l-6 -4z"/>' + flutes + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .64, .67, .9, .93, 1], D) +
      '<path class="f-acc" d="M196 70a40 14 0 0 1 -12 24"/>' + ctHead(190, 88, 184, 94, 'f-acc') + '</g>' +
      '</g>' +
      step(.02, .2, ['1. Snap the collet', 'into the nut']) + step(.22, .42, ['2. The bit in:', 'flutes clear of it']) + step(.47, .9, ['3. Thread it on and', 'tighten firmly']),
      320, 240, 'The collet clicks into the nut, the bit goes in, and the nut is tightened on the spindle', 9);
  },

  probecircuit: function() {
    var D = 8;
    return ctSvg(
      '<rect class="f-stock" x="20" y="158" width="200" height="30"/>' +
      ctSpindle(110, 100, 20) +
      '<rect class="f-clip" x="114" y="84" width="10" height="7" rx="2"/>' +
      '<path class="f-wire" d="M124 87C170 80 200 70 236 62"/>' +
      '<rect class="f-box" x="236" y="40" width="70" height="46" rx="6"/>' + ctText(271, 32, 'controller', 'f-txt', 'middle') +
      '<circle class="f-led-off" cx="271" cy="63" r="9"/>' +
      '<circle class="f-led-on" cx="271" cy="63" r="9" opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .34, .36, .62, .64, 1], D) + '</circle>' +
      '<g>' + ctMove([[0, 0], [0, 0], [0, -50], [0, -50], [0, 0], [0, 0]], [0, .1, .35, .62, .82, 1], D) +
      '<rect class="f-plate" x="88" y="150" width="44" height="8" rx="1"/>' + '<path class="f-wire" d="M132 154C190 160 240 120 252 86"/></g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .34, .36, .62, .64, 1], D) + ctText(271, 128, 'touching:', 'f-acc-txt', 'middle') + ctText(271, 144, 'probe input on', 'f-acc-txt', 'middle') + '</g>' +
      ctText(160, 206, 'the clip and the plate make a switch', 'f-txt', 'middle'),
      320, 214, 'Touching the plate to the bit closes the circuit and lights the probe input', 3.8);
  },

  touchplate: function() {
    var D = 12;
    function step(t0, t1, text) { return '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, t0, t0 + .02, t1, t1 + .02, 1], D) + ctText(300, 30, text, 'f-acc-txt', 'end') + '</g>'; }
    return ctSvg(
      '<rect class="f-stock" x="60" y="44" width="220" height="126"/>' + ctText(270, 160, 'stock (seen from above)', 'f-stock-txt', 'end') +
      '<rect class="f-plate" x="44" y="126" width="60" height="60" rx="2"/><path class="f-plate-lip" d="M44 126h16v44h44v16h-60z"/>' +
      '<circle class="f-ring" cx="78" cy="152" r="8" opacity="0"><animate attributeName="r" values="18;8;8" keyTimes="0;.12;1" dur="' + D + 's" repeatCount="indefinite"/>' +
      ctFade([0, 1, 1, 0, 0], [0, .02, .12, .14, 1], D) + '</circle>' +
      '<g>' + ctMove([[0, 0], [0, 0], [-52, 4], [-42, 4], [-42, 4], [-52, 54], [-4, 54], [-4, 42], [-4, 42], [0, 0], [0, 0]], [0, .14, .24, .32, .38, .43, .48, .56, .9, .96, 1], D) + ctBitTop(78, 152, 8, .4) + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .6, .63, .9, .93, 1], D) + '<path class="f-zero" d="M44 170h32M60 154v32"/>' + ctText(300, 30, 'X0 Y0 Z0 on the stock’s corner', 'f-acc-txt', 'end') + '</g>' +
      step(.0, .13, 'Z: down onto the top') + step(.2, .36, 'X: against its side') + step(.42, .58, 'Y: against its front'),
      320, 214, 'Probing a touch plate on a corner: Z on the top, then X and Y on its sides', 7.5);
  },

  tls: function() {
    var D = 10;
    return ctSvg(
      '<rect class="f-spoil" x="10" y="170" width="300" height="20"/>' +
      '<rect class="f-tls" x="204" y="138" width="34" height="32" rx="3"/>' +
      '<rect class="f-plunger" x="213" y="130" width="16" height="8" rx="1">' + ctMove([[0, 0], [0, 0], [0, 3], [0, 3], [0, 0], [0, 0]], [0, .5, .53, .7, .73, 1], D) + '</rect>' +
      ctText(221, 206, 'tool length setter', 'f-txt', 'middle') +
      '<g>' + ctMove([[0, 0], [0, 0], [131, 0], [131, 30], [131, 30], [131, 0], [0, 0], [0, 0]], [0, .06, .28, .5, .7, .78, .94, 1], D) + ctSpindle(90, 100, 26) + '</g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .52, .55, .86, .9, 1], D) + ctText(16, 24, 'touched: its length is measured', 'f-acc-txt') + ctText(16, 40, 'and the tool offset set', 'f-acc-txt') + '</g>',
      320, 214, 'The bit comes down onto the tool length setter, which measures its length', 6);
  },

  atc: function() {
    var D = 12, slots = [70, 120, 170, 220];
    function hold(i, values, times) { return '<circle class="f-toolhold" cx="' + slots[i] + '" cy="40" r="9"' + (values ? ' opacity="' + values[0] + '">' + ctFade(values, times, D) + '</circle>' : '/>'); }
    function step(t0, t1, text) { return '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, t0, t0 + .02, t1, t1 + .02, 1], D) + ctText(160, 202, text, 'f-acc-txt', 'middle') + '</g>'; }
    return ctSvg(
      '<rect class="f-rack" x="40" y="24" width="210" height="10" rx="2"/>' + ctText(145, 16, 'magazine', 'f-txt', 'middle') +
      slots.map(function(x, i) { return '<path class="f-fork" d="M' + (x - 12) + ' 34v14M' + (x + 12) + ' 34v14"/>' + ctText(x, 66, String(i + 1), 'f-txt', 'middle'); }).join('') +
      hold(0) + hold(1, [0, 0, 1, 1, 0, 0], [0, .26, .27, .97, .98, 1]) + hold(2, [1, 1, 0, 0, 1, 1], [0, .45, .46, .97, .98, 1]) + hold(3) +
      '<rect class="f-tls" x="252" y="128" width="24" height="24" rx="3"/>' + ctText(264, 170, 'TLS', 'f-txt', 'middle') +
      '<g>' + ctMove([[0, 0], [0, 0], [-30, -100], [-30, -100], [20, -100], [20, -100], [114, 0], [114, 0], [0, 0], [0, 0]], [0, .05, .22, .3, .4, .48, .64, .88, .96, 1], D) +
      '<circle class="f-spindle-top" cx="150" cy="140" r="14"/>' +
      '<circle class="f-toolhold" cx="150" cy="140" r="9">' + ctFade([1, 1, 0, 0, 1, 1], [0, .26, .27, .45, .46, 1], D) + '</circle></g>' +
      step(.04, .25, 'the spindle takes T2 back to slot 2') + step(.27, .46, 'leaves it, and picks up T3') + step(.48, .9, 'then measures T3 on the TLS'),
      320, 212, 'An automatic tool changer swaps tools from its magazine, then measures the new one', 5.5);
  },

  probe3d: function() {
    var D = 10;
    return ctSvg(
      '<rect class="f-stock" x="40" y="20" width="240" height="160"/>' + '<circle class="f-hole" cx="160" cy="100" r="40"/>' + ctText(270, 172, 'a hole, seen from above', 'f-stock-txt', 'end') + '<circle class="f-ball" cx="54" cy="34" r="5"/>' + ctText(64, 38, 'the probe’s ball tip', 'f-stock-txt') +
      '<g>' + ctMove([[0, 0], [0, 0], [43.7, 0], [-23.7, 0], [10, 0], [10, -39], [10, 29], [10, -5], [10, -5], [0, 0], [0, 0]], [0, .05, .15, .3, .36, .46, .6, .7, .92, .97, 1], D) +
      '<circle class="f-ball" cx="150" cy="105" r="6"/></g>' +
      '<g opacity="0">' + ctFade([0, 0, 1, 1, 0, 0], [0, .7, .73, .92, .95, 1], D) + '<path class="f-zero" d="M144 100h32M160 84v32"/>' + ctText(160, 154, 'center found', 'f-acc-txt', 'middle') + '</g>' +
      ctText(160, 196, 'four touches; the center is halfway between', 'f-txt', 'middle'),
      320, 204, 'A 3D probe finds a hole’s center by touching its four sides', 8);
  }
};

function figure(name, facts) { return CT_FIGS[name] ? CT_FIGS[name](facts || {}) : ''; }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { figure: figure, CT_FIGS: CT_FIGS };
}
