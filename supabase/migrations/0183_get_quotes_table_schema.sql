SELECT table_name, column_name, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'quotes'
ORDER BY ordinal_position;