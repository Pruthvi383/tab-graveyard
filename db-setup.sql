CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  topic text NOT NULL,
  tabs jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  restored_count int DEFAULT 0
);

CREATE TABLE tab_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  event_type text NOT NULL,
  tab_title text,
  tab_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

