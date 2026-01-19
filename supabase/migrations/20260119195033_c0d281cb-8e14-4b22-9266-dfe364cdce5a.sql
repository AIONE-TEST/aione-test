-- Fix 1: Remove overly permissive public read policies on user_quotas
-- Drop the redundant public read policies
DROP POLICY IF EXISTS "Allow public read on user_quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Public can read quotas" ON public.user_quotas;

-- Create a proper policy that only allows authenticated users to read quotas
-- For now, quotas are global/shared, so authenticated users can view them
CREATE POLICY "Authenticated users can view quotas"
ON public.user_quotas
FOR SELECT
USING (auth.uid() IS NOT NULL OR ((current_setting('request.headers'::text, true))::json ->> 'x-session-id') IS NOT NULL);

-- Fix 2: Recreate active_users view with security_invoker to respect RLS
DROP VIEW IF EXISTS public.active_users;
CREATE VIEW public.active_users
WITH (security_invoker = true) AS
SELECT username, last_login, last_activity
FROM public.user_sessions
WHERE last_activity > now() - interval '30 minutes';