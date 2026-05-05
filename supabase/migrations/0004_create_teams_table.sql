-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select" ON public.teams
FOR SELECT TO authenticated USING (true);

CREATE POLICY "teams_insert" ON public.teams
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "teams_update" ON public.teams
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "teams_delete" ON public.teams
FOR DELETE TO authenticated USING (true);