/* ============================================================================
   SESSION TOKEN

   Refreshing the page should not throw you back to the sign-in screen, but a
   demo left open on a shared laptop should not stay signed in forever either.
   So: a token with a sliding expiry. Activity pushes the expiry forward; going
   quiet lets it lapse, and the app signs itself out when it does.

   The token holds no secret — this is a client-side simulator, and the user
   object it carries is demo data. When a real backend arrives, `token` becomes
   an opaque string issued by the server and this file keeps the same shape:
   read it, send it, drop it when the server says it's stale.
   ========================================================================== */

const KEY = "rafeeq.session";

/* How long a session survives without any activity. */
export const IDLE_TTL_MS = 2 * 60 * 60 * 1000;   // 2 hours
/* Hard ceiling regardless of activity, so a tab left open for days expires. */
export const ABSOLUTE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const now = () => Date.now();

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function write(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

/* Start a session for this user. Credentials never belong in the stored token —
   strip them so a refresh restores who you are, not your password. */
export function issueSession(user) {
  const t = now();
  const { password, pin, ...safeUser } = user || {};
  const s = {
    token: `rq_${t.toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    user: safeUser,
    issuedAt: t,
    lastSeen: t,
  };
  write(s);
  return s;
}

/* Return the live session, or null if there isn't one / it has lapsed.
   Reading is also the expiry check — nothing else needs to know the rules. */
export function readSession() {
  const s = read();
  if (!s || !s.token) return null;
  const t = now();
  const idleFor = t - (s.lastSeen || s.issuedAt || 0);
  const aliveFor = t - (s.issuedAt || 0);
  if (idleFor > IDLE_TTL_MS || aliveFor > ABSOLUTE_TTL_MS) {
    clearSession();
    return null;
  }
  return s;
}

/* Push the idle clock forward. Called on real interaction, throttled by the
   caller — writing to localStorage on every mousemove would be wasteful. */
export function touchSession() {
  const s = read();
  if (!s) return null;
  s.lastSeen = now();
  write(s);
  return s;
}

export function clearSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/* Milliseconds until this session lapses, for a countdown or a warning. */
export function sessionRemainingMs() {
  const s = read();
  if (!s) return 0;
  const t = now();
  return Math.max(0, Math.min(
    IDLE_TTL_MS - (t - (s.lastSeen || 0)),
    ABSOLUTE_TTL_MS - (t - (s.issuedAt || 0)),
  ));
}
