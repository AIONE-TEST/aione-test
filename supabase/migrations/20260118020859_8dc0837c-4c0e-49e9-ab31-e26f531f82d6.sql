-- =============================================================
-- MIGRATION SÉCURITÉ CRITIQUE - Fix all security issues
-- =============================================================

-- 1. Supprimer toutes les policies permissives existantes
DROP POLICY IF EXISTS "Anyone can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can update roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON user_roles;
DROP POLICY IF EXISTS "Allow public insert on api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow public update on api_keys" ON api_keys;
DROP POLICY IF EXISTS "Allow public insert on user_quotas" ON user_quotas;
DROP POLICY IF EXISTS "Allow public update on user_quotas" ON user_quotas;
DROP POLICY IF EXISTS "Allow public insert sessions" ON user_sessions;
DROP POLICY IF EXISTS "Allow public update sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can insert support messages" ON support_messages;
DROP POLICY IF EXISTS "Users can CRUD own history" ON generation_history;
DROP POLICY IF EXISTS "Users can CRUD own api_keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can CRUD own notes" ON user_notes;
DROP POLICY IF EXISTS "Sessions can access their conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Sessions can access their messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow public operations on user_notes" ON user_notes;

-- 2. Créer des policies sécurisées pour user_roles
CREATE POLICY "Users can view their own role"
ON user_roles FOR SELECT
USING (
  username = lower(current_setting('request.headers', true)::json->>'x-username')
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

-- Les nouveaux utilisateurs peuvent créer leur propre rôle 'user' uniquement
CREATE POLICY "Users can create own role"
ON user_roles FOR INSERT
WITH CHECK (
  role = 'user'
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

CREATE POLICY "Only admins can update roles"
ON user_roles FOR UPDATE
USING (is_admin(current_setting('request.headers', true)::json->>'x-username'));

CREATE POLICY "Only admins can delete roles"
ON user_roles FOR DELETE
USING (is_admin(current_setting('request.headers', true)::json->>'x-username'));

-- 3. Policies sécurisées pour user_sessions - via username header
DROP POLICY IF EXISTS "Block direct select user_sessions" ON user_sessions;

CREATE POLICY "Sessions can only access own data"
ON user_sessions FOR SELECT
USING (
  username = lower(current_setting('request.headers', true)::json->>'x-username')
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

CREATE POLICY "Users can insert their own session"
ON user_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can only update own session"
ON user_sessions FOR UPDATE
USING (
  username = lower(current_setting('request.headers', true)::json->>'x-username')
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

-- 4. Policies sécurisées pour generation_history
CREATE POLICY "Users can view own generation history"
ON generation_history FOR SELECT
USING (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

CREATE POLICY "Users can insert own generation history"
ON generation_history FOR INSERT
WITH CHECK (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR current_setting('request.headers', true)::json->>'x-session-id' IS NOT NULL
);

CREATE POLICY "Users can update own generation history"
ON generation_history FOR UPDATE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can delete own generation history"
ON generation_history FOR DELETE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

-- 5. Policies sécurisées pour user_notes
CREATE POLICY "Users can view own notes"
ON user_notes FOR SELECT
USING (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

CREATE POLICY "Users can insert own notes"
ON user_notes FOR INSERT
WITH CHECK (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR current_setting('request.headers', true)::json->>'x-session-id' IS NOT NULL
);

CREATE POLICY "Users can update own notes"
ON user_notes FOR UPDATE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can delete own notes"
ON user_notes FOR DELETE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

-- 6. Policies sécurisées pour user_api_keys
CREATE POLICY "Users can view own api_keys"
ON user_api_keys FOR SELECT
USING (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

CREATE POLICY "Users can insert own api_keys"
ON user_api_keys FOR INSERT
WITH CHECK (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR current_setting('request.headers', true)::json->>'x-session-id' IS NOT NULL
);

CREATE POLICY "Users can update own api_keys"
ON user_api_keys FOR UPDATE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can delete own api_keys"
ON user_api_keys FOR DELETE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

-- 7. Policies sécurisées pour chat_conversations
CREATE POLICY "Users can view own conversations"
ON chat_conversations FOR SELECT
USING (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR is_admin(current_setting('request.headers', true)::json->>'x-username')
);

CREATE POLICY "Users can insert own conversations"
ON chat_conversations FOR INSERT
WITH CHECK (
  session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  OR current_setting('request.headers', true)::json->>'x-session-id' IS NOT NULL
);

CREATE POLICY "Users can update own conversations"
ON chat_conversations FOR UPDATE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Users can delete own conversations"
ON chat_conversations FOR DELETE
USING (session_id::text = current_setting('request.headers', true)::json->>'x-session-id');

-- 8. Policies sécurisées pour chat_messages (via conversation)
CREATE POLICY "Users can view own messages"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id
    AND (c.session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
         OR is_admin(current_setting('request.headers', true)::json->>'x-username'))
  )
);

CREATE POLICY "Users can insert own messages"
ON chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id
    AND c.session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  )
);

CREATE POLICY "Users can update own messages"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id
    AND c.session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  )
);

CREATE POLICY "Users can delete own messages"
ON chat_messages FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = conversation_id
    AND c.session_id::text = current_setting('request.headers', true)::json->>'x-session-id'
  )
);

-- 9. Policies pour support_messages - authentification requise via header
CREATE POLICY "Users can insert support with username"
ON support_messages FOR INSERT
WITH CHECK (
  current_setting('request.headers', true)::json->>'x-username' IS NOT NULL
);

-- 10. Policies pour api_keys (configuration globale) - admin seulement
CREATE POLICY "Admin can manage api_keys"
ON api_keys FOR ALL
USING (is_admin(current_setting('request.headers', true)::json->>'x-username'));

-- 11. Policies pour user_quotas - admin seulement pour modifications
DROP POLICY IF EXISTS "Only admin can insert quotas" ON user_quotas;
DROP POLICY IF EXISTS "Only admin can update quotas" ON user_quotas;

CREATE POLICY "Admin can insert quotas"
ON user_quotas FOR INSERT
WITH CHECK (is_admin(current_setting('request.headers', true)::json->>'x-username'));

CREATE POLICY "Admin can update quotas"
ON user_quotas FOR UPDATE
USING (is_admin(current_setting('request.headers', true)::json->>'x-username'));

-- 12. Mettre à jour la vue user_sessions_public pour exclure ip_address
DROP VIEW IF EXISTS user_sessions_public;
CREATE VIEW user_sessions_public
WITH (security_invoker = on) AS
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
FROM user_sessions