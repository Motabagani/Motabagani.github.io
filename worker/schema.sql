-- D1 schema for portfolio messages (contact + Haa feedback).
CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          TEXT NOT NULL,          -- ISO 8601 UTC
  type        TEXT NOT NULL,          -- 'contact' | 'feedback'
  name        TEXT,
  email       TEXT,
  message     TEXT NOT NULL,
  page        TEXT,
  lang        TEXT,
  ticket      TEXT,                   -- public tracking id, e.g. C-K-04821 / F-M-19230
  user_agent  TEXT,
  ip_hash     TEXT,
  pinned      INTEGER NOT NULL DEFAULT 0,   -- admin: pin to top
  resolved    INTEGER NOT NULL DEFAULT 0,   -- admin: legacy handled flag
  deleted     INTEGER NOT NULL DEFAULT 0,   -- admin: soft-delete (trash basket)
  status      TEXT NOT NULL DEFAULT 'received', -- phase (type-specific; see worker)
  reply       TEXT,                   -- admin reply to a contact request (shown on /track + emailed)
  localdate   TEXT                    -- submitter's local date (YYYY-MM-DD) — verifier for anonymous feedback
);
CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages (ts);
CREATE INDEX IF NOT EXISTS idx_messages_iphash_ts ON messages (ip_hash, ts);

-- Failed admin sign-in attempts, for brute-force lockout (hashed IP only).
CREATE TABLE IF NOT EXISTS login_attempts (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash  TEXT NOT NULL,
  ts       TEXT NOT NULL             -- ISO 8601 UTC
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_iphash_ts ON login_attempts (ip_hash, ts);
