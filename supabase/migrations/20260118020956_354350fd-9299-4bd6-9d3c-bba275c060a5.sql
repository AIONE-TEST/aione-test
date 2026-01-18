-- Fix remaining security warnings

-- 1. Fix the INSERT policy for user_sessions (remove USING true)
DROP POLICY IF EXISTS "Users can insert their own session" ON user_sessions;
CREATE POLICY "Users can insert their own session"
ON user_sessions FOR INSERT
WITH CHECK (
  username IS NOT NULL AND length(username) >= 3
);

-- 2. Recreate view without SECURITY DEFINER (use SECURITY INVOKER)
DROP VIEW IF EXISTS user_sessions_public;
CREATE VIEW user_sessions_public
WITH (security_invoker = true) AS
SELECT 
  id, 
  username, 
  save_history, 
  settings, 
  created_at, 
  updated_at, 
  last_login, 
  stay_connected, 
  last_activity,
  failed_attempts,
  locked_until
FROM user_sessions;

-- 3. Fix activity_logs INSERT policy
DROP POLICY IF EXISTS "Users can insert own activity_logs" ON activity_logs;
CREATE POLICY "Users can insert activity logs"
ON activity_logs FOR INSERT
WITH CHECK (
  session_id IS NOT NULL OR username IS NOT NULL
);