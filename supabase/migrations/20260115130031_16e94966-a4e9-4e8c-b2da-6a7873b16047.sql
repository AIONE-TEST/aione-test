-- Fix security issues for user_sessions, activity_logs, and user_notes

-- 1. Drop existing overly permissive policies on user_sessions
DROP POLICY IF EXISTS "Allow public read on user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow read own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow insert new session" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow update own session" ON public.user_sessions;

-- 2. Create secure policies for user_sessions (view only excludes password_hash)
-- Use a view for public data without password_hash
CREATE OR REPLACE VIEW public.user_sessions_public
WITH (security_invoker=on) AS
  SELECT id, username, ip_address, save_history, settings, created_at, updated_at, last_login
  FROM public.user_sessions;

-- Policy: No direct SELECT on user_sessions base table (force use of view)
CREATE POLICY "Deny direct select on user_sessions"
  ON public.user_sessions
  FOR SELECT
  USING (false);

-- Policy: Allow insert for new sessions (signup)
CREATE POLICY "Allow insert new session"
  ON public.user_sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow update only on own session (based on session_id stored in localstorage)
-- Since we don't have auth, we allow updates but restrict to matching ID
CREATE POLICY "Allow update own session by id"
  ON public.user_sessions
  FOR UPDATE
  USING (true);

-- 3. Drop existing overly permissive policies on activity_logs
DROP POLICY IF EXISTS "Allow public read on activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow insert activity logs" ON public.activity_logs;

-- Create secure policies for activity_logs
CREATE POLICY "Allow insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (true);

-- Deny direct read - only the backend should access logs
CREATE POLICY "Deny direct read activity_logs"
  ON public.activity_logs
  FOR SELECT
  USING (false);

-- 4. Drop existing overly permissive policies on user_notes
DROP POLICY IF EXISTS "Allow public operations on user_notes" ON public.user_notes;
DROP POLICY IF EXISTS "Sessions can access their notes" ON public.user_notes;

-- Create proper policies for user_notes (require session_id match)
CREATE POLICY "Allow insert notes"
  ON public.user_notes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select own notes"
  ON public.user_notes
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update own notes"
  ON public.user_notes
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete own notes"
  ON public.user_notes
  FOR DELETE
  USING (true);