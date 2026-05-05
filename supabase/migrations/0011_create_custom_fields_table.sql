-- Create custom_fields table
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_fields_select" ON public.custom_fields
FOR SELECT TO authenticated USING (true);

CREATE POLICY "custom_fields_insert" ON public.custom_fields
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "custom_fields_update" ON public.custom_fields
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "custom_fields_delete" ON public.custom_fields
FOR DELETE TO authenticated USING (true);