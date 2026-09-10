import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

/* Track page — two views (entry / status).
   Feedback (F-…): 4 phases, verified by the local date you submitted.
   Contact (C-…): 3 phases, verified by your email; the reply shows here + is emailed.
   Verification is required to see anything, which blocks ticket enumeration. */

const FEEDBACK_NODES = [
  { en: 'Received', ar: 'تم الاستلام' },
  { en: 'Under consideration', ar: 'قيد الدراسة' },
  { en: 'Approved', ar: 'معتمد' },
  { en: 'Implemented', ar: 'تم التنفيذ' },
];
const CONTACT_NODES = [
  { en: 'Received', ar: 'تم الاستلام' },
  { en: 'Under review', ar: 'قيد المراجعة' },
  { en: 'Replied', ar: 'تم الرد' },
];
const NODE_OF = {
  received: 0, under_consideration: 1, approved: 2, rejected: 2, implemented: 3, // feedback
  under_review: 1, replied: 2, // contact
};

// "fc00002" -> "F-C-00002" (prefix F/C, one letter, up to 5 digits).
function fmtTicket(raw) {
  const s = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const p = s.slice(0, 1).replace(/[^FC]/g, '');
  const rest = s.slice(1);
  const l = rest.slice(0, 1).replace(/[^A-Z]/g, '');
  const d = rest.slice(1).replace(/\D/g, '').slice(0, 5);
  return [p, l, d].filter((x) => x !== '').join('-');
}

