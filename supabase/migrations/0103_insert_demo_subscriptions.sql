-- Insert Subscriptions
INSERT INTO public.subscriptions (organization_id, customer_name, customer_email, plan_name, plan_price, billing_cycle, status, payment_method, mrr, arr, start_date, next_billing_date) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Acme Corp', 'billing@acme.example.com', 'Enterprise', 149, 'monthly', 'active', 'credit_card', 74500, 894000, '2024-01-15', '2025-02-15'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Hooli', 'finance@hooli.example.com', 'Enterprise Plus', 249, 'monthly', 'active', 'ach', 249000, 2988000, '2024-03-01', '2025-03-01'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Stark Industries', 'accounts@stark.example.com', 'Enterprise', 149, 'annual', 'active', 'wire_transfer', 149000, 1788000, '2024-06-01', '2025-06-01'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Wayne Enterprises', 'payments@wayne.example.com', 'Enterprise', 149, 'monthly', 'active', 'credit_card', 59600, 715200, '2024-08-15', '2025-02-15'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Globex Corporation', 'ap@globex.example.com', 'Professional', 79, 'monthly', 'active', 'credit_card', 23700, 284400, '2024-09-01', '2025-03-01'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Initech', 'billing@initech.example.com', 'Professional', 79, 'monthly', 'canceled', 'credit_card', 0, 0, '2024-05-01', NULL);