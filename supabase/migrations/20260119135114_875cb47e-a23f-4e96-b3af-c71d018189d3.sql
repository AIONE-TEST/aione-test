-- Security Fix: Remove hardcoded admin password from verify_admin_password function
-- The password should only be verified against the stored bcrypt hash

CREATE OR REPLACE FUNCTION public.verify_admin_password(admin_username text, admin_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only verify against stored hash - no hardcoded passwords
  RETURN public.verify_session_password(admin_password, admin_username);
END;
$$;

-- Security Fix: Update user_sessions RLS policies to use session_id instead of username header
-- This prevents users from accessing other users' data by setting x-username header

-- Drop existing problematic SELECT policy
DROP POLICY IF EXISTS "Sessions can only access own data" ON public.user_sessions;

-- Create secure SELECT policy that uses session_id header (not username header)
-- Users can only see their own session data, admins see all
CREATE POLICY "Sessions can only access own data" 
ON public.user_sessions 
FOR SELECT 
USING (
  (id::text = ((current_setting('request.headers', true))::json->>'x-session-id'))
  OR is_admin(((current_setting('request.headers', true))::json->>'x-username'))
);

-- Drop and recreate UPDATE policy to use session_id
DROP POLICY IF EXISTS "Users can only update own session" ON public.user_sessions;

CREATE POLICY "Users can only update own session" 
ON public.user_sessions 
FOR UPDATE 
USING (
  (id::text = ((current_setting('request.headers', true))::json->>'x-session-id'))
  OR is_admin(((current_setting('request.headers', true))::json->>'x-username'))
);

-- Security Fix: Recreate user_sessions_public view with security_invoker
-- This ensures the view respects RLS policies of the querying user
DROP VIEW IF EXISTS public.user_sessions_public;

-- Create secure view that excludes password_hash and uses security_invoker
CREATE VIEW public.user_sessions_public
WITH (security_invoker = true) AS
SELECT 
  id,
  username,
  created_at,
  updated_at,
  last_login,
  last_activity,
  failed_attempts,
  locked_until,
  save_history,
  stay_connected,
  settings
  -- password_hash is explicitly EXCLUDED for security
  -- ip_address is explicitly EXCLUDED for privacy
FROM public.user_sessions;

-- Security Fix: Recreate active_users view with security_invoker
DROP VIEW IF EXISTS public.active_users;

CREATE VIEW public.active_users
WITH (security_invoker = true) AS
SELECT 
  username,
  last_login,
  last_activity
FROM public.user_sessions
WHERE last_activity > now() - interval '30 minutes';