-- Drop overly permissive policies on organizations
DROP POLICY IF EXISTS org_public_read ON organizations;
DROP POLICY IF EXISTS org_insert ON organizations;
DROP POLICY IF EXISTS org_update ON organizations;

-- Drop overly permissive policies on organization_members
DROP POLICY IF EXISTS org_members_select ON organization_members;
DROP POLICY IF EXISTS org_members_insert ON organization_members;
DROP POLICY IF EXISTS org_members_update ON organization_members;
DROP POLICY IF EXISTS org_members_delete ON organization_members;

-- Drop overly permissive policies on departments
DROP POLICY IF EXISTS departments_select ON departments;
DROP POLICY IF EXISTS departments_insert ON departments;
DROP POLICY IF EXISTS departments_update ON departments;
DROP POLICY IF EXISTS departments_delete ON departments;

-- Drop overly permissive policies on teams
DROP POLICY IF EXISTS teams_select ON teams;
DROP POLICY IF EXISTS teams_insert ON teams;
DROP POLICY IF EXISTS teams_update ON teams;
DROP POLICY IF EXISTS teams_delete ON teams;

-- Drop overly permissive policies on sla_policies
DROP POLICY IF EXISTS sla_select ON sla_policies;
DROP POLICY IF EXISTS sla_insert ON sla_policies;
DROP POLICY IF EXISTS sla_update ON sla_policies;
DROP POLICY IF EXISTS sla_delete ON sla_policies;

-- Drop overly permissive policies on goals
DROP POLICY IF EXISTS goals_select ON goals;
DROP POLICY IF EXISTS goals_insert ON goals;
DROP POLICY IF EXISTS goals_update ON goals;
DROP POLICY IF EXISTS goals_delete ON goals;

-- Drop overly permissive policies on key_results
DROP POLICY IF EXISTS key_results_select ON key_results;
DROP POLICY IF EXISTS key_results_insert ON key_results;
DROP POLICY IF EXISTS key_results_update ON key_results;
DROP POLICY IF EXISTS key_results_delete ON key_results;

-- Drop overly permissive policies on comments
DROP POLICY IF EXISTS comments_select ON comments;
DROP POLICY IF EXISTS comments_insert ON comments;
DROP POLICY IF EXISTS comments_update ON comments;
DROP POLICY IF EXISTS comments_delete ON comments;

-- Drop overly permissive policies on audit_logs
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;