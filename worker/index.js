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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/submit') {
      if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });
      return handleSubmit(request, env);
    }
    if (path === '/admin' || path.startsWith('/admin/') || path.startsWith('/admin?')) {
      return handleAdmin(request, env, url);
    }
    // Fall through to the static site (the built dist/).
    return env.ASSETS.fetch(request);
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

  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const salt = env.IP_SALT || 'hm2983-portfolio-2026';
  const ipHash = await sha256hex(ip + '|' + salt);

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

// ---------- GET /admin ----------
async function handleAdmin(request, env, url) {
  // HTTP Basic Auth against Worker secrets (ADMIN_USER optional, ADMIN_PASSWORD required).
  const expectedUser = env.ADMIN_USER || 'admin';
  const expectedPass = env.ADMIN_PASSWORD || '';
  const auth = request.headers.get('Authorization') || '';
  let ok = false;
  if (expectedPass && auth.startsWith('Basic ')) {
    try {
      const [u, p] = atob(auth.slice(6)).split(':');
      ok = u === expectedUser && p === expectedPass;
    } catch { ok = false; }
  }
  if (!ok) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Messages", charset="UTF-8"' },
    });
  }

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
    return isNaN(d) ? esc(ts) : d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  };
  const tab = (key, label) =>
    `<a class="tab${want === key ? ' active' : ''}" href="?type=${key}">${label} <span class="n">${counts[key] || 0}</span></a>`;

  const bodyRows = shown.length === 0
    ? '<p class="empty">No messages yet.</p>'
    : `<table><thead><tr><th>When</th><th>Type</th><th>From</th><th>Message</th><th>Page</th></tr></thead><tbody>${
      shown.map((r) => {
        const t = r.type || 'feedback';
        let frm = '';
        if (r.name) frm += `<div>${esc(r.name)}</div>`;
        if (r.email) frm += `<a class="email" href="mailto:${esc(r.email)}">${esc(r.email)}</a>`;
        if (!frm) frm = '<span class="meta">&mdash;</span>';
        let page = esc(r.page || '');
        if (r.lang) page += ' &middot; ' + esc(r.lang);
        return `<tr><td class="when">${when(r.ts)}</td><td><span class="pill ${esc(t)}">${esc(t)}</span></td><td>${frm}</td><td class="msg">${esc(r.message)}</td><td class="meta">${page}</td></tr>`;
      }).join('')
    }</tbody></table>`;

  const htmlDoc = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Messages</title>
<style>
  :root{color-scheme:dark}*{box-sizing:border-box}
  body{margin:0;padding:28px;background:#20103d;color:#f0ebe0;font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
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
  th,td{text-align:left;padding:12px 14px;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.08)}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9088a8}
  td.msg{max-width:520px;white-space:pre-wrap;word-break:break-word}
  .pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;background:rgba(255,255,255,.1)}
  .pill.contact{background:rgba(245,160,92,.22);color:#f5a05c}
  .when{color:#9088a8;font-size:12px;white-space:nowrap}
  a.email{color:#f5a05c}.meta{color:#6f6690;font-size:11px}
  .empty{color:#9088a8;padding:40px 0}
</style></head><body><div class="wrap">
<header><img src="/images/logowhite.png" alt=""><h1>Messages</h1></header>
<p class="sub">${counts.all} total</p>
<nav class="tabs">${tab('all', 'All')}${tab('contact', 'Contact')}${tab('feedback', 'Feedback')}</nav>
${bodyRows}
</div></body></html>`;

  return new Response(htmlDoc, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}
