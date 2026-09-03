// Language context — gives every component access to the current language
// and a function to switch it. Uses URL hash (#/en or #/ar) for persistence.

import { createContext, useContext, useEffect, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

// Read the language from the URL hash. Defaults to English.
function getLangFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#/ar')) return 'ar';
  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getLangFromHash);

  // Listen for hash changes so back/forward buttons work
  useEffect(() => {
    const onHashChange = () => setLang(getLangFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Whenever language changes, update the <html> tag's dir and lang attributes.
  // This is what tells the browser to flip layout direction for Arabic.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const switchLang = (newLang) => {
    // Update the URL hash to reflect the new language
    const currentRoute = window.location.hash.replace(/^#\/(en|ar)/, '');
    window.location.hash = `#/${newLang}${currentRoute}`;
  };

  // `t` is the translations object for the current language — easy access in components
  const value = {
    lang,
    t: translations[lang],
    switchLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook so components can just write: const { lang, t, switchLang } = useLanguage();
export function useLanguage() {
  return useContext(LanguageContext);
}
