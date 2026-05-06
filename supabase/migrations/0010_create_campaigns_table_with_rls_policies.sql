CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT DEFAULT 'newsletter',
  status TEXT DEFAULT 'draft',
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select" ON campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "campaigns_delete" ON campaigns FOR DELETE TO authenticated USING (true);