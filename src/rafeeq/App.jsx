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
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // '#/en/rafeeq/visa' -> '/visa'
  const sub = route.replace(/^#\/(en|ar)\/rafeeq/, '');

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

export default function RafeeqApp() {
  return (
    <RafeeqProvider>
      <Router />
    </RafeeqProvider>
  );
}

/* Route helpers so pages never hardcode a hash string. */
export const rafeeqPath = (lang, page = '') => `#/${lang}/rafeeq${page ? '/' + page : ''}`;
export const PHASE_PAGE = { p1: 'preparation', pa: 'academic', p2: 'visa', p3: 'arrival' };
