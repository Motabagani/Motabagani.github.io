import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { CATS, ITEMS } from '../data/journey';

/* JourneyTimeline — a horizontal, color-coded timeline of Hashim's journey
   across four tracks (academic / research / industry / extracurricular). The
   spine is the site's hand-drawn Ha'a stroke: a thick wavy white line that runs
   left→right and draws itself in on scroll. Cards alternate above / below it,
   and the whole rail scrolls sideways. Bilingual + RTL-aware (the rail flows
   right→left and the stroke draws from the right in Arabic). */

// Build the hand-drawn spine as a gentle horizontal squiggle spanning the given
// pixel width (around y=8, amplitude ~5). We size the viewBox to the real width
// (1:1, no stretching) so a plain stroke draws correctly end-to-end — stretching
// a fixed-width viewBox breaks stroke-dash + non-scaling-stroke on wide rails.
function buildSpinePath(width) {
  const half = 72; // half-wavelength in px
  let d = 'M0 8';
  let x = 0;
  let up = true;
  while (x < width - 0.5) {
    const nx = Math.min(x + half, width);
    const cx = (x + nx) / 2;
    const cy = up ? -2 : 18; // control point → curve peaks near y3 / y13
    d += ` Q ${cx.toFixed(1)} ${cy} ${nx.toFixed(1)} 8`;
    x = nx;
    up = !up;
  }
  return d;
}

