-- Insert Custom Fields
INSERT INTO public.custom_fields (organization_id, entity_type, name, label, field_type, options, is_required, default_value, order_index, is_active) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'contact', 'linkedin_url', 'LinkedIn URL', 'text', '[]', false, NULL, 1, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'contact', 'lead_score', 'Lead Score', 'number', '[]', false, '50', 2, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'deal', 'competitor', 'Primary Competitor', 'text', '[]', false, NULL, 1, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'deal', 'decision_maker', 'Decision Maker', 'text', '[]', false, NULL, 2, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'deal', 'budget_confirmed', 'Budget Confirmed', 'boolean', '[]', false, 'false', 3, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'company', 'employee_count', 'Employee Count', 'number', '[]', false, NULL, 1, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'company', 'tech_stack', 'Tech Stack', 'text', '[]', false, NULL, 2, true);