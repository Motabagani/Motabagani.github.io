import { useLayoutEffect, useRef, useState } from 'react';
import TopBar from '../components/TopBar';
import ProjectCard from '../components/ProjectCard';
import { useLanguage } from '../LanguageContext';
import { codingProjects } from '../data/codingProjects';
import ComingSoon from '../components/ComingSoon';
// NOTE: SubwayDestinationSign (src/components/SubwayDestinationSign.jsx/.css) is
// intentionally kept in the codebase for possible later reuse, but is not
// currently rendered on the homepage.

// Play the "hala" hero intro only once per language per page load. Toggling the
// language (or navigating home again) re-renders Home, and replaying the slide +
// delayed subtitle each time felt like lag — so after a language's first play we
// render its hero in the final resting state instantly (class `is-static`).
const halaIntroPlayed = { en: false, ar: false };

// Per-language hero config. English reads LTR: the word sits on the right of the
// wide artwork (center ~79%), streak trailing left, so it slides in from the left
// edge. Arabic reads RTL: the word sits on the left (center ~19%), streak trailing
// right, so it mirrors — slides in from the right edge.
const HALA = {
  en: {
    img: 'images/hala smu.png',
    // Start viewport-relative (not a % of the image), so the whole artwork is
    // guaranteed fully past the left edge at ANY width — even wide screens where
    // the height clamps and a fixed % would leave a sliver peeking.
    rest: '-79%', start: 'calc(-50vw - 115%)',
    alt: 'hala',
    sub: 'I’m Hashim, I write code, design graphics, and build economic models',
    cta: 'See my work',
  },
  ar: {
    img: 'images/hala ar xl.png',
    rest: '-19%', start: 'calc(50vw + 15%)',   // fully past the right edge, any width
    alt: 'هلا',
    sub: 'أنا هاشم، أبرمج، وأصمّم الجرافيك، وأبني النماذج الاقتصادية',
    cta: 'شوف أعمالي',
  },
};

// Ambient tokens that stream along the streak once the word settles — glowing
// binary digits, $ and ﷼ (riyal), plus a few faint paint-streak dashes. They
// emerge from behind the word and trail outward along the streak, opposite the
// word's entry (off the left edge for English, off the right for Arabic).
// Deterministic layout so positions don't jump on re-render; negative delays
// pre-distribute them along the path. `stroke: true` renders a dash, not a glyph.
const RIYAL = 'images/ريال.png';
// `band` (0..1) is the token's vertical position WITHIN the streak band, mapped to
// the real band per language (English fills the height; Arabic's streak is only the
// lower ~38–92%, so tokens must stay there or they float in the empty dark above).
// `delay` is the token's stagger AFTER the FX start cue (added in render). Spread
// so the stream builds up gradually — sparse at first, filling in over ~9s — rather
// than all appearing together.
const HALA_FX = [
  { g: '10110',  band: 0.06, size: 0.55, o: 0.40, d: 14, delay: 0.0 },
  { g: '$',      band: 0.74, size: 0.80, o: 0.45, d: 15, delay: 0.9 },
  { img: RIYAL,  band: 0.30, size: 0.70, o: 0.50, d: 13, delay: 1.9 },
  { g: '011',    band: 0.34, size: 0.50, o: 0.38, d: 12, delay: 2.8 },
  { g: '1001',   band: 0.60, size: 0.55, o: 0.42, d: 13, delay: 3.7 },
  { img: RIYAL,  band: 0.48, size: 0.95, o: 0.55, d: 16, delay: 4.6 },
  { g: '0110',   band: 0.88, size: 0.50, o: 0.40, d: 11, delay: 5.4 },
  { g: '$',      band: 0.20, size: 0.95, o: 0.50, d: 17, delay: 6.2 },
  { g: '01101',  band: 0.66, size: 0.55, o: 0.40, d: 14, delay: 7.0 },
  { img: RIYAL,  band: 0.13, size: 0.75, o: 0.50, d: 18, delay: 7.8 },
  { g: '$',      band: 0.94, size: 0.70, o: 0.40, d: 16, delay: 8.6 },
  { stroke: true, band: 0.25, size: 1, o: 0.50, d: 9,  delay: 1.4 },
  { stroke: true, band: 0.55, size: 1, o: 0.45, d: 11, delay: 4.1 },
  { stroke: true, band: 0.80, size: 1, o: 0.50, d: 8,  delay: 6.6 },
];
// Streak band (top %) each token rides, per language. Kept inset from the stage's
// top/bottom clip edges (and out of the slanted word's dark corners) so no token
// gets half-clipped or strays off the streak — the word is italic/tilted.
const HALA_FX_BAND = { en: [17, 80], ar: [43, 87] };

