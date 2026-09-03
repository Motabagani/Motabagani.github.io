import { useState } from 'react';
import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import { CATS, findBySlug } from '../data/journey';
import MujocoViewer from '../components/MujocoViewer';
import MujocoControl from '../components/MujocoControl';
import { crumbFrom, getFrom } from '../lib/nav';
import Error404 from './Error404';

/* JourneyDetail — a full page for one timeline entry (linked from the About
   timeline's "Read more"). Content comes from src/data/journey.js: the entry's
   `more` block (body, photos, links). Add photos by dropping files in
   public/images/ and listing them under that entry's `more.photos`. */

const CSS = `
.jd { max-width: 820px; margin: 8px auto 0; text-align: start; }
/* Full-bleed brand hero band (logo centred on the entry's brand gradient),
   extended to the viewport edges out of the centred column. */
.jd__hero {
  position: relative; z-index: 1;   /* paint the opaque band above the fixed naqsh (z-index 0) */
  margin-block: 0 30px;
  margin-inline: calc(50% - 50vw);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(44px, 8vw, 84px) clamp(20px, 5vw, 48px);
  min-height: clamp(170px, 24vw, 250px);
}
.jd__hero-mark { height: clamp(70px, 12vw, 120px); width: auto; display: block; }
.jd__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 0 0 8px; }
.jd__date { font-size: 13px; font-weight: 600; letter-spacing: .02em; color: var(--muted); font-variant-numeric: tabular-nums; }
.jd__tag {
  font-size: 11.5px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
  color: var(--dot); padding: 3px 10px; border-radius: var(--r-pill);
  background: color-mix(in srgb, var(--dot) 15%, transparent);
}
.jd__title { margin: 0; font-size: clamp(26px, 4.4vw, 40px); font-weight: 700; letter-spacing: -.01em; color: var(--ink); line-height: 1.15; }
.jd__org { margin: 8px 0 0; font-size: 17px; color: var(--accent); }
.jd__sim { margin: 30px 0 0; }
.jd__sim-toggle { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; }
.jd__sim-toggle button { padding: 7px 15px; border-radius: var(--r-pill); background: var(--surface-1); border: 1px solid var(--divider); color: var(--muted); font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: color .15s ease, border-color .15s ease, background .15s ease; }
.jd__sim-toggle button.is-active { color: var(--accent); border-color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
.jd__sim-cap { margin: 12px 0 0; font-size: 13px; color: var(--muted); }
.jd__poster { margin: 30px 0 0; }
.jd__poster a { display: block; }
.jd__poster img { width: 100%; height: auto; display: block; border-radius: 14px; border: 1px solid var(--divider); background: var(--surface-1); box-shadow: 0 10px 30px rgba(0,0,0,0.28); transition: transform .18s ease; }
.jd__poster a:hover img { transform: translateY(-2px); }
.jd__poster figcaption { margin: 10px 2px 0; font-size: 13px; color: var(--muted); display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
.jd__poster figcaption a { color: var(--accent); text-decoration: none; font-weight: 600; }
.jd__poster figcaption a:hover { text-decoration: underline; text-underline-offset: 3px; }
.jd__body { margin: 22px 0 0; font-size: 16.5px; line-height: 1.7; color: var(--ink); opacity: .92; max-width: 68ch; }

/* Photos keep their natural aspect ratio (no cropping/stretching); each is
   capped so a tall image can't dominate. */
.jd__photos { margin: 30px 0 0; display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-start; }
.jd__photos img {
  max-width: 100%; max-height: 460px; width: auto; height: auto; display: block;
  border-radius: 16px; border: 1px solid var(--divider); background: var(--surface-1);
}

.jd__links { margin: 28px 0 0; display: flex; flex-wrap: wrap; gap: 10px; }
.jd__links a {
  display: inline-flex; align-items: center; padding: 10px 18px; border-radius: var(--r-pill);
  background: var(--surface-1); border: 1px solid var(--divider); color: var(--accent);
  font-weight: 600; font-size: 14.5px; text-decoration: none; transition: background .15s ease, border-color .15s ease;
}
.jd__links a:hover { background: var(--surface-2); border-color: var(--accent); }

.jd__back { margin: 34px 0 0; }
.jd__back a { color: var(--accent); text-decoration: none; font-weight: 600; }
.jd__back a:hover { text-decoration: underline; text-underline-offset: 3px; }
`;

