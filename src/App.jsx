import { useState, useEffect, useRef } from 'react';
import { LanguageProvider } from './LanguageContext';
import { navigate } from './lib/router';
import Home from './pages/Home';
import CodingPage from './pages/CodingPage';
import AboutPage from './pages/AboutPage';
import JourneyDetail from './pages/JourneyDetail';
import PhotoPage from './pages/PhotoPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import FaqPage from './pages/FaqPage';
import CourseRegistrationProject from './pages/CourseRegistrationProject';
import RafeeqProject from './pages/RafeeqProject';
import SSAUCSDProject from './pages/SSAUCSDProject';
import EconomicModelsPage from './pages/EconomicModelsPage';
import GraphicDesignPage from './pages/GraphicDesignPage';
import Error404 from './pages/Error404';
import Error403 from './pages/Error403';
import Footer from './components/Footer';
import HaaGreeter from './components/HaaGreeter';
import ExternalLinkGuard from './components/ExternalLinkGuard';
import RafeeqApp from './rafeeq/App.jsx';
import './App.css';

function App() {
  const [route, setRoute] = useState(window.location.pathname);

  // Re-read the path on SPA navigation (navigate() dispatches popstate), and
  // intercept internal <a> clicks so they navigate without a full page reload.
  useEffect(() => {
    const onNav = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onNav);

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return; // internal paths only
      const target = a.getAttribute('target');
      if ((target && target !== '_self') || a.hasAttribute('download')) return;
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('popstate', onNav);
      document.removeEventListener('click', onClick);
    };
  }, []);

  // Path with the language prefix stripped, e.g. '/en/journey/x' -> '/journey/x'.
  const routeWithoutLang = route.replace(/^\/(en|ar)(?=\/|$)/, '').replace(/\/$/, '');
  const lang = /^\/ar(\/|$)/.test(route) ? 'ar' : 'en';

  // On SPA route changes: scroll to top and move focus to <main> so screen readers
  // announce that new content loaded. Skip the very first mount (don't steal focus).
  const firstRouteRef = useRef(true);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRouteRef.current) { firstRouteRef.current = false; return; }
    const main = document.getElementById('main-content');
    if (main) main.focus({ preventScroll: true });
  }, [routeWithoutLang]);

  // Per-page browser tab title (bilingual), all under the same brand.
  useEffect(() => {
    const r = routeWithoutLang.replace(/\/$/, '');
    const NAMES = lang === 'ar'
      ? {
          '/coding': 'البرمجة', '/economic-models': 'النماذج الاقتصادية',
          '/graphic-design': 'التصميم الجرافيكي', '/about': 'عني', '/contact': 'تواصل',
          '/projects/rafeeq': 'رفيق', '/rafeeq': 'رفيق',
          '/projects/course-registration': 'نظام تسجيل المقررات',
          '/projects/ssa-ucsd': 'النادي السعودي في UCSD',
          '/journey': 'رحلتي', '/story': 'صورة', '/legal/privacy': 'سياسة الخصوصية',
          '/faq': 'الأسئلة الشائعة', '/403': 'الوصول مرفوض',
        }
      : {
          '/coding': 'Coding', '/economic-models': 'Economic Models',
          '/graphic-design': 'Graphic Design', '/about': 'About', '/contact': 'Contact',
          '/projects/rafeeq': 'Rafeeq', '/rafeeq': 'Rafeeq',
          '/projects/course-registration': 'Course Registration System',
          '/projects/ssa-ucsd': 'SSA at UC San Diego',
          '/journey': 'My Journey', '/story': 'Photo', '/legal/privacy': 'Privacy Policy',
          '/faq': 'FAQ', '/403': 'Access Denied',
        };
    const brand = lang === 'ar' ? 'هاشم مطبقاني' : 'Hashim Motabagani';
    const key = Object.keys(NAMES).find((k) => r === k || r.startsWith(k + '/'));
    if (!r || r === '/') {
      document.title = lang === 'ar' ? 'هاشم مطبقاني — أعمالي' : 'Hashim Motabagani — Portfolio';
    } else if (key) {
      document.title = `${NAMES[key]} · ${brand}`;
    } else {
      document.title = lang === 'ar' ? `غير موجود · ${brand}` : `Not Found · ${brand}`;
    }

    // Per-route canonical URL so /, /en, and deep links don't read as duplicates.
    const path = window.location.pathname.replace(/\/$/, '');
    const canonical = `https://motabagani.com${path || '/en'}`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.setAttribute('href', canonical);
  }, [routeWithoutLang, lang]);

  if (routeWithoutLang.startsWith('/rafeeq')) {
  return <RafeeqApp />;
}

  let page;
  // Project case studies
  if (routeWithoutLang.startsWith('/projects/course-registration')) {
    page = <CourseRegistrationProject />;
  } else if (routeWithoutLang.startsWith('/projects/rafeeq')) {
    page = <RafeeqProject />;
  } else if (routeWithoutLang.startsWith('/projects/ssa-ucsd')) {
    page = <SSAUCSDProject />;
  // Section pages
  } else if (routeWithoutLang.startsWith('/coding')) {
    page = <CodingPage />;
  } else if (routeWithoutLang.startsWith('/journey/')) {
    const slug = routeWithoutLang.replace('/journey/', '').replace(/\/$/, '');
    page = <JourneyDetail slug={slug} />;
  } else if (routeWithoutLang.startsWith('/story/')) {
    const slug = routeWithoutLang.replace('/story/', '').replace(/\/$/, '');
    page = <PhotoPage slug={slug} />;
  } else if (routeWithoutLang.startsWith('/about')) {
    page = <AboutPage />;
  } else if (routeWithoutLang.startsWith('/economic-models')) {
    page = <EconomicModelsPage />;
  } else if (routeWithoutLang.startsWith('/graphic-design')) {
    page = <GraphicDesignPage />;
  } else if (routeWithoutLang.startsWith('/contact')) {
    page = <ContactPage />;
  } else if (routeWithoutLang.startsWith('/faq')) {
    page = <FaqPage />;
  // Legal pages
  } else if (routeWithoutLang.startsWith('/legal/privacy')) {
    page = <LegalPage which="privacy" />;

  // Access denied (server 403 forwards here via ErrorDocument)
  } else if (routeWithoutLang.startsWith('/403')) {
    page = <Error403 />;


  // Home
  } else if (routeWithoutLang === '' || routeWithoutLang === '/') {
    page = <Home />;
  
  
  } else {
    page = <Error404 />;
  }

  return (
    <LanguageProvider>
      {/* Hidden off-screen; appears only when a keyboard user Tabs to it. Focuses
          <main> directly instead of changing the hash (which would confuse the router). */}
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const m = document.getElementById('main-content');
          if (m) { m.focus(); m.scrollIntoView({ block: 'start' }); }
        }}
      >
        {lang === 'ar' ? 'تخطَّ إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      {page}
      <Footer />
      <HaaGreeter />
      <ExternalLinkGuard />
    </LanguageProvider>
  );
}

export default App;
