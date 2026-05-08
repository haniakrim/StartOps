SELECT om.*, o.name as org_name
FROM public.organization_members om
JOIN public.organizations o ON o.id = om.organization_id
WHERE om.user_id = (SELECT id FROM auth.users WHERE email = 'demo@example.com');