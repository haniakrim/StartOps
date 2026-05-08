SELECT kr.id, kr.name, kr.goal_id, g.organization_id 
FROM public.key_results kr
LEFT JOIN public.goals g ON g.id = kr.goal_id;