-- Table pour les utilisateurs avec pseudo
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  ip_address TEXT,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  save_history BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Table pour l'historique des générations
CREATE TABLE public.generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', '3d', 'retouch', 'chat')),
  model_id TEXT NOT NULL,
  model_name TEXT,
  prompt TEXT,
  result_url TEXT,
  thumbnail_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER DEFAULT 1,
  aspect_ratio TEXT,
  quality TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les conversations de chat
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nouvelle conversation',
  model_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les messages de chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les notes personnelles (pense-bête)
CREATE TABLE public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  format TEXT DEFAULT 'txt' CHECK (format IN ('txt', 'json', 'md')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les logs système
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  username TEXT,
  ip_address TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les clés API par utilisateur
CREATE TABLE public.user_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  is_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, service_name)
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Policies permissives (pas d'auth Supabase, auth par pseudo)
CREATE POLICY "Anyone can create session" ON public.user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read their session by username" ON public.user_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update their session" ON public.user_sessions FOR UPDATE USING (true);

CREATE POLICY "Sessions can access their history" ON public.generation_history FOR ALL USING (true);
CREATE POLICY "Sessions can access their conversations" ON public.chat_conversations FOR ALL USING (true);
CREATE POLICY "Sessions can access their messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Sessions can access their notes" ON public.user_notes FOR ALL USING (true);
CREATE POLICY "Sessions can access their logs" ON public.activity_logs FOR ALL USING (true);
CREATE POLICY "Sessions can access their api keys" ON public.user_api_keys FOR ALL USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON public.user_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON public.user_api_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();