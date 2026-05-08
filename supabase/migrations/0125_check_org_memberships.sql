SELECT om.id, om.user_id, om.organization_id, om.role, o.name as org_name 
FROM organization_members om 
JOIN organizations o ON om.organization_id = o.id 
ORDER BY om.joined_at DESC LIMIT 10;