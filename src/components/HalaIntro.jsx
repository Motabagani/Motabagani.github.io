import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';

/* HalaIntro — first-visit hook: a blank screen, then the "hala / هلا" handwriting
   streaks in from the side leaving a sonic-speed purple trail, settles, and fades
   away to reveal the homepage. Once per session, skippable (click/scroll/key),
   and disabled for prefers-reduced-motion. */

const SEEN_KEY = 'hala-intro-seen';

export default function HalaIntro() {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const reduce = typeof window !== 'undefined' && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [phase, setPhase] = useState(() => {
    try { if (sessionStorage.getItem(SEEN_KEY) === '1') return 'done'; } catch { /* ignore */ }
    return reduce ? 'done' : 'run';
  });
  const outTimer = useRef(null);
  const doneTimer = useRef(null);

  // Mark seen immediately so a re-render / route change can't replay it.
  useEffect(() => {
    if (phase === 'done') return undefined;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    // Freeze page scroll while the intro plays.
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const finish = () => {
      if (outTimer.current) clearTimeout(outTimer.current);
      setPhase('out');
      doneTimer.current = setTimeout(() => setPhase('done'), 650);
    };
    // Auto-play to fade-out, or let the visitor skip.
    outTimer.current = setTimeout(finish, 2500);
    const onSkip = () => finish();
    window.addEventListener('pointerdown', onSkip, { once: true });
    window.addEventListener('keydown', onSkip, { once: true });
    window.addEventListener('wheel', onSkip, { once: true, passive: true });
    window.addEventListener('touchstart', onSkip, { once: true, passive: true });

    return () => {
      clearTimeout(outTimer.current); clearTimeout(doneTimer.current);
      window.removeEventListener('pointerdown', onSkip);
      window.removeEventListener('keydown', onSkip);
      window.removeEventListener('wheel', onSkip);
      window.removeEventListener('touchstart', onSkip);
      body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'done') { document.body.style.overflow = ''; }
  }, [phase]);

  if (phase === 'done') return null;

  const src = ar ? 'images/hala ar tx.png' : 'images/hala en tx.png';

  return (
    <div className={`hala-intro${phase === 'out' ? ' is-out' : ''}`} data-dir={ar ? 'rtl' : 'ltr'} aria-hidden="true">
      <style>{`
        .hala-intro {
          position: fixed; inset: 0; z-index: 100002;
          display: grid; place-items: center; overflow: hidden;
          background: #20103d;
          transition: opacity .6s ease;
        }
        .hala-intro.is-out { opacity: 0; }
        .hala-intro__stage { position: relative; display: inline-flex; align-items: center; }
        .hala-intro__word {
          position: relative; z-index: 2;
          height: clamp(84px, 22vh, 260px); width: auto; display: block;
          animation: hala-enter 1s cubic-bezier(.16,.85,.25,1) both;
        }
        /* The sonic streak trails behind the word (opposite the reading direction). */
        .hala-intro__streak {
          position: absolute; z-index: 1; top: 50%; height: 42%;
          width: 66vw; pointer-events: none; filter: blur(7px);
          transform: translateY(-50%) scaleX(0.15);
          animation: hala-streak 1.15s ease-out both;
        }
        .hala-intro__streak::after {
          content: ""; position: absolute; inset: 34% 0; filter: blur(1px);
          background: inherit; opacity: .9;
        }
        .hala-intro[data-dir="ltr"] .hala-intro__streak {
          right: 58%; transform-origin: right center;
          background: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent, #7c4dff) 75%, transparent) 62%, #efe9ff 100%);
        }
        .hala-intro[data-dir="ltr"] .hala-intro__word { animation-name: hala-enter-ltr; }
        .hala-intro[data-dir="rtl"] .hala-intro__streak {
          left: 58%; transform-origin: left center;
          background: linear-gradient(270deg, transparent 0%, color-mix(in srgb, var(--accent, #7c4dff) 75%, transparent) 62%, #efe9ff 100%);
        }
        .hala-intro[data-dir="rtl"] .hala-intro__word { animation-name: hala-enter-rtl; }

        @keyframes hala-enter-ltr {
          0%   { transform: translateX(-46vw) scale(.97); filter: blur(7px); opacity: 0; }
          45%  { opacity: 1; filter: blur(2.5px); }
          100% { transform: translateX(0) scale(1); filter: blur(0); opacity: 1; }
        }
        @keyframes hala-enter-rtl {
          0%   { transform: translateX(46vw) scale(.97); filter: blur(7px); opacity: 0; }
          45%  { opacity: 1; filter: blur(2.5px); }
          100% { transform: translateX(0) scale(1); filter: blur(0); opacity: 1; }
        }
        @keyframes hala-streak {
          0%   { opacity: 0; transform: translateY(-50%) scaleX(.12); }
          22%  { opacity: .95; }
          60%  { opacity: .5; transform: translateY(-50%) scaleX(1); }
          100% { opacity: 0; transform: translateY(-50%) scaleX(1.18); }
        }
      `}</style>
      <div className="hala-intro__stage">
        <span className="hala-intro__streak" />
        <img className="hala-intro__word" src={src} alt="" />
      </div>
    </div>
  );
}
