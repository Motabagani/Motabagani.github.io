/* Context-aware breadcrumbs. Some pages are reachable from more than one section
   (e.g. the SSA-UCSD case study from Graphic Design or About Me; the CMU project
   from Coding or About Me). Links to those pages carry a ?from=<section> marker,
   and the page uses `crumbFrom` to show the matching parent in the breadcrumb. */

// The known parent sections, with bilingual labels and their route.
const SECTIONS = {
  coding: { path: 'coding', en: 'Coding', ar: 'البرمجة' },
  'graphic-design': { path: 'graphic-design', en: 'Graphic Design', ar: 'التصميم الجرافيكي' },
  about: { path: 'about', en: 'About Me', ar: 'عني' },
};

// Read ?from=... out of the current query string (e.g. '/en/projects/x?from=coding').
export function getFrom() {
  const v = new URLSearchParams(window.location.search).get('from');
  return v || null;
}

// Resolve the breadcrumb parent: the ?from section if valid, else a fallback key.
export function crumbFrom(fallbackKey) {
  const key = getFrom();
  return SECTIONS[key] || SECTIONS[fallbackKey] || null;
}
