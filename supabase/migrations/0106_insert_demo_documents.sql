-- Insert Documents
INSERT INTO public.documents (organization_id, name, type, size, category, entity_type, entity_id, tags, created_by) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Acme Corp Contract.pdf', 'file', 2450000, 'contracts', 'deal', '7d0c387a-2c35-4b6a-8b5b-4bbb707476ef', '{"contract", "legal"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Hooli NDA.pdf', 'file', 890000, 'legal', 'deal', 'b083a8e4-7946-4f06-bb91-56308803875d', '{"nda", "confidential"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Q1 Sales Presentation.pptx', 'file', 15200000, 'presentations', NULL, NULL, '{"sales", "q1"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Product Roadmap 2025.pdf', 'file', 3200000, 'planning', NULL, NULL, '{"roadmap", "2025"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Stark Security Assessment.pdf', 'file', 4100000, 'security', 'deal', '6ab7f23f-7027-4e49-aad9-860263a6fd64', '{"security", "compliance"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Employee Handbook.pdf', 'file', 1800000, 'hr', NULL, NULL, '{"hr", "policy"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Marketing Budget Q1.xlsx', 'file', 520000, 'finance', NULL, NULL, '{"budget", "q1"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'API Documentation.pdf', 'file', 2800000, 'technical', NULL, NULL, '{"api", "docs"}', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9');