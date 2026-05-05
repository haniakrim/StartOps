-- Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  department_id UUID,
  team_id UUID,
  permissions JSONB DEFAULT '[]',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_select" ON public.organization_members
FOR SELECT TO authenticated USING (true);

CREATE POLICY "org_members_insert" ON public.organization_members
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "org_members_update" ON public.organization_members
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "org_members_delete" ON public.organization_members
FOR DELETE TO authenticated USING (true);