function JourneyDetail({ slug }) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const it = findBySlug(slug);
  const [simIdx, setSimIdx] = useState(0);
  const parent = crumbFrom('about'); // breadcrumb parent — About, unless linked from another section

  // Unknown slug → show the real 404 page rather than an inline "not found".
  if (!it) return <Error404 />;

  const backLabel = isEn ? '← Back to my journey' : 'العودة إلى رحلتي ←';

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb">
          <a href={`#/${lang}`}>{isEn ? 'Home' : 'الرئيسية'}</a>
          {parent && <>&nbsp;/&nbsp; <a href={`#/${lang}/${parent.path}`}>{isEn ? parent.en : parent.ar}</a></>}
          {it && <>&nbsp;/&nbsp; {isEn ? it.title.en : it.title.ar}</>}
          <img src="images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <div className="jd">
          <style>{CSS}</style>

          {!it ? (
            <>
              <h1 className="jd__title">{isEn ? 'Entry not found' : 'الصفحة غير موجودة'}</h1>
              <p className="jd__body">{isEn ? 'This journey entry doesn’t exist.' : 'لا توجد هذه الصفحة في رحلتي.'}</p>
              {!getFrom() && <p className="jd__back"><a href={`#/${lang}/about`}>{backLabel}</a></p>}
            </>
          ) : (() => {
            const c = CATS[it.cat];
            const m = it.more || {};
            return (
              <div style={{ '--dot': c.color }}>
                {it.hero && (
                  <div className="jd__hero" style={{ background: it.hero.bg }}>
                    <img src={it.hero.img} alt="" className="jd__hero-mark" />
                  </div>
                )}
                <div className="jd__meta">
                  <span className="jd__date">{isEn ? it.date.en : it.date.ar}</span>
                  <span className="jd__tag">{isEn ? c.en : c.ar}</span>
                </div>
                <h1 className="jd__title">{isEn ? it.title.en : it.title.ar}</h1>
                <p className="jd__org">{isEn ? it.org.en : it.org.ar}</p>

                {m.body && <p className="jd__body">{isEn ? m.body.en : m.body.ar}</p>}

                {m.sim && m.sim.length > 0 && (
                  <div className="jd__sim">
                    {m.sim.length > 1 && (
                      <div className="jd__sim-toggle">
                        {m.sim.map((s, j) => (
                          <button key={j} type="button" className={j === simIdx ? 'is-active' : ''} onClick={() => setSimIdx(j)}>
                            {isEn ? s.label.en : s.label.ar}
                          </button>
                        ))}
                      </div>
                    )}
                    {m.sim[simIdx].kind === 'control' ? (
                      <MujocoControl
                        key={m.sim[simIdx].src}
                        src={m.sim[simIdx].src}
                        height={480}
                        labels={{
                          arm: isEn ? 'Arm' : 'ذراع',
                          reset: isEn ? 'Reset' : 'إعادة',
                          hint: isEn ? 'drag to orbit · scroll to zoom' : 'اسحب للدوران · مرّر للتكبير',
                          loading: isEn ? 'Loading model…' : 'جارٍ تحميل النموذج…',
                          errorMsg: isEn ? 'Couldn’t load the model.' : 'تعذّر تحميل النموذج.',
                        }}
                      />
                    ) : (
                      <MujocoViewer key={m.sim[simIdx].src} src={m.sim[simIdx].src} height={480} />
                    )}
                    <p className="jd__sim-cap">
                      {m.sim[simIdx].kind === 'control'
                        ? (isEn
                          ? 'The real MuJoCo DeltaZ, running in your browser — move the sliders to drive each of the 3 arms; drag to orbit, scroll to zoom.'
                          : 'روبوت DeltaZ الحقيقي من MuJoCo يعمل في متصفحك — حرّك المؤشرات للتحكم في كل ذراع من الأذرع الثلاثة؛ اسحب للدوران، ومرّر للتكبير.')
                        : (isEn
                          ? 'Recorded playback of the soft-body model — drag to orbit, scroll to zoom.'
                          : 'تشغيل مسجَّل للنموذج المرن — اسحب للدوران، ومرّر للتكبير.')}
                    </p>
                  </div>
                )}

                {m.poster && (
                  <figure className="jd__poster">
                    <a href={m.poster.src} target="_blank" rel="noopener noreferrer">
                      <img src={m.poster.src} alt={isEn ? m.poster.alt.en : m.poster.alt.ar} />
                    </a>
                    <figcaption>
                      {isEn ? m.poster.caption.en : m.poster.caption.ar}
                      <a href={m.poster.src} target="_blank" rel="noopener noreferrer">
                        {isEn ? 'Open full size ↗' : 'فتح بالحجم الكامل ↗'}
                      </a>
                    </figcaption>
                  </figure>
                )}

                {it.to && (
                  <div className="jd__links">
                    <a href={`#/${lang}/${it.to}?from=about`}>
                      {isEn ? 'View the full case study' : 'عرض دراسة الحالة الكاملة'}<span aria-hidden="true"> {isEn ? '→' : '←'}</span>
                    </a>
                  </div>
                )}

                {m.photos && m.photos.length > 0 && (
                  <div className="jd__photos">
                    {m.photos.map((p, j) => (
                      <img key={j} src={p.src} alt={p.alt ? (isEn ? p.alt.en : p.alt.ar) : ''} />
                    ))}
                  </div>
                )}

                {m.links && m.links.length > 0 && (
                  <div className="jd__links">
                    {m.links.map((l, j) => (
                      <a key={j} href={l.href} target="_blank" rel="noopener noreferrer">
                        {isEn ? l.label.en : l.label.ar}<span aria-hidden="true"> ↗</span>
                      </a>
                    ))}
                  </div>
                )}

                {!getFrom() && <p className="jd__back"><a href={`#/${lang}/about`}>{backLabel}</a></p>}
              </div>
            );
          })()}
        </div>
      </main>
    </>
  );
}

export default JourneyDetail;
