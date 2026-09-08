// Cloudflare Worker: serves the static site AND the message backend that replaces
// the old NYU CIMS Python CGI. Same behaviour — collect Haa feedback + contact
// messages, honeypot, hourly rate-limit, hashed IPs, and a Basic-Auth admin
// dashboard — but stored in Cloudflare D1 and running on Cloudflare's edge.
//
//   POST /api/submit  -> store a message (from src/api.js)
//   GET  /admin       -> Basic-Auth dashboard (reads D1)
//   everything else   -> the built static site (env.ASSETS)

const RATE_PER_HOUR = 20;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Admin brute-force lockout: after this many failed sign-ins from one IP within
// the window, further attempts are refused until the window passes.
const LOGIN_MAX_FAILS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_MS = 8 * 3600 * 1000;     // signed-cookie session lifetime

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Force HTTPS so the padlock always shows and connections can't be downgraded.
    const proto = request.headers.get('X-Forwarded-Proto') || url.protocol.replace(':', '');
    if (proto === 'http') {
      return Response.redirect(`https://${url.host}${path}${url.search}`, 301);
    }

    // Canonical host is www.motabagani.com; send the bare apex there (and land the
    // root on /en in the same hop).
    if (url.hostname === 'motabagani.com') {
      const dest = path === '/' ? '/en' : path;
      return Response.redirect(`https://www.motabagani.com${dest}${url.search}`, 301);
    }
    // Resolve the "/" vs "/en" duplicate: the bare root permanently lands on /en
    // (but not on the admin host, whose root is the dashboard).
    if (path === '/' && url.hostname !== 'admin.motabagani.com') {
      return Response.redirect(`${url.origin}/en`, 301);
    }

    if (path === '/api/submit') {
      if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });
      return handleSubmit(request, env);
    }
    // Admin lives on its own subdomain (admin.motabagani.com). Its pages route to
    // the admin handler; the static assets it references (fonts/images/favicon)
    // fall through to ASSETS so the page can style itself.
    if (url.hostname === 'admin.motabagani.com') {
      const isAsset = /^\/(fonts|images|assets)\//.test(path) || path.startsWith('/favicon');
      if (!isAsset) return handleAdmin(request, env, url, '');
    } else if (path === '/admin' || path.startsWith('/admin/') || path.startsWith('/admin?')) {
      // Old /admin links -> the subdomain (kept working).
      const rest = path.replace(/^\/admin/, '') || '/';
      return Response.redirect(`https://admin.motabagani.com${rest}${url.search}`, 301);
    }
    // Fall through to the static site (the built dist/), adding HSTS so browsers
    // stick to HTTPS for a year.
    const assetRes = await env.ASSETS.fetch(request);
    const res = new Response(assetRes.body, assetRes);
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return res;
  },
};

// ---------- helpers ----------
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function clean(v, n) {
  let s = v == null ? '' : String(v);
  s = s.replace(/\r\n/g, '\n').trim();
  s = [...s].filter((c) => c === '\n' || c === '\t' || c.charCodeAt(0) >= 32).join('');
  return s.slice(0, n);
}

async function sha256hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// One hashed identifier per client, salted so raw IPs are never stored.
async function clientIpHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const salt = env.IP_SALT || 'hm2983-portfolio-2026';
  return sha256hex(ip + '|' + salt);
}

// Locked-down headers for every /admin response: no caching, no framing, and a
// strict same-origin CSP (only self assets + inline CSS; no scripts at all).
function adminSecHeaders(extra = {}) {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy':
      "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; " +
      "img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'",
    ...extra,
  };
}

