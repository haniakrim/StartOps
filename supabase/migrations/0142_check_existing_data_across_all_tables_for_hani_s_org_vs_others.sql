SELECT 
  'contacts' as table_name, organization_id, COUNT(*) as count FROM public.contacts GROUP BY organization_id
  UNION ALL
  SELECT 'companies', organization_id, COUNT(*) FROM public.companies GROUP BY organization_id
  UNION ALL
  SELECT 'deals', organization_id, COUNT(*) FROM public.deals GROUP BY organization_id
  UNION ALL
  SELECT 'activities', organization_id, COUNT(*) FROM public.activities GROUP BY organization_id
  UNION ALL
  SELECT 'projects', organization_id, COUNT(*) FROM public.projects GROUP BY organization_id
  UNION ALL
  SELECT 'products', organization_id, COUNT(*) FROM public.products GROUP BY organization_id
  UNION ALL
  SELECT 'employees', organization_id, COUNT(*) FROM public.employees GROUP BY organization_id
  UNION ALL
  SELECT 'departments', organization_id, COUNT(*) FROM public.departments GROUP BY organization_id
  UNION ALL
  SELECT 'quotes', organization_id, COUNT(*) FROM public.quotes GROUP BY organization_id
  UNION ALL
  SELECT 'invoices', organization_id, COUNT(*) FROM public.invoices GROUP BY organization_id
  UNION ALL
  SELECT 'expenses', organization_id, COUNT(*) FROM public.expenses GROUP BY organization_id
  UNION ALL
  SELECT 'vendors', organization_id, COUNT(*) FROM public.vendors GROUP BY organization_id
  UNION ALL
  SELECT 'subscriptions', organization_id, COUNT(*) FROM public.subscriptions GROUP BY organization_id
  UNION ALL
  SELECT 'campaigns', organization_id, COUNT(*) FROM public.campaigns GROUP BY organization_id
  UNION ALL
  SELECT 'documents', organization_id, COUNT(*) FROM public.documents GROUP BY organization_id
  UNION ALL
  SELECT 'forecasts', organization_id, COUNT(*) FROM public.forecasts GROUP BY organization_id
  UNION ALL
  SELECT 'workflows', organization_id, COUNT(*) FROM public.workflows GROUP BY organization_id
  UNION ALL
  SELECT 'custom_fields', organization_id, COUNT(*) FROM public.custom_fields GROUP BY organization_id
  UNION ALL
  SELECT 'pipelines', organization_id, COUNT(*) FROM public.pipelines GROUP BY organization_id
  UNION ALL
  SELECT 'communications', organization_id, COUNT(*) FROM public.communications GROUP BY organization_id
  UNION ALL
  SELECT 'email_templates', organization_id, COUNT(*) FROM public.email_templates GROUP BY organization_id
  UNION ALL
  SELECT 'support_tickets', organization_id, COUNT(*) FROM public.support_tickets GROUP BY organization_id
  UNION ALL
  SELECT 'time_entries', organization_id, COUNT(*) FROM public.time_entries GROUP BY organization_id
  UNION ALL
  SELECT 'goals', organization_id, COUNT(*) FROM public.goals GROUP BY organization_id
  UNION ALL
  SELECT 'skills', organization_id, COUNT(*) FROM public.skills GROUP BY organization_id
  UNION ALL
  SELECT 'teams', organization_id, COUNT(*) FROM public.teams GROUP BY organization_id
  UNION ALL
  SELECT 'audit_logs', organization_id, COUNT(*) FROM public.audit_logs GROUP BY organization_id
  UNION ALL
  SELECT 'api_keys', organization_id, COUNT(*) FROM public.api_keys GROUP BY organization_id
  UNION ALL
  SELECT 'webhooks', organization_id, COUNT(*) FROM public.webhooks GROUP BY organization_id
  UNION ALL
  SELECT 'comments', organization_id, COUNT(*) FROM public.comments GROUP BY organization_id
  ORDER BY table_name, organization_id;