-- Drop existing problematic policies on user_sessions
DROP POLICY IF EXISTS "Users can view own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow anonymous session creation" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow session read by session id" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow session update by session id" ON public.user_sessions;

-- Create permissive policies for user_sessions (this is a public pseudo-based system, not auth-based)
-- Allow anyone to read sessions (needed for login check)
CREATE POLICY "Allow public read on user_sessions"
ON public.user_sessions
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anyone to create sessions (needed for signup)
CREATE POLICY "Allow public insert on user_sessions"
ON public.user_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to update sessions (needed for login update)
CREATE POLICY "Allow public update on user_sessions"
ON public.user_sessions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Same for activity_logs
DROP POLICY IF EXISTS "Users can insert own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow anonymous log creation" ON public.activity_logs;

CREATE POLICY "Allow public insert on activity_logs"
ON public.activity_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read on activity_logs"
ON public.activity_logs
FOR SELECT
TO anon, authenticated
USING (true);

-- Same for user_notes
DROP POLICY IF EXISTS "Users can manage own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Allow anonymous notes creation" ON public.user_notes;

CREATE POLICY "Allow public operations on user_notes"
ON public.user_notes
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);