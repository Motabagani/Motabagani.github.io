// Tiny path-based (History API) router helper — replaces the old hash routing so
// URLs are clean (/en, /ar/coding, …). Navigation dispatches a popstate event so
// every listener (App, LanguageProvider, Rafeeq) re-reads the path uniformly.

export function currentPath() {
  return window.location.pathname || '/';
}

/** SPA-navigate to an internal path (optionally replacing history). */
export function navigate(to, { replace = false } = {}) {
  const url = to || '/';
  if (replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
