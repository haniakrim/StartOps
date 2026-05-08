-- Add more project tasks for existing projects
INSERT INTO public.project_tasks (project_id, name, description, status, priority, due_date)
SELECT 
  p.id,
  CASE (ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) % 5)
    WHEN 0 THEN 'Requirements gathering'
    WHEN 1 THEN 'Architecture design'
    WHEN 2 THEN 'Frontend implementation'
    WHEN 3 THEN 'Backend API development'
    WHEN 4 THEN 'QA testing & deployment'
  END,
  'Task created for ' || p.name,
  CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 4)
    WHEN 0 THEN 'todo'
    WHEN 1 THEN 'in_progress'
    WHEN 2 THEN 'completed'
    ELSE 'review'
  END,
  CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 4)
    WHEN 0 THEN 'high'
    WHEN 1 THEN 'medium'
    WHEN 2 THEN 'low'
    ELSE 'medium'
  END,
  (NOW() + (random() * interval '30 days'))::date
FROM public.projects p
WHERE p.organization_id = '9321e605-1b36-4b31-a8ef-4bf5c58b5542'
ORDER BY random()
LIMIT 15;