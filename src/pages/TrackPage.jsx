import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';

/* Public tracking page: enter a ticket (C-… contact / F-… feedback) and see its
   status. The API returns only status + type + date — never the message or PII. */
function TrackPage() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const [id, setId] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const lookup = async (raw) => {
    const t = String(raw ?? id).trim().toUpperCase();
    if (!t) return;
    setState('loading'); setErr(''); setResult(null);
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
    } catch {
      setErr(ar ? 'تعذّر الاتصال بالخادم.' : 'Could not reach the server.');
      setState('error');
    }
  };

  // Prefill + auto-lookup from ?id=
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('id');
    if (p) { setId(p); lookup(p); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => { e.preventDefault(); lookup(); };

  const statusLabel = (s) => ar
    ? (s === 'resolved' ? 'تم الرد عليها / معالجتها' : 'وردت — قيد المراجعة')
    : (s === 'resolved' ? 'Resolved' : 'Received — under review');
  const typeLabel = (ty) => ar
    ? (ty === 'contact' ? 'طلب تواصل' : 'ملاحظة')
    : (ty === 'contact' ? 'Contact request' : 'Feedback');

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <style>{`
          .track-result{margin-top:26px;background:var(--surface-1);border:1px solid var(--divider);border-radius:var(--r-lg);padding:24px}
          .track-row{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--divider);font-size:15px}
          .track-row:last-child{border-bottom:0}
          .track-row .k{color:var(--muted)}
          .track-pill{display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:700;
            background:color-mix(in srgb, var(--accent) 15%, transparent);color:var(--accent)}
          .track-pill--done{background:rgba(120,200,150,.16);color:#7fd6a3}
          .track-none{color:var(--muted);font-size:15px;line-height:1.6}
          .track-tip{color:var(--muted);font-size:13px;margin-top:8px}
        `}</style>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {ar ? 'تتبّع الطلب' : 'Track a request'}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{ar ? 'تتبّع طلبًا أو ملاحظة' : 'Track a request or feedback'}</h1>
          <p className="deck">
            {ar
              ? 'أدخل رقم التذكرة الذي حصلت عليه عند الإرسال لمعرفة حالته. تبدأ تذاكر التواصل بـ C وتذاكر الملاحظات بـ F.'
              : 'Enter the ticket number you got when you submitted to see its status. Contact tickets start with C, feedback tickets with F.'}
          </p>
        </header>

        <section className="container" style={{ paddingBlock: '8px 100px', maxWidth: 640 }}>
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="contact-field">
              <label htmlFor="track-id">{ar ? 'رقم التذكرة' : 'Ticket number'}</label>
              <input
                id="track-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="C-K-04821"
                dir="ltr"
                autoComplete="off"
                spellCheck={false}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <button className="contact-btn" type="submit" disabled={state === 'loading'}>
              {state === 'loading' ? (ar ? 'جارٍ البحث…' : 'Checking…') : (ar ? 'تتبّع' : 'Track')}
            </button>
          </form>

          {state === 'error' && <p className="field-error" role="alert" style={{ marginTop: 16 }}>{err}</p>}

          {state === 'done' && result && (
            <div className="track-result" role="status">
              {result.found ? (
                <>
                  <div className="track-row"><span className="k">{ar ? 'التذكرة' : 'Ticket'}</span><strong dir="ltr">{result.ticket}</strong></div>
                  <div className="track-row"><span className="k">{ar ? 'النوع' : 'Type'}</span><span>{typeLabel(result.type)}</span></div>
                  <div className="track-row"><span className="k">{ar ? 'الحالة' : 'Status'}</span>
                    <span className={'track-pill' + (result.status === 'resolved' ? ' track-pill--done' : '')}>{statusLabel(result.status)}</span>
                  </div>
                  {result.submittedAt && (
                    <div className="track-row"><span className="k">{ar ? 'أُرسلت في' : 'Submitted'}</span><span dir="ltr">{result.submittedAt}</span></div>
                  )}
                </>
              ) : (
                <p className="track-none">
                  {ar
                    ? 'لا يوجد طلب بهذا الرقم. تأكّد من رقم التذكرة كما ظهر لك عند الإرسال.'
                    : 'No request found for that ticket. Double-check the number exactly as it appeared when you submitted.'}
                </p>
              )}
            </div>
          )}

          <p className="track-tip">
            {ar ? 'ليس لديك تذكرة؟ ' : 'Don’t have a ticket? '}
            <a href={`/${lang}/contact`}>{ar ? 'أرسل طلبًا جديدًا' : 'Send a new request'}</a>.
          </p>
        </section>
      </main>
    </>
  );
}

export default TrackPage;
