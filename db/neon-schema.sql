CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  google_sub TEXT UNIQUE,
  created_at TEXT NOT NULL
);

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS google_sub TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_verified INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_google_sub ON app_users(google_sub) WHERE google_sub IS NOT NULL;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token_user ON sessions(token_hash, user_id);

CREATE TABLE IF NOT EXISTS auth_limits (
  key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  reset_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS communities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  block_count INTEGER NOT NULL DEFAULT 1,
  unit_count INTEGER NOT NULL DEFAULT 1,
  monthly_due INTEGER NOT NULL DEFAULT 0,
  period TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  owner_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('owner', 'manager', 'resident')),
  unit TEXT,
  phone TEXT,
  joined_at TEXT NOT NULL,
  UNIQUE (community_id, user_id)
);
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  unit TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'joined')),
  invited_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL,
  accepted_at TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'announcement',
  read_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('verify', 'reset')),
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS residents (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  phone TEXT,
  occupancy TEXT NOT NULL DEFAULT 'Ev sahibi',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dues (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  resident_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late')),
  due_date TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  expense_date TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Bilgilendirme',
  created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  decision_no TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_residents_community ON residents(community_id);
CREATE INDEX IF NOT EXISTS idx_dues_community ON dues(community_id);
CREATE INDEX IF NOT EXISTS idx_expenses_community ON expenses(community_id);
CREATE INDEX IF NOT EXISTS idx_announcements_community ON announcements(community_id);
CREATE INDEX IF NOT EXISTS idx_decisions_community ON decisions(community_id);
CREATE INDEX IF NOT EXISTS idx_invitations_community ON invitations(community_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id, kind);
