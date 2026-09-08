var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/index.js
var RATE_PER_HOUR = 20;
var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/api/submit") {
      if (request.method !== "POST") return json(405, { ok: false, error: "method" });
      return handleSubmit(request, env);
    }
    if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin?")) {
      return handleAdmin(request, env, url);
    }
    return env.ASSETS.fetch(request);
  }
};
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(json, "json");
function clean(v, n) {
  let s = v == null ? "" : String(v);
  s = s.replace(/\r\n/g, "\n").trim();
  s = [...s].filter((c) => c === "\n" || c === "	" || c.charCodeAt(0) >= 32).join("");
  return s.slice(0, n);
}
__name(clean, "clean");
async function sha256hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256hex, "sha256hex");
function esc(v) {
  return (v == null ? "" : String(v)).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(esc, "esc");
async function handleSubmit(request, env) {
  let data;
  try {
    data = await request.json();
    if (!data || typeof data !== "object") throw new Error();
  } catch {
    return json(400, { ok: false, error: "parse" });
  }
  if (clean(data.website, 100)) return json(200, { ok: true });
  const type = data.type === "contact" ? "contact" : "feedback";
  const message = clean(data.message, 5e3);
  if (message.length < 2) return json(422, { ok: false, error: "message" });
  const name = clean(data.name, 120);
  const email = clean(data.email, 190);
  if (email && !EMAIL_RE.test(email)) return json(422, { ok: false, error: "email" });
  const page = clean(data.page, 255);
  let lang = [...String(data.lang ?? "").slice(0, 5)].filter((c) => /[a-z]/i.test(c)).join("");
  if (lang !== "en" && lang !== "ar") lang = "";
  const ua = clean(request.headers.get("User-Agent"), 255);
  const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const salt = env.IP_SALT || "hm2983-portfolio-2026";
  const ipHash = await sha256hex(ip + "|" + salt);
  const cutoff = new Date(Date.now() - 36e5).toISOString();
  try {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM messages WHERE ip_hash = ? AND ts >= ?"
    ).bind(ipHash, cutoff).first();
    if (row && row.c >= RATE_PER_HOUR) return json(429, { ok: false, error: "rate" });
  } catch {
  }
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO messages (ts, type, name, email, message, page, lang, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(ts, type, name, email, message, page, lang, ua, ipHash).run();
  } catch {
    return json(500, { ok: false, error: "store" });
  }
  return json(200, { ok: true });
}
__name(handleSubmit, "handleSubmit");
async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hmacHex, "hmacHex");
function timingEq(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
__name(timingEq, "timingEq");
async function makeSession(env) {
  const exp = String(Date.now() + 8 * 3600 * 1e3);
  return `${exp}.${await hmacHex(env.ADMIN_PASSWORD || "x", exp)}`;
}
__name(makeSession, "makeSession");
async function validSession(token, env) {
  if (!token || !env.ADMIN_PASSWORD) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return timingEq(sig, await hmacHex(env.ADMIN_PASSWORD, exp));
}
__name(validSession, "validSession");
function readCookie(request, name) {
  const m = (request.headers.get("Cookie") || "").match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}
__name(readCookie, "readCookie");
var FONT_CSS = `
@font-face{font-family:'SF Grandezza';src:url('/fonts/sf-grandezza.light.ttf') format('truetype');font-weight:300;font-display:swap}
@font-face{font-family:'SF Grandezza';src:url('/fonts/sf-grandezza.medium.ttf') format('truetype');font-weight:500;font-display:swap}
@font-face{font-family:'SF Grandezza';src:url('/fonts/sf-grandezza.heavy.ttf') format('truetype');font-weight:700 900;font-display:swap}
@font-face{font-family:'Mada';src:url('/fonts/mada.ttf') format('truetype');font-display:swap}`;
var FONT_STACK = `'SF Grandezza','Mada',system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;
function loginPage(error) {
  return `<!doctype html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u2014 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644</title>
<style>
  ${FONT_CSS}
  :root{color-scheme:dark}*{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:flex-end;
    background:#20103d;color:#f0ebe0;font:15px/1.5 ${FONT_STACK};
    padding:24px clamp(24px,8vw,140px) 24px 24px}
  form{width:min(520px,100%);direction:rtl;text-align:right}
  .head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:40px}
  .brand{display:flex;align-items:center;gap:13px}
  .brand img{height:50px;width:auto;display:block}
  .brand .t{font-weight:700;letter-spacing:.02em;font-size:clamp(15px,3vw,23px);line-height:1.12;text-align:right}
  .brand .t small{display:block;font-weight:500;opacity:.9;font-size:.82em}
  .lead{font-size:clamp(20px,4vw,32px);font-weight:300;line-height:1.08;text-align:right;
    border-inline-start:1px solid rgba(255,255,255,.3);padding-inline-start:20px}
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
</style></head><body>
<form method="POST" action="/admin">
  <div class="head">
    <div class="brand">
      <img src="/images/logowhite.png" alt="">
      <div class="t">ADMIN DASHBOARD<small>\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645</small></div>
    </div>
    <div class="lead">Sign In<b>\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644</b></div>
  </div>
  <label dir="ltr"><span class="ar" dir="rtl">\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645</span><span>USERNAME</span></label>
  <input name="username" autocomplete="username" autofocus required>
  <label dir="ltr"><span class="ar" dir="rtl">\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</span><span>Password</span></label>
  <input name="password" type="password" autocomplete="current-password" required>
  ${error ? `<p class="err">${esc(error)}</p>` : ""}
  <button type="submit">\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \xB7 Sign in</button>
