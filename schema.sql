
-- Minimal schema: only store users who touch the points system
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enforce case-insensitive uniqueness on full names
CREATE UNIQUE INDEX IF NOT EXISTS users_full_name_lower_idx ON users (lower(full_name));

CREATE TABLE IF NOT EXISTS points (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
