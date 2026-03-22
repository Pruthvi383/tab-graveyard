CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS extension_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  label text NOT NULL DEFAULT 'Primary browser',
  token_hash text NOT NULL UNIQUE,
  token_prefix text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_extension_tokens_user_id ON extension_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_tokens_created_at ON extension_tokens(created_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_select_own" ON sessions;
CREATE POLICY "sessions_select_own"
  ON sessions FOR SELECT
  USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "sessions_insert_own" ON sessions;
CREATE POLICY "sessions_insert_own"
  ON sessions FOR INSERT
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "sessions_update_own" ON sessions;
CREATE POLICY "sessions_update_own"
  ON sessions FOR UPDATE
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "sessions_delete_own" ON sessions;
CREATE POLICY "sessions_delete_own"
  ON sessions FOR DELETE
  USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "tab_events_select_own" ON tab_events;
CREATE POLICY "tab_events_select_own"
  ON tab_events FOR SELECT
  USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "tab_events_insert_own" ON tab_events;
CREATE POLICY "tab_events_insert_own"
  ON tab_events FOR INSERT
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "extension_tokens_select_own" ON extension_tokens;
CREATE POLICY "extension_tokens_select_own"
  ON extension_tokens FOR SELECT
  USING ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "extension_tokens_insert_own" ON extension_tokens;
CREATE POLICY "extension_tokens_insert_own"
  ON extension_tokens FOR INSERT
  WITH CHECK ((select auth.uid())::text = user_id);

DROP POLICY IF EXISTS "extension_tokens_delete_own" ON extension_tokens;
CREATE POLICY "extension_tokens_delete_own"
  ON extension_tokens FOR DELETE
  USING ((select auth.uid())::text = user_id);

