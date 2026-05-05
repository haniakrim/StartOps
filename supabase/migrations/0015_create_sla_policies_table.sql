-- Create sla_policies table
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL,
  response_time_hours INTEGER NOT NULL,
  resolution_time_hours INTEGER NOT NULL,
  business_hours_only BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sla_select" ON public.sla_policies
FOR SELECT TO authenticated USING (true);

CREATE POLICY "sla_insert" ON public.sla_policies
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "sla_update" ON public.sla_policies
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "sla_delete" ON public.sla_policies
FOR DELETE TO authenticated USING (true);