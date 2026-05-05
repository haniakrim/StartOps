-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.pipelines(id),
  contact_id UUID REFERENCES public.contacts(id),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  description TEXT,
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select" ON public.deals
FOR SELECT TO authenticated USING (true);

CREATE POLICY "deals_insert" ON public.deals
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "deals_update" ON public.deals
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "deals_delete" ON public.deals
FOR DELETE TO authenticated USING (true);