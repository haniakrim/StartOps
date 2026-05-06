DROP POLICY IF EXISTS org_insert ON organizations;

CREATE POLICY "org_insert" ON organizations
FOR INSERT TO authenticated WITH CHECK (is_org_member(id));