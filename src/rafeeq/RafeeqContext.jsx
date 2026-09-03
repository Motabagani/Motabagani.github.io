// Rafeeq state context — gives every page access to the application state
// without prop drilling. Same shape as the portfolio's LanguageContext:
// wrap once in App, then call useRafeeq() from any page.

import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { makeT } from './i18n/useT.js';
import { isoOf } from './lib/dates.js';
import { makeRef } from './lib/refs.js';
import { PHASES } from './phases/registry.js';
import { DOC_TYPES } from './data/documents.js';
import { DEMO_USER } from './data/user.js';
import { TERM_ORDINALS, semYearOf } from './data/semester.js';
import { priorLevels } from './data/academic.js';
import { storage, userStore } from './storage/legacy.js';
import { issueSession, readSession, touchSession, clearSession } from './storage/session.js';
import { setAttachmentScope, getAttachment, fileName, fileKey } from './storage/attachments.js';
import { usePersistentState } from './storage/usePersistentState.js';
import { buildDocumentPdf, pdfFilename } from './lib/pdf.js';

const RafeeqContext = createContext();

// Language lives in the URL, exactly like the portfolio: #/en/rafeeq/...
// so arriving from the English site lands in English, and vice versa.
function getLangFromHash() {
  return window.location.hash.startsWith('#/ar') ? 'ar' : 'en';
}

