-- Fix RLS policies for user_sessions to allow INSERT and UPDATE properly
-- The issue: RESTRICTIVE policies require ALL to be satisfied

-- First drop the problematic policies
DROP POLICY IF EXISTS "Allow insert new session" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow update own session by id" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can create session" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can update their session" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow public insert on user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow public update on user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can read their own session" ON public.user_sessions;
DROP POLICY IF EXISTS "Deny direct select on user_sessions" ON public.user_sessions;

-- Create PERMISSIVE policies (default - combine with OR, not AND)
-- Allow anyone to INSERT a new session
CREATE POLICY "Allow public insert sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to UPDATE their session (we filter by session ID in the app)
CREATE POLICY "Allow public update sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (true);

-- Block SELECT on user_sessions table (force use of view for reading)
CREATE POLICY "Block direct select user_sessions"
ON public.user_sessions 
FOR SELECT 
USING (false);