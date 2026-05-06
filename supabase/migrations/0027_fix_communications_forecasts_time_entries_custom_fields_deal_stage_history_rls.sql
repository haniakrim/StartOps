
-- COMMUNICATIONS
DROP POLICY IF EXISTS communications_select ON communications;
DROP POLICY IF EXISTS communications_insert ON communications;
DROP POLICY IF EXISTS communications_update ON communications;
DROP POLICY IF EXISTS communications_delete ON communications;

CREATE POLICY "communications_select" ON communications FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "communications_insert" ON communications FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "communications_update" ON communications FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "communications_delete" ON communications FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- FORECASTS
DROP POLICY IF EXISTS forecasts_select ON forecasts;
DROP POLICY IF EXISTS forecasts_insert ON forecasts;
DROP POLICY IF EXISTS forecasts_update ON forecasts;
DROP POLICY IF EXISTS forecasts_delete ON forecasts;

CREATE POLICY "forecasts_select" ON forecasts FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "forecasts_insert" ON forecasts FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "forecasts_update" ON forecasts FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "forecasts_delete" ON forecasts FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- TIME_ENTRIES
DROP POLICY IF EXISTS time_entries_select ON time_entries;
DROP POLICY IF EXISTS time_entries_insert ON time_entries;
DROP POLICY IF EXISTS time_entries_update ON time_entries;
DROP POLICY IF EXISTS time_entries_delete ON time_entries;

CREATE POLICY "time_entries_select" ON time_entries FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "time_entries_insert" ON time_entries FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "time_entries_update" ON time_entries FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "time_entries_delete" ON time_entries FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- CUSTOM_FIELDS
DROP POLICY IF EXISTS custom_fields_select ON custom_fields;
DROP POLICY IF EXISTS custom_fields_insert ON custom_fields;
DROP POLICY IF EXISTS custom_fields_update ON custom_fields;
DROP POLICY IF EXISTS custom_fields_delete ON custom_fields;

CREATE POLICY "custom_fields_select" ON custom_fields FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "custom_fields_insert" ON custom_fields FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "custom_fields_update" ON custom_fields FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "custom_fields_delete" ON custom_fields FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- DEAL_STAGE_HISTORY (via deal_id)
DROP POLICY IF EXISTS deal_stage_history_select ON deal_stage_history;
DROP POLICY IF EXISTS deal_stage_history_insert ON deal_stage_history;
DROP POLICY IF EXISTS deal_stage_history_update ON deal_stage_history;

CREATE POLICY "deal_stage_history_select" ON deal_stage_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_stage_history.deal_id AND is_org_member(deals.organization_id)));
CREATE POLICY "deal_stage_history_insert" ON deal_stage_history FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_stage_history.deal_id AND is_org_member(deals.organization_id)));
CREATE POLICY "deal_stage_history_update" ON deal_stage_history FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_stage_history.deal_id AND is_org_member(deals.organization_id)));
