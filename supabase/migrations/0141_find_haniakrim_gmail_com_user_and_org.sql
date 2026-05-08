SELECT 
  u.id as user_id,
  u.email,
  p.first_name,
  p.last_name,
  p.role as profile_role,
  o.id as org_id,
  o.name as org_name,
  om.role as org_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.organization_members om ON om.user_id = u.id
LEFT JOIN public.organizations o ON o.id = om.organization_id
WHERE u.email = 'haniakrim@gmail.com';