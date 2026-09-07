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
  user_agent  TEXT,
  ip_hash     TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_ts ON messages (ts);
CREATE INDEX IF NOT EXISTS idx_messages_iphash_ts ON messages (ip_hash, ts);
