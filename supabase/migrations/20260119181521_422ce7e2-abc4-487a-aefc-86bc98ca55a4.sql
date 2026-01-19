-- Create user_roles with proper auth.users reference if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey' 
    AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.email));
  RETURN new;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies on profiles to use auth.uid()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Update RLS policies on favorite_models to use auth.uid()
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorite_models;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorite_models;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorite_models;

CREATE POLICY "Users can view their own favorites" 
ON public.favorite_models FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.favorite_models FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorite_models FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies on notifications
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON public.notifications;
CREATE POLICY "Authenticated users can view notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update RLS policies on user_notifications
DROP POLICY IF EXISTS "Users can view their own user_notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can insert their own user_notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own user_notifications" ON public.user_notifications;

CREATE POLICY "Users can view their own user_notifications" 
ON public.user_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_notifications" 
ON public.user_notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_notifications" 
ON public.user_notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Update user_roles has_role function to use auth.uid()
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update is_admin to use auth.uid()
CREATE OR REPLACE FUNCTION public.is_admin_by_uid(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Update user_roles RLS to use auth.uid()
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can create own role" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin_by_uid(auth.uid()));

CREATE POLICY "Users can create default role" 
ON public.user_roles FOR INSERT 
WITH CHECK (auth.uid() = user_id AND role = 'user');

CREATE POLICY "Only admins can update roles" 
ON public.user_roles FOR UPDATE 
USING (public.is_admin_by_uid(auth.uid()));

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles FOR DELETE 
USING (public.is_admin_by_uid(auth.uid()));