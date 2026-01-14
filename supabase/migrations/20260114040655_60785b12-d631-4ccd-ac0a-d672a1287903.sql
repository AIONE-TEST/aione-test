-- Fix api_keys RLS policies to allow public access for API key management
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read on api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Allow public insert on api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Allow public update on api_keys" ON public.api_keys;

-- Create permissive policies for api_keys (since this is a demo/prototype without auth)
CREATE POLICY "Allow public read on api_keys"
ON public.api_keys FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on api_keys"
ON public.api_keys FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on api_keys"
ON public.api_keys FOR UPDATE
USING (true);

-- Create user_quotas table for tracking generation quotas
CREATE TABLE IF NOT EXISTS public.user_quotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT 'standard',
  total_quota INTEGER NOT NULL DEFAULT 100,
  used_quota INTEGER NOT NULL DEFAULT 0,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_name, quality)
);

-- Enable RLS on user_quotas
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for user_quotas (demo mode)
CREATE POLICY "Allow public read on user_quotas"
ON public.user_quotas FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on user_quotas"
ON public.user_quotas FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on user_quotas"
ON public.user_quotas FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_quotas_updated_at
BEFORE UPDATE ON public.user_quotas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default quotas for common services
INSERT INTO public.user_quotas (service_name, quality, total_quota, used_quota)
VALUES 
  ('openai', 'standard', 100, 0),
  ('openai', 'hd', 50, 0),
  ('openai', 'ultra', 25, 0),
  ('stability', 'standard', 100, 0),
  ('stability', 'hd', 50, 0),
  ('midjourney', 'standard', 100, 0),
  ('midjourney', 'hd', 50, 0),
  ('replicate', 'standard', 200, 0),
  ('fal', 'standard', 150, 0)
ON CONFLICT (service_name, quality) DO NOTHING;