-- Verify the trigger is running for new users
SELECT pg_get_functiondef('public.handle_new_user'::regproc);