const CSS = `
.jt { max-width: 960px; margin: 8px auto 0; text-align: start; }
.jt__head { margin: 0 0 6px; font-size: clamp(24px, 4vw, 34px); font-weight: 700; letter-spacing: -.01em; color: var(--ink); }
.jt__sub { margin: 0 0 22px; color: var(--muted); font-size: 15px; line-height: 1.5; }

.jt__legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 8px; }
.jt__chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 14px; border-radius: var(--r-pill);
  background: var(--surface-1); border: 1px solid var(--divider);
  color: var(--ink); font-size: 13.5px; font-weight: 600; cursor: pointer;
  transition: border-color .15s ease, background .15s ease, opacity .15s ease, transform .1s ease;
}
.jt__chip:hover { transform: translateY(-1px); }
.jt__chip[aria-pressed="true"] { border-color: var(--dot); background: color-mix(in srgb, var(--dot) 14%, transparent); }
.jt--filtering .jt__chip:not([aria-pressed="true"]) { opacity: .45; }
.jt__swatch { width: 11px; height: 11px; border-radius: 50%; background: var(--dot); box-shadow: 0 0 8px 1px var(--dot); flex: none; }

/* Horizontal scrolling rail. */
.jt__track {
  position: relative; overflow-x: auto; overflow-y: hidden;
  padding: 6px 0 12px; margin-top: 8px;
  scrollbar-width: thin; scrollbar-color: var(--surface-3) transparent;
  -webkit-overflow-scrolling: touch;
}
.jt__track::-webkit-scrollbar { height: 8px; }
.jt__track::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 999px; }
.jt__rail {
  position: relative; display: flex; align-items: stretch;
  width: max-content; min-width: 100%;
  height: clamp(430px, 60vh, 500px);
}

/* Hand-drawn Ha'a spine — thick wavy white stroke that draws itself in. */
.jt__spine {
  position: absolute; top: 50%; inset-inline-start: 0;
  height: 16px; transform: translateY(-50%); overflow: visible; pointer-events: none;
}
html[dir="rtl"] .jt__spine { transform: translateY(-50%) scaleX(-1); }
.jt__spine path {
  fill: none; stroke: var(--ink); stroke-width: 6;
  stroke-linecap: round; stroke-linejoin: round;
  filter: drop-shadow(0 0 5px rgba(240, 235, 224, 0.22));
  /* Start hidden so there's no solid-line flash before JS sets the real dash.
     The draw animation is driven imperatively (see JourneyTimeline effects). */
  stroke-dasharray: 100000; stroke-dashoffset: 100000;
}

.jt__item { position: relative; flex: 0 0 clamp(286px, 84vw, 360px); height: 100%; }
.jt__node {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--dot); box-shadow: 0 0 0 4px var(--bg), 0 0 12px 2px var(--dot);
  z-index: 2;
}
.jt__card {
  position: absolute; inset-inline: 14px;
  background: var(--surface-1); border: 1px solid var(--divider);
  border-radius: 16px; padding: 14px 16px;
  transition: transform .16s ease, background .16s ease;
}
.jt__item.above .jt__card { bottom: calc(50% + 27px); border-bottom: 3px solid var(--dot); }
.jt__item.below .jt__card { top: calc(50% + 27px); border-top: 3px solid var(--dot); }
.jt__card:hover { background: var(--surface-2); transform: translateY(-2px); }
.jt__item.below .jt__card:hover { transform: translateY(2px); }
/* connector from the node up/down to its card */
.jt__card::after { content: ""; position: absolute; left: 50%; transform: translateX(-50%); width: 2px; height: 27px; background: var(--dot); opacity: .7; }
.jt__item.above .jt__card::after { bottom: -27px; }
.jt__item.below .jt__card::after { top: -27px; }

.jt__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 0 0 6px; }
.jt__date { font-size: 12px; font-weight: 600; letter-spacing: .02em; color: var(--muted); font-variant-numeric: tabular-nums; }
.jt__tag {
  font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
  color: var(--dot); padding: 3px 9px; border-radius: var(--r-pill);
  background: color-mix(in srgb, var(--dot) 15%, transparent);
}
.jt__title { margin: 0; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1.3; }
.jt__org { margin: 3px 0 0; font-size: 13px; color: var(--accent); }
.jt__note {
  margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: var(--muted);
  display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;
}

.jt__honor, .jt__cert {
  display: inline-flex; align-items: center; gap: 6px; margin: 9px 0 0;
  max-width: 100%; padding: 4px 10px; border-radius: 12px;
  font-size: 12px; font-weight: 700; letter-spacing: .01em; line-height: 1.25;
}
.jt__honor svg, .jt__cert svg { width: 13px; height: 13px; flex: none; }
.jt__honor { background: color-mix(in srgb, #f5b74e 15%, transparent); color: #f5b74e; }
.jt__cert { background: color-mix(in srgb, var(--accent) 15%, transparent); color: var(--accent); }

/* Institution logo, top corner of the card. Missing files hide themselves
   (onError) so a not-yet-added logo just doesn't show. */
.jt__logo {
  position: absolute; top: 16px; inset-inline-start: 18px;
  height: 66px; width: auto; max-width: 152px; object-fit: contain; object-position: left center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.42));
}
/* Reserve a top band so the logo sits fully inside the card, above the text.
   The institution name is redundant with the logo, so hide the org line. */
.jt__card.has-logo { padding-top: 92px; }

/* Small status badge in the top corner opposite the logo (e.g. "Transferred out"). */
.jt__flag {
  position: absolute; top: 18px; inset-inline-end: 16px; z-index: 3;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: var(--r-pill);
  font-size: 11px; font-weight: 700; letter-spacing: .02em;
  color: #ff4d4d; background: color-mix(in srgb, #ff4d4d 16%, transparent);
  border: 1px solid color-mix(in srgb, #ff4d4d 55%, transparent);
}
.jt__flag::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: #ff4d4d; flex: none; box-shadow: 0 0 6px rgba(255, 77, 77, 0.6);
  animation: jt-flag-pulse 1.8s ease-in-out infinite;
}
@keyframes jt-flag-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
/* The flag is a real button — make it clearly interactive. */
.jt__flag--btn {
  font-family: inherit; cursor: pointer;
  transition: transform .14s ease, background .14s ease, box-shadow .14s ease;
}
.jt__flag--btn:hover {
  transform: scale(1.06);
  background: color-mix(in srgb, #ff4d4d 26%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, #ff4d4d 55%, transparent), 0 4px 14px rgba(255, 77, 77, 0.28);
}
.jt__flag--btn:active { transform: scale(.98); }

/* Confetti burst — fixed overlay, pieces fly out from the flag then fall + fade. */
.jt-confetti { position: fixed; inset: 0; pointer-events: none; z-index: 100020; }
.jt-confetti i {
  position: absolute; width: 9px; height: 9px; border-radius: 2px;
  transform: translate(-50%, -50%);
  animation: jt-confetti-pop 1.25s cubic-bezier(.2, .7, .3, 1) forwards;
}
@keyframes jt-confetti-pop {
  0%   { opacity: 1; transform: translate(-50%, -50%) rotate(0) scale(.5); }
  12%  { opacity: 1; }
  100% { opacity: 0;
         transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 70px)) rotate(var(--rot)) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .jt-confetti { display: none; }
  .jt__flag::before { animation: none; }
}

.jt__item.is-hidden { display: none; }

/* "Read more" link on cards that have a detail page. */
.jt__more {
  display: inline-flex; align-items: center; gap: 4px; margin: 11px 0 0;
  color: var(--accent); font-size: 13px; font-weight: 700; letter-spacing: .01em;
  text-decoration: none; transition: gap .15s ease;
}
.jt__more:hover { gap: 8px; text-decoration: underline; text-underline-offset: 3px; }

/* Click-to-open photo thumbnail on a card. */
.jt__thumb {
  display: inline-block; position: relative; width: 78px; height: 78px; margin: 12px 0 0;
  padding: 0; border: 1px solid var(--divider); border-radius: 12px;
  overflow: hidden; cursor: pointer; background: var(--surface-1); line-height: 0;
}
.jt__thumb img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 42%; display: block; transition: transform .25s ease; }
.jt__thumb:hover img { transform: scale(1.05); }
.jt__thumb__badge {
  position: absolute; bottom: 8px; inset-inline-end: 8px;
  display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px;
  background: rgba(10, 6, 20, 0.62); color: #fff; font-size: 12px; line-height: 1;
  -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
}

@media (prefers-reduced-motion: reduce) { .jt__thumb img { transition: none; } }

/* Photo modal — a contained card: image on top, quote + source in the body. */
.jt-modal {
  position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center; padding: 24px;
  background: rgba(6, 3, 14, 0.8);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  animation: jt-modal-fade 0.18s ease;
}
@keyframes jt-modal-fade { from { opacity: 0; } to { opacity: 1; } }
.jt-modal__card {
  position: relative; width: min(600px, 100%); max-height: min(88vh, 780px);
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--surface-2); border: 1px solid var(--divider); border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}
.jt-modal__media { flex: 0 0 auto; background: #0b0713; }
.jt-modal__media img { width: 100%; max-height: 52vh; object-fit: contain; display: block; }
.jt-modal__body { padding: 20px 24px 24px; overflow-y: auto; text-align: start; }
.jt-modal__quote { margin: 0; }
.jt-modal__quote-de { display: block; font-size: clamp(15px, 2vw, 18px); line-height: 1.5; color: var(--ink); font-style: italic; }
.jt-modal__quote-tr { display: block; margin-top: 8px; font-size: 14px; line-height: 1.5; color: var(--muted); }
.jt-modal__src { display: inline-block; margin-top: 14px; color: var(--accent); text-decoration: none; font-weight: 600; font-size: 14px; }
.jt-modal__src:hover { text-decoration: underline; text-underline-offset: 3px; }
.jt-modal__close {
  position: absolute; top: 12px; inset-inline-end: 12px; z-index: 2;
  width: 34px; height: 34px; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; padding: 0;
  background: rgba(10, 6, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.18); color: #fff; font-size: 14px; line-height: 1;
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
}
.jt-modal__close:hover { background: rgba(10, 6, 20, 0.85); }
@media (prefers-reduced-motion: reduce) { .jt-modal { animation: none; } }

/* Prev / next controls under the line. */
.jt__controls { display: flex; justify-content: center; gap: 14px; margin-top: 18px; }
.jt__arrow {
  width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center;
  background: var(--surface-1); border: 1px solid var(--divider); color: var(--ink);
  transition: background .15s ease, border-color .15s ease, transform .1s ease, color .15s ease;
}
.jt__arrow:hover { background: var(--surface-2); border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
.jt__arrow:active { transform: translateY(0); }
.jt__arrow svg { width: 20px; height: 20px; }
/* In RTL the button row reverses (prev on the right); flip the chevrons so they
   still point outward and match the flipped scroll direction. */
html[dir="rtl"] .jt__arrow svg { transform: scaleX(-1); }

@media (max-width: 560px) {
  .jt__rail { height: clamp(440px, 78vh, 520px); }
}
@media (prefers-reduced-motion: reduce) {
  .jt__chip, .jt__card { transition: none; }
  .jt__spine path { transition: none; }
}
`;

