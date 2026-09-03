export const BRAND = {
  mark:       "images/rafeeq-bright.png",  // light artwork — used on the DARK theme
  markLight:  "images/rafeeq-dark.png",    // dark artwork  — used on the LIGHT theme
  returnMark: "images/logowhite.png",  // mark on the "back to portfolio" bar

  fontFaces: [
    // { family: "SF Grandezza", src: "/fonts/SFGrandezza-Regular.woff2", weight: 400 },
    // { family: "SF Grandezza", src: "/fonts/SFGrandezza-Bold.woff2",    weight: 700 },
    // { family: "Mada",         src: "/fonts/Mada-Regular.woff2",        weight: 400 },
    // { family: "Mada",         src: "/fonts/Mada-Bold.woff2",           weight: 700 },
  ],
  fontLatin:  '"SF Grandezza", "Bricolage Grotesque", system-ui, sans-serif',
  fontArabic: '"Mada", "Noto Naskh Arabic", system-ui, sans-serif',
  /* Used when the page is Arabic. Latin faces are listed FIRST and the generic
     fallbacks come last, so Latin characters render in the Latin font while
     Arabic characters — absent from it — fall through to the Arabic font.
     Putting system-ui before the Arabic faces would swallow Arabic, so don't. */
  fontMixed:  '"SF Grandezza", "Bricolage Grotesque", "Mada", "Noto Naskh Arabic", system-ui, sans-serif',
  fontMono:   '"JetBrains Mono", ui-monospace, monospace',
};

/* Turns BRAND.fontFaces into real @font-face rules. woff2 is assumed; add more
   formats by listing the same family twice with different src paths. */
const FONT_FACE_CSS = BRAND.fontFaces.map(f => `
@font-face{
  font-family:"${f.family}";
  src:url("${f.src}") format("${(f.src.split(".").pop() || "woff2") === "woff" ? "woff" : "woff2"}");
  font-weight:${f.weight || 400};
  font-style:${f.style || "normal"};
  font-display:swap;
}`).join("");

