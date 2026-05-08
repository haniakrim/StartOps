CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    'user'
  );

  -- Create a default organization for the user
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'My') || ' Organization',
    gen_random_uuid()::text
  )
  RETURNING id INTO new_org_id;

  -- Add user as admin of their organization
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, new.id, 'admin');

  RETURN new;
END;
$$;