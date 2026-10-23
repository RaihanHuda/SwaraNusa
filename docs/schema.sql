-- Skema SQLite aktual SwaraNusa; disalin dari server.mjs.
-- Hanya struktur tabel dan indeks. Tidak memuat akun, sesi, request, atau data pribadi.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('user','expert','admin')),
  is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  purpose TEXT NOT NULL, province_id TEXT NOT NULL, category TEXT NOT NULL,
  topic TEXT NOT NULL, description TEXT NOT NULL, city TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT '', time_preference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  selected_response_id TEXT
);
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  expert_id TEXT NOT NULL REFERENCES users(id), message TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  message TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS request_owner ON requests(user_id);
CREATE INDEX IF NOT EXISTS response_request ON responses(request_id);
CREATE INDEX IF NOT EXISTS notification_owner ON notifications(user_id);
CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires_at);
