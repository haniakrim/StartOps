-- Insert Campaigns
INSERT INTO public.campaigns (organization_id, name, subject, type, status, recipient_count, open_count, click_count, bounce_count, unsubscribe_count, sent_at, scheduled_at) VALUES
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Q1 Product Launch', 'Introducing our new AI-powered features', 'product_launch', 'sent', 5000, 1850, 620, 45, 32, '2025-01-15', '2025-01-15'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Customer Success Stories', 'See how Acme Corp achieved 300% ROI', 'newsletter', 'sent', 8500, 3400, 890, 78, 56, '2025-01-22', '2025-01-22'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Webinar: Sales Automation', 'Join our free webinar on sales automation', 'webinar', 'scheduled', 0, 0, 0, 0, 0, NULL, '2025-02-10'),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Enterprise Upgrade Offer', 'Exclusive 20% discount on enterprise plans', 'promotional', 'draft', 0, 0, 0, 0, 0, NULL, NULL),
('9321e605-1b36-4b31-a8ef-4bf5c58b5542', 'Monthly Tips & Tricks', '5 ways to boost your team productivity', 'newsletter', 'sent', 12000, 4800, 1200, 120, 89, '2025-01-30', '2025-01-30');