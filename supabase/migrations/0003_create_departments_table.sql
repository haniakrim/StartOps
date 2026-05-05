-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_department_id UUID REFERENCES public.departments(id),
  manager_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_select" ON public.departments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "departments_insert" ON public.departments
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "departments_update" ON public.departments
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "departments_delete" ON public.departments
FOR DELETE TO authenticated USING (true);