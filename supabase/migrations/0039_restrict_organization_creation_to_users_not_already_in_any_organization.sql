DROP POLICY IF EXISTS org_insert ON organizations;

CREATE POLICY "org_insert" ON organizations
FOR INSERT TO authenticated 
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM organization_members WHERE user_id = auth.uid()
  )
);