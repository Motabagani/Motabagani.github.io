/* ============================================================================
   REPOSITORY — the app's data model expressed as intent, not storage calls.

   Screens call these methods (loadApplication, savePhase, issueDocument…). The
   repository turns them into keyed reads/writes on `store`. This is the layer a
   backend replaces: same method names, same return shapes, fetch() inside.

   Key scheme (per applicant, so it's already multi-tenant):
     app:<uid>:meta         → { statuses, refs, screen }
     app:<uid>:phase:<pid>  → the phase's form data
     app:<uid>:doc:<ref>    → one issued document
   ========================================================================== */
import { store } from "./db.js";

const K = {
  meta: uid => `app:${uid}:meta`,
  phase: (uid, pid) => `app:${uid}:phase:${pid}`,
  doc: (uid, ref) => `app:${uid}:doc:${ref}`,
  file: (uid, ref) => `app:${uid}:file:${ref}`,
  docPrefix: uid => `app:${uid}:doc:`,
  phasePrefix: uid => `app:${uid}:phase:`,
};

export function makeRepo(uid) {
  return {
    /* Pull the whole application state in one call, the way a REST endpoint
       would return it. Returns null on a fresh account. */
    async load() {
      const meta = await store.get(K.meta(uid));
      if (!meta) return null;
      const phaseRecs = await store.list(K.phasePrefix(uid));
      const docRecs = await store.list(K.docPrefix(uid));
      const data = {};
      for (const r of phaseRecs) {
        const pid = r.key.slice(K.phasePrefix(uid).length);
        data[pid] = r.value;
      }
      return {
        statuses: meta.statuses || {},
        refs: meta.refs || {},
        screen: meta.screen || "home",
        data,
        docs: docRecs.map(r => r.value),
      };
    },

    saveMeta(meta) { return store.set(K.meta(uid), meta); },
    savePhase(pid, phaseData) { return store.set(K.phase(uid, pid), phaseData); },

    /* Documents are keyed by their reference, so re-issuing is idempotent. */
    issueDocument(doc) { return store.set(K.doc(uid, doc.ref), doc); },

    /* The rendered PDF is stored as a Blob keyed by the document's reference.
       IndexedDB holds Blobs natively — no base64, no size penalty — so this is
       the same shape a server would store, and reading it back gives the exact
       bytes that were issued rather than a re-render. */
    saveFile(ref, blob, meta) {
      return store.set(K.file(uid, ref), { ref, blob, ...(meta || {}) });
    },
    getFile(ref) { return store.get(K.file(uid, ref)); },

    async listDocuments() {
      const recs = await store.list(K.docPrefix(uid));
      return recs.map(r => r.value);
    },

    /* Wipe one applicant (the "reset" action). */
    async clear() {
      const recs = await store.list(`app:${uid}:`);
      await Promise.all(recs.map(r => store.remove(r.key)));
    },
  };
}