function esc(v) {
  return (v == null ? '' : String(v)).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// ---------- POST /api/submit ----------
async function handleSubmit(request, env) {
  let data;
  try {
    data = await request.json();
    if (!data || typeof data !== 'object') throw new Error();
  } catch {
    return json(400, { ok: false, error: 'parse' });
  }

  // Honeypot: pretend success so bots don't learn they were caught.
  if (clean(data.website, 100)) return json(200, { ok: true });

  const type = data.type === 'contact' ? 'contact' : 'feedback';
  const message = clean(data.message, 5000);
  if (message.length < 2) return json(422, { ok: false, error: 'message' });

  const name = clean(data.name, 120);
  const email = clean(data.email, 190);
  if (email && !EMAIL_RE.test(email)) return json(422, { ok: false, error: 'email' });

  const page = clean(data.page, 255);
  let lang = [...String(data.lang ?? '').slice(0, 5)].filter((c) => /[a-z]/i.test(c)).join('');
  if (lang !== 'en' && lang !== 'ar') lang = '';
  const ua = clean(request.headers.get('User-Agent'), 255);

  const ipHash = await clientIpHash(request, env);

  // Rate limit: submissions from this IP in the last hour.
  const cutoff = new Date(Date.now() - 3600_000).toISOString();
  try {
    const row = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM messages WHERE ip_hash = ? AND ts >= ?'
    ).bind(ipHash, cutoff).first();
    if (row && row.c >= RATE_PER_HOUR) return json(429, { ok: false, error: 'rate' });
  } catch {
    /* if the count fails, don't block a genuine message */
  }

  const ts = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO messages (ts, type, name, email, message, page, lang, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(ts, type, name, email, message, page, lang, ua, ipHash).run();
  } catch {
    return json(500, { ok: false, error: 'store' });
  }

  return json(200, { ok: true });
}

// ---------- /admin auth (custom login page + signed cookie session) ----------
async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function timingEq(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function makeSession(env) {
  const exp = String(Date.now() + SESSION_MS);
  return `${exp}.${await hmacHex(env.ADMIN_PASSWORD || 'x', exp)}`;
}

// ---------- admin brute-force lockout (hashed IP + D1) ----------
async function loginLocked(env, ipHash) {
  try {
    const cutoff = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
    const row = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM login_attempts WHERE ip_hash = ? AND ts >= ?'
    ).bind(ipHash, cutoff).first();
    return !!row && row.c >= LOGIN_MAX_FAILS;
  } catch { return false; }
}
async function noteLoginFail(env, ipHash) {
  try {
    await env.DB.prepare('INSERT INTO login_attempts (ip_hash, ts) VALUES (?, ?)')
      .bind(ipHash, new Date().toISOString()).run();
  } catch { /* best effort */ }
}
async function clearLoginFails(env, ipHash) {
  try {
    await env.DB.prepare('DELETE FROM login_attempts WHERE ip_hash = ?').bind(ipHash).run();
  } catch { /* best effort */ }
}
async function validSession(token, env) {
  if (!token || !env.ADMIN_PASSWORD) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return timingEq(sig, await hmacHex(env.ADMIN_PASSWORD, exp));
}
function readCookie(request, name) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

// The site's own typeface (copied to /fonts with stable names), so the admin
// pages match the portfolio instead of falling back to a system font.
const FONT_CSS = `
@font-face{font-family:'SF Grandezza';src:url('/fonts/sf-grandezza.light.ttf') format('truetype');font-weight:300;font-display:swap}
@font-face{font-family:'SF Grandezza';src:url('/fonts/sf-grandezza.medium.ttf') format('truetype');font-weight:500;font-display:swap}
@font-face{font-family:'SF Grandezza';src:url('/fonts/sf-grandezza.heavy.ttf') format('truetype');font-weight:700 900;font-display:swap}
@font-face{font-family:'Mada';src:url('/fonts/mada.ttf') format('truetype');font-display:swap}`;
const FONT_STACK = `'SF Grandezza','Mada',system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;

function loginPage(error, action = '/admin') {
  return `<!doctype html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>لوحة التحكم — تسجيل الدخول</title>
