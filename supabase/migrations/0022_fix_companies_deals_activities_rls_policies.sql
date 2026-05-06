
-- COMPANIES
DROP POLICY IF EXISTS companies_select ON companies;
DROP POLICY IF EXISTS companies_insert ON companies;
DROP POLICY IF EXISTS companies_update ON companies;
DROP POLICY IF EXISTS companies_delete ON companies;

CREATE POLICY "companies_select" ON companies FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "companies_insert" ON companies FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "companies_update" ON companies FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "companies_delete" ON companies FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- DEALS
DROP POLICY IF EXISTS deals_select ON deals;
DROP POLICY IF EXISTS deals_insert ON deals;
DROP POLICY IF EXISTS deals_update ON deals;
DROP POLICY IF EXISTS deals_delete ON deals;

CREATE POLICY "deals_select" ON deals FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "deals_insert" ON deals FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "deals_update" ON deals FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "deals_delete" ON deals FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- ACTIVITIES
DROP POLICY IF EXISTS activities_select ON activities;
DROP POLICY IF EXISTS activities_insert ON activities;
DROP POLICY IF EXISTS activities_update ON activities;
DROP POLICY IF EXISTS activities_delete ON activities;

CREATE POLICY "activities_select" ON activities FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "activities_insert" ON activities FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "activities_update" ON activities FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "activities_delete" ON activities FOR DELETE TO authenticated USING (is_org_member(organization_id));
