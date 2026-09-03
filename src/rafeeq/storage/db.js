/* ============================================================================
   STORAGE LAYER — one async API, two interchangeable back ends.

   Everything the app persists goes through `store` below. Today it writes to
   IndexedDB in the browser; nothing else in the codebase knows or cares. To
   move to a server later, implement the same four methods against fetch() in
   a new file and swap the export at the bottom — no screen or phase changes.

   Records are content-addressed: every write is stamped with a SHA-256 hash of
   its payload (`_hash`) plus `_updatedAt`. That gives cheap change-detection,
   optimistic-concurrency checks, and a natural primary key when this becomes a
   real database — the same row shape a backend would store.
   ========================================================================== */

const DB_NAME = "rafeeq";
const DB_VERSION = 1;
const STORE = "records";

/* ---- content hash (SHA-256, hex) ---- */
export async function hashPayload(value) {
  const json = JSON.stringify(value);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const bytes = new TextEncoder().encode(json);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Non-crypto fallback (older environments / SSR): FNV-1a, still stable.
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) { h ^= json.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/* ---- IndexedDB plumbing ---- */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("no-indexeddb")); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "key" });
        os.createIndex("updatedAt", "_updatedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const os = t.objectStore(STORE);
    const out = fn(os);
    t.oncomplete = () => resolve(out.result !== undefined ? out.result : out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

/* ---- in-memory fallback when IndexedDB is unavailable ---- */
const mem = new Map();
let idbFailed = false;

async function withDB(mode, fn, memFn) {
  if (idbFailed) { const r = memFn(mem); return r && "result" in r ? r.result : r; }
  try { const db = await openDB(); return await tx(db, mode, fn); }
  catch { idbFailed = true; const r = memFn(mem); return r && "result" in r ? r.result : r; }
}

/* ============================================================================
   PUBLIC API — the surface a backend must reimplement.
   ========================================================================== */
export const store = {
  /* Read one record by key → the stored value (payload only), or null. */
  async get(key) {
    const rec = await withDB("readonly", os => os.get(key), m => ({ result: m.get(key) || null }));
    return rec ? rec.value : null;
  },

  /* Write one record. Returns the envelope { key, value, _hash, _updatedAt }. */
  async set(key, value) {
    const _hash = await hashPayload(value);
    const rec = { key, value, _hash, _updatedAt: new Date().toISOString() };
    await withDB("readwrite", os => os.put(rec), m => { m.set(key, rec); return { result: rec }; });
    return rec;
  },

  /* Delete one record. */
  async remove(key) {
    await withDB("readwrite", os => os.delete(key), m => { m.delete(key); return { result: true }; });
    return true;
  },

  /* List records whose key starts with `prefix` (default: all). */
  async list(prefix = "") {
    const all = await withDB("readonly",
      os => os.getAll(),
      m => ({ result: [...m.values()] }));
    return (all || []).filter(r => r.key.startsWith(prefix));
  },
};
