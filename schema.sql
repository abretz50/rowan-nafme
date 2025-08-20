
-- Minimal users/points schema (from your Points Manager)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_full_name_lower_idx ON users (lower(full_name));

CREATE TABLE IF NOT EXISTS points (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events schema
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                         -- Event Name
  description TEXT,                           -- description complete
  preview TEXT,                               -- description preview
  date DATE,                                  -- date (YYYY-MM-DD)
  start_time TIME,                            -- start time (HH:MM)
  end_time TIME,                              -- end time (HH:MM)
  location TEXT,
  image_url TEXT,                             -- image link
  points INTEGER NOT NULL DEFAULT 0,          -- points awarded
  attendance INTEGER NOT NULL DEFAULT 0,      -- tracked attendance
  tag TEXT,                                   -- category/tag
  volunteers_per_hour INTEGER,                -- volunteers per hour
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_date_idx ON events (date);
CREATE INDEX IF NOT EXISTS events_tag_idx ON events (tag);
