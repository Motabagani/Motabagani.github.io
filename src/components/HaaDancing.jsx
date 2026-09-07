import { useEffect, useRef, useState } from 'react';

/* ============================================================
   <HaaDancing /> — Ha'a plays your oud recording and dances.
   Needs: /images/base.png, /images/arm.png, and your audio file.

   Props (all optional):
     size          number(px) or CSS length     default 320
     audioSrc      path to your mp3              default 'audio/oud.mp3'
     spaceAnywhere true = spacebar works without focusing first
                   (good for a full-screen 404; leave off elsewhere
                   so it won't hijack space on scrollable pages)
     className / style  passed through for positioning

   Behavior: click/space toggles play <-> pause, resuming from
   where you stopped. Ha'a dances while it plays. When the track
   finishes it resets, so the next press starts from the top.
   ============================================================ */

const STYLE_ID = 'haa-dancing-styles';
const CSS = `
@keyframes haa-bob{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-8px) rotate(-1.2deg)}50%{transform:translateY(-2px) rotate(0)}75%{transform:translateY(-8px) rotate(1.2deg)}}
@keyframes haa-strum{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(6deg)}}
@keyframes haa-noteup{0%{transform:translateY(0) scale(.6);opacity:0}18%{opacity:.95}100%{transform:translateY(-72px) scale(1.05);opacity:0}}
.haa-dancing.is-playing{animation:haa-bob .9s ease-in-out infinite}
.haa-dancing.is-playing .haa-arm{animation:haa-strum .22s ease-in-out infinite}
.haa-note{position:absolute;font-size:24px;color:#f5a05c;opacity:0;pointer-events:none}
.haa-dancing.is-playing .haa-note:nth-child(1){animation:haa-noteup 2s linear infinite}
.haa-dancing.is-playing .haa-note:nth-child(2){left:28px;animation:haa-noteup 2s linear .6s infinite}
.haa-dancing.is-playing .haa-note:nth-child(3){left:-22px;animation:haa-noteup 2s linear 1.2s infinite}
@media (prefers-reduced-motion: reduce){.haa-dancing.is-playing,.haa-dancing.is-playing .haa-arm,.haa-dancing.is-playing .haa-note{animation:none}}
`;
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID; el.textContent = CSS;
  document.head.appendChild(el);
}

export default function HaaDancing({
  size = 320,
  audioSrc = 'audio/oud.mp3',
  spaceAnywhere = false,
  className = '',
  style = {},
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  // toggle: reads the audio element's live state, so no stale-closure issues
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      a.pause(); // keeps currentTime, so the next press resumes
    }
  };

  // keyboard when the character itself is focused (click or tab to it)
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); toggle(); }
  };

  // optional: spacebar from anywhere (skips inputs and other focused controls)
  useEffect(() => {
    if (!spaceAnywhere) return;
    const handler = (e) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const a = document.activeElement;
      if (a === rootRef.current) return; // its own onKeyDown handles it
      const tag = a && a.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A' || (a && a.isContentEditable)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spaceAnywhere]);

  // stop audio if the component unmounts
  useEffect(() => () => { const a = audioRef.current; if (a) a.pause(); }, []);

  const width = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      ref={rootRef}
      className={`haa-dancing${playing ? ' is-playing' : ''}${className ? ' ' + className : ''}`}
      onClick={toggle}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Ha'a playing the oud"
      style={{ position: 'relative', display: 'inline-block', width, lineHeight: 0, cursor: 'pointer', transformOrigin: '50% 85%', ...style }}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { const a = audioRef.current; if (a) a.currentTime = 0; setPlaying(false); }}
      />

      <div className="haa-notes" aria-hidden="true" style={{ position: 'absolute', left: '42%', top: '22%', zIndex: 2, pointerEvents: 'none' }}>
        <span className="haa-note">&#9834;</span><span className="haa-note">&#9835;</span><span className="haa-note">&#9834;</span>
      </div>

      <img
        className="haa-base"
        src="/images/base.png"
        alt="Ha'a the character playing an oud"
        style={{ display: 'block', width: '100%', height: 'auto', userSelect: 'none', WebkitUserDrag: 'none' }}
      />
      <img
        className="haa-arm"
        src="/images/arm.png"
        alt=""
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', transformOrigin: '20.2% 42.6%', userSelect: 'none', WebkitUserDrag: 'none' }}
      />
    </div>
  );
}