export default function JourneyTimeline() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [active, setActive] = useState(null); // null = show all; else a category key
  const [photo, setPhoto] = useState(null); // item.photo shown in the modal, or null
  const [drawn, setDrawn] = useState(false);
  const [spineW, setSpineW] = useState(0);
  const [railH, setRailH] = useState(0);
  const [burst, setBurst] = useState(null); // confetti burst {x,y,id,pieces}
  const [cheer, setCheer] = useState('');    // polite screen-reader announcement
  const burstTimer = useRef(null);

  // Little easter egg: clicking the "Transferred out" flag pops a confetti burst
  // from the badge (transferring to NYU is worth celebrating).
  const popCelebration = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const colors = ['#ff4d4d', '#f5a05c', '#2FD6B0', '#C2A24A', '#f0ebe0', '#8FF0D6'];
    const pieces = Array.from({ length: 28 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 28 + (Math.random() - 0.5) * 0.5;
      const dist = 55 + Math.random() * 95;
      return {
        dx: Math.round(Math.cos(angle) * dist),
        dy: Math.round(Math.sin(angle) * dist),
        rot: Math.round(Math.random() * 720 - 360),
        color: colors[i % colors.length],
        delay: +(Math.random() * 0.06).toFixed(3),
      };
    });
    setBurst({ x: cx, y: cy, id: Date.now(), pieces });
    setCheer(isEn ? '🎉 Onward to NYU!' : '🎉 نحو نيويورك!');
    clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => { setBurst(null); setCheer(''); }, 1500);
  };
  useEffect(() => () => clearTimeout(burstTimer.current), []);

  const rootRef = useRef(null);
  const railRef = useRef(null);
  const pathRef = useRef(null);
  const trackRef = useRef(null);

  const toggle = (key) => setActive((cur) => (cur === key ? null : key));

  // dir: -1 = previous (toward the start / earlier), +1 = next (toward the end /
  // later). In RTL the track starts at the right and later items are to the
  // left (negative scrollLeft), so flip the sign.
  // Close the photo modal on Escape, and freeze the page scroll at its offset
  // (reliable when <html> is the scroller; restores position exactly on close).
  useEffect(() => {
    if (!photo) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setPhoto(null); };
    document.addEventListener('keydown', onKey);
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [photo]);

  const scrollTrack = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 360);
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollBy({ left: (rtl ? -dir : dir) * step, behavior: 'smooth' });
  };

  // Keep the spine's dash in sync with its (measured) length WITHOUT animating —
  // this runs on every width change, so it must never restart the draw or the
  // line "flashes" instead of drawing. Transition is toggled off for this set.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const prevTransition = path.style.transition;
    path.style.transition = 'none';
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = drawn ? '0' : String(len);
    void path.getBBox(); // flush so the "none" transition applies before restore
    path.style.transition = prevTransition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spineW]);

  // Draw the stroke in exactly once, when the section scrolls into view.
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !drawn) return undefined;
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      path.style.transition = 'none';
      path.style.strokeDashoffset = '0';
      return undefined;
    }
    path.style.strokeDashoffset = String(len); // ensure it starts hidden
    const id = requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 2.1s ease-in-out';
      path.style.strokeDashoffset = '0';
    });
    return () => cancelAnimationFrame(id);
  }, [drawn]);

  // Draw the spine when the section scrolls into view (once).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const inView = () => {
      const r = el.getBoundingClientRect();
      return r.top < (window.innerHeight || document.documentElement.clientHeight) && r.bottom > 0;
    };
    if (typeof IntersectionObserver === 'undefined') { setDrawn(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setDrawn(true); io.disconnect(); }
    }, { threshold: 0 });
    io.observe(el);
    // Fallback: if it's already on screen shortly after mount, kick the draw even
    // if the observer is suppressed (backgrounded/hidden tab).
    const t = setTimeout(() => { if (inView()) setDrawn(true); }, 500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);

  // The spine SVG stretches to the rail's full (scrollable) width, which changes
  // when filtering — measure it and set the width.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const measure = () => {
      setSpineW(el.scrollWidth);
      // Cards are absolutely anchored to the centred line and grow outward, so
      // the rail must be tall enough for the tallest card in each half — else
      // it clips. Size it to the tallest visible card (+ the connector gap).
      let maxH = 0;
      el.querySelectorAll('.jt__card').forEach((c) => {
        maxH = Math.max(maxH, c.getBoundingClientRect().height);
      });
      if (maxH) setRailH(Math.round(2 * (maxH + 48)));
    };
    measure();
    // Cards grow when the custom webfont swaps in — re-measure once it's ready.
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    // Logos/thumbnails load late and change a card's height (e.g. the logo's
    // reserved top band, the photo thumbnail) — re-measure when each one loads,
    // else the tallest card (IChO: logo + thumbnail) overflows and gets clipped.
    const imgs = [...el.querySelectorAll('img')].filter((im) => !im.complete);
    imgs.forEach((im) => { im.addEventListener('load', measure); im.addEventListener('error', measure); });
    if (typeof ResizeObserver === 'undefined') {
      return () => { imgs.forEach((im) => { im.removeEventListener('load', measure); im.removeEventListener('error', measure); }); };
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Observe the cards too: their height changes (font load, wrapping) don't
    // resize the rail box, so watching only the rail would miss them.
    el.querySelectorAll('.jt__card').forEach((c) => ro.observe(c));
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      imgs.forEach((im) => { im.removeEventListener('load', measure); im.removeEventListener('error', measure); });
    };
  }, [active, lang]);

  return (
    <section ref={rootRef} className={`jt${active ? ' jt--filtering' : ''}${drawn ? ' is-drawn' : ''}`} aria-label={isEn ? 'My journey' : 'رحلتي'}>
      <style>{CSS}</style>

      <h2 className="jt__head">{isEn ? 'My Journey' : 'رحلتي'}</h2>
      <p className="jt__sub">
        {isEn
          ? 'From the KAUST Gifted Student Program in 2022 onward — across academics, research, industry, and community. Tap a track to filter; scroll sideways to move through time.'
          : 'من انضمامي لبرنامج جامعة الملك عبدالله للعلوم والتقنية للطلبة الموهوبين عام ٢٠٢٢ بين الدراسة والبحث والعمل والمجتمع. اضغط على مسار للتصفية، ومرّر جانبياً عبر الزمن.'}
      </p>

      <div className="jt__legend" role="group" aria-label={isEn ? 'Filter by track' : 'تصفية حسب المسار'}>
        {Object.entries(CATS).map(([key, c]) => (
          <button
            key={key}
            type="button"
            className="jt__chip"
            style={{ '--dot': c.color }}
            aria-pressed={active === key}
            onClick={() => toggle(key)}
          >
            <span className="jt__swatch" aria-hidden="true" />
            {isEn ? c.en : c.ar}
          </button>
        ))}
      </div>

      <div className="jt__track" ref={trackRef}>
        <div className="jt__rail" ref={railRef} style={railH ? { height: `${railH}px` } : undefined}>
          <svg
            className="jt__spine"
            viewBox={`0 0 ${Math.max(1, Math.round(spineW || 1200))} 16`}
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ width: spineW ? `${spineW}px` : '100%' }}
          >
            <path
              ref={pathRef}
              d={buildSpinePath(Math.max(1, Math.round(spineW || 1200)))}
            />
          </svg>

          {ITEMS.map((it, i) => {
            const c = CATS[it.cat];
            const hidden = active && active !== it.cat;
            const side = i % 2 === 0 ? 'above' : 'below';
            return (
              <div
                key={i}
                className={`jt__item ${side}${hidden ? ' is-hidden' : ''}`}
                style={{ '--dot': c.color }}
              >
                <span className="jt__node" aria-hidden="true" />
                <div className="jt__card">
                  {it.flag && (
                    <button
                      type="button"
                      className="jt__flag jt__flag--btn"
                      onClick={popCelebration}
                      aria-label={isEn ? `${it.flag.en} — celebrate the move to NYU` : `${it.flag.ar} — احتفل بالانتقال إلى نيويورك`}
                      title={isEn ? 'Celebrate 🎉' : 'احتفل 🎉'}
                    >
                      {isEn ? it.flag.en : it.flag.ar}
                    </button>
                  )}
                  {it.logo && (
                    <img
                      className="jt__logo"
                      src={it.logo}
                      alt=""
                      onLoad={(e) => { const card = e.currentTarget.closest('.jt__card'); if (card) card.classList.add('has-logo'); }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="jt__meta">
                    <span className="jt__date">{isEn ? it.date.en : it.date.ar}</span>
                    <span className="jt__tag">{isEn ? c.en : c.ar}</span>
                  </div>
                  <h3 className="jt__title">{isEn ? it.title.en : it.title.ar}</h3>
                  <p className="jt__org">{isEn ? it.org.en : it.org.ar}</p>
                  <p className="jt__note">{isEn ? it.note.en : it.note.ar}</p>
                  {it.honor && (
                    <p className="jt__honor">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
                      </svg>
                      {isEn ? it.honor.en : it.honor.ar}
                    </p>
                  )}
                  {it.cert && (
                    <p className="jt__cert">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
                      </svg>
                      {isEn ? it.cert.en : it.cert.ar}
                    </p>
                  )}
                  {(it.to || (it.slug && it.more)) && (
                    <a className="jt__more" href={it.slug && it.more ? `/${lang}/journey/${it.slug}` : `/${lang}/${it.to}`}>
                      {isEn ? 'Read more' : 'اقرأ المزيد'}<span aria-hidden="true"> {isEn ? '→' : '←'}</span>
                    </a>
                  )}
                  {it.photo && (
                    <button
                      type="button"
                      className="jt__thumb"
                      onClick={() => setPhoto(it.photo)}
                      aria-label={isEn ? 'Open photo' : 'فتح الصورة'}
                    >
                      <img src={it.photo.src} alt="" />
                      <span className="jt__thumb__badge" aria-hidden="true">⤢</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="jt__controls">
        <button type="button" className="jt__arrow" onClick={() => scrollTrack(-1)} aria-label={isEn ? 'Scroll back' : 'للخلف'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <button type="button" className="jt__arrow" onClick={() => scrollTrack(1)} aria-label={isEn ? 'Scroll forward' : 'للأمام'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {photo && (
        <div className="jt-modal" role="dialog" aria-modal="true" onClick={() => setPhoto(null)}>
          <div className="jt-modal__card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="jt-modal__close" onClick={() => setPhoto(null)} aria-label={isEn ? 'Close' : 'إغلاق'}>✕</button>
            <div className="jt-modal__media">
              <img src={photo.src} alt={photo.alt ? (isEn ? photo.alt.en : photo.alt.ar) : ''} />
            </div>
            {(photo.quote || photo.source) && (
              <div className="jt-modal__body">
                {photo.quote && (
                  <blockquote className="jt-modal__quote">
                    <span className="jt-modal__quote-de">{photo.quote.de}</span>
                    <span className="jt-modal__quote-tr">{isEn ? photo.quote.en : photo.quote.ar}</span>
                  </blockquote>
                )}
                {photo.source && (
                  <a className="jt-modal__src" href={`/${lang}/${photo.source.to}`}>
                    {isEn ? photo.source.label.en : photo.source.label.ar}<span aria-hidden="true"> {isEn ? '→' : '←'}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration burst from the "Transferred out" flag. */}
      {burst && (
        <div className="jt-confetti" aria-hidden="true" key={burst.id}>
          {burst.pieces.map((p, i) => (
            <i
              key={i}
              style={{
                left: `${burst.x}px`,
                top: `${burst.y}px`,
                background: p.color,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="sr-only" aria-live="polite" role="status">{cheer}</div>
    </section>
  );
}
