// Rafeeq router — same shape as the portfolio's App.jsx: read the hash,
// strip the language prefix, match a page. Every screen is its own file
// under pages/, so browser back/forward work and each page deep-links.
//
//   #/en/rafeeq                 → RafeeqHome
//   #/en/rafeeq/preparation     → PreparationPage
//   #/en/rafeeq/academic        → AcademicPage
//   #/en/rafeeq/visa            → VisaTravelPage
//   #/en/rafeeq/arrival         → ArrivalPage
//   #/en/rafeeq/files           → FilesPage

import { useState, useEffect } from 'react';
import { RafeeqProvider, useRafeeq } from './RafeeqContext.jsx';
import Chrome from './components/Chrome.jsx';
import { Loading } from './ui/RafeeqDraw.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RafeeqHome from './pages/RafeeqHome.jsx';
import PreparationPage from './pages/PreparationPage.jsx';
import AcademicPage from './pages/AcademicPage.jsx';
import VisaTravelPage from './pages/VisaTravelPage.jsx';
import ArrivalPage from './pages/ArrivalPage.jsx';
import FilesPage from './pages/FilesPage.jsx';
import RequestsPage from './pages/RequestsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function Router() {
  const { signedIn, ready, t, theme } = useRafeeq();
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onNav = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, []);

  // '/en/rafeeq/visa' -> '/visa'
  const sub = route.replace(/^\/(en|ar)\/rafeeq/, '');

  useEffect(() => { window.scrollTo(0, 0); }, [sub]);

  // Reading the applicant's records back out of the database is async, so the
  // first paint after a refresh has nothing to show yet.
  if (signedIn && !ready) return <Chrome><Loading theme={theme} label={t('chrome.loading')} /></Chrome>;

  // Everything is behind the Nafath sign-in.
  if (!signedIn) return <Chrome bare><LoginPage /></Chrome>;

  let page;
  if (sub.startsWith('/preparation')) {
    page = <PreparationPage />;
  } else if (sub.startsWith('/academic')) {
    page = <AcademicPage />;
  } else if (sub.startsWith('/visa')) {
    page = <VisaTravelPage />;
  } else if (sub.startsWith('/arrival')) {
    page = <ArrivalPage />;
  } else if (sub.startsWith('/files')) {
    page = <FilesPage />;
  } else if (sub.startsWith('/requests')) {
    page = <RequestsPage />;
  } else if (sub.startsWith('/profile')) {
    page = <ProfilePage />;
  } else {
    page = <RafeeqHome />;
  }

  return <Chrome>{page}</Chrome>;
}

// One-time interstitial so nobody mistakes the demo for a real service: shows
// Hashim's mark beside the Rafeeq mark and states it's a concept redesign.
function RafeeqIntro({ onEnter }) {
  const { t, lang, theme } = useRafeeq();
  const rafeeqMark = theme === 'light' ? '/images/rafeeq-dark.png' : '/images/rafeeq-bright.png';
  return (
    <div className="rafeeq" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} data-theme={theme}>
      <style>{`
        .rq-intro-scrim{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;
          background:radial-gradient(120% 120% at 50% 0%, #0f3b30 0%, #071c17 70%);}
        .rq-intro{width:min(520px,100%);text-align:center;background:rgba(8,24,20,.72);
          border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:clamp(26px,5vw,44px);
          box-shadow:0 24px 70px rgba(0,0,0,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#eafaf4}
        .rq-intro__logos{display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:22px}
        .rq-intro__logos img{height:56px;width:auto;display:block}
        .rq-intro__x{font-size:22px;opacity:.5;font-weight:300}
        .rq-intro h1{margin:0 0 12px;font-size:clamp(20px,3.4vw,26px);font-weight:700;line-height:1.2}
        .rq-intro p{margin:0 auto;max-width:42ch;font-size:15px;line-height:1.6;opacity:.9}
        .rq-intro__enter{margin-top:26px;width:100%;padding:15px;border:0;border-radius:999px;cursor:pointer;
          background:#2FD6B0;color:#06231b;font:700 16px/1 inherit;letter-spacing:.01em}
        .rq-intro__enter:hover{filter:brightness(1.06)}
        .rq-intro__back{display:inline-block;margin-top:16px;color:#bfe9dc;text-decoration:none;font-size:14px}
        .rq-intro__back:hover{color:#2FD6B0}
      `}</style>
      <div className="rq-intro-scrim">
        <div className="rq-intro" role="dialog" aria-modal="true" aria-label={t('intro.title')}>
          <div className="rq-intro__logos">
            <img src="/images/logowhite.png" alt="Hashim Motabagani" />
            <span className="rq-intro__x" aria-hidden="true">×</span>
            <img src={rafeeqMark} alt="Rafeeq" />
          </div>
          <h1>{t('intro.title')}</h1>
          <p>{t('intro.body')}</p>
          <button type="button" className="rq-intro__enter" onClick={onEnter}>{t('intro.cta')}</button>
          <div><a className="rq-intro__back" href={`/${lang}`}>{t('intro.back')}</a></div>
        </div>
      </div>
    </div>
  );
}

function RafeeqGate() {
  const [ack, setAck] = useState(() => {
    try { return sessionStorage.getItem('rafeeqIntroAck') === '1'; } catch { return false; }
  });
  if (!ack) {
    return <RafeeqIntro onEnter={() => {
      try { sessionStorage.setItem('rafeeqIntroAck', '1'); } catch { /* ignore */ }
      setAck(true);
    }} />;
  }
  return <Router />;
}

export default function RafeeqApp() {
  return (
    <RafeeqProvider>
      <RafeeqGate />
    </RafeeqProvider>
  );
}

/* Route helpers so pages never hardcode a hash string. */
export const rafeeqPath = (lang, page = '') => `/${lang}/rafeeq${page ? '/' + page : ''}`;
export const PHASE_PAGE = { p1: 'preparation', pa: 'academic', p2: 'visa', p3: 'arrival' };
