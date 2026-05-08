SELECT dsh.id, dsh.deal_id, dsh.to_stage, d.organization_id 
FROM public.deal_stage_history dsh
LEFT JOIN public.deals d ON d.id = dsh.deal_id;