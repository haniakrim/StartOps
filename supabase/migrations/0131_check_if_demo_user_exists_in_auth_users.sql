SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'demo@example.com';