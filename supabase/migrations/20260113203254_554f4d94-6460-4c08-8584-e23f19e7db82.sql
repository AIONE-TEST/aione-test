-- Fix security issue: Restrict api_keys table access to authenticated users only
DROP POLICY IF EXISTS "Anyone can view api_keys status" ON public.api_keys;

CREATE POLICY "Authenticated users can view api_keys status" 
ON public.api_keys 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue: Restrict notifications to authenticated users only
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;

CREATE POLICY "Authenticated users can view notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);