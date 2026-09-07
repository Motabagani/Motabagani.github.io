import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import { privacyPolicy } from '../data/privacyPolicy';

/* Legal pages. Privacy renders the full policy from src/data/privacyPolicy.js;
   the `which` prop currently only expects 'privacy' (terms/cookies removed). */

// Parse markdown [label](url) into <a> elements; leave the rest as plain text.
function linkify(text) {
  const parts = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const href = m[2];
    const ext = /^https?:/.test(href);
    parts.push(
      <a key={i++} href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>{m[1]}</a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function LegalPage({ which }) {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const title = t.legal[which];
  const pp = which === 'privacy' ? privacyPolicy[ar ? 'ar' : 'en'] : null;

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp; {t.legal.heading}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <header className="project-header container">
          <h1>{title}</h1>
          {pp && <p className="deck">{pp.effective}</p>}
        </header>

        <section
          className="container legal-body"
          style={{ paddingBlock: '20px 100px', maxWidth: 820, margin: '0 auto', textAlign: 'start' }}
        >
          {pp ? (
            <>
              <style>{`
                .legal-body p { color: var(--ink); opacity: .9; line-height: 1.75; margin: 0 0 14px; font-size: 15.5px; }
                .legal-body h2 { color: var(--ink); font-size: 20px; font-weight: 700; margin: 34px 0 10px; }
                .legal-body h3 { color: var(--accent); font-size: 16px; margin: 18px 0 6px; }
                .legal-body ul { margin: 0 0 14px; padding-inline-start: 22px; color: var(--ink); opacity: .9; line-height: 1.75; font-size: 15.5px; }
                .legal-body li { margin: 0 0 5px; }
                .legal-body a { color: var(--accent); text-decoration: none; }
                .legal-body a:hover { text-decoration: underline; text-underline-offset: 3px; }
              `}</style>
              <p>{pp.intro}</p>
              {pp.sections.map((s, si) => (
                <div key={si}>
                  <h2>{s.h}</h2>
                  {s.blocks.map((b, bi) => {
                    if (b.t === 'sub') return <h3 key={bi}>{b.c}</h3>;
                    if (b.t === 'ul') {
                      return (
                        <ul key={bi}>
                          {b.c.map((li, li2) => <li key={li2}>{linkify(li)}</li>)}
                        </ul>
                      );
                    }
                    return <p key={bi}>{linkify(b.c)}</p>;
                  })}
                </div>
              ))}
            </>
          ) : (
            <p style={{ color: 'var(--muted)' }}>
              {ar ? 'سيتم إضافة النص الكامل قريباً.' : 'Full text will be added here soon.'}
            </p>
          )}
        </section>
      </main>
    </>
  );
}

export default LegalPage;
