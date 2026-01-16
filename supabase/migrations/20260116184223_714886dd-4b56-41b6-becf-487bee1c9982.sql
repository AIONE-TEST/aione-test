-- TÂCHE 1, 6, 15: Créer le système de rôles utilisateur et l'utilisateur admin Mik

-- Créer l'enum pour les rôles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Créer la table user_roles avec user_id nullable
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    username text NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (username, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique (pour vérifier les rôles)
CREATE POLICY "Anyone can read roles" ON public.user_roles FOR SELECT USING (true);

-- Policy pour insert/update/delete
CREATE POLICY "Anyone can insert roles" ON public.user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update roles" ON public.user_roles FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete roles" ON public.user_roles FOR DELETE USING (true);

-- Créer la fonction has_role
CREATE OR REPLACE FUNCTION public.has_role(_username text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE username = lower(_username)
      AND role = _role
  )
$$;

-- Créer la fonction is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(lower(_username), 'admin')
$$;

-- TÂCHE 6: Ajouter colonne pour tentatives de connexion échouées
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS failed_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;

-- TÂCHE 8: Ajouter colonne pour "rester connecté"
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS stay_connected boolean DEFAULT false;

-- TÂCHE 9: Ajouter colonne pour dernière activité
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS last_activity timestamp with time zone DEFAULT now();

-- TÂCHE 16: Créer table pour les messages de support
CREATE TABLE IF NOT EXISTS public.support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_username text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert support" ON public.support_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read support" ON public.support_messages FOR SELECT USING (true);

-- TÂCHE 20: Créer une vue pour les utilisateurs actifs
CREATE OR REPLACE VIEW public.active_users AS
SELECT username, last_login, last_activity
FROM public.user_sessions
WHERE last_activity > now() - interval '30 minutes';

-- Insérer le rôle admin pour Mik
INSERT INTO public.user_roles (username, role)
VALUES ('mik', 'admin')
ON CONFLICT (username, role) DO NOTHING;