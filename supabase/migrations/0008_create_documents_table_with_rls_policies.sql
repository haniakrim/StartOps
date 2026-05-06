CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'file',
  size INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  entity_type TEXT,
  entity_id UUID,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "documents_insert" ON documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "documents_update" ON documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "documents_delete" ON documents FOR DELETE TO authenticated USING (true);