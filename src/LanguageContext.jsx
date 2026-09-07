// Language context — gives every component the current language and a way to
// switch it. Language lives in the URL PATH now (/en/…, /ar/…), no hash. Default
// (no prefix, e.g. "/") is English.

import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';
import { navigate } from './lib/router';

const LanguageContext = createContext();

function getLangFromPath() {
  return /^\/ar(\/|$)/.test(window.location.pathname) ? 'ar' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getLangFromPath);

  // Re-read the language on any SPA navigation (navigate() dispatches popstate).
  useEffect(() => {
    const onNav = () => setLang(getLangFromPath());
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, []);

  // Reflect language on <html> so layout direction flips for Arabic.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const switchLang = (newLang) => {
    const { pathname, search } = window.location;
    let rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, ''); // keep the sub-path
    if (rest === '/') rest = '';
    navigate(`/${newLang}${rest}${search}`);
  };

  const value = { lang, t: translations[lang], switchLang };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
