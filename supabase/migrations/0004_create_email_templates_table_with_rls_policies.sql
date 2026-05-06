CREATE TABLE public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates_select" ON public.email_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "email_templates_insert" ON public.email_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "email_templates_update" ON public.email_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "email_templates_delete" ON public.email_templates FOR DELETE TO authenticated USING (true);