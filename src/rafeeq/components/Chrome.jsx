// Shared chrome — topbar, drawer, return bar, toast, page container.
// EDIT THIS FILE to change something that should appear on every page.
// Pages render as children and know nothing about any of it.

import { useState, useEffect } from 'react';
import { Icon, IC } from '../ui/Icon.jsx';
import { Mark } from '../ui/Mark.jsx';
import { Confetti } from '../ui/atoms.jsx';
import { Loading } from '../ui/RafeeqDraw.jsx';
import { BRAND, CSS } from '../styles/index.js';
import { Drawer } from '../screens/Drawer.jsx';
import { DocumentModal } from '../screens/Files.jsx';
import { useRafeeq } from '../RafeeqContext.jsx';

export default function Chrome({ bare = false, children }) {
  const {
    t, lang, setLang, theme, setTheme, user, signedIn,
    signOut, resetDemo, toastMsg, confetti, openDoc, setOpenDoc, busy,
  } = useRafeeq();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);

  /* Close the avatar menu on any click outside it. */
  useEffect(() => {
    if (!menu) return;
    const away = (e) => { if (!e.target.closest || !e.target.closest('.rq-who')) setMenu(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [menu]);
  const go = (page) => { window.location.hash = `#/${lang}/rafeeq${page ? '/' + page : ''}`; };

  return (
    <div className="rafeeq" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} data-theme={theme}>
      <style>{CSS}</style>

      {!bare && signedIn && (
        <header className="rq-topbar">
          {/* Logo first in DOM order: `start` is left in LTR, right in RTL. */}
          <div className="rq-logo">
            <Mark size={38} theme={theme} />
            <div className="wm">{t('brand.name')}</div>
          </div>
          <div className="rq-who">
            <button type="button" className="rq-avatar" aria-haspopup="menu" aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}>
              {user.first[lang][0]}
            </button>
            <div className="nm">{user.name[lang]}<small>{user.university[lang]}</small></div>
            {menu && (
              <div className="rq-usermenu" role="menu">
                <button type="button" className="rq-ditem" onClick={() => { go('profile'); setMenu(false); }}>
                  <Icon d={IC.user} />{t('profile.title')}
                </button>
                <div className="rq-usermenu-sep" />
                <button type="button" className="rq-ditem" style={{ color: 'var(--red)' }}
                  onClick={() => { setMenu(false); signOut(); }}>
                  <Icon d={IC.out} />{t('chrome.signout')}
                </button>
              </div>
            )}
          </div>
          <button type="button" className="rq-burger" onClick={() => setDrawer(true)} aria-label={t('chrome.menu')}>
            <Icon d={IC.menu} />
          </button>
        </header>
      )}

      {/* Always a <main> landmark; auth (bare) screens lay out full-bleed so they
          skip the container's constraints but still get the landmark + focus target. */}
      <main id="main-content" tabIndex={-1} className={bare ? 'rq-authmain' : 'rq-content'}>{children}</main>

      {drawer && (
        <Drawer
          t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
          onClose={() => setDrawer(false)}
          onHome={() => { go(''); setDrawer(false); }}
          onFiles={() => { go('files'); setDrawer(false); }}
          onRequests={() => { go('requests'); setDrawer(false); }}
          onReset={() => { resetDemo(); setDrawer(false); }}
        />
      )}

      {/* One waiting state for the whole app. */}
      {busy && (
        <div className="rq-busy" role="status" aria-live="polite">
          <Loading theme={theme} label={busy.label} size={124} />
        </div>
      )}

      {openDoc && <DocumentModal t={t} lang={lang} doc={openDoc} user={user} onClose={() => setOpenDoc(null)} />}
      {confetti && <Confetti />}

      <a className="rq-return" href={`#/${lang}`} onClick={signOut}
        aria-label={lang === 'ar' ? 'العودة لباقي الأعمال' : 'Return to portfolio'}>
        <img src={BRAND.returnMark} alt="" />
        <span className="rq-return-txt">
          {lang === 'ar' ? 'العودة لباقي الأعمال' : 'Return to portfolio'}
        </span>
      </a>

      <div className={'rq-toast' + (toastMsg ? ' show' : '')} role="status">{toastMsg}</div>
    </div>
  );
}
