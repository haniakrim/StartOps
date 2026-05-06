-- Organizations: members can see/update their own orgs; anyone can create (signup flow)
CREATE POLICY "org_select" ON organizations FOR SELECT TO authenticated USING (is_org_member(id));
CREATE POLICY "org_insert" ON organizations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "org_update" ON organizations FOR UPDATE TO authenticated USING (is_org_member(id));

-- Organization members: scope to org membership
CREATE POLICY "org_members_select" ON organization_members FOR SELECT TO authenticated USING (is_org_member(organization_id) OR auth.uid() = user_id);
CREATE POLICY "org_members_insert" ON organization_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "org_members_update" ON organization_members FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "org_members_delete" ON organization_members FOR DELETE TO authenticated USING (is_org_member(organization_id) OR auth.uid() = user_id);

-- Departments: scope to org membership
CREATE POLICY "departments_select" ON departments FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "departments_insert" ON departments FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "departments_update" ON departments FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "departments_delete" ON departments FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- Teams: scope to org membership
CREATE POLICY "teams_select" ON teams FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "teams_insert" ON teams FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "teams_update" ON teams FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "teams_delete" ON teams FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- SLA policies: scope to org membership
CREATE POLICY "sla_select" ON sla_policies FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "sla_insert" ON sla_policies FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "sla_update" ON sla_policies FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "sla_delete" ON sla_policies FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- Goals: scope to org membership
CREATE POLICY "goals_select" ON goals FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "goals_insert" ON goals FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "goals_update" ON goals FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "goals_delete" ON goals FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- Key results: scope via goals table
CREATE POLICY "key_results_select" ON key_results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = key_results.goal_id AND is_org_member(goals.organization_id)));
CREATE POLICY "key_results_insert" ON key_results FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM goals WHERE goals.id = key_results.goal_id AND is_org_member(goals.organization_id)));
CREATE POLICY "key_results_update" ON key_results FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = key_results.goal_id AND is_org_member(goals.organization_id)));
CREATE POLICY "key_results_delete" ON key_results FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = key_results.goal_id AND is_org_member(goals.organization_id)));

-- Comments: users can only access their own comments (no organization_id column)
CREATE POLICY "comments_select" ON comments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "comments_insert" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Audit logs: scope to org membership
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));