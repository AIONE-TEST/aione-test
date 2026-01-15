-- Create a function to verify session password (returns true/false, never exposes the hash)
CREATE OR REPLACE FUNCTION public.verify_session_password(session_username text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.user_sessions
  WHERE username = session_username;
  
  IF stored_hash IS NULL THEN
    RETURN true; -- No password set
  END IF;
  
  RETURN stored_hash = input_password;
END;
$$;

-- Create a function to check if a session has a password
CREATE OR REPLACE FUNCTION public.session_has_password(session_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.user_sessions
  WHERE username = session_username;
  
  RETURN stored_hash IS NOT NULL;
END;
$$;