export function RafeeqProvider({ children }) {
  const [lang, setLangState] = useState(getLangFromHash);

  // Follow the hash — covers the portfolio's switcher, back/forward, and
  // anyone pasting a link straight into the address bar.
  useEffect(() => {
    const onHashChange = () => setLangState(getLangFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Mirror the portfolio: set direction on <html> so global RTL rules apply.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Switching inside Rafeeq rewrites the hash and keeps the current page,
  // so the portfolio and the simulator can never disagree about language.
  const setLang = (newLang) => {
    const sub = window.location.hash.replace(/^#\/(en|ar)\/rafeeq/, '');
    window.location.hash = `#/${newLang}/rafeeq${sub}`;
  };
  const [theme, setThemeState] = useState(() => storage.get('theme', 'dark'));
  const setTheme = (th) => { setThemeState(th); storage.set('theme', th); };
  const t = useMemo(() => makeT(lang), [lang]);

  /* A live token means the page was refreshed, not freshly opened — pick the
     session back up rather than bouncing the user to sign-in. */
  const restored = readSession();
  const [signedIn, setSignedIn] = useState(!!restored);
  const [user, setUser] = useState((restored && restored.user) || DEMO_USER);
  const [toastMsg, setToastMsg] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [openDoc, setOpenDoc] = useState(null);
  const [busy, setBusy] = useState(null);   // { label } while a task runs

  /* Any action that makes the student wait goes through here, so waiting looks
     the same everywhere: the mark draws itself over the page.

     The overlay is only worth showing for a genuine wait. So it is never shown
     up front for quick work — it appears only once we've actually been waiting
     REVEAL_MS (~1s), or immediately when a caller anticipates work that long via
     `anticipatedMs`. Anything that finishes sooner runs with no overlay at all,
     which is why opening a stored file (fast, local) stays silent while a
     submission or an approval (simulated server work) shows the mark. Once the
     overlay does appear, MIN_VISIBLE_MS keeps it on screen long enough to read
     rather than flashing. */
  const BUSY_REVEAL_MS = 1000;
  const BUSY_MIN_VISIBLE_MS = 450;
  const runTask = async (label, fn, anticipatedMs = 0) => {
    const willShow = anticipatedMs >= BUSY_REVEAL_MS;
    let shownAt = 0;
    const reveal = () => { if (!shownAt) { shownAt = Date.now(); setBusy({ label }); } };
    if (willShow) reveal();
    /* Unanticipated work only reveals if it's still running at the threshold. */
    const timer = willShow ? null : setTimeout(reveal, BUSY_REVEAL_MS);
    const started = Date.now();
    try { return await fn(); }
    finally {
      if (timer) clearTimeout(timer);
      /* Hold out the anticipated (simulated) duration only for work we meant to
         show — quick paths must not be padded into a visible wait. */
      if (willShow) {
        const holdLeft = anticipatedMs - (Date.now() - started);
        if (holdLeft > 0) await new Promise((r) => setTimeout(r, holdLeft));
      }
      if (shownAt) {
        const visLeft = BUSY_MIN_VISIBLE_MS - (Date.now() - shownAt);
        if (visLeft > 0) await new Promise((r) => setTimeout(r, visLeft));
      }
      setBusy(null);
    }
  };
  const objectUrls = useRef([]);

  const toast = useCallback((m) => {
    setToastMsg(m);
    setTimeout(() => setToastMsg(''), 2600);
  }, []);

  const celebrate = () => { setConfetti(true); setTimeout(() => setConfetti(false), 3600); };

  // All persisted application state, keyed on the signed-in applicant.
  const uid = (user && user.national_id) || 'demo';
  useEffect(() => { setAttachmentScope(uid); }, [uid]);
  const { state, setState, ready, reset: resetStore, repo } = usePersistentState(uid);
  const { statuses, refs, data, docs } = state;

  const setStatuses = (v) => setState((s) => ({ ...s, statuses: typeof v === 'function' ? v(s.statuses) : v }));
  const setRefs = (v) => setState((s) => ({ ...s, refs: typeof v === 'function' ? v(s.refs) : v }));
  const setData = (v) => setState((s) => ({ ...s, data: typeof v === 'function' ? v(s.data) : v }));
  const setDocs = (v) => setState((s) => ({ ...s, docs: typeof v === 'function' ? v(s.docs) : v }));

  const setPhaseData = (pid) => (next) =>
    setData((d) => ({ ...d, [pid]: typeof next === 'function' ? next(d[pid]) : next }));

  const todayIso = () => { const n = new Date(); return isoOf(n.getFullYear(), n.getMonth(), n.getDate()); };

  // A request-backed document is identified by its reference; automatic ones
  // (award, admission guarantee) carry none, so those dedupe on kind.
  const issueDoc = (kind, extra) => setDocs((ds) => {
    const ref = (extra || {}).ref;
    const dup = ref ? ds.some((d) => d.ref === ref) : ds.some((d) => d.kind === kind);
    if (dup) return ds;
    const doc = { kind, ref: makeRef(DOC_TYPES[kind].code), date: todayIso(), ...(extra || {}) };
    /* Render the PDF once, now, and file it. Everything afterwards reads these
       exact bytes, so the document a student downloads in month six is the one
       that was issued in month one. */
    try {
      const blob = buildDocumentPdf(doc, user);
      repo.saveFile(doc.ref, blob, { filename: pdfFilename(doc), type: 'application/pdf' });
    } catch (e) {
      console.error('PDF generation failed for', doc.ref, e);
    }
    return [...ds, doc];
  });

  /* Hand back a temporary URL for the stored PDF. The caller opens it in a new
     tab, which is the browser's own PDF viewer — complete with a download
     button — so this behaves like clicking a file in an LMS. */
  /* Open a file the student uploaded. Same mechanics as an issued document —
     read the stored blob, hand the browser a temporary URL. */
  const openAttachment = (key, mode = 'view') => runTask(t('busy.doc'), async () => {
    if (!key) return false;
    const rec = await getAttachment(key);
    if (!rec || !rec.blob) return false;
    const url = URL.createObjectURL(rec.blob);
    objectUrls.current.push(url);
    if (mode === 'download') {
      const a = document.createElement('a');
      a.href = url; a.download = rec.filename || 'attachment';
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      window.open(url, '_blank', 'noopener');
    }
    return true;
  }, 700);

  const openDocumentFile = (doc, mode = 'view') => runTask(t('busy.doc'), async () => {
    const rec = await repo.getFile(doc.ref);
    if (!rec || !rec.blob) return false;
    const url = URL.createObjectURL(rec.blob);
    objectUrls.current.push(url);
    if (mode === 'download') {
      const a = document.createElement('a');
      a.href = url; a.download = rec.filename || doc.name || `${doc.ref}`;
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      window.open(url, '_blank', 'noopener');
    }
    return true;
  }, 700);

  const semLabelOf = (d) => (d && d.semStart)
    ? semYearOf(d) + ' · ' + (TERM_ORDINALS.find((x) => x.k === (d.semTerm || '1')) || {})[lang]
    : '';

  const submitPhase = (pid) => runTask(t('busy.submit'), async () => {
    const ph = PHASES.find((x) => x.id === pid);
    setRefs((r) => (r[pid] ? r : { ...r, [pid]: makeRef(ph.code) }));
    setStatuses((s) => ({ ...s, [pid]: 'submitted' }));
  }, 1000);

  const approvePhase = (pid) => runTask(t('busy.review'), async () => {
    if (pid === 'p1') { issueDoc('award'); issueDoc('fgAdmission'); }
    if (pid === 'pa' && data.pa.fgRequested) {
      issueDoc('fgAcademic', { term: semLabelOf(data.pa), ref: data.pa.fgRef });
    }
    if (pid === 'p3' && data.p3.fgRequested) {
      issueDoc('fgAcademic', { term: semLabelOf(data.p3), ref: data.p3.fgRef });
    }
    const order = ['p1', 'pa', 'p2', 'p3'];
    const i = order.indexOf(pid);
    setStatuses((s) => {
      const nx = { ...s, [pid]: 'approved' };
      if (order[i + 1] && nx[order[i + 1]] === 'locked') nx[order[i + 1]] = 'in_progress';
      return nx;
    });
    celebrate();
  }, 1400);

  // The arrival phase inherits the term and courses registered before travel,
  // seeded once so later edits here are never overwritten.
  const seedArrival = () => setData((d) =>
    (d.p3.semStart || !d.pa.semStart) ? d : {
      ...d,
      p3: {
        ...d.p3,
        semSystem: d.pa.semSystem, semTerm: d.pa.semTerm,
        semStart: d.pa.semStart, semEnd: d.pa.semEnd,
        courses: (d.pa.courses || []).map((c) => ({ ...c })),
        inheritedFrom: 'pa',
      },
    });


  // Per-phase completion percentage for the home cards.
  const phaseProgress = useMemo(() => {
    const pct = {};
    /* Three required steps decide the bar (dependents are optional, so they
       don't count toward completion): confirming the record, attaching every
       prior-qualification document the ministry expects, and accepting terms. */
    const p1Levels = priorLevels(user);
    const p1QualDone = p1Levels.length > 0 && p1Levels.every((lv) => (data.p1.qualDocs || {})[lv]);
    pct.p1 = ((data.p1.confirmed ? 1 : 0) + (p1QualDone ? 1 : 0) + (data.p1.terms ? 1 : 0)) / 3 * 100;
    pct.pa = ((data.pa.semStart ? 1 : 0) + (((data.pa.courses || []).length && (data.pa.courses || []).every(c => c.done)) || data.pa.coursesLater ? 1 : 0) + ((data.pa.fgRequested || data.pa.coursesLater) ? 1 : 0)) / 3 * 100;
    pct.p2 = ((Object.keys(data.p2.visas || {}).length ? 1 : 0) + (data.p2.flightConfirmed ? 1 : 0)) / 2 * 100;
    pct.p3 = ((data.p3.addr ? 1 : 0) + (data.p3.bankName ? 1 : 0) + (data.p3.courses?.length ? 1 : 0) + (data.p3.fgRequested ? 1 : 0)) / 4 * 100;
    return pct;
  }, [data, user]);

  /* Every file the student attached, gathered from wherever in the journey it
     was uploaded and stamped with the term it belongs to. Grouping by term is
     what makes this useful later — "what did I submit for the second term?" */
  const userDocuments = useMemo(() => {
    const out = [];
    const add = (v, srcKey, term) => {
      const name = fileName(v);
      if (name) out.push({ name, key: fileKey(v), srcKey, term: term || '' });
    };

    Object.entries(data.p1.qualDocs || {}).forEach(([lv, n]) => add(n, 'udoc.qual.' + lv, ''));
    Object.values(data.p2.visas || {}).forEach((v) => add(v && v.file, 'udoc.visa', ''));
    (data.p2.reqFiles || []).forEach((n) => add(n, 'udoc.ticket', ''));

    [['pa', data.pa], ['p3', data.p3]].forEach(([pid, d]) => {
      const term = semLabelOf(d);
      Object.entries((d && d.docs) || {}).forEach(([k, n]) => add(n, 'udoc.' + k, term));
    });
    return out;
  }, [data, lang]);

  /* ---- Requests -------------------------------------------------------
     Everything the student has submitted and is waiting on, in one list:
     the four phase submissions, the flight ticket, and each financial
     guarantee. Each carries enough to render a row and to undo itself. */
  const requests = useMemo(() => {
    const out = [];
    PHASES.forEach((ph) => {
      const st = statuses[ph.id];
      if (st !== 'submitted' && st !== 'approved') return;
      out.push({
        id: 'phase:' + ph.id,
        kind: 'phase',
        titleKey: ph.nameKey,
        ref: refs[ph.id],
        status: st === 'approved' ? 'approved' : 'review',
        date: '',
        term: '',
        cancellable: st === 'submitted',
        target: ph.id,
      });
    });

    if (data.p2.reqNo) {
      out.push({
        id: 'ticket',
        kind: 'ticket',
        titleKey: 'req.ticket',
        ref: data.p2.reqNo,
        status: data.p2.flightConfirmed ? 'approved' : 'review',
        date: data.p2.date || '',
        term: '',
        /* Once the OTB is issued the booking is final, like every other
           approved request — only a ticket still under review can be pulled. */
        cancellable: !data.p2.flightConfirmed,
        target: 'p2',
      });
    }

    [['pa', data.pa], ['p3', data.p3]].forEach(([pid, d]) => {
      if (!d || !d.fgRequested || !d.fgRef) return;
      out.push({
        id: 'fg:' + pid,
        kind: 'fg',
        titleKey: 'req.fg',
        ref: d.fgRef,
        status: docs.some((x) => x.ref === d.fgRef) ? 'approved' : 'review',
        date: '',
        term: semLabelOf(d),
        cancellable: !docs.some((x) => x.ref === d.fgRef),
        target: pid,
      });
    });
    return out;
  }, [statuses, refs, data, docs, lang]);

  /* Withdrawing a request puts the student back where they were before they
     sent it — the phase reopens, the reference is released, and anything the
     request would have produced is not issued. Approved requests are final. */
  const cancelRequest = (req) => {
    if (!req || !req.cancellable) return;
    if (req.kind === 'phase') {
      setStatuses((s) => ({ ...s, [req.target]: 'in_progress' }));
      setRefs((r) => { const n = { ...r }; delete n[req.target]; return n; });
    } else if (req.kind === 'ticket') {
      setPhaseData('p2')((d) => ({
        ...d, reqNo: undefined, otb: '', flightNo: '',
        flightStage: 'form', flightConfirmed: false, routeOk: undefined, dateOk: undefined,
      }));
    } else if (req.kind === 'fg') {
      setPhaseData(req.target)((d) => ({ ...d, fgRequested: false, fgRef: undefined }));
    }
    toast(t('req.cancelled'));
  };

  const allDone = statuses.p3 === 'approved';
  const guaranteeReady = statuses.p1 === 'approved';

  // Everything a phase step's render() needs beyond its own form data.
  const wizardCtx = {
    user,
    userName: user.name[lang],
    dependents: data.p1.dependents || [],
    semStart: data.pa.semStart || '',
    semLabel: semLabelOf(data.pa),
    openFiles: () => { window.location.hash = `#/${lang}/rafeeq/files`; },
    fgIssued: (ref) => !!ref && docs.some((x) => x.ref === ref),
    runTask,
  };

  /* Leaving ends the session and takes the data with it: the whole record set
     for this applicant is deleted and every object URL revoked, so nothing
     survives in the browser after the demo. Refreshing mid-session keeps your
     progress; leaving does not. */
  /* Called by the auth screens once credentials check out. */
  const startSession = (u) => {
    const who = u || DEMO_USER;
    issueSession(who);
    setUser(who);
    setSignedIn(true);
  };

  /* Keep the idle clock alive while the person is actually doing things,
     throttled to once a minute — localStorage writes on every mousemove would
     be wasteful and pointless at this granularity. */
  useEffect(() => {
    if (!signedIn) return;
    let last = 0;
    const bump = () => {
      const t = Date.now();
      if (t - last > 60000) { last = t; touchSession(); }
    };
    const evts = ['pointerdown', 'keydown', 'focus'];
    evts.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    /* And a watchdog: when the token lapses, sign out on our own rather than
       leaving a stale-looking session on screen. */
    const timer = setInterval(() => {
      if (!readSession()) {
        clearSession();
        setSignedIn(false);
        setUser(DEMO_USER);
        toast(t('session.expired'));
      }
    }, 30000);
    return () => {
      evts.forEach((e) => window.removeEventListener(e, bump));
      clearInterval(timer);
    };
  }, [signedIn, t, toast]);

  /* Contact details belong to the student, so they can change them. Written
     through the session token as well, or a refresh would restore the old
     values from the stored copy. */
  const updateUser = (patch) => {
    setUser((u) => {
      const next = { ...u, ...patch };
      try { issueSession(next); } catch { /* private mode */ }
      return next;
    });
    toast(t('profile.saved'));
  };

  const signOut = async () => {
    objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrls.current = [];
    try { await repo.clear(); } catch (e) { console.error('wipe failed', e); }
    clearSession();
    userStore.endSession();
    setUser(DEMO_USER);
    setSignedIn(false);
  };
  const resetDemo = () => { resetStore(); setOpenDoc(null); toast(t('toast.reset')); };

  const value = {
    // i18n + theming
    t, lang, setLang, theme, setTheme,
    // session
    user, setUser, updateUser, signedIn, setSignedIn, signOut, startSession,
    // persisted state
    statuses, refs, data, docs, ready,
    setStatuses, setRefs, setData, setDocs, setPhaseData,
    // actions
    submitPhase, approvePhase, issueDoc, seedArrival, resetDemo, openDocumentFile, openAttachment,
    runTask, busy,
    semLabelOf, phaseProgress, allDone, guaranteeReady, wizardCtx, userDocuments,
    requests, cancelRequest,
    // transient UI
    toast, toastMsg, confetti, celebrate, openDoc, setOpenDoc,
  };

  return <RafeeqContext.Provider value={value}>{children}</RafeeqContext.Provider>;
}

// Any page: const { t, lang, data, setPhaseData } = useRafeeq();
export function useRafeeq() {
  return useContext(RafeeqContext);
}
