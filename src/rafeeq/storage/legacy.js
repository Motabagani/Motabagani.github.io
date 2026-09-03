/* Auth/session bits carried over from the single-file build: a tiny sync
   localStorage wrapper plus the userStore that talks to the NYU CGI endpoint.
   The applicant DATA now lives in storage/db.js; this only handles the signed-in
   user object and language/theme prefs. */
/* ============ 3 · Storage adapter ============
   Small preference store (theme, language) backed by localStorage so a choice
   survives a refresh, with an in-memory fallback for private mode / SSR where
   localStorage throws. Keys are namespaced so they can't collide with anything
   else on the origin. */
export function makeStorage() {
  const mem = {};
  const memStore = {
    get: (k, fb) => (k in mem ? mem[k] : fb),
    set: (k, v) => { mem[k] = v; },
    clear: () => { for (const k of Object.keys(mem)) delete mem[k]; },
  };
  let ls = null;
  try {
    ls = window.localStorage;
    const probe = "__rafeeq_probe__";
    ls.setItem(probe, "1"); ls.removeItem(probe);
  } catch { return memStore; }

  const PFX = "rafeeq.pref.";
  return {
    get: (k, fb) => {
      try { const v = ls.getItem(PFX + k); return v === null ? fb : JSON.parse(v); }
      catch { return fb; }
    },
    set: (k, v) => { try { ls.setItem(PFX + k, JSON.stringify(v)); } catch { mem[k] = v; } },
    clear: () => {
      try {
        for (let i = ls.length - 1; i >= 0; i--) {
          const key = ls.key(i);
          if (key && key.startsWith(PFX)) ls.removeItem(key);
        }
      } catch { /* ignore */ }
    },
  };
}
export const storage = makeStorage();

/* ---------- user accounts: localStorage (instant, per-device) + CIMS CGI (durable) ---------- */
const RAFEEQ_ENDPOINT = "https://cims.nyu.edu/~hm2983/cgi-bin"; // register.cgi / login.cgi
const LS_KEY = "rafeeq:user";
const NET_TIMEOUT_MS = 6000;

/* fetch that gives up rather than hanging the interface forever. */
async function postJSON(url, body) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), NET_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
  } finally { clearTimeout(timer); }
}
/* Demo accounts are throwaway: they live in sessionStorage, so the whole
   experience is wiped the moment the tab closes. endSession() clears it early. */
const SS = (() => { try { return window.sessionStorage; } catch { return null; } })();
export const userStore = {
  loadLocal() { try { const r = SS && SS.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; } },
  saveLocal(u) { try { const { pin, ...safe } = u; SS && SS.setItem(LS_KEY, JSON.stringify(safe)); } catch {} },
  clear() { try { SS && SS.removeItem(LS_KEY); } catch {} },
  endSession() { this.clear(); try { SS && SS.removeItem("rafeeq:setup"); } catch {} },
  async register(u) {
    /* Saved locally first, so the account exists whether or not the remote
       call lands. The fetch is best-effort and time-boxed: from localhost this
       is a cross-origin request that can stall, and a hung promise here would
       freeze registration with no visible reason. */
    this.saveLocal(u);
    try { await postJSON(`${RAFEEQ_ENDPOINT}/register.cgi`, u); }
    catch { /* offline or blocked: the local copy still stands */ }
    const { pin, ...safe } = u; return safe;
  },
  async login(national_id, pin) {
    try {
      const r = await postJSON(`${RAFEEQ_ENDPOINT}/login.cgi`, { national_id, pin });
      const d = await r.json();
      if (d && d.ok && d.user) { this.saveLocal(d.user); return d.user; }
    } catch { /* fall through to local */ }
    const local = this.loadLocal();
    if (local && String(local.national_id) === String(national_id)) return local;
    return null;
  },
};

/* Fields Safeer2 never asks the student to type — inquiried from external gov sources.
   We have no integrations, so these render read-only with a "not connected" badge. */