</form>
</body></html>`;
}
__name(loginPage, "loginPage");
var COOKIE_BASE = "Path=/admin; HttpOnly; Secure; SameSite=Strict";
async function handleAdmin(request, env, url) {
  if (url.pathname === "/admin/logout") {
    return new Response("", { status: 302, headers: {
      Location: "/admin",
      "Set-Cookie": `admin_session=; ${COOKIE_BASE}; Max-Age=0`
    } });
  }
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    const u = form ? String(form.get("username") || "") : "";
    const p = form ? String(form.get("password") || "") : "";
    const okUser = u === (env.ADMIN_USER || "admin");
    const okPass = !!env.ADMIN_PASSWORD && p === env.ADMIN_PASSWORD;
    if (okUser && okPass) {
      const token = await makeSession(env);
      return new Response("", { status: 302, headers: {
        Location: "/admin",
        "Set-Cookie": `admin_session=${token}; ${COOKIE_BASE}; Max-Age=28800`
      } });
    }
    return new Response(loginPage("Incorrect username or password."), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
  if (!await validSession(readCookie(request, "admin_session"), env)) {
    return new Response(loginPage(""), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const want = ["all", "contact", "feedback"].includes(url.searchParams.get("type")) ? url.searchParams.get("type") : "all";
  let rows = [];
  try {
    const res = await env.DB.prepare(
      "SELECT ts, type, name, email, message, page, lang FROM messages ORDER BY ts DESC"
    ).all();
    rows = res.results || [];
  } catch {
    rows = [];
  }
  const counts = { all: rows.length, contact: 0, feedback: 0 };
  for (const r of rows) counts[r.type] = (counts[r.type] || 0) + 1;
  const shown = want === "all" ? rows : rows.filter((r) => (r.type || "feedback") === want);
  const when = /* @__PURE__ */ __name((ts) => {
    const d = new Date(ts);
    return isNaN(d) ? esc(ts) : d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
  }, "when");
  const tab = /* @__PURE__ */ __name((key, label) => `<a class="tab${want === key ? " active" : ""}" href="?type=${key}">${label} <span class="n">${counts[key] || 0}</span></a>`, "tab");
  const bodyRows = shown.length === 0 ? '<p class="empty">No messages yet.</p>' : `<table><thead><tr><th>When</th><th>Type</th><th>From</th><th>Message</th><th>Page</th></tr></thead><tbody>${shown.map((r) => {
    const t = r.type || "feedback";
    let frm = "";
    if (r.name) frm += `<div>${esc(r.name)}</div>`;
    if (r.email) frm += `<a class="email" href="mailto:${esc(r.email)}">${esc(r.email)}</a>`;
    if (!frm) frm = '<span class="meta">&mdash;</span>';
    let page = esc(r.page || "");
    if (r.lang) page += " &middot; " + esc(r.lang);
    return `<tr><td class="when">${when(r.ts)}</td><td><span class="pill ${esc(t)}">${esc(t)}</span></td><td>${frm}</td><td class="msg" dir="auto">${esc(r.message)}</td><td class="meta">${page}</td></tr>`;
  }).join("")}</tbody></table>`;
  const htmlDoc = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Messages</title>
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
  th,td{text-align:left;padding:12px 14px;vertical-align:top;border-bottom:1px solid rgba(255,255,255,.08)}
  th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9088a8}
  td.msg{max-width:520px;white-space:pre-wrap;word-break:break-word}
  .pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;background:rgba(255,255,255,.1)}
  .pill.contact{background:rgba(245,160,92,.22);color:#f5a05c}
  .when{color:#9088a8;font-size:12px;white-space:nowrap}
  a.email{color:#f5a05c}.meta{color:#6f6690;font-size:11px}
  .empty{color:#9088a8;padding:40px 0}
  header .sp{flex:1}
  a.signout{color:#9088a8;text-decoration:none;font-size:13px;border:1px solid rgba(255,255,255,.16);
    padding:6px 12px;border-radius:999px}
  a.signout:hover{color:#f0ebe0;border-color:var(--accent,#f5a05c)}
</style></head><body><div class="wrap">
<header><img src="/images/logowhite.png" alt=""><h1>Messages</h1><span class="sp"></span><a class="signout" href="/admin/logout">Sign out</a></header>
<p class="sub">${counts.all} total</p>
<nav class="tabs">${tab("all", "All")}${tab("contact", "Contact")}${tab("feedback", "Feedback")}</nav>
${bodyRows}
</div></body></html>`;
  return new Response(htmlDoc, {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, nofollow" }
  });
}
__name(handleAdmin, "handleAdmin");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
