import { store } from "./db.js";

/* ============================================================================
   USER ATTACHMENTS

   Upload fields used to keep only the filename, which made the Files page a
   list of things you couldn't open. These keep the file itself: IndexedDB
   stores a File/Blob natively, so this is the real bytes, not a copy of a name.

   Phase data stores the small descriptor { name, key, type, size } — never the
   blob — so the phase records stay light and serialisable. The blob lives under
   its own key and is fetched only when someone asks to see it.

   The uid is set once by the context rather than threaded through every phase,
   because the upload handlers sit four levels deep inside step render functions
   and passing it down would touch a dozen signatures for no benefit.
   ========================================================================== */

let currentUid = "demo";
export const setAttachmentScope = (uid) => { currentUid = uid || "demo"; };

const attKey = (key) => `app:${currentUid}:file:${key}`;

/* Store an uploaded File and return the descriptor to put in phase data. */
export async function putAttachment(file) {
  const key = `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await store.set(attKey(key), {
    ref: key,
    blob: file,
    filename: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
  });
  return { name: file.name, key, type: file.type, size: file.size };
}

export function getAttachment(key) { return store.get(attKey(key)); }

/* Upload fields once held a bare string. Read through both shapes so older
   sessions — and any phase not yet migrated — keep rendering. */
export const fileName = (v) => (!v ? "" : typeof v === "string" ? v : v.name || "");
export const fileKey = (v) => (v && typeof v === "object" ? v.key : null);
