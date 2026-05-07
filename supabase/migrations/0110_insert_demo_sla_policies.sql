-- Insert SLA Policies
INSERT INTO public.sla_policies (organization_id, name, description, priority, response_time_hours, resolution_time_hours, business_hours_only, is_active) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Standard Support', 'Default SLA for all support tickets', 'medium', 4, 24, true, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Enterprise Support', 'Premium SLA for enterprise customers', 'high', 1, 4, true, true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Critical Issues', 'Emergency response for critical system issues', 'critical', 0, 2, false, true);