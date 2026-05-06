CREATE TABLE public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  location TEXT,
  website TEXT,
  revenue TEXT,
  health INTEGER DEFAULT 80,
  status TEXT DEFAULT 'Prospect',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "companies_delete" ON public.companies FOR DELETE TO authenticated USING (true);