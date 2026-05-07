-- Insert Audit Logs
INSERT INTO public.audit_logs (organization_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'create', 'deal', '7d0c387a-2c35-4b6a-8b5b-4bbb707476ef', NULL, '{"name": "Acme Corp Enterprise Expansion", "value": 125000}', '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'update', 'contact', '77b937c6-d267-497e-8f5b-3f7c5ccf58cd', '{"status": "lead"}', '{"status": "customer"}', '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'create', 'invoice', NULL, NULL, '{"invoice_number": "INV-2025-001", "amount": 125000}', '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'update', 'deal', '7d0c387a-2c35-4b6a-8b5b-4bbb707476ef', '{"stage": "proposal"}', '{"stage": "negotiation"}', '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'create', 'activity', NULL, NULL, '{"type": "call", "subject": "Discovery call with John"}', '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'delete', 'contact', NULL, NULL, NULL, '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'create', 'quote', NULL, NULL, '{"quote_number": "Q-2025-001", "total": 135000}', '192.168.1.100', 'Mozilla/5.0'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'update', 'invoice', NULL, '{"status": "sent"}', '{"status": "paid"}', '192.168.1.100', 'Mozilla/5.0');