function Home() {
  const { t, lang } = useLanguage();

  // Decide once per language whether to play the intro, and mark that language as
  // played. Guarded by a lang-ref so it stays STABLE across re-renders (e.g. when
  // heroReady flips) — otherwise a re-render would recompute it to false and cancel
  // the animation. (Also StrictMode-safe: the guard skips the double invocation.)
  const introLangRef = useRef(null);
  const playIntroRef = useRef(false);
  if (introLangRef.current !== lang) {
    introLangRef.current = lang;
    playIntroRef.current = !halaIntroPlayed[lang];
    halaIntroPlayed[lang] = true;
  }
  const playHalaIntro = playIntroRef.current;

  // Hold the intro until the (large) hero artwork is decoded — otherwise its very
  // first, uncached load janks the slide. Cached loads are ready before first paint
  // (useLayoutEffect + the img's `complete` flag), so there's no delay on revisits.
  const heroImgRef = useRef(null);
  const [heroReady, setHeroReady] = useState(false);
  useLayoutEffect(() => {
    const el = heroImgRef.current;
    setHeroReady(!!(el && el.complete && el.naturalWidth > 0));
  }, [lang]);

  const pick = (v) => (v && typeof v === 'object' && 'en' in v ? v[lang] : v);

  const hala = HALA[lang];
  const fxBand = HALA_FX_BAND[lang];
  // When the token stream begins: after the word + subtitle on first load, almost
  // immediately on a language toggle. Each token staggers from here.
  const fxBase = playHalaIntro ? 2.6 : 0.2;

  return (
    <>
      <TopBar />

      <main id="main-content" tabIndex={-1}>
        <section className={`hero container hero--hala${lang === 'ar' ? ' hero--hala-ar' : ''}${!playHalaIntro ? ' is-static' : ''}${heroReady ? ' is-ready' : ''}`}>
          <img src="images/naqsh.png" alt="" className="hero-naqsh" />
          <style>{`
            .hero--hala { text-align: center; overflow: visible; }
            /* One baked artwork: the "hala" handwriting with its purple sonic-speed
               streak. It slides in from the page edge, decelerates, and rests with
               the WORD centered on screen and the streak sweeping off past one edge.
               --rest pulls the word's center (which sits off-center in the wide
               image) onto screen center; --start throws it off past the edge to
               begin. Values differ per language (LTR vs RTL mirror). */
            .hala-stage {
              /* Full-bleed to the viewport edges so the streak can run to the page
                 edge (the parent .container is narrower & centered, so we break out
                 of it and clip HERE, not on the hero). */
              position: relative; overflow: hidden;
              width: 100vw; margin: clamp(6px, 3vh, 34px) calc(50% - 50vw) 0;
              /* Height driven by viewport WIDTH (~15.5vw): at this size the
                 fixed-aspect artwork is wide enough that, with the word held at
                 screen center, the streak bleeds off the page edge at every width. */
              height: clamp(120px, 15.5vw, 330px);
            }
            /* Arabic strokes read lighter/narrower, so scale its word up a touch
               to match the English word's visual weight. */
            .hero--hala-ar .hala-stage { height: clamp(146px, 19vw, 400px); }
            .hala-smu {
              position: absolute; top: 0; left: 50%;
              height: 100%; width: auto; z-index: 2;   /* above the ambient tokens */
              transform: translateX(var(--rest));   /* word center -> screen center */
              opacity: 0;   /* revealed only once the artwork is decoded (is-ready) */
            }
            .hero--hala.is-ready .hala-smu { opacity: 1; }
            /* Keep the intro (subtitle + tokens) hidden until the artwork is ready
               so nothing flashes before the hero animation begins. */
            .hero--hala:not(.is-static):not(.is-ready) .hala-sub,
            .hero--hala:not(.is-static):not(.is-ready) .hala-cta { opacity: 0; }
            .hero--hala:not(.is-ready) .hala-fx { visibility: hidden; }
            /* Primary call-to-action under the intro — scrolls to the work below. */
            .hala-cta {
              margin: clamp(18px, 3.5vh, 34px) auto 0;
              display: inline-flex; align-items: center; gap: .5em;
              padding: .72em 1.5em; border: 0; border-radius: 999px; cursor: pointer;
              font-size: clamp(15px, 1.6vw, 18px); font-weight: 700; letter-spacing: .01em;
              /* Dark-purple text on the amber accent: ~8:1 contrast (white was ~2.1:1). */
              color: #20103D; background: var(--accent, #f5a05c);
              box-shadow: 0 8px 26px rgba(245, 160, 92, .34);
              transition: transform .16s ease, box-shadow .16s ease, filter .16s ease;
            }
            .hala-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245, 160, 92, .46); filter: brightness(1.05); }
            .hala-cta:active { transform: translateY(0); }
            .hala-cta:focus-visible { outline: 3px solid var(--ink, #f0ebe0); outline-offset: 4px; }
            .hala-cta__arrow { display: inline-block; transition: transform .16s ease; }
            .hala-cta:hover .hala-cta__arrow { transform: translateY(3px); }
            /* Push the Coding section a bit further below the hero, and land the
               CTA scroll ABOVE the heading so the 84px sticky topbar doesn't cover
               it (scroll-margin-top clears the bar + a little breathing room). */
            #coding { margin-top: clamp(22px, 6vh, 72px); scroll-margin-top: clamp(60px, 9vh, 96px); }
            /* Ambient drift layer: glowing binary / $ / ﷼ tokens + paint dashes that
               ride the streak band. Fades in after the word lands (later on first
               load, sooner on a language toggle), then loops quietly. */
            /* z-index 3 -> tokens ride ON TOP of the streak, not behind it. No
               layer-wide fade: each token gates itself via its own delay (offset
               past the word+subtitle) + backwards fill, so they stream in one by
               one and build up gradually instead of appearing all at once. */
            .hala-fx { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
            .hala-fx b {
              position: absolute; left: 0; display: block;
              font: 700 calc(var(--sz, .6) * clamp(15px, 1.7vw, 28px))/1 ui-monospace, "SF Mono", Menlo, monospace;
              color: #fff; white-space: nowrap;
              text-shadow: 0 0 10px rgba(255, 255, 255, .8), 0 0 3px rgba(255, 255, 255, .95);
              animation-timing-function: linear; animation-iteration-count: infinite;
              /* backwards fill = during a token's start delay it's held at the
                 first keyframe (invisible, at the letter edge) instead of parked
                 at its base position (the page edge) at full opacity. */
              animation-fill-mode: backwards;
            }
            .hala-fx .fx-img {
              height: calc(var(--sz, .7) * clamp(15px, 1.7vw, 28px) * 1.5); width: auto; display: block;
              filter: drop-shadow(0 0 8px rgba(255, 255, 255, .8));
            }
            .hala-fx .fx-stroke {
              width: clamp(60px, 10vw, 170px); height: 3px; border-radius: 3px;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .9), transparent);
              filter: blur(1.2px); text-shadow: none;
            }
            /* Tokens peel off the letter where the streak attaches — the left edge
               of the "h" (English, ~13vw left of the centered word) / the right
               edge of the "ه" (Arabic, ~11vw right) — and stream OUT along the
               streak, opposite the word's entry. They fade in right at that edge. */
            .fx--ltr b { animation-name: fx-trail-left; }
            .fx--rtl b { animation-name: fx-trail-right; }
            @keyframes fx-trail-left {
              0%   { transform: translateX(37vw); opacity: 0; }   /* h left edge */
              10%  { opacity: var(--o, .5); }
              55%  { opacity: var(--o, .5); }
              70%  { opacity: 0; }                                 /* dissolve before the edge */
              100% { transform: translateX(-14vw); opacity: 0; }
            }
            @keyframes fx-trail-right {
              0%   { transform: translateX(61vw); opacity: 0; }   /* ه right edge */
              10%  { opacity: var(--o, .5); }
              55%  { opacity: var(--o, .5); }
              70%  { opacity: 0; }                                 /* dissolve before the edge */
              100% { transform: translateX(114vw); opacity: 0; }
            }
            @media (max-width: 640px) { .hala-fx b:nth-child(even) { display: none; } }
            /* Scoped to .hero--hala so it out-specifies the global .hero h1 rule
               (this subtitle is now the page <h1>, but must keep its subtitle size). */
            .hero--hala .hala-sub {
              margin: clamp(14px, 3vh, 34px) auto 0; max-width: 22ch;
              font-size: clamp(19px, 3vw, 32px); font-weight: 300; line-height: 1.4;
              letter-spacing: -.01em; color: var(--ink);
              opacity: 1;   /* rest: visible */
            }
            @media (max-width: 640px) {
              .hala-stage { height: clamp(78px, 15vh, 130px); }
              .hero--hala-ar .hala-stage { height: clamp(94px, 18vh, 156px); }
            }
            /* Intro animations run only on a language's first appearance (no
               .is-static) and never for reduced-motion — otherwise the hero shows
               at rest instantly, so language toggles don't replay the intro. */
            /* On first load: the word slides in immediately (no delay, so its
               edge never sits parked before moving), then the subtitle fades in
               (1.4s), then the tokens (2.6s). */
            .hero--hala.is-ready:not(.is-static) .hala-smu {
              animation: hala-slide 1.15s cubic-bezier(.15,.85,.25,1) 0s both;
            }
            .hero--hala.is-ready:not(.is-static) .hala-sub {
              animation: hala-sub-in .7s ease 1.4s both;
            }
            .hero--hala.is-ready:not(.is-static) .hala-cta {
              animation: hala-sub-in .6s ease 2s both;
            }
            @keyframes hala-slide {
              0%   { transform: translateX(var(--start)); }  /* word off past the edge */
              100% { transform: translateX(var(--rest)); }   /* word centered, streak trailing */
            }
            @keyframes hala-sub-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
            @media (prefers-reduced-motion: reduce) {
              .hala-smu { animation: none !important; transform: translateX(var(--rest)) !important; opacity: 1 !important; }
              .hala-sub { animation: none !important; opacity: 1 !important; transform: none !important; }
              .hala-cta { animation: none !important; opacity: 1 !important; }
              .hala-fx { display: none !important; }
            }
          `}</style>
          <div className="hala-stage">
            <div
              className={`hala-fx fx--${lang === 'ar' ? 'rtl' : 'ltr'}`}
              role="img"
              aria-label={lang === 'ar'
                ? 'تنطلق هلا وخلفها أرقام ثنائية وعلامات الدولار والريال السعودي، في إشارة إلى البرمجة والاقتصاد والهوية السعودية.'
                : 'Hala trails binary code, dollar signs, and Saudi riyal symbols, representing software, economics, and Saudi identity.'}
            >
              {HALA_FX.map((f, i) => (
                <b
                  key={i}
                  className={f.stroke ? 'fx-stroke' : ''}
                  style={{
                    top: `${fxBand[0] + f.band * (fxBand[1] - fxBand[0])}%`,
                    '--sz': f.size,
                    '--o': f.o,
                    animationDuration: `${f.d}s`,
                    animationDelay: `${(fxBase + f.delay).toFixed(2)}s`,
                  }}
                >
                  {f.img ? <img className="fx-img" src={f.img} alt="" /> : (f.stroke ? '' : f.g)}
                </b>
              ))}
            </div>
            <img
              ref={heroImgRef}
              className="hala-smu"
              style={{ '--rest': hala.rest, '--start': hala.start }}
              src={hala.img}
              alt={hala.alt}
              onLoad={() => setHeroReady(true)}
            />
          </div>
          <h1 className="hala-sub">{hala.sub}</h1>
          <button
            type="button"
            className="hala-cta"
            onClick={() => document.getElementById('coding')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {hala.cta}
            <span className="hala-cta__arrow" aria-hidden="true">↓</span>
          </button>
        </section>

        {/* Coding */}
        <section className="section" id="coding">
          <div className="container">
            <div className="section-head">
              <a className="section-link" href={`#/${lang}/coding`}>
                <h2>{t.sections.coding}</h2>
              </a>
            </div>
            <div className="projects">
              {codingProjects.map((p) => (
                <ProjectCard
                  key={pick(p.title)}
                  year={pick(p.year)}
                  type={pick(p.type)}
                  title={pick(p.title)}
                  description={pick(p.description)}
                  tags={p.tags}
                  image={p.image}
                  thumbClass={p.thumbClass}
                  hideDescription
                  href={p.href(lang)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Economic Models */}
        <section className="section" id="economics">
          <div className="container">
            <div className="section-head">
              <a className="section-link" href={`#/${lang}/economic-models`}>
                <h2>{t.sections.economics}</h2>
              </a>
            </div>
            <ComingSoon />
          </div>
        </section>

        {/* Graphic Design */}
        <section className="section" id="design">
          <div className="container">
            <div className="section-head">
              <a className="section-link" href={`#/${lang}/graphic-design`}>
                <h2>{t.sections.design}</h2>
              </a>
            </div>
            <div className="projects">
              <a className="project" href={`#/${lang}/projects/ssa-ucsd?from=graphic-design`}>
                <div className="project-thumb">
                  <img
                    src="images/ssa-ucsd-logo.png"
                    alt={lang === 'ar' ? 'شعار النادي السعودي' : 'Saudi Student Association mark'}
                  />
                </div>
                <div className="meta">
                  <span>{lang === 'ar' ? '٢٠٢٤' : '2024'}</span>
                  <span>{lang === 'ar' ? 'هوية بصرية' : 'Visual Identity'}</span>
                </div>
                <h3>
                  {lang === 'ar'
                    ? 'النادي السعودي في جامعة كاليفورنيا سان دييغو'
                    : 'Saudi Student Association at UC San Diego'}
                </h3>
                <div className="arrow">{lang === 'ar' ? 'اقرأ المزيد ←' : 'Read more →'}</div>
              </a>
            </div>
          </div>
        </section>

        {/* About Me */}
        <section className="section" id="about">
          <div className="container">
            <div className="section-head">
              <a className="section-link" href={`#/${lang}/about`}>
                <h2>{t.sections.about}</h2>
              </a>
            </div>
            <div className="about-grid">
              <div>
                <p>{t.about.bio1}</p>
                <p>{t.about.bio2}</p>
              </div>
              <div className="about-meta">
                <dl>
                  <dt>{t.about.meta.based}</dt>
                  <dd>{t.about.meta.basedValue}</dd>
                  <dt>{t.about.meta.currently}</dt>
                  <dd>{t.about.meta.currentlyValue}</dd>
                  <dt>{t.about.meta.tools}</dt>
                  <dd>{t.about.meta.toolsValue}</dd>
                  <dt>{t.about.meta.elsewhere}</dt>
                  <dd>
                    <a href="https://github.com/Motabagani" target="_blank" rel="noreferrer">GitHub</a> ·{' '}
                    <a href="https://www.linkedin.com/in/almutabaganih/" target="_blank" rel="noreferrer">LinkedIn</a>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
