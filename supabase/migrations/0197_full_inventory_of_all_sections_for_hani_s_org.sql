SELECT 
  'contacts' as section, COUNT(*) as count FROM public.contacts WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'companies', COUNT(*) FROM public.companies WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'deals', COUNT(*) FROM public.deals WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'activities', COUNT(*) FROM public.activities WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'projects', COUNT(*) FROM public.projects WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'products', COUNT(*) FROM public.products WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'employees', COUNT(*) FROM public.employees WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'departments', COUNT(*) FROM public.departments WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'quotes', COUNT(*) FROM public.quotes WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'invoices', COUNT(*) FROM public.invoices WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'expenses', COUNT(*) FROM public.expenses WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'vendors', COUNT(*) FROM public.vendors WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'subscriptions', COUNT(*) FROM public.subscriptions WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'campaigns', COUNT(*) FROM public.campaigns WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'documents', COUNT(*) FROM public.documents WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'forecasts', COUNT(*) FROM public.forecasts WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'workflows', COUNT(*) FROM public.workflows WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'custom_fields', COUNT(*) FROM public.custom_fields WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'pipelines', COUNT(*) FROM public.pipelines WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'communications', COUNT(*) FROM public.communications WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'email_templates', COUNT(*) FROM public.email_templates WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'support_tickets', COUNT(*) FROM public.support_tickets WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'time_entries', COUNT(*) FROM public.time_entries WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'goals', COUNT(*) FROM public.goals WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'skills', COUNT(*) FROM public.skills WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'teams', COUNT(*) FROM public.teams WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'comments', COUNT(*) FROM public.comments WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'project_tasks', COUNT(*) FROM public.project_tasks
UNION ALL SELECT 'key_results', COUNT(*) FROM public.key_results
UNION ALL SELECT 'deal_stage_history', COUNT(*) FROM public.deal_stage_history
UNION ALL SELECT 'employee_skills', COUNT(*) FROM public.employee_skills
UNION ALL SELECT 'quote_items', COUNT(*) FROM public.quote_items
UNION ALL SELECT 'sla_policies', COUNT(*) FROM public.sla_policies
UNION ALL SELECT 'audit_logs', COUNT(*) FROM public.audit_logs WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'api_keys', COUNT(*) FROM public.api_keys WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
UNION ALL SELECT 'webhooks', COUNT(*) FROM public.webhooks WHERE organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
ORDER BY count DESC;