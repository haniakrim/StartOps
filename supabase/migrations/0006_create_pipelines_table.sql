-- Create pipelines table
CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stages JSONB NOT NULL DEFAULT '[{"id":"lead","name":"Lead","order":1,"color":"#6452db"},{"id":"qualified","name":"Qualified","order":2,"color":"#5683da"},{"id":"proposal","name":"Proposal","order":3,"color":"#ff8964"},{"id":"negotiation","name":"Negotiation","order":4,"color":"#f0ad4e"},{"id":"closed","name":"Closed Won","order":5,"color":"#8dc572"}]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipelines_select" ON public.pipelines
FOR SELECT TO authenticated USING (true);

CREATE POLICY "pipelines_insert" ON public.pipelines
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pipelines_update" ON public.pipelines
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "pipelines_delete" ON public.pipelines
FOR DELETE TO authenticated USING (true);