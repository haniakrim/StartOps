-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  due_date DATE,
  paid_date DATE,
  line_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE TO authenticated USING (true);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  vendor_id UUID,
  category TEXT,
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses_insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "expenses_update" ON public.expenses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "expenses_delete" ON public.expenses FOR DELETE TO authenticated USING (true);

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  category TEXT,
  rating NUMERIC DEFAULT 0,
  payment_terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendors_select" ON public.vendors FOR SELECT TO authenticated USING (true);
CREATE POLICY "vendors_insert" ON public.vendors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vendors_update" ON public.vendors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "vendors_delete" ON public.vendors FOR DELETE TO authenticated USING (true);

-- Create products/inventory table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit_price NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated USING (true);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  progress INTEGER DEFAULT 0,
  client_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  manager_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated USING (true);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assignee_id UUID,
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tasks_select" ON public.project_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "project_tasks_insert" ON public.project_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "project_tasks_update" ON public.project_tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "project_tasks_delete" ON public.project_tasks FOR DELETE TO authenticated USING (true);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  description TEXT,
  hours NUMERIC DEFAULT 0,
  date DATE NOT NULL,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_select" ON public.time_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "time_entries_insert" ON public.time_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "time_entries_update" ON public.time_entries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "time_entries_delete" ON public.time_entries FOR DELETE TO authenticated USING (true);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  title TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  hire_date DATE,
  salary NUMERIC,
  utilization_target INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_select" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "employees_insert" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "employees_update" ON public.employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "employees_delete" ON public.employees FOR DELETE TO authenticated USING (true);

-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "skills_insert" ON public.skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "skills_update" ON public.skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "skills_delete" ON public.skills FOR DELETE TO authenticated USING (true);

-- Create employee_skills table
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency INTEGER DEFAULT 1,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employee_skills_select" ON public.employee_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "employee_skills_insert" ON public.employee_skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "employee_skills_update" ON public.employee_skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "employee_skills_delete" ON public.employee_skills FOR DELETE TO authenticated USING (true);

-- Create communications table (ambient capture)
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  direction TEXT DEFAULT 'inbound',
  subject TEXT,
  content TEXT,
  summary TEXT,
  sentiment TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "communications_select" ON public.communications FOR SELECT TO authenticated USING (true);
CREATE POLICY "communications_insert" ON public.communications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "communications_update" ON public.communications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "communications_delete" ON public.communications FOR DELETE TO authenticated USING (true);

-- Create deal_stage_history table (semantic pipeline audit)
CREATE TABLE IF NOT EXISTS public.deal_stage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  reason TEXT,
  confidence NUMERIC DEFAULT 0,
  inferred_by TEXT DEFAULT 'manual',
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deal_stage_history_select" ON public.deal_stage_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "deal_stage_history_insert" ON public.deal_stage_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "deal_stage_history_update" ON public.deal_stage_history FOR UPDATE TO authenticated USING (true);

-- Create forecasts table
CREATE TABLE IF NOT EXISTS public.forecasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  projected_revenue NUMERIC DEFAULT 0,
  weighted_revenue NUMERIC DEFAULT 0,
  confidence_low NUMERIC DEFAULT 0,
  confidence_high NUMERIC DEFAULT 0,
  factors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forecasts_select" ON public.forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "forecasts_insert" ON public.forecasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "forecasts_update" ON public.forecasts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "forecasts_delete" ON public.forecasts FOR DELETE TO authenticated USING (true);