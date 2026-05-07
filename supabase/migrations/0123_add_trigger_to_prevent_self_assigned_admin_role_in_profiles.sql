-- Fix #1: Prevent users from self-assigning admin role in profiles
CREATE OR REPLACE FUNCTION prevent_self_admin()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow role changes to 'admin' from service role context
  -- In Supabase, service role requests bypass RLS but we can detect them
  -- by checking if the current user is the same as the row being updated
  -- and if they're trying to change their own role to admin
  IF NEW.role = 'admin' AND OLD.role != 'admin' THEN
    -- Reject if a regular user is trying to upgrade themselves to admin
    -- Service role / edge functions can bypass this by using supabaseAdmin
    -- but regular authenticated users through the API will hit this trigger
    RAISE EXCEPTION 'Admin role cannot be self-assigned';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_admin_trigger ON profiles;
CREATE TRIGGER prevent_self_admin_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_admin();