export const CSS = FONT_FACE_CSS + `
.rafeeq{--font-latin:${BRAND.fontLatin};--font-ar:${BRAND.fontArabic};--font-mono:${BRAND.fontMono};--font-mixed:${BRAND.fontMixed};}
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
/* full-screen takeover: escape Vite's #root width cap while Rafeeq is on screen */
#root:has(.rafeeq){max-width:none;width:100%;margin:0;padding:0;text-align:start;}
body:has(.rafeeq){margin:0;display:block;}

/* return-to-portfolio — sits at the end of the page like a footer */
.rafeeq .rq-return{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  margin-block-start:auto; flex:none; position:relative; z-index:0;
  padding:20px clamp(20px,5vw,44px);
  border-block-start:1px solid rgba(206,178,255,.30);
  /* Fixed colours, no transparency and no backdrop-filter: the bar belongs to
     the portfolio shell, so it must look identical in dark and light themes. */
  background:linear-gradient(135deg, #4B2E8C 0%, #351C68 48%, #20103D 100%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.22);
  font-family:var(--font-latin); font-weight:400; font-size:17px;
  color:#fff; text-decoration:none; letter-spacing:.01em;
  transition:background .18s ease;
}
.rafeeq[dir="rtl"] .rq-return{ font-family:var(--font-ar); }
.rafeeq .rq-return:hover{ background:linear-gradient(135deg, #5A38A6 0%, #402180 48%, #2A1550 100%); }
.rafeeq .rq-return .rq-return-txt{ white-space:nowrap; }
.rafeeq .rq-return img{ width:26px !important; height:26px !important; flex:none; object-fit:contain; filter:brightness(0) invert(1); }





.rafeeq{--r:16px;--r-sm:10px;--r-pill:999px;min-height:100dvh;font-size:15.5px;line-height:1.6;
  display:flex;flex-direction:column;
  -webkit-font-smoothing:antialiased;color:var(--ink);position:relative;overflow-x:hidden;
  background:radial-gradient(1100px 620px at var(--glow-x) -140px, var(--body-glow), var(--bg) 60%), var(--bg);}
.rafeeq[data-theme="dark"]{
  --bg:#0F2A20;--surface:#16382B;--surface-2:#1C4234;--body-glow:#1D4A39;
  --ink:#E9F2ED;--ink-soft:#A6BEB4;--ink-faint:#7B9488;
  --line:#2A4C3E;--line-soft:#20402F;
  --accent:#2FD6B0;--accent-ink:#8FF0D6;--accent-soft:rgba(47,214,176,.13);--on-accent:#06231A;
  --coral:#E7998A;--amber:#E0B15C;--amber-soft:rgba(224,177,92,.14);--red:#E38279;--red-soft:rgba(227,130,121,.15);
  --glass:rgba(18,44,34,.62);--glass-brd:rgba(150,228,200,.20);--scrim:rgba(6,18,13,.45);
  --shadow:0 1px 2px rgba(0,0,0,.3),0 10px 28px -14px rgba(0,0,0,.55);
  --logo-mark:#2FD6B0;--logo-mark2:#8FF0D6;}
.rafeeq[data-theme="light"]{
  --bg:#F3F1EA;--surface:#FFFFFF;--surface-2:#F7F4EC;--body-glow:#FBFAF3;
  --ink:#132A20;--ink-soft:#4C5A52;--ink-faint:#8A968E;
  --line:#E3DFD4;--line-soft:#ECE8DD;
  --accent:#0E7A58;--accent-ink:#0A5239;--accent-soft:#E2F0E9;--on-accent:#FFFFFF;
  --coral:#C96A54;--amber:#9A6611;--amber-soft:#FAF0DA;--red:#A8362F;--red-soft:#F8E6E3;
  --glass:rgba(255,255,255,.66);--glass-brd:rgba(20,60,45,.14);--scrim:rgba(20,40,30,.22);
  --shadow:0 1px 2px rgba(20,32,26,.05),0 10px 28px -14px rgba(20,32,26,.16);
  --logo-mark:#0E7A58;--logo-mark2:#2FA37E;}
.rafeeq[dir="rtl"]{--glow-x:92%} .rafeeq[dir="ltr"]{--glow-x:8%}
.rafeeq[dir="rtl"]{font-family:var(--font-mixed)}
/* ---- Isolation from the host site -------------------------------------
   Rafeeq is mounted inside the portfolio, so it inherits that site's global
   element rules. The portfolio sets h1,h2 with color:var(--text-h), and its
   --text-h flips to near-white under prefers-color-scheme:dark — which made
   headings invisible on Rafeeq's LIGHT theme. Anything Rafeeq renders must
   take its colour from Rafeeq's own tokens, never the host's.
   Add to this block if another host rule ever leaks in. */
.rafeeq h1,.rafeeq h2,.rafeeq h3,.rafeeq h4,.rafeeq h5,.rafeeq h6{color:var(--ink);font-family:inherit;font-weight:600}
.rafeeq p,.rafeeq li,.rafeeq dd,.rafeeq dt,.rafeeq label,.rafeeq span,.rafeeq div,.rafeeq td,.rafeeq th{color:inherit}
.rafeeq{color:var(--ink)}
.rafeeq code{background:var(--surface-2);color:var(--ink);font-family:var(--font-mono)}
.rafeeq a{color:var(--accent)}

.rafeeq[dir="ltr"]{font-family:var(--font-latin)}
.rafeeq *{box-sizing:border-box;margin:0;padding:0}
.rafeeq h1,.rafeeq h2,.rafeeq h3{line-height:1.28;letter-spacing:0;font-weight:700}
.rafeeq[dir="ltr"] h1,.rafeeq[dir="ltr"] h2,.rafeeq[dir="ltr"] h3{font-family:var(--font-latin);letter-spacing:-.01em;line-height:1.14}
.rafeeq .mono{font-family:var(--font-mono)}
/* :where() keeps this at (0,1,0) so a single-class rule like .rq-avatar or
   .rq-iconbtn can still set its own background — otherwise this reset silently
   wins against every styled button in the app. */
.rafeeq :where(button){font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;font-size:inherit}
.rafeeq input,.rafeeq select,.rafeeq textarea{font-family:inherit;color:var(--ink)}
.rafeeq svg{flex:none}
/* directional arrows flip in RTL (handoff §3) */
.rafeeq[dir="rtl"] .dirsvg{transform:scaleX(-1)}

/* buttons */
.rq-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;
  border-radius:var(--r-sm);font-weight:600;font-size:15px;transition:.16s;line-height:1.3}
.rq-btn svg{width:17px;height:17px;stroke-width:2}
.rq-primary{background:var(--accent);color:var(--on-accent)}
.rq-primary:hover{filter:brightness(1.07)}
.rq-primary:disabled{opacity:.45;cursor:not-allowed}
.rq-ghost{background:var(--surface);border:1px solid var(--line)}
.rq-ghost:hover{border-color:var(--ink-faint)}
.rq-btn:focus-visible,.rafeeq button:focus-visible,.rafeeq input:focus-visible,.rafeeq select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* topbar — coral hairline is the one warm note */
.rq-topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:14px;
  padding:12px clamp(16px,4vw,36px);background:var(--glass);backdrop-filter:blur(14px);
  border-block-end:1px solid var(--coral)}
.rq-burger{width:40px;height:40px;border-radius:11px;border:1px solid var(--line);background:var(--surface);
  display:grid;place-items:center;color:var(--ink-soft)}
.rq-burger svg{width:19px;height:19px;stroke-width:2}
.rq-who{display:flex;align-items:center;gap:10px;min-width:0;margin-inline-start:auto}
.rq-who{position:relative}
.rq-usermenu{position:absolute;inset-inline-start:0;inset-block-start:calc(100% + 8px);z-index:62;
  min-width:212px;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);
  box-shadow:0 16px 38px rgba(0,0,0,.34);padding:6px}
.rq-usermenu .rq-ditem{width:100%}
.rq-usermenu-sep{height:1px;background:var(--line);margin:5px 8px}
.rq-profile{display:grid;gap:0;margin:0}
.rq-profile > div{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;
  padding:14px 0;border-block-end:1px solid var(--line)}
.rq-profile > div:last-child{border-block-end:0}
.rq-profile dt{font-size:12.5px;color:var(--ink-faint)}
.rq-profile dd{margin:0;font-size:14px;color:var(--ink);font-weight:500;text-align:end}
.rq-avatar{width:38px;height:38px;border-radius:50%;background:var(--accent);color:var(--on-accent);border:0;cursor:pointer;
  display:grid;place-items:center;font-weight:700;font-size:15px}
.rq-who .nm{font-weight:600;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-who .nm small{display:block;font-weight:500;font-size:11.5px;color:var(--ink-faint)}
.rq-logo{display:flex;align-items:center;gap:10px}
.rq-mark-img{object-fit:contain;display:block}
.rq-logo .wm{font-weight:700;font-size:21px;line-height:1;text-align:start}
.rq-logo .wm small{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);font-weight:500;margin-block-start:2px;font-family:var(--font-latin)}
/* On a phone the logo, full name and burger crowd each other and the name
   clips mid-word — drop the name block; the avatar still opens the same menu. */
@media(max-width:560px){.rq-who .nm{display:none}}

/* drawer */
.rq-scrim{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(3px);z-index:60;animation:rqFade .22s ease both}
.rq-drawer{position:fixed;inset-block:0;inset-inline-end:0;width:min(320px,86vw);z-index:61;
  background:var(--glass);backdrop-filter:blur(22px);border-inline-end:1px solid var(--glass-brd);
  padding:22px 18px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;
  animation:rqSlide .28s cubic-bezier(.2,.8,.2,1) both}
@keyframes rqSlide{from{transform:translateX(calc(var(--slide-dir) * -100%))}to{transform:none}}
/* The burger sits at the inline end of the topbar, so the panel slides in
   from that same edge - right in English, left in Arabic. */
.rafeeq[dir="ltr"] .rq-drawer{--slide-dir:-1}.rafeeq[dir="rtl"] .rq-drawer{--slide-dir:1}
@keyframes rqFade{from{opacity:0}to{opacity:1}}
.rq-drawer .dh{display:flex;align-items:center;gap:11px;padding-block-end:16px;border-block-end:1px solid var(--line-soft);margin-block-end:10px}
.rq-ditem{display:flex;align-items:center;gap:12px;width:100%;text-align:start;padding:11px 12px;border-radius:var(--r-sm);font-weight:500;color:var(--ink-soft);transition:.14s}
.rq-ditem:hover{background:var(--accent-soft);color:var(--ink)}
.rq-ditem svg{width:18px;height:18px;stroke-width:1.9}
.rq-ditem .end{margin-inline-start:auto;font-size:13px;color:var(--ink-faint)}
.rq-dlabel{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);padding:14px 12px 6px}
.rq-seg{display:flex;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-pill);padding:3px;margin:4px 12px}
.rq-seg button{flex:1;padding:7px 10px;border-radius:var(--r-pill);font-size:13.5px;font-weight:600;color:var(--ink-soft)}
.rq-seg button.on{background:var(--accent);color:var(--on-accent)}

/* cards + layout */
.rq-content{padding:clamp(20px,4vw,40px);padding-block-end:clamp(64px,10vh,120px);
  max-width:880px;margin-inline:auto;width:100%;flex:1 0 auto}
.rq-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow)}
.rq-rise{animation:rqRise .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes rqRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.rafeeq *{animation-duration:.001s!important;transition-duration:.001s!important}}

/* home hero */
.rq-hero{position:relative;overflow:hidden;padding:clamp(24px,4vw,36px);border-radius:var(--r);
  background:linear-gradient(140deg,var(--surface-2),var(--surface));border:1px solid var(--line)}
.rq-hero .eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--accent);text-transform:uppercase}
.rq-hero h1{font-size:clamp(24px,4vw,32px);margin-block:8px 10px}
.rq-hero p{color:var(--ink-soft);max-width:62ch}
.rq-hero .leafbg{position:absolute;inset-block-start:-30px;inset-inline-end:-30px;width:220px;height:220px;opacity:.09;pointer-events:none}
.rq-meta{display:flex;flex-wrap:wrap;gap:8px;margin-block-start:18px}
.rq-chip{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:var(--r-pill);
  background:var(--surface);border:1px solid var(--line);font-size:13px;font-weight:600;color:var(--ink-soft)}
.rq-chip svg{width:14px;height:14px;stroke-width:2;color:var(--accent)}

/* phase cards */
.rq-phases{display:grid;gap:14px;margin-block-start:22px}
.rq-phase{display:flex;gap:16px;align-items:center;padding:18px 20px;flex-wrap:wrap}
.rq-phase .pnum{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;flex:none;
  font-weight:700;font-size:21px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--line)}
.rq-phase.locked .pnum{background:var(--surface-2);color:var(--ink-faint)}
.rq-phase.approved .pnum{background:var(--accent);color:var(--on-accent)}
.rq-phase .pb{flex:1;min-width:180px}
.rq-phase h3{font-size:17.5px}
.rq-phase .pw{font-size:13px;color:var(--ink-faint);margin-block-start:2px}
.rq-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:var(--r-pill);font-size:12.5px;font-weight:700}
.rq-pill .led{width:7px;height:7px;border-radius:50%;background:currentColor}
.rq-pill.green{background:var(--accent-soft);color:var(--accent)}
.rq-pill.amber{background:var(--amber-soft);color:var(--amber)}
.rq-pill.gray{background:var(--surface-2);color:var(--ink-faint);border:1px solid var(--line)}
.rq-callout{font-size:12.5px;color:var(--ink-soft);background:var(--accent-soft);
  border:1px solid color-mix(in srgb,var(--accent) 32%,transparent);
  border-radius:var(--r-sm);padding:10px 12px;margin-block:0 12px}
.rq-warn{background:color-mix(in srgb,var(--amber) 16%,transparent);border-color:color-mix(in srgb,var(--amber) 40%,transparent);color:var(--ink)}
.rq-issuer-tag{font-size:10.5px;font-weight:700;letter-spacing:.06em;color:var(--accent);
  border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);border-radius:var(--r-pill);
  padding:2px 8px;flex:none;margin-inline-start:8px;vertical-align:middle}
.rq-termhead{display:flex;align-items:center;gap:9px;margin:18px 0 9px}
.rq-termhead .lbl{font-size:12.5px;font-weight:700;color:var(--ink-soft);letter-spacing:.02em}
.rq-termhead .ln{flex:1;height:1px;background:var(--line)}
.rq-sec-h{font-size:16px;margin:26px 0 4px}
.rq-sec-s{font-size:12.5px;color:var(--ink-faint);margin:0 0 6px}
.rq-file-acts{display:flex;gap:8px;flex-wrap:wrap;flex:none}
@media(max-width:560px){.rq-file-acts{width:100%}.rq-file-acts .rq-btn{flex:1;justify-content:center}}
.rq-files-hd{display:flex;align-items:center;gap:10px;margin-block-end:10px}
.rq-files-tag{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--ink-faint);
  border:1px solid var(--line);border-radius:var(--r-pill);padding:2px 9px}
.rq-ref{display:flex;align-items:center;gap:7px;margin-block-start:5px;font-size:12px}
.rq-ref span{color:var(--ink-faint)}
.rq-ref b{letter-spacing:.05em;color:var(--ink-soft);font-weight:600}
.rq-checks{display:grid;gap:7px;margin-block-start:10px}
.rq-checks .ck{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:var(--amber)}
.rq-checks .ck.ok{color:var(--accent)}
.rq-checks .ck span{color:var(--ink-soft)}
.rq-reqno{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-block-end:10px;margin-block-end:10px;
  border-block-end:1px solid var(--line)}
.rq-reqno .k{font-size:12px;color:var(--ink-faint)}
.rq-reqno b{font-size:15px;letter-spacing:.06em;color:var(--ink)}
.rq-mailcard{border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);padding:13px 14px;margin-block-start:12px}
.rq-mailcard .mh{display:flex;gap:10px;align-items:flex-start;margin-block-end:10px;color:var(--accent)}
.rq-mailcard .mh .t{font-weight:600;font-size:13.5px;color:var(--ink)}
.rq-mailcard .mh .d{font-size:12.5px;color:var(--ink-soft);font-weight:400}
.rq-mailcard .mb{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);
  padding:11px 13px;font-size:12.5px;line-height:1.75;white-space:pre-wrap;overflow-x:auto;margin:0 0 10px;text-align:start}
.rq-mailcard .ma{display:flex;gap:8px;flex-wrap:wrap;margin-block-end:10px}
.rq-mailcard .mi{margin:0;padding-inline-start:18px;font-size:12.5px;color:var(--ink-soft);line-height:1.8}
.rq-item.pending{border-color:color-mix(in srgb,var(--amber) 45%,transparent);background:color-mix(in srgb,var(--amber) 8%,transparent)}
.rq-course.locked{opacity:.9;background:var(--surface)}
.rq-course.locked input{cursor:default}
.rq-course.done{display:flex;align-items:center;gap:11px;padding:12px 14px;color:var(--accent)}
.rq-course.done .ib2{flex:1;min-width:0}
.rq-course.done .t{font-size:13.5px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-course.done .d{font-size:12px;color:var(--ink-faint)}
.rq-course-done{display:flex;align-items:flex-end;padding-block-end:2px}
.rq-course-done .rq-btn{width:100%;justify-content:center}
/* finished-phase record view */
.rq-rvhead{display:flex;align-items:center;gap:14px;flex-wrap:wrap;
  background:var(--surface);border:1px solid var(--line);border-radius:var(--r);
  padding:16px 18px;margin-block-end:14px}
.rq-rvhead .ri{width:44px;height:44px;flex:none;display:grid;place-items:center;border-radius:50%;
  background:color-mix(in srgb,var(--amber) 18%,transparent);color:var(--amber)}
.rq-rvhead.ok .ri{background:var(--accent-soft);color:var(--accent)}
.rq-rvhead .tx{flex:1;min-width:180px}
.rq-rvhead h1{font-size:21px;margin:0 0 3px}
.rq-rvhead p{margin:0;font-size:13px;color:var(--ink-soft)}
.rq-ro-note{font-size:12.5px;color:var(--ink-faint);margin:0 0 12px}
.rq-ro{border:0;margin:0;padding:0;min-width:0}
.rq-ro input,.rq-ro select,.rq-ro textarea{opacity:.82}
.rq-ro .rq-btn,.rq-ro .rq-iconbtn,.rq-ro .rq-date-x,.rq-ro .rq-date-cal,.rq-ro label.rq-btn{display:none}
.rq-ro .rq-wnav,.rq-ro .rq-course-act,.rq-ro .rq-course-done{display:none}
.rq-ro .rq-agree{cursor:default}
/* course rows */
.rq-course{border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);padding:12px 14px 4px}
.rq-course + .rq-course{margin-block-start:10px}
.rq-course-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-block-end:8px}
.rq-course-hd .n{font-size:12.5px;font-weight:700;color:var(--ink-faint);letter-spacing:.02em}
.rq-iconbtn{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:8px;
  border:1px solid var(--line);background:var(--surface);color:var(--ink-faint);cursor:pointer}
.rq-iconbtn:hover{border-color:var(--accent);color:var(--accent)}
.rq-iconbtn.danger:hover{border-color:#e0574f;color:#e0574f;background:color-mix(in srgb,#e0574f 10%,transparent)}
.rq-course-act{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-block-start:12px}
.rq-course-act .rq-btn.danger{color:#e0574f;border-color:color-mix(in srgb,#e0574f 40%,transparent)}
.rq-course-act .rq-btn.danger:hover:not(:disabled){background:color-mix(in srgb,#e0574f 12%,transparent);border-color:#e0574f}
.rq-course-act .rq-btn:disabled{opacity:.45;cursor:not-allowed}
.rq-course-sum{margin-inline-start:auto;font-size:12.5px;color:var(--ink-faint)}
.rq-empty{font-size:13px;color:var(--ink-faint);border:1px dashed var(--line);border-radius:var(--r-sm);
  padding:14px;text-align:center;margin:0}
@media(max-width:560px){.rq-course-act{gap:8px}.rq-course-act .rq-btn{flex:1 1 auto;justify-content:center}
  .rq-course-sum{flex:1 0 100%;margin-inline-start:0;text-align:center}}
/* ---- the mark drawing itself: the app's loading state ---- */
.rq-draw{display:block;height:auto;overflow:visible}
.rq-draw__nib{stroke-dasharray:1;stroke-dashoffset:1;
  animation:rq-draw 1.9s cubic-bezier(.62,.02,.28,1) .25s forwards}
@keyframes rq-draw{to{stroke-dashoffset:0}}
.rq-draw__flood{opacity:0;animation:rq-flood .45s linear 1.75s forwards}
@keyframes rq-flood{to{opacity:1}}
/* looping variant, for waits of unknown length */
.rq-draw.loop .rq-draw__nib{animation:rq-draw 1.9s cubic-bezier(.62,.02,.28,1) .1s infinite}
.rq-draw.loop .rq-draw__flood{animation:rq-flood .4s linear 1.6s infinite alternate}
.rq-loading{display:grid;place-items:center;gap:14px;padding:clamp(36px,9vh,90px) 20px;text-align:center}
.rq-loading p{margin:0;font-size:13.5px;color:var(--ink-soft)}
@media(prefers-reduced-motion:reduce){
  .rq-draw__nib{animation:none;stroke-dashoffset:0}
  .rq-draw__flood{animation:none;opacity:1}
}
.rq-busy{position:fixed;inset:0;z-index:80;display:grid;place-items:center;
  background:color-mix(in srgb,var(--bg) 78%,transparent);backdrop-filter:blur(3px);
  animation:rq-fadein .18s ease}
@keyframes rq-fadein{from{opacity:0}to{opacity:1}}
.rq-verify{display:grid;place-items:center;gap:10px;text-align:center;padding:clamp(28px,7vh,64px) 8px}
.rq-verify h2{font-size:19px;margin:6px 0 0}
.rq-verify p{margin:0;font-size:13.5px;color:var(--ink-soft);max-width:34ch}
/* calendar field */
.rq-date{position:relative}
.rq-date-box{display:flex;align-items:center;gap:2px;border:1px solid var(--line);border-radius:var(--r-sm);
  background:var(--surface-2);padding-inline-end:4px}
.rq-date-box:focus-within{outline:2px solid var(--accent);outline-offset:1px;border-color:var(--accent)}
.rq-date-box.err{border-color:#e0574f}
.rq-date-box.off{opacity:.55}
.rq-date-in{flex:1;min-width:0;border:0;background:0;color:var(--ink);font-size:14px;font-family:inherit;
  padding:10px 12px;font-variant-numeric:tabular-nums;letter-spacing:.04em}
.rq-date-in:focus{outline:none}
.rq-date-in::placeholder{color:var(--ink-faint);letter-spacing:.02em}
.rq-date-x,.rq-date-cal{width:28px;height:28px;flex:none;display:grid;place-items:center;border:0;border-radius:7px;
  background:0;color:var(--ink-faint);cursor:pointer}
.rq-date-x:hover{color:#e0574f;background:color-mix(in srgb,#e0574f 12%,transparent)}
.rq-date-cal:hover{color:var(--accent);background:var(--accent-soft)}
.rq-date-cal:disabled{cursor:not-allowed}
.rq-date-err{display:block;font-size:11.5px;color:#e0574f;margin-block-start:5px}
.rq-cal{position:absolute;inset-inline-start:0;inset-block-start:calc(100% + 6px);z-index:50;width:296px;
  background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);
  box-shadow:0 16px 38px rgba(0,0,0,.36);padding:10px}
.rq-cal-hd{display:flex;align-items:center;gap:4px;margin-block-end:8px}
.rq-cal-hd .nav{width:26px;height:28px;flex:none;display:grid;place-items:center;border-radius:7px;
  border:1px solid var(--line);background:var(--surface-2);color:var(--ink);cursor:pointer}
.rq-cal-hd .nav:hover{border-color:var(--accent);color:var(--accent)}
.rafeeq[dir="rtl"] .rq-cal-hd .nav svg{transform:scaleX(-1)}
.rq-cal-hd .mo{flex:1;display:flex;gap:5px;min-width:0}
.rq-cal-hd .mo select{flex:1;min-width:0;padding:6px 6px;font-size:12.5px;border:1px solid var(--line);
  border-radius:7px;background:var(--surface-2);color:var(--ink);font-family:inherit}
.rq-cal-wd{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-block-end:3px}
.rq-cal-wd span{text-align:center;font-size:11px;font-weight:700;color:var(--ink-faint);padding-block:4px}
.rq-cal-gd{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.rq-cal-gd .day{aspect-ratio:1;display:grid;place-items:center;border:0;border-radius:8px;background:transparent;
  color:var(--ink);font-size:13px;font-family:inherit;cursor:pointer;font-variant-numeric:tabular-nums}
.rq-cal-gd .day:hover:not(:disabled){background:var(--surface-2)}
.rq-cal-gd .day.today{box-shadow:inset 0 0 0 1px var(--line)}
.rq-cal-gd .day.cur{box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--accent) 55%,transparent)}
.rq-cal-gd .day.on{background:var(--accent);color:var(--on-accent);font-weight:700}
.rq-cal-gd .day.off{opacity:.28;cursor:not-allowed}
.rq-cal-ft{display:flex;gap:14px;align-items:center;margin-block-start:8px;padding-block-start:8px;border-block-start:1px solid var(--line)}
.rq-cal-ft .lnk{background:0;border:0;color:var(--accent);font-size:12.5px;font-family:inherit;cursor:pointer;padding:0}
.rq-cal-ft .lnk.end{margin-inline-start:auto;color:var(--ink-faint)}
.rq-cal-ft .lnk:disabled{color:var(--ink-faint);cursor:not-allowed}
.rq-cal.up{inset-block-start:auto;inset-block-end:calc(100% + 6px)}
@media(max-width:560px){.rq-cal{width:min(300px,86vw)}}
.rq-combo{position:relative}
.rq-combo>input{width:100%;padding-inline-end:34px}
.rq-combo-caret{position:absolute;inset-inline-end:11px;inset-block-start:50%;transform:translateY(-50%);display:grid;place-items:center;width:26px;height:26px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--ink-faint);cursor:pointer;transition:transform .16s ease,color .16s ease}
.rq-combo-caret:hover{color:var(--accent)}
.rq-combo-caret.open{transform:translateY(-50%) rotate(180deg);color:var(--accent)}
.rq-combo-caret:disabled{cursor:not-allowed;opacity:.5}
.rq-combo-list{position:absolute;inset-inline:0;inset-block-start:calc(100% + 4px);z-index:40;max-height:270px;overflow:auto;
  background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);box-shadow:0 12px 30px rgba(0,0,0,.32);
  overscroll-behavior:contain}
.rq-combo-grp{padding:7px 12px 5px;font-size:11.5px;font-weight:700;letter-spacing:.04em;
  color:var(--ink-faint);background:var(--surface-2);position:sticky;inset-block-start:0}
.rq-combo-opt{padding:9px 12px;font-size:13.5px;cursor:pointer;display:flex;align-items:baseline;gap:8px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-combo-opt.hi,.rq-combo-opt:hover{background:var(--surface-2)}
.rq-combo-opt .tag{font-size:12.5px;font-weight:700;color:var(--accent);flex:none;min-width:34px}
.rq-combo-opt .lbl{flex:none}
.rq-combo-opt .sub{color:var(--ink-faint);overflow:hidden;text-overflow:ellipsis}
.rq-combo-opt.none{color:var(--ink-faint);cursor:default}
.rq-progress{height:5px;border-radius:3px;background:var(--surface-2);overflow:hidden;margin-block-start:9px}
.rq-progress i{display:block;height:100%;background:var(--accent);border-radius:3px;transition:width .7s cubic-bezier(.2,.8,.2,1)}

/* chevron step bar — NO transforms. flex handles order, clip-path handles the point.
   (transform + clip-path together render inconsistently in Safari, and scaleX
   silently controls order too, which couples the two concerns.) */
.rq-chevs{display:flex;gap:4px;align-items:stretch;margin-block:4px 24px}
.rq-chev{flex:1;min-width:0;padding:12px 10px 12px 22px;background:var(--surface);border:1px solid var(--line);
  color:var(--ink-faint);font-weight:600;font-size:13px;display:flex;align-items:center;justify-content:center;gap:7px;
  clip-path:polygon(0 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 0 100%, 13px 50%);transition:.18s}
.rq-chev:first-child{clip-path:polygon(0 0, calc(100% - 13px) 0, 100% 50%, calc(100% - 13px) 100%, 0 100%);border-start-start-radius:0;padding-inline-start:14px}
/* RTL: flex already puts step ١ on the right — do NOT reverse. Only mirror the point. */
.rafeeq[dir="rtl"] .rq-chev{padding:12px 22px 12px 10px;
  clip-path:polygon(100% 0, 13px 0, 0 50%, 13px 100%, 100% 100%, calc(100% - 13px) 50%)}
.rafeeq[dir="rtl"] .rq-chev:first-child{clip-path:polygon(100% 0, 13px 0, 0 50%, 13px 100%, 100% 100%);padding-inline-start:14px}
.rq-chev>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-flex;align-items:center;gap:8px;min-width:0}
.rq-chev.active{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.rq-chev.done{background:var(--accent-soft);color:var(--accent);cursor:pointer}
.rq-chev.todo{cursor:not-allowed;opacity:.75}
.rq-chev .n{font-size:14px;font-weight:700}
@media(max-width:640px){.rq-chev>span .lbl{display:none}.rq-chevs{gap:3px;margin-block:2px 18px}
  .rq-chev{padding:11px 6px 11px 18px}
  .rafeeq[dir="rtl"] .rq-chev{padding:11px 18px 11px 6px}}

/* wizard panel + fields */
.rq-panel{padding:clamp(20px,3.5vw,30px)}
.rq-panel h2{font-size:21px}
.rq-panel .sub{color:var(--ink-soft);font-size:14px;margin-block:5px 22px}
.rq-field{margin-block-end:16px}
.rq-field label{display:block;font-size:13.5px;font-weight:600;margin-block-end:7px;color:var(--ink-soft)}
.rq-field label .req{color:var(--red)}
.rq-ib{display:flex;align-items:center;gap:10px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);padding-inline:13px;transition:.15s}
.rq-ib:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.rq-ib input,.rq-ib select{border:none;outline:none;background:none;padding-block:11px;width:100%;font-size:15px}
.rq-ib select option{color:#132A20;background:#fff}
.rq-field.err .rq-ib{border-color:var(--red);box-shadow:0 0 0 3px var(--red-soft)}
.rq-field .hint{display:none;font-size:12px;color:var(--red);margin-block-start:5px}
.rq-field.err .hint{display:block}
.rq-row2{display:grid;grid-template-columns:1fr 1fr;gap:13px}
@media(max-width:560px){.rq-row2{grid-template-columns:1fr}}
.rq-rec{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line-soft);border:1px solid var(--line);border-radius:var(--r-sm);overflow:hidden;margin-block-end:18px}
@media(max-width:560px){.rq-rec{grid-template-columns:1fr}}
.rq-rec>div{background:var(--surface);padding:13px 16px}
.rq-rec .k{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);margin-block-end:3px}
.rq-rec .v{font-weight:600;font-size:14.5px}
.rq-agree{display:flex;align-items:flex-start;gap:11px;font-size:14.5px;font-weight:500;cursor:pointer;padding:13px 15px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2)}
.rq-agree input{accent-color:var(--accent);width:18px;height:18px;margin-block-start:3px}
.rq-agree.on{border-color:var(--accent);background:var(--accent-soft)}
.rq-terms{max-height:230px;overflow-y:auto;border:1px solid var(--line);border-radius:var(--r-sm);padding:16px 18px;font-size:14px;color:var(--ink-soft);background:var(--surface-2);margin-block-end:14px}
.rq-terms h4{font-size:14px;color:var(--ink);margin-block:12px 4px}
.rq-terms h4:first-child{margin-block-start:0}
.rq-wnav{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-block-start:24px;flex-wrap:wrap}
.rq-wnav .grow{flex:1}
.rq-list{display:flex;flex-direction:column;gap:10px;margin-block-end:14px}
.rq-item{display:flex;align-items:center;gap:12px;padding:12px 15px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);flex-wrap:wrap}
.rq-item .ib2{flex:1;min-width:140px}
.rq-item .t{font-weight:600;font-size:14.5px}
.rq-item .d{font-size:12.5px;color:var(--ink-faint)}
.rq-x{color:var(--red);font-size:13px;font-weight:600;padding:6px 10px;border-radius:8px}
.rq-x:hover{background:var(--red-soft)}
.rq-empty{padding:20px;text-align:center;color:var(--ink-faint);font-size:14px;border:1.5px dashed var(--line);border-radius:var(--r-sm);margin-block-end:14px}

/* review / approval */
.rq-review{padding:clamp(24px,4vw,36px);text-align:center}
.rq-review .ri{width:62px;height:62px;border-radius:50%;background:var(--amber-soft);color:var(--amber);display:grid;place-items:center;margin:0 auto 16px}
.rq-review .ri svg{width:29px;height:29px;stroke-width:2}
.rq-review.ok .ri{background:var(--accent-soft);color:var(--accent)}
.rq-review h2{font-size:22px}
.rq-review p{color:var(--ink-soft);margin-block:8px 20px;max-width:52ch;margin-inline:auto}
.rq-sim{font-size:12.5px;color:var(--ink-faint);margin-block-start:12px}

/* toast + modal + confetti */
.rq-toast{position:fixed;inset-block-end:26px;left:50%;transform:translateX(-50%) translateY(90px);
  background:var(--ink);color:var(--bg);padding:13px 22px;border-radius:var(--r-pill);font-weight:600;font-size:14.5px;
  z-index:100;opacity:0;transition:.35s cubic-bezier(.2,.8,.2,1);box-shadow:var(--shadow);max-width:90vw;text-align:center}
.rq-toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.rq-modal-scrim{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(4px);z-index:70;display:grid;place-items:center;padding:18px;animation:rqFade .2s ease both}
.rq-modal{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);max-width:560px;width:100%;max-height:86vh;overflow-y:auto;padding:26px}
.rq-letter{background:#fff;color:#1a1a1a;border:1px solid #ddd;border-radius:8px;padding:26px;font-family:var(--font-latin);font-size:13.5px;line-height:1.7;direction:ltr;text-align:left;margin-block:16px}
.rq-letter h3{font-family:var(--font-latin);font-size:16px;margin-block-end:10px;color:#0A4A37}
.rq-confetti{position:fixed;inset:0;pointer-events:none;z-index:95;overflow:hidden}
.rq-confetti i{position:absolute;inset-block-start:-12px;border-radius:2px;animation:rqDrop var(--dur) cubic-bezier(.3,.6,.5,1) forwards}
@keyframes rqDrop{to{transform:translateY(105vh) rotate(var(--rot));opacity:.6}}

/* login */
.rq-auth{min-height:100vh;display:grid;place-items:center;padding:24px;position:relative}
.rq-auth-card{width:min(430px,100%);padding:clamp(24px,4vw,34px)}
.rq-auth .langsw{position:absolute;inset-block-start:18px;inset-inline-end:clamp(16px,4vw,36px);display:flex;gap:8px;z-index:3}
.rq-auth-brand{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;margin-block-end:22px}
.rq-auth-brand h1{font-size:30px;line-height:1.2}
.rq-auth-brand .tg{color:var(--ink-soft);font-size:14px}
.rq-nafath{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:12px;border:1px solid var(--line);border-radius:var(--r-sm);font-weight:600;background:var(--surface-2);transition:.15s}
.rq-reg .rq-nafath{margin-block-start:18px;position:relative;z-index:1;padding:14px}
.rq-reg .rq-nafath[disabled]{opacity:.6;cursor:progress}
.rq-reg .rq-stub-note{margin-block-start:12px;margin-block-end:4px}
.rq-reg .rq-f{margin-block-end:16px}
.rq-reg .rq-f>input,.rq-reg .rq-captcha{margin-block-start:2px}
.rq-captcha .cap-box .refresh{align-self:stretch;display:grid;place-items:center}
.rq-nafath:hover{border-color:var(--accent);background:var(--accent-soft)}
.rq-nafath .nf{width:24px;height:24px;border-radius:7px;background:#19833f;color:#fff;display:grid;place-items:center;font-size:10.5px;font-weight:700}
.rq-divider{display:flex;align-items:center;gap:14px;margin-block:18px;color:var(--ink-faint);font-size:12.5px}
.rq-divider::before,.rq-divider::after{content:"";flex:1;height:1px;background:var(--line)}
.rq-disc{font-size:11.5px;color:var(--ink-faint);text-align:center;margin-block-start:18px;max-width:46ch;margin-inline:auto;line-height:1.6}
.rq-reg{width:min(520px,94vw);max-width:100%;text-align:start;overflow:hidden}
.rq-reg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;margin:14px 0;min-width:0}
.rq-reg-grid label,.rq-f{display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--ink-soft);font-weight:600;min-width:0;margin-block-end:12px}
.rq-reg-grid label{margin-block-end:0}
.rq-reg-grid label.wide{grid-column:1 / -1}
.rq-reg-grid input,.rq-f input{width:100%;min-width:0;box-sizing:border-box;padding:11px 13px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-reg-grid input:focus,.rq-f input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-reg-grid input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-reg-grid input:disabled{opacity:.5;cursor:not-allowed}
.rq-stub{border:1px dashed var(--line);border-radius:14px;padding:14px;margin:12px 0;background:var(--surface)}
.rq-stub-badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--amber);background:var(--amber-soft);border-radius:999px;padding:3px 10px;margin-block-end:10px}
.rq-stub-note{font-size:12px;color:var(--ink-faint);margin-block-start:8px;line-height:1.55}
.rq-reg-actions{display:flex;gap:12px;justify-content:flex-end;margin-block-start:8px}
.rq-auth-err{color:#e0574f;font-size:13px;margin:8px 0;font-weight:600}
@media(max-width:520px){.rq-reg-grid{grid-template-columns:1fr}}
.rq-combo>input{padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-combo>input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-combo>input.err{border-color:#e0574f}
.rq-pick{position:relative}
.rq-pick input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-pick input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-pick-list{position:absolute;inset-inline:0;top:calc(100% + 4px);z-index:30;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm);box-shadow:var(--shadow);max-height:230px;overflow-y:auto}
.rq-pick-opt{padding:9px 12px;font-size:13.5px;cursor:pointer;border-bottom:1px solid var(--line);text-align:start}
.rq-pick-opt:last-child{border-bottom:none}
.rq-pick-opt:hover{background:var(--accent-soft);color:var(--accent)}
.rq-pick-opt.none{color:var(--ink-faint);cursor:default}
.rq-pick-opt .ar-alt{color:var(--ink-faint)}
.rq-readonly input{opacity:.75;cursor:default;background:var(--surface)}
.rq-nf-sheet{width:min(430px,94vw);padding:24px;text-align:start}
.rq-nf-head{display:flex;align-items:center;gap:10px;margin-block-end:6px}
.rq-nf-head .nf{width:26px;height:26px;border-radius:7px;background:#19833f;color:#fff;display:grid;place-items:center;font-size:10px;font-weight:700;flex:none}
.rq-nf-head h2{font-size:19px}
.rq-nf-sub{color:var(--ink-soft);font-size:13.5px;margin-block-end:16px}
.rq-nf-f{display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:var(--ink-soft);font-weight:600;margin-block-end:12px}
.rq-nf-f>input{padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-nf-f>input:focus{outline:2px solid var(--accent);outline-offset:1px}
.rq-nf-f>input.err{border-color:#e0574f;outline:none}
.rq-nf-act{display:flex;gap:10px;justify-content:flex-end;margin-block-start:6px}
.rq-reg-h{font-size:20px;margin-block-end:4px}
.rq-reg-sub{color:var(--ink-soft);font-size:13.5px;margin-block-end:16px}
.rq-steps{display:flex;align-items:center;margin-block-end:22px}
.rq-step{display:flex;align-items:center;gap:9px;flex:1}
.rq-step:last-child{flex:none}
.rq-step .dot{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:var(--surface-2);color:var(--ink-faint);border:1px solid var(--line);flex:none}
.rq-step.active .dot{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.rq-step.done .dot{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.rq-step .sl{font-size:12.5px;color:var(--ink-faint);white-space:nowrap}
.rq-step.active .sl{color:var(--ink);font-weight:600}
.rq-step .line{flex:1;height:1px;background:var(--line);margin-inline:10px;min-width:14px}
.rq-idtypes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.rq-idt{padding:15px 10px;border:1.5px solid var(--line);border-radius:var(--r-sm);background:var(--surface);text-align:center;transition:.16s;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px}
.rq-idt:hover{border-color:var(--accent-soft)}
.rq-idt.sel{border-color:var(--accent);background:var(--accent-soft)}
.rq-idt .ti{width:36px;height:36px;border-radius:10px;background:var(--surface-2);display:grid;place-items:center;color:var(--accent);margin-block-end:5px}
.rq-idt.sel .ti{background:var(--surface)}
.rq-idt .tn{font-weight:600;font-size:13px;color:var(--ink)}
.rq-idt .ta{font-size:11.5px;color:var(--ink-faint)}
.rq-captcha{display:flex;gap:10px}
.rq-captcha .cap-box{display:flex;align-items:center;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r-sm);overflow:hidden;flex:none}
.rq-captcha .refresh{padding:0 11px;color:var(--ink-faint);display:grid;place-items:center;height:100%;
  border-inline-end:1px solid var(--line);background:var(--surface);transition:color .16s ease,background .16s ease}
.rq-captcha .refresh:hover{color:var(--accent);background:var(--surface-2)}
.rq-captcha .cap-code{padding:8px 16px;font-family:var(--font-mono);font-weight:500;font-size:20px;letter-spacing:5px;color:var(--accent);font-style:italic;transform:skewX(-6deg);user-select:none}
.rq-captcha input{flex:1;min-width:0;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface-2);color:var(--ink);font-size:14px;font-family:inherit}
.rq-reg input.err,.rq-captcha input.err{border-color:#e0574f;outline:none}
.rq-fe{color:#e0574f;font-size:11.5px;font-weight:600;margin-block-start:4px}
.rq-award-box{border:1px solid var(--accent);background:var(--accent-soft);border-radius:14px;padding:14px 16px;margin-block-end:16px}
.rq-award-badge{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--accent);margin-block-end:10px}
.rq-award-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;min-width:0}
.rq-award-grid>div{min-width:0}
.rq-award-grid .wide{grid-column:1 / -1}
.rq-award-grid span{display:block;font-size:11px;color:var(--ink-faint);margin-block-end:2px}
.rq-rank{display:inline-block;margin-inline-start:8px;font-style:normal;font-size:10.5px;font-weight:700;color:var(--accent);background:var(--surface);border:1px solid var(--accent);border-radius:999px;padding:1px 7px;vertical-align:middle}
.rq-award-grid b{font-size:13px;font-weight:600;color:var(--ink);line-height:1.35;overflow-wrap:anywhere}
/* The card is 430px wide and centred; the absolute switcher needs ~180px of
   clearance beside it. Below ~860px that clearance is gone, so put the switcher
   into normal flow above the card instead of letting them overlap. */
@media(max-width:860px){
  .rq-auth{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
           gap:12px;padding:20px 20px 40px}
  .rq-auth .langsw{position:static;align-self:flex-end;margin:0}
}
@media(max-width:600px){
  /* language/theme switcher: out of the card's way, into normal flow */
  .rq-auth{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
           gap:12px;padding:14px 14px 32px;min-height:100dvh}
  .rq-auth .langsw{position:static;align-self:flex-end;margin:0}
  .rq-auth-card{width:100%;padding:20px 16px}

  .rq-auth-brand{margin-block-end:16px}
  .rq-auth-brand h1{font-size:24px}

  /* stop iOS auto-zooming on focus — needs >=16px */
  .rq-auth input,.rq-reg input,.rq-captcha input,.rq-nf-f>input,.rq-combo>input{font-size:16px}
  .rq-combo-list{max-height:240px}

  /* 3-up ID type cards are far too cramped at this width */
  .rq-idtypes{grid-template-columns:1fr}
  .rq-idt{flex-direction:row;justify-content:flex-start;gap:12px;padding:12px 14px;text-align:start}
  .rq-idt .ti{margin-block-end:0}

  .rq-captcha{flex-wrap:wrap}
  .rq-captcha .cap-code{font-size:18px;letter-spacing:3px;padding:8px 12px}

  .rq-reg-actions{flex-direction:column-reverse;gap:8px}
  .rq-reg-actions .rq-btn{width:100%}

  .rq-award-box{padding:12px 13px}
  .rq-award-grid b{font-size:12.5px}
  .rq-rank{margin-inline-start:6px}
}
`;
