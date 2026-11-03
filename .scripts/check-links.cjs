// Checks every docs link in lib/tutor-lessons.cjs: the page loads and has the anchor.
// Network; not part of npm test. Usage: node .scripts/check-links.cjs
const { CT_DOCS, CT_DOCS_BASE } = require('../lib/tutor-lessons.cjs');
(async () => {
  const pages = {};
  let bad = 0;
  for (const [key, d] of Object.entries(CT_DOCS)) {
    const [page, anchor] = d.path.split('#');
    if (!(page in pages)) { const r = await fetch(CT_DOCS_BASE + page); pages[page] = r.ok ? await r.text() : null; }
    const html = pages[page];
    const ok = html != null && (!anchor || html.includes('id="' + anchor + '"'));
    if (!ok) { bad++; console.log('BROKEN', key, CT_DOCS_BASE + d.path); }
  }
  console.log(bad ? bad + ' broken' : 'all ' + Object.keys(CT_DOCS).length + ' links resolve');
  process.exit(bad ? 1 : 0);
})();
