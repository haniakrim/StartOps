-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  sla_target_hours INTEGER DEFAULT 24,
  sla_breach_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select" ON public.support_tickets
FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "tickets_insert" ON public.support_tickets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tickets_update" ON public.support_tickets
FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = assigned_to);