-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id),
  deal_id UUID REFERENCES public.deals(id),
  owner_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON public.activities
FOR SELECT TO authenticated USING (true);

CREATE POLICY "activities_insert" ON public.activities
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "activities_update" ON public.activities
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "activities_delete" ON public.activities
FOR DELETE TO authenticated USING (true);