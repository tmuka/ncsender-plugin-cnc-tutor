// Students on a shared machine, one at a time. Each student's progress is
// kept in the plugin's settings under students[id]; `current` is the student
// at the machine (the machine's, not the screen's), or null. A guest's
// progress is never saved. Only a display name and a color are kept.

var CT_COLORS = ['teal', 'blue', 'purple', 'pink', 'orange', 'gold', 'green', 'gray'];
var CT_STILL_YOU_MS = 2 * 60 * 60 * 1000;

function ctEmptyProgress() { return { done: {}, ticks: {}, answers: {}, firstAnswers: {}, feeds: {} }; }
function ctHasProgress(o) {
  return ['done', 'ticks', 'answers', 'feeds'].some(function(k) { return o[k] && typeof o[k] === 'object' && Object.keys(o[k]).length > 0; });
}

// 0.1 kept one person's progress at the top level. Move it into a first
// student; returns the patches ([keys, value]) that make the change stick.
function migrateSettings(cfg, nowIso) {
  var patches = [];
  if (!cfg.students || typeof cfg.students !== 'object') {
    cfg.students = {};
    if (ctHasProgress(cfg)) {
      var s = ctEmptyProgress();
      ['done', 'ticks', 'answers', 'feeds'].forEach(function(k) { if (cfg[k] && typeof cfg[k] === 'object') s[k] = cfg[k]; });
      s.name = 'Student 1'; s.color = CT_COLORS[0]; s.created = nowIso; s.lastActive = nowIso;
      cfg.students.s1 = s;
      cfg.current = 's1';
      patches.push([['current'], 's1']);
    }
    patches.push([['students'], cfg.students]);
  }
  ['done', 'ticks', 'answers', 'feeds', 'quiz', 'page'].forEach(function(k) {
    if (k in cfg) { delete cfg[k]; patches.push([[k], undefined]); }
  });
  Object.keys(cfg.students).forEach(function(id) {
    var s = cfg.students[id];
    if (!s || typeof s !== 'object') { delete cfg.students[id]; return; }
    ['done', 'ticks', 'answers', 'firstAnswers', 'feeds'].forEach(function(k) { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  });
  if (cfg.current && !cfg.students[cfg.current]) cfg.current = null;
  return patches;
}

function studentIds(cfg) {
  return Object.keys(cfg.students || {}).sort(function(a, b) { return String(cfg.students[a].name).localeCompare(String(cfg.students[b].name)); });
}
function newStudentId(cfg) {
  var n = 1;
  while (cfg.students['s' + n]) n++;
  return 's' + n;
}
// A name as typed, tidied: trimmed, spaces collapsed, at most 30 characters.
function cleanName(name) { return String(name || '').replace(/\s+/g, ' ').trim().slice(0, 30); }
function nameTaken(cfg, name, exceptId) {
  var n = cleanName(name).toLowerCase();
  return Object.keys(cfg.students).some(function(id) { return id !== exceptId && String(cfg.students[id].name).toLowerCase() === n; });
}
function nextColor(cfg) {
  var used = Object.keys(cfg.students).map(function(id) { return cfg.students[id].color; });
  for (var i = 0; i < CT_COLORS.length; i++) if (used.indexOf(CT_COLORS[i]) < 0) return CT_COLORS[i];
  return CT_COLORS[Object.keys(cfg.students).length % CT_COLORS.length];
}

// When the tutor opens: ask "Still you?" after a long gap since the
// current student was last active.
function openingView(cfg, nowMs, gapMs) {
  var id = cfg.current, s = id && cfg.students[id];
  if (!s) return { page: 'students' };
  var last = Date.parse(s.lastActive || '');
  if (isFinite(last) && nowMs - last > (gapMs || CT_STILL_YOU_MS)) return { page: 'students', ask: id };
  return { page: 'lessons', student: id };
}

// Class progress: per student, lessons done per level, Try it steps seen and
// the first-try quiz score.
function classProgress(cfg, lessons, levels) {
  return studentIds(cfg).map(function(id) {
    var s = cfg.students[id], perLevel = {}, right = 0, asked = 0, tries = 0, tryable = 0;
    levels.forEach(function(lv) {
      var ls = lessons.filter(function(l) { return l.level === lv.id; });
      perLevel[lv.id] = { done: ls.filter(function(l) { return s.done[l.id]; }).length, of: ls.length };
    });
    lessons.forEach(function(l) {
      if (l.tryIt) { tryable++; if (s.done[l.id + ':try']) tries++; }
      (l.quiz || []).forEach(function(q, qi) {
        var a = (s.firstAnswers[l.id] || {})[qi];
        if (a == null) return;
        asked++;
        if (a === q.right) right++;
      });
    });
    var done = lessons.filter(function(l) { return s.done[l.id]; }).length;
    return { id: id, name: s.name, color: s.color, done: done, of: lessons.length, perLevel: perLevel, tries: tries, tryable: tryable,
      quizRight: right, quizAsked: asked, lastActive: s.lastActive || null, lastLesson: s.lastLesson || null };
  });
}

// "3 hours ago", "yesterday", "12 Oct": when a student was last active.
function agoText(iso, nowMs) {
  var t = Date.parse(iso || '');
  if (!isFinite(t)) return 'never';
  var m = Math.round((nowMs - t) / 60000);
  if (m < 2) return 'just now';
  if (m < 60) return m + ' minutes ago';
  var h = Math.round(m / 60);
  if (h < 24) return h === 1 ? 'an hour ago' : h + ' hours ago';
  var d = Math.round(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 14) return d + ' days ago';
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CT_COLORS: CT_COLORS, CT_STILL_YOU_MS: CT_STILL_YOU_MS, ctEmptyProgress: ctEmptyProgress, migrateSettings: migrateSettings,
    studentIds: studentIds, newStudentId: newStudentId, cleanName: cleanName, nameTaken: nameTaken, nextColor: nextColor,
    openingView: openingView, classProgress: classProgress, agoText: agoText };
}
