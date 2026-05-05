-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_response_status INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhooks_select" ON public.webhooks
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "webhooks_insert" ON public.webhooks
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_update" ON public.webhooks
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "webhooks_delete" ON public.webhooks
FOR DELETE TO authenticated USING (auth.uid() = user_id);