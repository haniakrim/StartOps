CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  text TEXT NOT NULL,
  author_name TEXT DEFAULT 'You',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "comments_update" ON public.comments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE TO authenticated USING (true);