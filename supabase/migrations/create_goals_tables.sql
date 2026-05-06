-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  period TEXT,
  status TEXT DEFAULT 'on_track',
  progress INTEGER DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create policies for goals
CREATE POLICY "goals_select" ON public.goals FOR SELECT USING (true);
CREATE POLICY "goals_insert" ON public.goals FOR INSERT WITH CHECK (true);
CREATE POLICY "goals_update" ON public.goals FOR UPDATE USING (true);
CREATE POLICY "goals_delete" ON public.goals FOR DELETE USING (true);

-- Create key_results table
CREATE TABLE IF NOT EXISTS public.key_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC DEFAULT 100,
  unit TEXT DEFAULT '%',
  status TEXT DEFAULT 'on_track',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;

-- Create policies for key_results
CREATE POLICY "key_results_select" ON public.key_results FOR SELECT USING (true);
CREATE POLICY "key_results_insert" ON public.key_results FOR INSERT WITH CHECK (true);
CREATE POLICY "key_results_update" ON public.key_results FOR UPDATE USING (true);
CREATE POLICY "key_results_delete" ON public.key_results FOR DELETE USING (true);