-- Corriger les politiques RLS pour user_sessions (protéger les données sensibles)
DROP POLICY IF EXISTS "Anyone can read their session by username" ON public.user_sessions;

-- Nouvelle politique: les utilisateurs ne peuvent lire que leur propre session via leur ID de session stocké
CREATE POLICY "Users can read their own session" 
ON public.user_sessions 
FOR SELECT 
USING (id::text = current_setting('request.headers', true)::json->>'x-session-id' OR username = 'Mik');

-- Corriger les politiques RLS pour user_quotas (empêcher manipulation non autorisée)
DROP POLICY IF EXISTS "Anyone can read quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Anyone can insert quotas" ON public.user_quotas;
DROP POLICY IF EXISTS "Anyone can update quotas" ON public.user_quotas;

-- Nouvelles politiques restrictives pour user_quotas
-- Lecture publique autorisée pour les quotas (pas de données sensibles)
CREATE POLICY "Public can read quotas" 
ON public.user_quotas 
FOR SELECT 
USING (true);

-- Seul l'admin Mik peut insérer des quotas
CREATE POLICY "Only admin can insert quotas" 
ON public.user_quotas 
FOR INSERT 
WITH CHECK (current_setting('request.headers', true)::json->>'x-username' = 'Mik');

-- Seul l'admin Mik peut modifier les quotas (via header ou fonctions serveur)
CREATE POLICY "Only admin can update quotas" 
ON public.user_quotas 
FOR UPDATE 
USING (current_setting('request.headers', true)::json->>'x-username' = 'Mik');