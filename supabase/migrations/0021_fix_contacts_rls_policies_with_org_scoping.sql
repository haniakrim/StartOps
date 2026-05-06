
-- Drop overly permissive policies on core tables and create proper org-scoped ones

-- CONTACTS
DROP POLICY IF EXISTS contacts_select ON contacts;
DROP POLICY IF EXISTS contacts_insert ON contacts;
DROP POLICY IF EXISTS contacts_update ON contacts;
DROP POLICY IF EXISTS contacts_delete ON contacts;

CREATE POLICY "contacts_select" ON contacts FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "contacts_insert" ON contacts FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "contacts_update" ON contacts FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "contacts_delete" ON contacts FOR DELETE TO authenticated USING (is_org_member(organization_id));
