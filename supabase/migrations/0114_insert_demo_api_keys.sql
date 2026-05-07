-- Insert API Keys
INSERT INTO public.api_keys (organization_id, user_id, name, key_hash, key_prefix, permissions, rate_limit, last_used_at, expires_at, is_active) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'Production API Key', 'sha256:abc123...', 'sk_prod', '["read", "write"]', 1000, '2025-01-30', '2025-12-31', true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'Integration Key - Salesforce', 'sha256:def456...', 'sk_sf', '["read", "write"]', 500, '2025-01-28', '2025-06-30', true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'Read-Only Analytics', 'sha256:ghi789...', 'sk_ro', '["read"]', 2000, '2025-01-25', '2025-12-31', true),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'a9d8171b-44b9-47c8-9572-ddc6beb7f5d9', 'Webhook Testing', 'sha256:jkl012...', 'sk_test', '["read", "write"]', 100, '2025-01-15', '2025-03-31', false);