function TrackPage() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const [id, setId] = useState('');
  const [verifier, setVerifier] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [filled, setFilled] = useState(false);

  const prefix = id.trim().toUpperCase()[0];
  const isContactTicket = prefix === 'C';
  const isFeedbackTicket = prefix === 'F';

  const lookup = async (rawId, rawV) => {
    const t = fmtTicket(rawId);
    const v = String(rawV ?? verifier).trim();
    if (!t || !v) return;
    setState('loading'); setErr(''); setResult(null); setFilled(false);
    try {
      const res = await fetch(`/api/ticket?id=${encodeURIComponent(t)}&v=${encodeURIComponent(v)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) {
        setErr(ar ? 'تعذّر البحث. حاول لاحقًا.' : 'Lookup failed. Please try again.');
        setState('error'); return;
      }
      if (!data.found) {
        setErr(ar
          ? 'لا يوجد طلب مطابق. تأكّد من رقم التذكرة ومن بيانات التحقق.'
          : 'No match. Check the ticket number and your verification details.');
        setState('error'); return;
      }
      setResult(data);
      setState('done');
      try { sessionStorage.setItem('trk:' + t, v); } catch { /* ignore */ }
      window.history.replaceState(null, '', `?id=${encodeURIComponent(t)}`); // id only; verifier stays local
      setTimeout(() => setFilled(true), 90);
    } catch {
      setErr(ar ? 'تعذّر الاتصال بالخادم.' : 'Could not reach the server.');
      setState('error');
    }
  };

  // Restore on refresh / deep-link: id from the URL, verifier from sessionStorage.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('id');
    if (!p) return;
    const t = fmtTicket(p);
    setId(t);
    let v = '';
    try { v = sessionStorage.getItem('trk:' + t) || ''; } catch { /* ignore */ }
    if (v) { setVerifier(v); lookup(t, v); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => { e.preventDefault(); lookup(id, verifier); };
  const reset = () => {
    setResult(null); setState('idle'); setErr(''); setId(''); setVerifier(''); setFilled(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const typeLabel = (ty) => ar ? (ty === 'contact' ? 'طلب تواصل' : 'ملاحظة') : (ty === 'contact' ? 'Contact request' : 'Feedback');
  const nodesFor = (ty) => (ty === 'contact' ? CONTACT_NODES : FEEDBACK_NODES);
  const statusLabel = (r) => {
    if (r.status === 'rejected') return ar ? 'مرفوض' : 'Rejected';
    const nodes = nodesFor(r.type);
    const i = Math.min(NODE_OF[r.status] ?? 0, nodes.length - 1);
    return ar ? nodes[i].ar : nodes[i].en;
  };
  const fmtTime = (iso, tz) => {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    try {
      return new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    } catch { return '—'; }
  };

  const renderTracker = () => {
    const isContact = result.type === 'contact';
    const NODES = isContact ? CONTACT_NODES : FEEDBACK_NODES;
    const status = result.status || 'received';
    const rejected = !isContact && status === 'rejected';
    const cur = Math.min(NODE_OF[status] ?? 0, NODES.length - 1);
    const nodeState = (i) => {
      if (!filled) return i === 0 ? 'current' : '';
      if (rejected && i === 2) return 'reject';
      if (i < cur) return 'done';
      if (i === cur) return 'current';
      return '';
    };
    const segDone = (i) => filled && (i + 1) <= cur;
    return (
      <div className="trk" role="img" aria-label={`${ar ? 'المرحلة' : 'Phase'}: ${statusLabel(result)}`}>
        {NODES.flatMap((n, i) => {
          const label = i === 2 && rejected ? (ar ? 'مرفوض' : 'Rejected') : (ar ? n.ar : n.en);
          const s = nodeState(i);
          const glyph = s === 'reject' ? '✕' : (s === 'done' ? '✓' : i + 1);
          const cell = (
            <div className="trk__cell" key={`c${i}`}>
              <span className={'trk__dot ' + s} style={{ transitionDelay: `${i * 0.3}s` }}>{glyph}</span>
              <span className={'trk__label ' + s}>{label}</span>
            </div>
          );
          if (i === 0) return [cell];
          const seg = (
            <span key={`s${i}`} className={'trk__seg' + (segDone(i - 1) ? ' done' : '')}>
              <i style={{ transitionDelay: `${(i - 1) * 0.3 + 0.15}s` }} />
            </span>
          );
          return [seg, cell];
        })}
      </div>
    );
  };

  const showStatus = state === 'done' && result && result.found;

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <style>{`
          .trk{display:flex;align-items:center;margin:10px 0 3.2em;padding:6px 4px 0}
          .trk__cell{flex:0 0 auto;position:relative;display:flex;justify-content:center}
          .trk__dot{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;
            border:2px solid var(--divider);background:var(--surface-1);color:var(--muted);font-weight:700;font-size:19px;
            transition:border-color .45s ease,color .45s ease,background .45s ease,box-shadow .45s ease}
          .trk__dot.done,.trk__dot.current{border-color:#37d67a;color:#37d67a}
          .trk__dot.done{background:rgba(55,214,122,.18)}
          .trk__dot.current{box-shadow:0 0 0 5px rgba(55,214,122,.18)}
          .trk__dot.reject{border-color:#ff6b6b;color:#ff6b6b;background:rgba(255,90,90,.16);box-shadow:0 0 0 5px rgba(255,90,90,.14)}
          .trk__seg{position:relative;flex:1 1 auto;height:3px;border-radius:3px;
            background:repeating-linear-gradient(90deg,var(--divider) 0 7px,transparent 7px 14px)}
          .trk__seg i{position:absolute;inset-inline-start:0;top:0;bottom:0;width:0;background:#37d67a;border-radius:3px;transition:width .55s ease}
          .trk__seg.done i{width:100%}
          .trk__label{position:absolute;top:100%;inset-inline-start:50%;transform:translateX(-50%);margin-top:12px;
            width:14ch;text-align:center;font-size:13px;line-height:1.35;color:var(--muted)}
          html[dir=rtl] .trk__label{transform:translateX(50%)}
          .trk__label.done,.trk__label.current{color:var(--ink)}
          .trk__label.reject{color:#ff8f8f}
          .trk__panel{background:var(--surface-1);border:1px solid var(--divider);border-radius:var(--r-lg);padding:30px 30px 20px;text-align:start;overflow:hidden}
          .trk__body{text-align:start}
          .trk__req{margin:34px 0 2px;font-size:clamp(28px,5vw,46px);font-weight:600;line-height:1.1;color:var(--ink)}
          .trk__req .mono{font-family:ui-monospace,"SF Mono",Menlo,monospace}
          .trk__status{margin:0 0 22px;font-size:clamp(20px,3vw,28px);font-weight:300;color:#37d67a}
          .trk__status.reject{color:#ff8f8f}
          .trk__dl{margin:0;font-size:15px;line-height:1.9;color:var(--muted)}
          .trk__dl b{color:var(--ink);font-weight:600}
          .trk__content{white-space:pre-wrap;word-break:break-word}
          .trk__reply{margin-top:20px;padding:16px 18px;border-radius:14px;background:rgba(55,214,122,.10);
            border:1px solid rgba(55,214,122,.35)}
          .trk__reply h3{margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#7fd6a3}
          .trk__reply p{margin:0;color:var(--ink);white-space:pre-wrap;word-break:break-word;line-height:1.6}
          @media (max-width:560px){
            .trk__dot{width:42px;height:42px;font-size:15px}
            .trk__label{font-size:10.5px;width:9ch}
          }
        `}</style>

        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {ar ? 'تتبّع الطلب' : 'Track a request'}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        {showStatus ? (
          <section className="container trk__body" style={{ paddingBlock: '8px 100px' }}>
            <div className="trk__panel">{renderTracker()}</div>
            <h1 className="trk__req">{ar ? 'الطلب: ' : 'Request: '}<span className="mono" dir="ltr">{result.ticket}</span></h1>
            <p className={'trk__status' + (result.status === 'rejected' ? ' reject' : '')}>
              {ar ? 'الحالة: ' : 'Status: '}{statusLabel(result)}
            </p>
            <dl className="trk__dl">
              <div>{ar ? 'نوع الطلب: ' : 'Request type: '}<b>{typeLabel(result.type)}</b></div>
              {result.content && <div>{ar ? 'محتوى الطلب: ' : 'Request content: '}<b className="trk__content" dir="auto">{result.content}</b></div>}
              {result.submittedAt && (
                <div>
                  {ar ? 'وقت الطلب — ' : 'Request time — '}
                  <b dir="ltr">NYC: {fmtTime(result.submittedAt, 'America/New_York')}</b>{' · '}
                  <b dir="ltr">Riyadh: {fmtTime(result.submittedAt, 'Asia/Riyadh')}</b>
                </div>
              )}
            </dl>
            {result.reply && (
              <div className="trk__reply">
                <h3>{ar ? 'الرد' : 'Reply'}</h3>
                <p dir="auto">{result.reply}</p>
              </div>
            )}
            <button type="button" className="contact-btn" style={{ marginTop: 30 }} onClick={reset}>
              {ar ? 'تتبّع طلبًا آخر' : 'Track another request'}
            </button>
          </section>
        ) : (
          <>
            <header className="project-header container">
              <h1>{ar ? 'تتبّع طلبًا أو ملاحظة' : 'Track a request or feedback'}</h1>
              <p className="deck">
                {ar
                  ? 'أدخل رقم التذكرة، ثم تحقّق: للملاحظات بتاريخ إرسالها (بتوقيتك)، ولطلبات التواصل ببريدك الإلكتروني.'
                  : 'Enter your ticket, then verify: feedback with the date you submitted (your local date), a contact request with your email.'}
              </p>
            </header>
            <section className="container" style={{ paddingBlock: '8px 100px', maxWidth: 640 }}>
              <form className="contact-form" onSubmit={submit} noValidate>
                <div className="contact-field">
                  <label htmlFor="track-id">{ar ? 'رقم التذكرة' : 'Ticket number'}</label>
                  <input
                    id="track-id" value={id} onChange={(e) => setId(fmtTicket(e.target.value))}
                    placeholder="C-K-04821" dir="ltr" autoComplete="off" spellCheck={false} inputMode="text"
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="track-v">
                    {isContactTicket ? (ar ? 'بريدك الإلكتروني' : 'Your email')
                      : isFeedbackTicket ? (ar ? 'تاريخ الإرسال (بتوقيتك)' : 'Date you submitted (your local date)')
                        : (ar ? 'التحقّق' : 'Verification')}
                  </label>
                  {isContactTicket ? (
                    <input id="track-v" type="email" value={verifier} onChange={(e) => setVerifier(e.target.value)}
                      placeholder="you@example.com" dir="ltr" autoComplete="off" />
                  ) : (
                    <input id="track-v" type="date" value={verifier} onChange={(e) => setVerifier(e.target.value)}
                      dir="ltr" disabled={!isFeedbackTicket} />
                  )}
                </div>
                <button className="contact-btn" type="submit" disabled={state === 'loading' || !id || !verifier}>
                  {state === 'loading' ? (ar ? 'جارٍ البحث…' : 'Checking…') : (ar ? 'تتبّع' : 'Track')}
                </button>
              </form>
              {state === 'error' && <p className="field-error" role="alert" style={{ marginTop: 16 }}>{err}</p>}
              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 18 }}>
                {ar ? 'ليس لديك تذكرة؟ ' : 'Don’t have a ticket? '}
                <a href={`/${lang}/contact`}>{ar ? 'أرسل طلبًا جديدًا' : 'Send a new request'}</a>.
              </p>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default TrackPage;
