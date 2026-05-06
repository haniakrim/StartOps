
-- CAMPAIGNS
DROP POLICY IF EXISTS campaigns_select ON campaigns;
DROP POLICY IF EXISTS campaigns_insert ON campaigns;
DROP POLICY IF EXISTS campaigns_update ON campaigns;
DROP POLICY IF EXISTS campaigns_delete ON campaigns;

CREATE POLICY "campaigns_select" ON campaigns FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "campaigns_insert" ON campaigns FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "campaigns_update" ON campaigns FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "campaigns_delete" ON campaigns FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS subscriptions_select ON subscriptions;
DROP POLICY IF EXISTS subscriptions_insert ON subscriptions;
DROP POLICY IF EXISTS subscriptions_update ON subscriptions;
DROP POLICY IF EXISTS subscriptions_delete ON subscriptions;

CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "subscriptions_insert" ON subscriptions FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "subscriptions_update" ON subscriptions FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "subscriptions_delete" ON subscriptions FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- DOCUMENTS
DROP POLICY IF EXISTS documents_select ON documents;
DROP POLICY IF EXISTS documents_insert ON documents;
DROP POLICY IF EXISTS documents_update ON documents;
DROP POLICY IF EXISTS documents_delete ON documents;

CREATE POLICY "documents_select" ON documents FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "documents_insert" ON documents FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "documents_update" ON documents FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "documents_delete" ON documents FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- EMAIL_TEMPLATES
DROP POLICY IF EXISTS email_templates_select ON email_templates;
DROP POLICY IF EXISTS email_templates_insert ON email_templates;
DROP POLICY IF EXISTS email_templates_update ON email_templates;
DROP POLICY IF EXISTS email_templates_delete ON email_templates;

CREATE POLICY "email_templates_select" ON email_templates FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "email_templates_insert" ON email_templates FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "email_templates_update" ON email_templates FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "email_templates_delete" ON email_templates FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- WORKFLOWS
DROP POLICY IF EXISTS workflows_select ON workflows;
DROP POLICY IF EXISTS workflows_insert ON workflows;
DROP POLICY IF EXISTS workflows_update ON workflows;
DROP POLICY IF EXISTS workflows_delete ON workflows;

CREATE POLICY "workflows_select" ON workflows FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "workflows_insert" ON workflows FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "workflows_update" ON workflows FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "workflows_delete" ON workflows FOR DELETE TO authenticated USING (is_org_member(organization_id));
