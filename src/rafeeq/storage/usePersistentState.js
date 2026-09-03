import { useState, useEffect, useRef, useCallback } from "react";
import { makeRepo } from "./repo.js";

/* ============================================================================
   usePersistentState — hydrates the application from storage on mount and
   writes changes back, debounced. The rest of the app treats the returned
   state exactly like useState; persistence is invisible.

   Because the repository is async, this hook is the single place that knows
   storage is asynchronous. Swapping IndexedDB for a server changes nothing
   here — makeRepo returns the same promises either way.
   ========================================================================== */
const EMPTY = {
  statuses: { p1: "in_progress", pa: "locked", p2: "locked", p3: "locked" },
  refs: {},
  screen: "home",
  data: { p1: {}, pa: {}, p2: {}, p3: {} },
  docs: [],
};

export function usePersistentState(uid) {
  const repo = useRef(null);
  if (!repo.current || repo.current._uid !== uid) {
    repo.current = Object.assign(makeRepo(uid), { _uid: uid });
  }

  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef(null);
  const lastSaved = useRef("");

  /* hydrate */
  useEffect(() => {
    let alive = true;
    setReady(false);
    (async () => {
      try {
        const loaded = await repo.current.load();
        if (alive) setState(loaded ? { ...EMPTY, ...loaded } : EMPTY);
      } catch {
        if (alive) setState(EMPTY);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, [uid]);

  /* persist, debounced — meta + each phase + each doc as separate records */
  useEffect(() => {
    if (!ready) return;
    const snap = JSON.stringify(state);
    if (snap === lastSaved.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      lastSaved.current = snap;
      const r = repo.current;
      await r.saveMeta({ statuses: state.statuses, refs: state.refs, screen: state.screen });
      await Promise.all(Object.entries(state.data).map(([pid, d]) => r.savePhase(pid, d)));
      await Promise.all((state.docs || []).map(doc => r.issueDocument(doc)));
    }, 350);
    return () => clearTimeout(saveTimer.current);
  }, [state, ready]);

  const reset = useCallback(async () => {
    await repo.current.clear();
    lastSaved.current = "";
    setState(EMPTY);
  }, []);

  return { state, setState, ready, reset, repo: repo.current };
}
