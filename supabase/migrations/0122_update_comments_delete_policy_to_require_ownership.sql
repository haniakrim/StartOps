DROP POLICY IF EXISTS comments_delete ON comments;
CREATE POLICY "comments_delete" ON comments
FOR DELETE TO authenticated USING (is_org_member(organization_id) AND auth.uid() = user_id);