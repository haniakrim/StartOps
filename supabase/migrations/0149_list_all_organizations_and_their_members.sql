SELECT 
  o.id as org_id,
  o.name as org_name,
  COUNT(DISTINCT om.user_id) as member_count,
  ARRAY_AGG(DISTINCT u.email) as member_emails
FROM public.organizations o
LEFT JOIN public.organization_members om ON om.organization_id = o.id
LEFT JOIN auth.users u ON u.id = om.user_id
GROUP BY o.id, o.name;