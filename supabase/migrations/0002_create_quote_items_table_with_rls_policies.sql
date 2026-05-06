CREATE TABLE public.quote_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quote_items_select" ON public.quote_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_items_insert" ON public.quote_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_items_update" ON public.quote_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_items_delete" ON public.quote_items FOR DELETE TO authenticated USING (true);