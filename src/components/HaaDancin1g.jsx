import { useEffect, useRef, useState } from 'react';

/* ============================================================
   <HaaDancing /> — Ha'a plays the oud, dances on click / space.
   Self-contained: just needs /images/base.png and /images/arm.png.

   Props (all optional):
     size          number(px) or CSS length      default 320
     spaceAnywhere  true = spacebar works without focusing first
                    (good for a full-screen 404; leave off elsewhere
                    so it won't hijack space on scrollable pages)
     className / style  passed through for positioning
   ============================================================ */

/* ---------- Oud audio engine: Karplus-Strong plucked string, maqam Rast ---------- */
const DAMPING = 0.50, DECAY = 0.9994, WET = 0.26;
const T = 130.81, hz = (c) => T * Math.pow(2, c / 1200);
const R = { C2:hz(-1200), C3:hz(0), D3:hz(200), Eh3:hz(350), F3:hz(500), G3:hz(700), A3:hz(900), C4:hz(1200) };
const PHRASE = [
  {t:0,f:R.C3,d:0.5,g:0.9},{t:0.38,f:R.D3,d:0.45,g:0.85},{t:0.74,f:R.Eh3,d:0.45,g:0.9},
  {t:1.10,f:R.F3,d:0.45,g:0.85},{t:1.46,f:R.G3,d:0.55,g:0.95},{t:1.66,f:R.G3,d:0.32,g:0.55},
  {t:1.80,f:R.G3,d:0.32,g:0.55},{t:1.96,f:R.A3,d:0.40,g:0.8},{t:2.22,f:R.G3,d:0.40,g:0.8},
  {t:2.58,f:R.F3,d:0.40,g:0.8},{t:2.94,f:R.Eh3,d:0.42,g:0.85},{t:3.30,f:R.D3,d:0.42,g:0.8},
  {t:3.68,f:R.C3,d:1.20,g:1.0},{t:3.72,f:R.C2,d:1.30,g:0.65},
];
const PHRASE_DUR = 4.9;

function createOudPlayer() {
  let ctx = null, master = null, bodyIn = null, built = false;
  const makeIR = (sec, decay) => {
    const sr = ctx.sampleRate, len = Math.floor(sr * sec), ir = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return ir;
  };
  const build = () => {
    master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    bodyIn = ctx.createGain();
    const p1 = ctx.createBiquadFilter(); p1.type = 'peaking'; p1.frequency.value = 120; p1.Q.value = 1.1; p1.gain.value = 5;
    const p2 = ctx.createBiquadFilter(); p2.type = 'peaking'; p2.frequency.value = 380; p2.Q.value = 1.0; p2.gain.value = 3;
    const tame = ctx.createBiquadFilter(); tame.type = 'lowpass'; tame.frequency.value = 4600; tame.Q.value = 0.5;
    bodyIn.connect(p1); p1.connect(p2); p2.connect(tame);
    const dry = ctx.createGain(); dry.gain.value = 1 - WET * 0.4;
    const wet = ctx.createGain(); wet.gain.value = WET;
    const conv = ctx.createConvolver(); conv.buffer = makeIR(1.5, 3.0);
    tame.connect(dry); dry.connect(master);
    tame.connect(conv); conv.connect(wet); wet.connect(master);
    built = true;
  };
  const ksBuffer = (freq, dur) => {
    const sr = ctx.sampleRate, N = Math.max(2, Math.round(sr / freq)), total = Math.floor(sr * (dur + 0.05));
    const buf = ctx.createBuffer(1, total, sr), out = buf.getChannelData(0), line = new Float32Array(N);
    for (let i = 0; i < N; i++) line[i] = Math.random() * 2 - 1;
    let idx = 0;
    for (let i = 0; i < total; i++) { const cur = line[idx], nxt = line[(idx + 1) % N]; out[i] = cur;
      line[idx] = (cur * (1 - DAMPING) + nxt * DAMPING) * DECAY; idx = (idx + 1) % N; }
    return buf;
  };
  const pluck = (time, freq, dur, gain) => {
    [-6, 6].forEach((cents, i) => {
      const f = freq * Math.pow(2, cents / 1200);
      const src = ctx.createBufferSource(); src.buffer = ksBuffer(f, dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(gain * 0.55, time + 0.004);
      g.gain.exponentialRampToValueAtTime(gain * 0.0006, time + dur);
      const pan = ctx.createStereoPanner(); pan.pan.value = i ? 0.22 : -0.22;
      src.connect(g); g.connect(pan); pan.connect(bodyIn);
      src.start(time + i * 0.004); src.stop(time + dur + 0.1);
    });
  };
  return {
    play() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (!built) build();
      if (ctx.state === 'suspended') ctx.resume();
      const t0 = ctx.currentTime + 0.06;
      for (const n of PHRASE) pluck(t0 + n.t, n.f, n.d, n.g);
    },
  };
}

/* ---------- one-time scoped stylesheet (animations only — layout is inline & can't balloon) ---------- */
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

export default function HaaDancing({ size = 320, spaceAnywhere = false, className = '', style = {} }) {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => { injectStyles(); }, []);

  const play = () => {
    if (!playerRef.current) playerRef.current = createOudPlayer();
    playerRef.current.play();
    setPlaying(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPlaying(false), PHRASE_DUR * 1000);
  };

  // keyboard when the character itself is focused (click or tab to it)
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); play(); }
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
      play();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [spaceAnywhere]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const width = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      ref={rootRef}
      className={`haa-dancing${playing ? ' is-playing' : ''}${className ? ' ' + className : ''}`}
      onClick={play}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Ha'a playing the oud"
      style={{ position: 'relative', display: 'inline-block', width, lineHeight: 0, cursor: 'pointer', transformOrigin: '50% 85%', ...style }}
    >
      <div className="haa-notes" aria-hidden="true" style={{ position: 'absolute', left: '42%', top: '22%', zIndex: 2, pointerEvents: 'none' }}>
        <span className="haa-note">♪</span><span className="haa-note">♫</span><span className="haa-note">♪</span>
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
