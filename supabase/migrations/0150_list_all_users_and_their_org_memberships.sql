SELECT 
  u.id, u.email, u.created_at,
  p.first_name, p.last_name, p.role,
  om.organization_id, om.role as org_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.organization_members om ON om.user_id = u.id
ORDER BY u.created_at DESC;