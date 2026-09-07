import TopBar from '../components/TopBar';
import { useLanguage } from '../LanguageContext';
import { crumbFrom } from '../lib/nav';

/* ------------------------------------------------------------------ *
 *  Saudi Student Association at UC San Diego — Visual Identity
 *  First graphic-design case study.
 *
 *  Assets:
 *    REQUIRED NOW  →  public/images/ssa-ucsd-logo.png   (the white mark you sent)
 *    ADD LATER     →  public/images/ssa-logo-variants.png
 *                     public/images/ssa-graphics-ucsd.png
 *                     public/images/ssa-graphics-saudi.png
 *    (the dashed slots below show exactly where each one drops in)
 * ------------------------------------------------------------------ */

// Brand palette — straight from the guide
const PALETTE = [
  { hex: '#055c57', en: 'Deep Teal', ar: 'تيل غامق' },
  { hex: '#137c73', en: 'Sea Green', ar: 'أخضر بحري' },
  { hex: '#e2993a', en: 'Saffron',   ar: 'ذهبي' },
  { hex: '#a9691f', en: 'Bronze',    ar: 'برونزي' },
];

const LOGO = '/images/ssa-ucsd-logo.png';

// Sadu-inspired cross-weave, rebuilt as an SVG pattern
function Weave({ id, color, opacity = 1 }) {
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ display: 'block', opacity }}
    >
      <defs>
        <pattern id={id} width="38" height="38" patternUnits="userSpaceOnUse">
          <rect x="15" y="5" width="8" height="28" rx="1.5" fill={color} />
          <rect x="5" y="15" width="28" height="8" rx="1.5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function SSAUCSDProject() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const parent = crumbFrom('graphic-design'); // Graphic Design, unless linked from About

  return (
    <>
      <TopBar />
      <main id="main-content" tabIndex={-1}>
        <div className="breadcrumb breadcrumb--ssa">
          <a href={`/${lang}`}>{ar ? 'الرئيسية' : 'Home'}</a>
          &nbsp;/&nbsp;
          {parent && <><a href={`/${lang}/${parent.path}`}>{ar ? parent.ar : parent.en}</a>&nbsp;/&nbsp; </>}
          {ar ? 'النادي السعودي – UCSD' : 'SSA — UCSD'}
          <img src="/images/naqsh.png" alt="" className="hero-naqsh" />
        </div>

        <article className="ssa">
          {/* ---------- Title ---------- */}
          <header className="ssa-head">
            <p className="ssa-eyebrow">{ar ? 'هوية بصرية' : 'Visual Identity'}</p>
            <h1 className="ssa-title">
              {ar
                ? 'النادي السعودي في جامعة كاليفورنيا سان دييغو'
                : 'Saudi Student Association at UC San Diego'}
            </h1>
            <p className="ssa-sub">
              {ar ? 'دليل الهوية البصرية' : 'Visual Identity Guide'}
              <span className="ssa-dot">·</span>
              <span className="ssa-alt latin">{ar ? 'Visual Identity Guide' : 'دليل الهوية البصرية'}</span>
            </p>

            <div className="ssa-meta">
              <div>
                <span className="k">{ar ? 'السنة' : 'Year'}</span>
                <span className="v latin">2024</span>
              </div>
              <div>
                <span className="k">{ar ? 'الدور' : 'Role'}</span>
                <span className="v">{ar ? 'تصميم الهوية والشعار' : 'Brand & Logo Design'}</span>
              </div>
              <div>
                <span className="k">{ar ? 'النطاق' : 'Scope'}</span>
                <span className="v">
                  {ar ? 'شعار · ألوان · خطوط · رسومات' : 'Logo · Color · Type · Graphics'}
                </span>
              </div>
            </div>
          </header>

          {/* ---------- Hero: the mark ---------- */}
          <section className="ssa-hero">
            <div className="ssa-hero-weave">
              <Weave id="ssaWeaveHero" color="#ffffff" opacity={0.07} />
            </div>
            <img src={LOGO} alt={ar ? 'شعار النادي السعودي' : 'Saudi Student Association mark'} />
            <p className="ssa-hero-cap">
              {ar
                ? 'سيفان متقاطعان ورمح — التراث السعودي وهوية الجامعة في علامة واحدة'
                : 'Crossed swords and a trident — Saudi heritage and the university in a single mark'}
            </p>
          </section>

          {/* ---------- Concept ---------- */}
          <section className="ssa-section">
            <h2 className="ssa-h2">{ar ? 'الفكرة' : 'The Mark'}</h2>
            <p className="ssa-lead">
              {ar
                ? 'يدمج الشعار سيفَي الشعار الوطني السعودي المتقاطعين مع رمح «الترايتون» — رمز جامعة كاليفورنيا سان دييغو. تتحوّل نخلة الشعار السعودي إلى رمح، مرسومةً بحركة خطية عربية واحدة.'
                : "The mark fuses the two crossed swords of the Saudi national emblem with the trident of UC San Diego's Triton. The palm of Saudi heraldry is reimagined as the trident, drawn as a single Arabic calligraphic gesture."}
            </p>
            <p className="ssa-body">
              {ar
                ? 'نظام بصري متكامل: الشعار وتنويعاته، ولوحة ألوان من التيل والذهبي، وخطوط ثنائية اللغة، ومجموعة من الرسومات المساندة المستوحاة من الثقافة السعودية وحرم الجامعة.'
                : "A full brand system: the logo and its variants, a teal-and-gold palette, bilingual typography, and a family of supporting graphics drawn from Saudi culture and the UC San Diego campus."}
            </p>
          </section>

          {/* ---------- The mark on color ---------- */}
          <section className="ssa-section">
            <h2 className="ssa-h2">{ar ? 'الشعار على الألوان' : 'The Mark on Color'}</h2>
            <div className="ssa-bgs">
              {[
                { bg: '#055c57', label: ar ? 'تيل غامق' : 'Deep Teal' },
                { bg: '#137c73', label: ar ? 'أخضر بحري' : 'Sea Green' },
                { bg: '#a9691f', label: ar ? 'برونزي' : 'Bronze' },
                { bg: '#0b0f10', label: ar ? 'أسود' : 'Black' },
              ].map((b) => (
                <div key={b.bg}>
                  <div className="ssa-bg" style={{ background: b.bg }}>
                    <img src={LOGO} alt="" />
                  </div>
                  <p className="ssa-cap latin">{b.label}</p>
                </div>
              ))}
            </div>

            <div className="ssa-slot" style={{ marginTop: 16 }}>
              <span>{ar ? 'النسخ الملوّنة والخطّية — قريبًا' : 'Full-colour & outline lockups — coming soon'}</span>
              <span className="ssa-slot-file latin">public/images/ssa-logo-variants.png</span>
            </div>
          </section>

          {/* ---------- Color ---------- */}
          <section className="ssa-section">
            <h2 className="ssa-h2">{ar ? 'الألوان' : 'Color'}</h2>
            <div className="ssa-colors">
              {PALETTE.map((c) => (
                <div className="ssa-color" key={c.hex}>
                  <div className="chip" style={{ background: c.hex }} />
                  <p className="name">{ar ? c.ar : c.en}</p>
                  <p className="hex latin">{c.hex}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- Typography ---------- */}
          <section className="ssa-section">
            <h2 className="ssa-h2">{ar ? 'الخطوط' : 'Typography'}</h2>
            <div className="ssa-type">
              <div className="ssa-type-card">
                <p className="ssa-type-label latin">Muli — English</p>
                <p className="ssa-type-en">
                  <span className="light">The Saudi Student Association</span><br />
                  at The University of California San Diego
                </p>
                <p className="ssa-type-glyphs latin">Aa Bb Cc · 0123456789</p>
              </div>

              <div className="ssa-type-card">
                <p className="ssa-type-label latin">HT Baybars — Arabic</p>
                <p className="ssa-type-ar">النادي السعودي في جامعة كاليفورنيا سان دييغو</p>
                <p className="ssa-type-glyphs">أ ب ج · ٠١٢٣٤٥٦٧٨٩</p>
              </div>
            </div>
          </section>

          {/* ---------- Supporting graphics ---------- */}
          <section className="ssa-section">
            <h2 className="ssa-h2">{ar ? 'الرسومات المساندة' : 'Supporting Graphics'}</h2>
            <p className="ssa-body" style={{ marginBottom: 24 }}>
              {ar
                ? 'عائلة من الرسومات المستوحاة من حرم الجامعة والثقافة السعودية — مبنى المكتبة، والدلّة والفناجين، والبيت النجدي، والنمط السعدي.'
                : 'A family of illustrations drawn from the campus and from Saudi culture — the library, the dallah and finjan, the Najdi house, and the sadu weave.'}
            </p>
            <div className="ssa-graphics">
              <figure className="ssa-figure">
                <img src="/images/ssa-graphics-ucsd.png" alt={ar ? 'رسومات حرم جامعة كاليفورنيا سان دييغو' : 'UC San Diego campus graphics'} />
                <figcaption>{ar ? 'حرم جامعة كاليفورنيا سان دييغو' : 'UC San Diego — campus'}</figcaption>
              </figure>
              <div className="ssa-slot">
                <span>{ar ? 'الثقافة السعودية — قريبًا' : 'Saudi culture — coming soon'}</span>
                <span className="ssa-slot-file latin">public/images/ssa-graphics-saudi.png</span>
              </div>
            </div>
          </section>

          {/* ---------- Patterns ---------- */}
          <section className="ssa-section">
            <h2 className="ssa-h2">{ar ? 'الأنماط' : 'Patterns'}</h2>
            <div className="ssa-pattern">
              <Weave id="ssaWeavePat" color="#1fb6a6" />
            </div>
            <p className="ssa-cap" style={{ marginTop: 12 }}>
              {ar ? 'نمط سعدي متشابك مبني على شكل المعيّن.' : 'Interlocking sadu-style weave built from the cross motif.'}
            </p>
          </section>

          <footer className="ssa-credit">
            {ar
              ? 'النادي السعودي في جامعة كاليفورنيا سان دييغو — دليل الهوية البصرية'
              : 'Saudi Student Association at UC San Diego — Visual Identity Guide'}
          </footer>
        </article>
      </main>

      {/* ------------------------------------------------------------------ *
       *  Scoped styles — every class prefixed `ssa` so nothing collides
       *  with the global App.css (.section, .meta, .project, etc.)
       * ------------------------------------------------------------------ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;600;800&display=swap');

        /* Match the breadcrumb to this page's .ssa column (1080px), not the
           820px prose column the other case studies use. */
        .breadcrumb--ssa {
          max-width: 1080px !important;
          padding-inline: clamp(20px, 5vw, 40px) !important;
        }

        .ssa {
          max-width: 1080px;
          margin-inline: auto;
          padding-inline: clamp(20px, 5vw, 40px);
          padding-block: clamp(24px, 5vw, 48px) 120px;
          color: var(--ink);
          font-family: var(--font);
        }
        html[lang="ar"] .ssa { font-family: var(--font-ar); }

        /* The head block is centred as one unit. The text elements inherited
           centring from #root while .ssa-sub/.ssa-meta are flex containers
           defaulting to flex-start, which is what made the block look
           half-centred, half-left. */
        .ssa-head { text-align: center; }
        .ssa-head .ssa-sub,
        .ssa-head .ssa-meta { justify-content: center; }
        .ssa-head .ssa-meta > div { align-items: center; text-align: center; }

        .ssa-eyebrow {
          font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent); margin: 0 0 14px;
        }
        .ssa-title {
          font-size: clamp(32px, 6vw, 60px); font-weight: 600;
          line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 18px;
        }
        .ssa-sub {
          font-size: clamp(16px, 2.5vw, 20px); color: var(--muted);
          margin: 0 0 32px; display: flex; align-items: center; flex-wrap: wrap; gap: 12px;
        }
        .ssa-dot { opacity: 0.5; }
        .ssa-alt { color: var(--muted); }

        html[lang="ar"] .ssa-eyebrow { letter-spacing: 0; text-transform: none; }
        html[lang="ar"] .ssa-title { letter-spacing: 0; line-height: 1.25; }

        .ssa-meta {
          display: flex; flex-wrap: wrap; gap: 36px;
          padding-block: 22px;
          border-block: 1px solid rgba(255,255,255,0.12);
        }
        .ssa-meta > div { display: flex; flex-direction: column; gap: 6px; }
        .ssa-meta .k {
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);
        }
        .ssa-meta .v { font-size: 16px; color: var(--ink); }
        html[lang="ar"] .ssa-meta .k { letter-spacing: 0; text-transform: none; }

        /* hero plate */
        .ssa-hero {
          position: relative; overflow: hidden; border-radius: 20px;
          background: #055c57;
          padding: clamp(48px, 9vw, 100px) clamp(24px, 6vw, 64px);
          margin-block: 48px clamp(56px, 9vw, 96px);
          display: grid; place-items: center; text-align: center;
        }
        .ssa-hero-weave { position: absolute; inset: 0; pointer-events: none; }
        .ssa-hero img {
          position: relative; width: min(240px, 52%); height: auto; display: block;
          filter: drop-shadow(0 12px 34px rgba(0,0,0,0.30));
          animation: ssa-rise 0.7s cubic-bezier(.2,.7,.2,1) both;
        }
        .ssa-hero-cap {
          position: relative; margin: 34px 0 0; max-width: 52ch;
          color: rgba(255,255,255,0.82); font-size: 15px; line-height: 1.5;
        }

        @keyframes ssa-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }

        /* sections */
        .ssa-section { margin-block: clamp(56px, 9vw, 96px); }
        .ssa-h2 {
          font-size: 14px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent); margin: 0 0 26px;
        }
        html[lang="ar"] .ssa-h2 { letter-spacing: 0; text-transform: none; font-size: 17px; }

        .ssa-lead { font-size: clamp(18px, 2.4vw, 23px); line-height: 1.5; max-width: 62ch; margin: 0 0 18px; color: var(--ink); }
        .ssa-body { font-size: 16px; line-height: 1.7; max-width: 60ch; margin: 0; color: var(--muted); }

        /* mark on color */
        .ssa-bgs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ssa-bg {
          aspect-ratio: 1 / 1; border-radius: 14px; display: grid; place-items: center;
          transition: transform 0.2s ease;
        }
        .ssa-bg img { width: 50%; height: auto; }
        .ssa-bg:hover { transform: translateY(-3px); }
        .ssa-cap { margin: 10px 0 0; font-size: 12px; color: var(--muted); letter-spacing: 0.04em; }

        /* placeholder slot */
        .ssa-slot {
          border: 1.5px dashed rgba(255,255,255,0.22); border-radius: 14px;
          display: grid; place-items: center; gap: 10px; text-align: center;
          padding: 34px; min-height: 150px; color: var(--muted); font-size: 15px;
        }
        .ssa-slot-file {
          font-size: 12px; color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.05); padding: 5px 11px; border-radius: 6px;
        }

        /* color */
        .ssa-colors { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ssa-color .chip { height: clamp(120px, 18vw, 184px); border-radius: 14px; }
        .ssa-color .name { margin: 14px 0 2px; font-size: 15px; color: var(--ink); }
        .ssa-color .hex { margin: 0; font-size: 13px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }

        /* type */
        .ssa-type { display: grid; gap: 18px; }
        .ssa-type-card {
          border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;
          padding: clamp(24px, 4vw, 44px); background: rgba(255,255,255,0.03);
        }
        .ssa-type-label { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 18px; }
        .ssa-type-en { font-family: 'Mulish', var(--font); font-weight: 700; font-size: clamp(24px, 4.2vw, 42px); line-height: 1.18; margin: 0; }
        .ssa-type-en .light { font-weight: 300; }
        .ssa-type-ar { font-family: var(--font-ar); direction: rtl; font-size: clamp(26px, 4.6vw, 46px); line-height: 1.5; margin: 0; }
        .ssa-type-glyphs { margin: 18px 0 0; color: var(--muted); font-size: 17px; letter-spacing: 0.05em; }
        .ssa-type-en + .ssa-type-glyphs, .ssa-type-card .latin.ssa-type-glyphs { font-family: 'Mulish', var(--font); }

        /* supporting graphics */
        .ssa-graphics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; align-items: start; }
        .ssa-figure { margin: 0; }
        .ssa-figure img {
          width: 100%; height: auto; display: block; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03);
        }
        .ssa-figure figcaption { margin: 12px 0 0; font-size: 13px; color: var(--muted); text-align: center; }

        /* patterns */
        .ssa-pattern { border-radius: 16px; overflow: hidden; height: clamp(170px, 26vw, 240px); background: #055c57; }

        /* credit */
        .ssa-credit {
          margin-top: clamp(64px, 10vw, 110px); padding-top: 26px;
          border-top: 1px solid rgba(255,255,255,0.12);
          font-size: 13px; letter-spacing: 0.04em; color: var(--muted);
        }

        /* responsive */
        @media (max-width: 720px) {
          .ssa-bgs, .ssa-colors { grid-template-columns: repeat(2, 1fr); }
          .ssa-graphics { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ssa-hero img { animation: none; }
          .ssa-bg { transition: none; }
        }
      `}</style>
    </>
  );
}

export default SSAUCSDProject;
