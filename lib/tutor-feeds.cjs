// The feeds table in the Feeds and speeds lesson: the starting feeds
// (QuickCut's startingFeeds) for each cutting bit in ncSender's tool table,
// or common sizes, in one material, Conservative, Average and Aggressive
// side by side, with what shapes them in plain words.
var ctFeedsFn = typeof startingFeeds === 'function' ? startingFeeds : require('./starting-feeds.cjs').startingFeeds;

var CT_FEEDS_COMMON = [
  { name: '1/8" O-flute', mm: 3.175, flutes: 1 },
  { name: '1/8" end mill', mm: 3.175, flutes: 2 },
  { name: '1/8" compression', mm: 3.175, flutes: 2, compression: true, fluteMm: 12.7 },
  { name: '1/4" O-flute', mm: 6.35, flutes: 1 },
  { name: '1/4" end mill', mm: 6.35, flutes: 2 },
  { name: '1/4" compression', mm: 6.35, flutes: 2, compression: true, fluteMm: 25.4 },
  { name: '6 mm end mill', mm: 6, flutes: 2 },
  { name: '1/2" end mill', mm: 12.7, flutes: 2 }
];
var CT_FEED_STYLES = ['conservative', 'average', 'aggressive'];

// Flutes written in a bit's name: "O Flute", "2 flute", "single flute".
function ctFlutesFromText(text) {
  var t = String(text || '').toLowerCase();
  if (/\b(o|0|zero|single|one)[\s-]*flutes?\b/.test(t)) return 1;
  var m = /\b([1-4])[\s-]*(?:flutes?|fl)\b/.exec(t) || /\b([1-4])f\b/.exec(t);
  if (m) return +m[1];
  var w = /\b(two|double|three|four)[\s-]*flutes?\b/.exec(t);
  return w ? { two: 2, double: 2, three: 3, four: 4 }[w[1]] : null;
}

// ncSender's tool table entries that cut sideways: end mills, ball noses,
// compression bits (not V-bits, drills, surfacing bits or probes).
function ctFeedsBits(tools) {
  return (tools || []).filter(function(t) { return t && t.diameter > 0 && (!t.type || /^(flat|ball|compression)$/.test(t.type)); })
    .map(function(t) {
      var meta = t.metadata || {}, fromTable = meta.flutes > 0, named = ctFlutesFromText(t.name + ' ' + (meta.notes || ''));
      return { name: (t.toolNumber > 0 ? 'T' + t.toolNumber + ' ' : '') + (t.name || 'Bit'), mm: t.diameter,
               flutes: fromTable ? Math.min(4, Math.round(meta.flutes)) : named || 2, flutesFrom: fromTable ? '' : named ? 'name' : 'guess',
               compression: t.type === 'compression' || /\bcompression\b/i.test(t.name || ''), fluteMm: (t.dimensions && t.dimensions.flute_length) || 0 };
    });
}

// One row per bit: its RPM, each style's feed, plunge, depth of each pass,
// passes for the Total Depth and chip, and notes; odd marks a row to look at.
function ctFeedsRows(bits, material, depthMm, limits) {
  return bits.map(function(b) {
    var deep = { depthMm: depthMm, compression: !!b.compression, fluteMm: b.fluteMm || 0 }, notes = [], odd = false, rpm = 0;
    var styles = {};
    CT_FEED_STYLES.forEach(function(style) {
      var f = ctFeedsFn(b.mm, b.flutes, material, limits, style, deep);
      rpm = f.rpm;
      styles[style] = { feedMm: f.feedMm, plungeMm: f.plungeMm, stepMm: f.stepMm, chipMm: f.chipMm,
                        passes: depthMm > 0 ? Math.max(1, Math.ceil(depthMm / f.stepMm - 1e-9)) : 0 };
      if (style !== 'average') return;
      if (f.passes) notes.push({ text: 'compression bit: ' + (f.passes === 1 ? 'the whole depth in one pass' : f.passes + ' equal passes') });
      if (f.deepChip < 1) notes.push({ text: 'deep pass: a ' + Math.round(f.deepChip * 100) + '% chip, so the bit bends less' });
      if (f.capped) { notes.push({ text: 'feed held at the starting limit', flag: true }); odd = true; }
      if (material !== 'aluminum' && f.chipMm < 0.025) { notes.push({ text: 'thin chip: it may rub; try a higher feed or lower RPM', flag: true }); odd = true; }
    });
    if (b.flutesFrom === 'name') notes.push({ text: 'flutes read from its name' });
    if (b.flutesFrom === 'guess') { notes.push({ text: 'flutes not in the tool table: 2 assumed', flag: true }); odd = true; }
    if (b.fluteMm > 0 && !b.compression && depthMm > b.fluteMm + Math.max(1, b.fluteMm / 10)) { notes.push({ text: 'Total Depth is past its flutes', flag: true }); odd = true; }
    return { name: b.name, mm: b.mm, flutes: b.flutes, rpm: rpm, styles: styles, notes: notes, odd: odd };
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CT_FEEDS_COMMON: CT_FEEDS_COMMON, CT_FEED_STYLES: CT_FEED_STYLES, ctFlutesFromText: ctFlutesFromText, ctFeedsBits: ctFeedsBits, ctFeedsRows: ctFeedsRows };
}
