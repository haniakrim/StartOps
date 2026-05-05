-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_select" ON public.api_keys
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "api_keys_insert" ON public.api_keys
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_update" ON public.api_keys
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "api_keys_delete" ON public.api_keys
FOR DELETE TO authenticated USING (auth.uid() = user_id);