CREATE POLICY "comments_select" ON comments
FOR SELECT TO authenticated USING (is_org_member(organization_id));

CREATE POLICY "comments_insert" ON comments
FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));

CREATE POLICY "comments_update" ON comments
FOR UPDATE TO authenticated USING (is_org_member(organization_id));

CREATE POLICY "comments_delete" ON comments
FOR DELETE TO authenticated USING (is_org_member(organization_id));