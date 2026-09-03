import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtnRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll(); // set correct state if the page loads already scrolled
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { lang, t, switchLang } = useLanguage();
  const ar = lang === 'ar';

  const closeMenu = () => setIsOpen(false);
  // Close and return focus to the toggle (used by Escape / backdrop, where focus
  // would otherwise be lost; nav-link clicks navigate and focus <main> instead).
  const closeAndRefocus = () => { setIsOpen(false); menuBtnRef.current?.focus(); };
  const toggleLang = () => switchLang(ar ? 'en' : 'ar');
  const link = (section) => `#/${lang}/${section}`;

  // Which primary-nav section is active, for aria-current="page".
  const route = typeof window !== 'undefined' ? window.location.hash : '';
  const isActive = (section) => new RegExp(`^#/(en|ar)/${section}(?:[/?]|$)`).test(route);
  const current = (section) => (isActive(section) ? 'page' : undefined);

  // Lock body scroll + support Escape while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) {
      const onKey = (e) => { if (e.key === 'Escape') closeAndRefocus(); };
      document.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <a href={`#/${lang}`} className="mark" onClick={closeMenu}>
        <img src="images/logowhite.png" alt="" className="logo" />
        <span>{t.name}</span>
      </a>

      <div className="topbar-right">
        {/* aria-label gives the action in the page language; the visible text is the
            other language's script, so it carries its own lang. */}
        <button
          className="lang-switch"
          onClick={toggleLang}
          aria-label={ar ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
        >
          <span lang={ar ? 'en' : 'ar'}>{ar ? t.switcher.toEnglish : t.switcher.toArabic}</span>
        </button>

        <button
          ref={menuBtnRef}
          className="menu-toggle"
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? (ar ? 'أغلق القائمة' : 'Close menu') : (ar ? 'افتح القائمة' : 'Open menu')}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`nav-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={closeAndRefocus}
        aria-hidden="true"
      />

      <nav
        id="site-navigation"
        aria-label={ar ? 'التنقل الرئيسي' : 'Primary'}
        className={isOpen ? 'is-open' : ''}
      >
        <a href={`#/${lang}`} className="nav-mark" onClick={closeMenu}>
          <img src="images/logowhite.png" alt="" className="logo" />
          <span>{t.name}</span>
        </a>
        <div className="nav-links">
          <a href={link('coding')} onClick={closeMenu} aria-current={current('coding')}>{t.nav.coding}</a>
          <a href={link('economic-models')} onClick={closeMenu} aria-current={current('economic-models')}>{t.nav.economics}</a>
          <a href={link('graphic-design')} onClick={closeMenu} aria-current={current('graphic-design')}>{t.nav.design}</a>
          <a href={link('about')} onClick={closeMenu} aria-current={current('about')}>{t.nav.about}</a>
          <a href={link('contact')} onClick={closeMenu} aria-current={current('contact')}>{t.nav.contact}</a>
        </div>
      </nav>
    </header>
  );
}

export default TopBar;
