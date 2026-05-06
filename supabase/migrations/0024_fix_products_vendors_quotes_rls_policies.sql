
-- PRODUCTS
DROP POLICY IF EXISTS products_select ON products;
DROP POLICY IF EXISTS products_insert ON products;
DROP POLICY IF EXISTS products_update ON products;
DROP POLICY IF EXISTS products_delete ON products;

CREATE POLICY "products_select" ON products FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "products_insert" ON products FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "products_update" ON products FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "products_delete" ON products FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- VENDORS
DROP POLICY IF EXISTS vendors_select ON vendors;
DROP POLICY IF EXISTS vendors_insert ON vendors;
DROP POLICY IF EXISTS vendors_update ON vendors;
DROP POLICY IF EXISTS vendors_delete ON vendors;

CREATE POLICY "vendors_select" ON vendors FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "vendors_insert" ON vendors FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "vendors_update" ON vendors FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "vendors_delete" ON vendors FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- QUOTES
DROP POLICY IF EXISTS quotes_select ON quotes;
DROP POLICY IF EXISTS quotes_insert ON quotes;
DROP POLICY IF EXISTS quotes_update ON quotes;
DROP POLICY IF EXISTS quotes_delete ON quotes;

CREATE POLICY "quotes_select" ON quotes FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "quotes_insert" ON quotes FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "quotes_update" ON quotes FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "quotes_delete" ON quotes FOR DELETE TO authenticated USING (is_org_member(organization_id));

-- QUOTE_ITEMS
DROP POLICY IF EXISTS quote_items_select ON quote_items;
DROP POLICY IF EXISTS quote_items_insert ON quote_items;
DROP POLICY IF EXISTS quote_items_update ON quote_items;
DROP POLICY IF EXISTS quote_items_delete ON quote_items;

CREATE POLICY "quote_items_select" ON quote_items FOR SELECT TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "quote_items_insert" ON quote_items FOR INSERT TO authenticated WITH CHECK (is_org_member(organization_id));
CREATE POLICY "quote_items_update" ON quote_items FOR UPDATE TO authenticated USING (is_org_member(organization_id));
CREATE POLICY "quote_items_delete" ON quote_items FOR DELETE TO authenticated USING (is_org_member(organization_id));