<style>
  ${FONT_CSS}
  :root{color-scheme:dark}*{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:flex-end;direction:ltr;
    color:#f0ebe0;font:15px/1.5 ${FONT_STACK};
    background:linear-gradient(90deg, rgba(16,8,32,.35) 0%, rgba(16,8,32,.15) 45%, rgba(16,8,32,.10) 100%), #16081f url('/images/admin-bg.jpg') center/cover no-repeat fixed;
    padding:clamp(20px,4vw,56px)}
  form{width:min(620px,100%);direction:rtl;text-align:right;
    background:rgba(32,16,61,.90);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
    border:1px solid rgba(255,255,255,.10);border-radius:22px;
    padding:clamp(24px,3.4vw,44px);box-shadow:0 24px 70px rgba(0,0,0,.5)}
  .head{display:flex;align-items:center;justify-content:flex-start;gap:14px;margin-bottom:36px;flex-wrap:wrap}
  .brand{display:flex;align-items:center;gap:10px}
  .brand img{height:42px;width:auto;display:block}
  .brand .t{font-weight:500;letter-spacing:.01em;font-size:clamp(15px,2.6vw,20px);line-height:1.12;text-align:right;white-space:nowrap}
  .brand .t small{display:block;font-weight:500;opacity:.9;font-size:.82em}
  .lead{font-size:clamp(15px,2.6vw,20px);font-weight:300;line-height:1.14;text-align:right;white-space:nowrap;
    border-inline-start:1px solid rgba(255,255,255,.3);padding-inline-start:14px}
  .lead b{display:block;font-weight:600}
  label{display:flex;justify-content:flex-end;align-items:baseline;gap:9px;direction:ltr;
    font-size:15px;font-weight:500;color:#e7e0f4;margin:28px 2px 10px}
  label .ar{opacity:.92}
  input{width:100%;background:transparent;border:2px solid rgba(255,255,255,.6);border-radius:9px;
    color:#f0ebe0;font:inherit;padding:12px 14px;outline:none;direction:ltr}
  input:focus{border-color:#f5a05c}
  button{margin-top:28px;width:100%;padding:14px;border:0;border-radius:999px;cursor:pointer;
    background:#f5a05c;color:#20103d;font:700 15px/1 ${FONT_STACK};letter-spacing:.02em}
  button:hover{filter:brightness(1.05)}
  .err{color:#ff9a9a;font-weight:600;margin:18px 0 0;text-align:right}
  .back{display:inline-flex;gap:8px;align-items:center;margin-top:22px;color:#b7aecb;
    text-decoration:none;font-size:14px;direction:ltr}
  .back:hover{color:#f5a05c}
</style></head><body>
<form method="POST" action="${action}">
  <div class="head">
    <div class="brand">
      <img src="/images/logowhite.png" alt="">
      <div class="t">ADMIN DASHBOARD<small>لوحة التحكم</small></div>
    </div>
    <div class="lead">Sign In<b>تسجيل الدخول</b></div>
  </div>
  <label dir="ltr"><span>Username</span><span class="ar" dir="rtl">اسم المستخدم</span></label>
  <input name="username" autocomplete="username" autofocus required>
  <label dir="ltr"><span>Password</span><span class="ar" dir="rtl">كلمة المرور</span></label>
  <input name="password" type="password" autocomplete="current-password" required>
  ${error ? `<p class="err">${esc(error)}</p>` : ''}
  <button type="submit">تسجيل الدخول · Sign in</button>
  <a class="back" href="https://www.motabagani.com">← Back to website · العودة إلى الموقع</a>
</form>
</body></html>`;
}


// Dashboard UI strings (the login page is bilingual on one screen; the dashboard
// switches with a toggle and remembers the choice in a cookie).
const DASH_T = {
  en: {
    dir: 'ltr', title: 'Dashboard', h1: 'Dashboard', welcome: 'Welcome, Hashim', total: 'total',
    all: 'All', contact: 'Contact', feedback: 'Feedback',
    when: 'When', type: 'Type', from: 'From', message: 'Message', page: 'Page',
    empty: 'No messages yet.', signout: 'Sign out', back: 'Back to website',
    toggle: 'العربية', pill: { contact: 'contact', feedback: 'feedback' },
  },
  ar: {
    dir: 'rtl', title: 'لوحة التحكم', h1: 'لوحة التحكم', welcome: 'مرحبًا هاشم', total: 'الإجمالي',
    all: 'الكل', contact: 'تواصل', feedback: 'ملاحظات',
    when: 'الوقت', type: 'النوع', from: 'من', message: 'الرسالة', page: 'الصفحة',
    empty: 'لا توجد رسائل بعد.', signout: 'تسجيل الخروج', back: 'العودة إلى الموقع',
    toggle: 'English', pill: { contact: 'تواصل', feedback: 'ملاحظة' },
  },
};

function adminLang(url, request) {
  const q = url.searchParams.get('lang');
  if (q === 'en' || q === 'ar') return q;
  return readCookie(request, 'admin_lang') === 'ar' ? 'ar' : 'en';
}

async function handleAdmin(request, env, url, base = '') {
  const home = base || '/';                 // where sign-in / sign-out land
  const logoutPath = `${base}/logout`;      // '/logout' on the subdomain
  const cookieBase = `Path=${base || '/'}; HttpOnly; Secure; SameSite=Strict`;

  // Sign out.
  if (url.pathname === logoutPath) {
    return new Response('', { status: 302, headers: {
      Location: home,
      'Set-Cookie': `admin_session=; ${cookieBase}; Max-Age=0`,
    } });
  }

  const ipHash = await clientIpHash(request, env);

  // Login form submission.
  if (request.method === 'POST') {
    // Brute-force lockout: refuse once too many recent failures from this IP.
    if (await loginLocked(env, ipHash)) {
      return new Response(
        loginPage('Too many attempts. Try again later. · محاولات كثيرة، حاول لاحقًا.', home),
        { status: 429, headers: adminSecHeaders({ 'Retry-After': '900' }) },
      );
    }
    const form = await request.formData().catch(() => null);
    const u = form ? String(form.get('username') || '') : '';
    const p = form ? String(form.get('password') || '') : '';
    const okUser = !!env.ADMIN_USER ? timingEq(u, env.ADMIN_USER) : u === 'admin';
    const okPass = !!env.ADMIN_PASSWORD && timingEq(p, env.ADMIN_PASSWORD);
    if (okUser && okPass) {
      await clearLoginFails(env, ipHash);
      const token = await makeSession(env);
      return new Response('', { status: 302, headers: {
        Location: home,
        'Set-Cookie': `admin_session=${token}; ${cookieBase}; Max-Age=${SESSION_MS / 1000}`,
      } });
    }
    await noteLoginFail(env, ipHash);
    return new Response(loginPage('Incorrect username or password. · بيانات الدخول غير صحيحة.', home), {
      status: 401, headers: adminSecHeaders(),
    });
  }

  // Anything else requires a valid session cookie; otherwise show the login page.
  if (!(await validSession(readCookie(request, 'admin_session'), env))) {
    return new Response(loginPage('', home), { headers: adminSecHeaders() });
  }

  const lang = adminLang(url, request);
  const T = DASH_T[lang];
  const rtl = lang === 'ar';

  const want = ['all', 'contact', 'feedback'].includes(url.searchParams.get('type'))
    ? url.searchParams.get('type') : 'all';

  let rows = [];
  try {
    const res = await env.DB.prepare(
      'SELECT ts, type, name, email, message, page, lang FROM messages ORDER BY ts DESC'
    ).all();
    rows = res.results || [];
  } catch { rows = []; }

  const counts = { all: rows.length, contact: 0, feedback: 0 };
  for (const r of rows) counts[r.type] = (counts[r.type] || 0) + 1;
  const shown = want === 'all' ? rows : rows.filter((r) => (r.type || 'feedback') === want);

  const when = (ts) => {
    const d = new Date(ts);
    if (isNaN(d)) return esc(ts);
    const fmt = (tz) => new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(d).replace(',', '');
    const nyc = rtl ? 'نيويورك' : 'NYC';
    const ksa = rtl ? 'الرياض' : 'Riyadh';
    return `<div>${esc(nyc)} ${esc(fmt('America/New_York'))}</div>` +
           `<div>${esc(ksa)} ${esc(fmt('Asia/Riyadh'))}</div>`;
  };
  const q = (obj) => Object.entries(obj).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const tab = (key, label) =>
    `<a class="tab${want === key ? ' active' : ''}" href="?${q({ type: key, lang })}">${label} <span class="n">${counts[key] || 0}</span></a>`;

  const bodyRows = shown.length === 0
    ? `<p class="empty">${esc(T.empty)}</p>`
    : `<table><thead><tr><th>${esc(T.when)}</th><th>${esc(T.type)}</th><th>${esc(T.from)}</th><th>${esc(T.message)}</th><th>${esc(T.page)}</th></tr></thead><tbody>${
      shown.map((r) => {
        const t = r.type || 'feedback';
        let frm = '';
        if (r.name) frm += `<div>${esc(r.name)}</div>`;
        if (r.email) frm += `<a class="email" href="mailto:${esc(r.email)}">${esc(r.email)}</a>`;
        if (!frm) frm = '<span class="meta">&mdash;</span>';
        let page = esc(r.page || '');
        if (r.lang) page += ' &middot; ' + esc(r.lang);
        const pill = T.pill[t] || t;
        return `<tr><td class="when">${when(r.ts)}</td><td><span class="pill ${esc(t)}">${esc(pill)}</span></td><td>${frm}</td><td class="msg" dir="auto">${esc(r.message)}</td><td class="meta">${page}</td></tr>`;
      }).join('')
    }</tbody></table>`;

  const htmlDoc = `<!doctype html><html lang="${lang}" dir="${T.dir}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${esc(T.title)}</title>
<style>
  ${FONT_CSS}
  :root{color-scheme:dark}*{box-sizing:border-box}
  body{margin:0;padding:28px;background:#20103d;color:#f0ebe0;font:15px/1.5 ${FONT_STACK}}
  .wrap{max-width:1100px;margin:0 auto}
  header{display:flex;align-items:center;gap:14px;margin-bottom:6px}
  header img{height:30px;width:auto}
  h1{font-size:22px;font-weight:600;margin:0}
  .sub{color:#9088a8;margin:0 0 22px;font-size:13px}
  .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
  .tab{text-decoration:none;color:#f0ebe0;padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.16);font-size:13px}
  .tab.active{background:#f5a05c;color:#20103d;border-color:transparent;font-weight:600}
  .tab .n{opacity:.7}
  table{width:100%;border-collapse:collapse;background:rgba(255,255,255,.03);border-radius:16px;overflow:hidden}
  th,td{text-align:${rtl ? 'right' : 'left'};padding:12px 14px;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.08)}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9088a8}
  td.msg{max-width:520px;white-space:pre-wrap;word-break:break-word}
  .pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;background:rgba(255,255,255,.1)}
  .pill.contact{background:rgba(245,160,92,.22);color:#f5a05c}
  .when{color:#9088a8;font-size:12px;white-space:nowrap}
  a.email{color:#f5a05c}.meta{color:#6f6690;font-size:11px}
  .empty{color:#9088a8;padding:40px 0}
  header .sp{flex:1}
  .hbtn{color:#9088a8;text-decoration:none;font-size:13px;border:1px solid rgba(255,255,255,.16);
    padding:6px 12px;border-radius:999px;white-space:nowrap}
  .hbtn:hover{color:#f0ebe0;border-color:#f5a05c}
</style></head><body><div class="wrap">
<header>
  <img src="/images/logowhite.png" alt="">
  <h1>${esc(T.h1)}</h1>
  <span class="sp"></span>
  <a class="hbtn" href="https://www.motabagani.com">${esc(T.back)}</a>
  <a class="hbtn" href="?${q({ type: want, lang: rtl ? 'en' : 'ar' })}">${esc(T.toggle)}</a>
  <a class="hbtn" href="${logoutPath}">${esc(T.signout)}</a>
</header>
<p class="sub">${esc(T.welcome)} &middot; ${counts.all} ${esc(T.total)}</p>
<nav class="tabs">${tab('all', T.all)}${tab('contact', T.contact)}${tab('feedback', T.feedback)}</nav>
${bodyRows}
</div></body></html>`;

  // Persist the language choice when it came in on the query string.
  const extra = url.searchParams.get('lang')
    ? { 'Set-Cookie': `admin_lang=${lang}; ${cookieBase}; Max-Age=31536000` }
    : {};
  return new Response(htmlDoc, { headers: adminSecHeaders(extra) });
}
