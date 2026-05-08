SELECT pt.id, pt.name, pt.project_id, p.organization_id 
FROM public.project_tasks pt
LEFT JOIN public.projects p ON p.id = pt.project_id;