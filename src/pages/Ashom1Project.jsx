import { useState } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import AshomShowcase from '../components/AshomShowcase';

// One-time warning shown before the concept page: it's an independent research
// concept, still in progress, and not investment advice.
function AshomWarning({ onEnter }) {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  return (
    <div className="ashw-scrim" role="dialog" aria-modal="true" aria-label={ar ? 'تنبيه' : 'Notice'}>
      <style>{`
        .ashw-scrim{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;
          background:radial-gradient(120% 120% at 50% 0%, #241247 0%, #120a25 72%);}
        .ashw{width:min(540px,100%);text-align:center;background:rgba(32,16,61,.92);
          border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:clamp(26px,5vw,44px);
          box-shadow:0 24px 70px rgba(0,0,0,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#f0ebe0}
        .ashw__logos{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:18px}
        .ashw__logos img{height:42px;width:auto;display:block}
        .ashw__x{font-size:20px;opacity:.45;font-weight:300}
        .ashw__badge{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
          color:var(--accent,#f5a05c);border:1px solid color-mix(in srgb, var(--accent,#f5a05c) 45%, transparent);
          border-radius:999px;padding:5px 12px;margin-bottom:14px}
        .ashw h1{margin:0 0 12px;font-size:clamp(19px,3.2vw,24px);font-weight:700;line-height:1.22}
        .ashw p{margin:0 auto;max-width:44ch;font-size:14.5px;line-height:1.65;opacity:.92}
        .ashw__enter{margin-top:24px;width:100%;padding:15px;border:0;border-radius:999px;cursor:pointer;
          background:var(--accent,#f5a05c);color:#20103D;font:700 16px/1 inherit;letter-spacing:.01em}
        .ashw__enter:hover{filter:brightness(1.06)}
        .ashw__back{display:inline-block;margin-top:15px;color:#b7aecb;text-decoration:none;font-size:14px}
        .ashw__back:hover{color:var(--accent,#f5a05c)}
      `}</style>
      <div className="ashw">
        <div className="ashw__logos">
          <img src="/images/logowhite.png" alt="Hashim Motabagani" />
          <span className="ashw__x" aria-hidden="true">×</span>
          <img src="/images/ashom1-logo.png" alt="Ashom 1" />
        </div>
        <span className="ashw__badge">{ar ? 'مفهوم مستقل' : 'Independent concept'}</span>
        <h1>{ar ? 'اقرأ قبل المتابعة' : 'Please read before continuing'}</h1>
        <p>
          {ar
            ? 'أسهم ١ مفهوم بحثي مستقل من إعداد هاشم مطبقاني — غير تابع لأي جهة أو مؤسسة أو جامعة أو جهة حكومية، وما زال قيد التطوير. وهو ليس منتجًا ماليًا أو توصية؛ لا تستخدمه لاتخاذ قرارات استثمارية.'
            : 'Ashom 1 is an independent research concept by Hashim Motabagani — not affiliated with any institution, employer, university, or government body, and still in progress. It is not a financial product or recommendation; do not use it to make investment decisions.'}
        </p>
        <button type="button" className="ashw__enter" onClick={onEnter}>
          {ar ? 'فهمت — متابعة' : 'I understand — continue'}
        </button>
        <div><a className="ashw__back" href={`/${lang}/economic-models`}>{ar ? 'العودة إلى النماذج الاقتصادية' : 'Back to Economic Models'}</a></div>
      </div>
    </div>
  );
}

function Ashom1Project() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const [ack, setAck] = useState(() => {
    try { return sessionStorage.getItem('ashom1WarnAck') === '1'; } catch { return false; }
  });

  if (!ack) {
    return (
      <AshomWarning onEnter={() => {
        try { sessionStorage.setItem('ashom1WarnAck', '1'); } catch { /* ignore */ }
        setAck(true);
      }} />
    );
  }

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; <a href={`/${lang}/economic-models`}>{t.sections.economics}</a>
          &nbsp;/&nbsp; {ar ? 'أسهم ١' : 'Ashom 1'}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>
        <AshomShowcase />
      </main>
    </>
  );
}

export default Ashom1Project;
