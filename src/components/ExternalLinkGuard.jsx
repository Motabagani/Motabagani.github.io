import { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';

/* ExternalLinkGuard — a site-wide interstitial shown before the visitor leaves
   for a third-party website. Mounted once in App. It intercepts clicks on any
   <a> that points to a different http(s) origin (GitHub, LinkedIn, …), and asks
   the visitor to confirm before opening it in a new tab. mailto:/tel: and
   in-site links are left alone. Add data-no-guard to an anchor to opt out. */

function isExternalHttp(a) {
  if (!a || !a.href) return false;
  if (a.hasAttribute('data-no-guard')) return false;
  let url;
  try { url = new URL(a.href, window.location.href); } catch { return false; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false; // skip mailto:, tel:, etc.
  return url.host !== window.location.host;
}

export default function ExternalLinkGuard() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const [target, setTarget] = useState(null); // pending external URL string, or null

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a');
      if (!isExternalHttp(a)) return;
      e.preventDefault();
      setTarget(a.href);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (!target) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setTarget(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target]);

  if (!target) return null;

  let host = target;
  try { host = new URL(target).host.replace(/^www\./, ''); } catch { /* keep raw */ }

  const proceed = () => {
    const url = target;
    setTarget(null);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const t = ar
    ? {
        title: 'أنت على وشك مغادرة الموقع',
        body: 'ستنتقل إلى موقع خارجي لا أتحكّم به. لست مسؤولاً عن محتواه أو سياسة خصوصيته أو شروط استخدامه.',
        dest: 'الوجهة',
        cont: 'متابعة',
        cancel: 'رجوع',
      }
    : {
        title: 'You’re leaving the site',
        body: 'You’re heading to a third-party website I don’t control. I’m not responsible for its content, privacy practices, or terms of use.',
        dest: 'Destination',
        cont: 'Continue',
        cancel: 'Go back',
      };

  return (
    <div className="xlg" role="dialog" aria-modal="true" aria-label={t.title} onClick={() => setTarget(null)}>
      <style>{`
        .xlg { position: fixed; inset: 0; z-index: 100001; display: grid; place-items: center; padding: 24px;
          background: rgba(6, 3, 14, 0.78); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
          animation: xlg-fade .16s ease; }
        @keyframes xlg-fade { from { opacity: 0 } to { opacity: 1 } }
        .xlg__card { position: relative; width: min(440px, 100%); text-align: start;
          background: var(--surface-2, #1c1030); border: 1px solid var(--divider, rgba(255,255,255,.14));
          border-radius: 20px; padding: 30px 26px 24px; box-shadow: 0 30px 80px rgba(0,0,0,.55); }
        .xlg__brand { display: flex; justify-content: flex-start; margin: 0 0 14px; }
        .xlg__logo { height: 46px; width: auto; object-fit: contain; display: block; flex: none; }
        .xlg__title { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: var(--ink, #fff); }
        .xlg__body { margin: 0 0 16px; font-size: 14.5px; line-height: 1.6; color: var(--muted, #b9b2c7); }
        .xlg__dest { display: block; margin: 0 0 20px; font-size: 13px; color: var(--muted, #b9b2c7); word-break: break-all; }
        .xlg__dest b { color: var(--accent, #c9a8ff); font-weight: 700; }
        .xlg__actions { display: flex; gap: 10px; justify-content: flex-start; flex-wrap: wrap; }
        .xlg__btn { font: inherit; font-size: 14.5px; font-weight: 600; padding: 11px 20px; border-radius: 999px; cursor: pointer; border: 1px solid var(--divider, rgba(255,255,255,.16)); }
        .xlg__btn--ghost { background: transparent; color: var(--ink, #fff); }
        .xlg__btn--ghost:hover { background: var(--surface-1, rgba(255,255,255,.06)); }
        .xlg__btn--primary { background: var(--accent, #7c4dff); color: #fff; border-color: transparent; }
        .xlg__btn--primary:hover { filter: brightness(1.08); }
        @media (prefers-reduced-motion: reduce) { .xlg { animation: none } }
      `}</style>
      <div className="xlg__card" onClick={(e) => e.stopPropagation()}>
        <div className="xlg__brand">
          <img className="xlg__logo" src="/images/logowhite.png" alt="" />
        </div>
        <h2 className="xlg__title">{t.title}</h2>
        <p className="xlg__body">{t.body}</p>
        <span className="xlg__dest">{t.dest}: <b>{host}</b></span>
        <div className="xlg__actions">
          <button type="button" className="xlg__btn xlg__btn--ghost" onClick={() => setTarget(null)}>{t.cancel}</button>
          <button type="button" className="xlg__btn xlg__btn--primary" onClick={proceed}>{t.cont}</button>
        </div>
      </div>
    </div>
  );
}
