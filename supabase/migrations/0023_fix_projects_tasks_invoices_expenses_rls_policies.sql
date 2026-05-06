
-- PROJECTS
DROP POLICY IF EXISTS projects_select ON projects;
DROP POLICY IF EXISTS projects_insert ON projects;
DROP POLICY IF EXISTS projects_update ON projects;
DROP POLICY IF EXISTS projects_delete ON projects;

CREATE POLICY "projects_select" ON projects FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "projects_insert" ON projects FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "projects_update" ON projects FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "projects_delete" ON projects FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- PROJECT_TASKS (need to check via project_id -> projects)
DROP POLICY IF EXISTS project_tasks_select ON project_tasks;
DROP POLICY IF EXISTS project_tasks_insert ON project_tasks;
DROP POLICY IF EXISTS project_tasks_update ON project_tasks;
DROP POLICY IF EXISTS project_tasks_delete ON project_tasks;

CREATE POLICY "project_tasks_select" ON project_tasks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_tasks.project_id AND is_org_member(projects.organization_id)));
CREATE POLICY "project_tasks_insert" ON project_tasks FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_tasks.project_id AND is_org_member(projects.organization_id)));
CREATE POLICY "project_tasks_update" ON project_tasks FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_tasks.project_id AND is_org_member(projects.organization_id)));
CREATE POLICY "project_tasks_delete" ON project_tasks FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_tasks.project_id AND is_org_member(projects.organization_id)));

-- INVOICES
DROP POLICY IF EXISTS invoices_select ON invoices;
DROP POLICY IF EXISTS invoices_insert ON invoices;
DROP POLICY IF EXISTS invoices_update ON invoices;
DROP POLICY IF EXISTS invoices_delete ON invoices;

CREATE POLICY "invoices_select" ON invoices FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "invoices_insert" ON invoices FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "invoices_update" ON invoices FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "invoices_delete" ON invoices FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- EXPENSES
DROP POLICY IF EXISTS expenses_select ON expenses;
DROP POLICY IF EXISTS expenses_insert ON expenses;
DROP POLICY IF EXISTS expenses_update ON expenses;
DROP POLICY IF EXISTS expenses_delete ON expenses;

CREATE POLICY "expenses_select" ON expenses FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "expenses_insert" ON expenses FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "expenses_update" ON expenses FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "expenses_delete" ON expenses FOR DELETE TO authenticated USING (is_org_member(organization_id));
