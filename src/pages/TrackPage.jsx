import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

/* Two views:
   1) entry — enter a ticket number.
   2) status — a phased tracker + the request's details.
   The API returns type + status + date + the message content (no name/email). */

const NODE_OF = { received: 0, under_consideration: 1, approved: 2, rejected: 2, implemented: 3 };

function TrackPage() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const [id, setId] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [filled, setFilled] = useState(false);

  const NODES = [
    { en: 'Received', ar: 'تم الاستلام' },
    { en: 'Under consideration', ar: 'قيد الدراسة' },
    { en: 'Approved', ar: 'معتمد' },
    { en: 'Implemented', ar: 'تم التنفيذ' },
  ];

  const lookup = async (raw) => {
    const t = String(raw ?? id).trim().toUpperCase();
    if (!t) return;
    setState('loading'); setErr(''); setResult(null); setFilled(false);
    try {
      const res = await fetch(`/api/ticket?id=${encodeURIComponent(t)}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) {
        setErr(data && data.error === 'format'
          ? (ar ? 'صيغة التذكرة غير صحيحة. مثال: C-K-04821' : 'That doesn’t look like a valid ticket. Example: C-K-04821')
          : (ar ? 'تعذّر البحث. حاول لاحقًا.' : 'Lookup failed. Please try again.'));
        setState('error');
        return;
      }
      setResult(data);
      setState('done');
      setTimeout(() => setFilled(true), 90);
    } catch {
      setErr(ar ? 'تعذّر الاتصال بالخادم.' : 'Could not reach the server.');
      setState('error');
    }
  };

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('id');
    if (p) { setId(p); lookup(p); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => { e.preventDefault(); lookup(); };
  const reset = () => {
    setResult(null); setState('idle'); setErr(''); setId(''); setFilled(false);
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
  };

  const typeLabel = (ty) => ar ? (ty === 'contact' ? 'طلب تواصل' : 'ملاحظة') : (ty === 'contact' ? 'Contact request' : 'Feedback');
  const statusLabel = (s) => {
    if (s === 'rejected') return ar ? 'مرفوض' : 'Rejected';
    const i = NODE_OF[s] ?? 0;
    return ar ? NODES[i].ar : NODES[i].en;
  };
  const fmtTime = (iso, tz) => {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: tz, year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(d);
    } catch { return '—'; }
  };

  const renderTracker = () => {
    const status = result.status || 'received';
    const rejected = status === 'rejected';
    const cur = NODE_OF[status] ?? 0;
    const nodeState = (i) => {
      if (!filled) return i === 0 ? 'current' : '';
      if (rejected && i === 2) return 'reject';
      if (i < cur) return 'done';
      if (i === cur) return 'current';
      return '';
    };
    const segDone = (i) => filled && (i + 1) <= cur;
    return (
      <div className="trk" role="img" aria-label={`${ar ? 'المرحلة' : 'Phase'}: ${statusLabel(status)}`}>
        {NODES.flatMap((n, i) => {
          const label = i === 2 && rejected ? (ar ? 'مرفوض' : 'Rejected') : (ar ? n.ar : n.en);
          const s = nodeState(i);
          const glyph = s === 'reject' ? '✕' : (s === 'done' ? '✓' : i + 1);
          const cell = (
            <div className="trk__cell" key={`c${i}`}>
              <span className={'trk__dot ' + s}>{glyph}</span>
              <span className={'trk__label ' + s}>{label}</span>
            </div>
          );
          if (i === 0) return [cell];
          return [<span key={`s${i}`} className={'trk__seg' + (segDone(i - 1) ? ' done' : '')}><i /></span>, cell];
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
          .trk{display:flex;align-items:flex-start;margin:8px 0 0}
          .trk__cell{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;width:14ch;max-width:24vw}
          .trk__dot{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;
            border:2px solid var(--divider);background:var(--surface-1);color:var(--muted);font-weight:700;font-size:19px;
            transition:border-color .4s ease,color .4s ease,background .4s ease,box-shadow .4s ease}
          .trk__dot.done,.trk__dot.current{border-color:#37d67a;color:#37d67a}
          .trk__dot.done{background:rgba(55,214,122,.18)}
          .trk__dot.current{box-shadow:0 0 0 5px rgba(55,214,122,.18)}
          .trk__dot.reject{border-color:#ff6b6b;color:#ff6b6b;background:rgba(255,90,90,.16);box-shadow:0 0 0 5px rgba(255,90,90,.14)}
          .trk__seg{position:relative;flex:1 1 auto;height:3px;margin-top:27px;border-radius:3px;
            background:repeating-linear-gradient(90deg,var(--divider) 0 7px,transparent 7px 14px)}
          .trk__seg i{position:absolute;inset:0;width:0;background:#37d67a;border-radius:3px;transition:width .6s ease}
          .trk__seg.done i{width:100%}
          .trk__label{margin-top:14px;font-size:13px;line-height:1.35;text-align:center;color:var(--muted)}
          .trk__label.done,.trk__label.current{color:var(--ink)}
          .trk__label.reject{color:#ff8f8f}
          .trk__panel{background:var(--surface-1);border:1px solid var(--divider);border-radius:var(--r-lg);padding:30px 26px 34px;text-align:start}
          .trk__body{text-align:start}
          .trk__req{margin:34px 0 2px;font-size:clamp(28px,5vw,46px);font-weight:600;line-height:1.1;color:var(--ink)}
          .trk__req .mono{font-family:ui-monospace,"SF Mono",Menlo,monospace}
          .trk__status{margin:0 0 22px;font-size:clamp(20px,3vw,28px);font-weight:300;color:#37d67a}
          .trk__status.reject{color:#ff8f8f}
          .trk__dl{margin:0;font-size:15px;line-height:1.9;color:var(--muted)}
          .trk__dl b{color:var(--ink);font-weight:600}
          .trk__content{white-space:pre-wrap;word-break:break-word}
          .trk__again{margin-top:30px;display:inline-block;background:transparent;border:1px solid var(--divider);
            color:var(--ink);border-radius:999px;padding:12px 22px;font:inherit;font-weight:600;cursor:pointer}
          .trk__again:hover{border-color:#37d67a;color:#37d67a}
          @media (max-width:560px){
            .trk__dot{width:42px;height:42px;font-size:15px}
            .trk__seg{margin-top:20px}
            .trk__label{font-size:11px}
          }
        `}</style>

        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {ar ? 'تتبّع الطلب' : 'Track a request'}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        {showStatus ? (
          /* ---------- STATUS VIEW ---------- */
          <section className="container trk__body" style={{ paddingBlock: '8px 100px' }}>
            <div className="trk__panel">{renderTracker()}</div>
            <h1 className="trk__req">
              {ar ? 'الطلب: ' : 'Request: '}<span className="mono" dir="ltr">{result.ticket}</span>
            </h1>
            <p className={'trk__status' + (result.status === 'rejected' ? ' reject' : '')}>
              {ar ? 'الحالة: ' : 'Status: '}{statusLabel(result.status)}
            </p>
            <dl className="trk__dl">
              <div>{ar ? 'نوع الطلب: ' : 'Request type: '}<b>{typeLabel(result.type)}</b></div>
              {result.content && (
                <div>{ar ? 'محتوى الطلب: ' : 'Request content: '}<b className="trk__content" dir="auto">{result.content}</b></div>
              )}
              {result.submittedAt && (
                <div>
                  {ar ? 'وقت الطلب — ' : 'Request time — '}
                  <b dir="ltr">NYC: {fmtTime(result.submittedAt, 'America/New_York')}</b>
                  {' · '}
                  <b dir="ltr">Riyadh: {fmtTime(result.submittedAt, 'Asia/Riyadh')}</b>
                </div>
              )}
            </dl>
            <button type="button" className="trk__again" onClick={reset}>
              {ar ? 'تتبّع طلبًا آخر' : 'Track another request'}
            </button>
          </section>
        ) : (
          /* ---------- ENTRY VIEW ---------- */
          <>
            <header className="project-header container">
              <h1>{ar ? 'تتبّع طلبًا أو ملاحظة' : 'Track a request or feedback'}</h1>
              <p className="deck">
                {ar
                  ? 'أدخل رقم التذكرة الذي حصلت عليه عند الإرسال لتتابع مرحلته. تبدأ تذاكر التواصل بـ C وتذاكر الملاحظات بـ F.'
                  : 'Enter the ticket number you got when you submitted to follow its phase. Contact tickets start with C, feedback tickets with F.'}
              </p>
            </header>
            <section className="container" style={{ paddingBlock: '8px 100px', maxWidth: 640 }}>
              <form className="contact-form" onSubmit={submit} noValidate>
                <div className="contact-field">
                  <label htmlFor="track-id">{ar ? 'رقم التذكرة' : 'Ticket number'}</label>
                  <input
                    id="track-id" value={id} onChange={(e) => setId(e.target.value)}
                    placeholder="C-K-04821" dir="ltr" autoComplete="off" spellCheck={false}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <button className="contact-btn" type="submit" disabled={state === 'loading'}>
                  {state === 'loading' ? (ar ? 'جارٍ البحث…' : 'Checking…') : (ar ? 'تتبّع' : 'Track')}
                </button>
              </form>
              {state === 'error' && <p className="field-error" role="alert" style={{ marginTop: 16 }}>{err}</p>}
              {state === 'done' && result && !result.found && (
                <p className="field-error" role="alert" style={{ marginTop: 16 }}>
                  {ar
                    ? 'لا يوجد طلب بهذا الرقم. تأكّد من رقم التذكرة كما ظهر لك عند الإرسال.'
                    : 'No request found for that ticket. Double-check the number exactly as it appeared when you submitted.'}
                </p>
              )}
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
