-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6452db',
  secondary_color TEXT DEFAULT '#ff8964',
  domain TEXT,
  plan TEXT DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_public_read" ON public.organizations
FOR SELECT TO authenticated USING (true);

CREATE POLICY "org_insert" ON public.organizations
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "org_update" ON public.organizations
FOR UPDATE TO authenticated USING (true);