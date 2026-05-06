
-- EMPLOYEES
DROP POLICY IF EXISTS employees_select ON employees;
DROP POLICY IF EXISTS employees_insert ON employees;
DROP POLICY IF EXISTS employees_update ON employees;
DROP POLICY IF EXISTS employees_delete ON employees;

CREATE POLICY "employees_select" ON employees FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "employees_insert" ON employees FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "employees_update" ON employees FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "employees_delete" ON employees FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- SKILLS
DROP POLICY IF EXISTS skills_select ON skills;
DROP POLICY IF EXISTS skills_insert ON skills;
DROP POLICY IF EXISTS skills_update ON skills;
DROP POLICY IF EXISTS skills_delete ON skills;

CREATE POLICY "skills_select" ON skills FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "skills_insert" ON skills FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "skills_update" ON skills FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "skills_delete" ON skills FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- EMPLOYEE_SKILLS (via employee_id)
DROP POLICY IF EXISTS employee_skills_select ON employee_skills;
DROP POLICY IF EXISTS employee_skills_insert ON employee_skills;
DROP POLICY IF EXISTS employee_skills_update ON employee_skills;
DROP POLICY IF EXISTS employee_skills_delete ON employee_skills;

CREATE POLICY "employee_skills_select" ON employee_skills FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_skills.employee_id AND is_org_member(employees.organization_id)));
CREATE POLICY "employee_skills_insert" ON employee_skills FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_skills.employee_id AND is_org_member(employees.organization_id)));
CREATE POLICY "employee_skills_update" ON employee_skills FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_skills.employee_id AND is_org_member(employees.organization_id)));
CREATE POLICY "employee_skills_delete" ON employee_skills FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM employees WHERE employees.id = employee_skills.employee_id AND is_org_member(employees.organization_id)));

-- PIPELINES
DROP POLICY IF EXISTS pipelines_select ON pipelines;
DROP POLICY IF EXISTS pipelines_insert ON pipelines;
DROP POLICY IF EXISTS pipelines_update ON pipelines;
DROP POLICY IF EXISTS pipelines_delete ON pipelines;

CREATE POLICY "pipelines_select" ON pipelines FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "pipelines_insert" ON pipelines FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "pipelines_update" ON pipelines FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "pipelines_delete" ON pipelines FOR DELETE TO authenticated USING (is_org_member(organization_id));
