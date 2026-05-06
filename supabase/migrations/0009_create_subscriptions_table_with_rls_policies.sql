CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  plan_name TEXT NOT NULL,
  plan_price NUMERIC DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'active',
  payment_method TEXT DEFAULT 'credit_card',
  mrr NUMERIC DEFAULT 0,
  arr NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "subscriptions_delete" ON subscriptions FOR DELETE TO authenticated USING (true);