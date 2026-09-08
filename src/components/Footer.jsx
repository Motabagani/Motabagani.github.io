import { useLanguage } from '../LanguageContext';

function Footer() {
  const { lang, t } = useLanguage();
  const year = new Date().getFullYear().toLocaleString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { useGrouping: false }
  );
  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  

  return (
    
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          {/* Brand block */}
          <div className="site-footer__brand">
            <a href={`/${lang}`} className="site-footer__mark">
  <span className="site-footer__wordmark">
    <span className="site-footer__name-en">Hashim Motabagani</span>
    <span className="site-footer__name-ar">هــــاشـم مــطـبـقــاني</span>
  </span>
  <img src="/images/logowhite.png" alt="" className="site-footer__logo" />
</a>
            <p className="site-footer__tagline">
              {lang === 'en'
                ? 'Software, economics, and graphic design.'
                : 'برمجيات، واقتصاد، وتصميم جرافيكي.'}
            </p>
            <p className="site-footer__locale">
              {lang === 'en' ? 'Riyadh ⁄ New York' : 'الرياض ⁄ نيويورك'}
            </p>
          </div>

          {/* Link columns */}
          <nav className="site-footer__cols" aria-label={lang === 'ar' ? 'روابط التذييل' : 'Footer'}>
            <div className="site-footer__col">
              <h2 className="site-footer__heading">{lang === 'en' ? 'Explore' : 'استكشف'}</h2>
              <a href={`/${lang}/coding`}>{t.nav.coding}</a>
              <a href={`/${lang}/economic-models`}>{t.nav.economics}</a>
              <a href={`/${lang}/graphic-design`}>{t.nav.design}</a>
              <a href={`/${lang}/about`}>{t.nav.about}</a>
              <a href={`/${lang}/faq`}>{lang === 'en' ? 'FAQ' : 'الأسئلة الشائعة'}</a>
            </div>

            <div className="site-footer__col">
              <h2 className="site-footer__heading">{t.legal.heading}</h2>
              <a href={`/${lang}/legal/privacy`}>{t.legal.privacy}</a>
            </div>

            <div className="site-footer__col">
  <h2 className="site-footer__heading">{lang === 'en' ? 'Elsewhere' : 'روابط'}</h2>
  <a href="https://github.com/Motabagani" target="_blank" rel="noreferrer" className="latin">GitHub</a>
  <a href="https://www.linkedin.com/in/almutabaganih/" target="_blank" rel="noreferrer" className="latin">LinkedIn</a>
  <a href="mailto:info@motabagani.com" className="latin">Email</a>
</div>
          </nav>
        </div>

        {/* Legal / bottom bar */}
        <div className="site-footer__bottom">
          <span>© {year} {t.name}</span>
          <span>{lang === 'en' ? '' : ''}</span>
          <a href="#top" className="site-footer__top-link" onClick={toTop}>
            {lang === 'en' ? 'Back to top ↑' : 'العودة للأعلى ↑'}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;