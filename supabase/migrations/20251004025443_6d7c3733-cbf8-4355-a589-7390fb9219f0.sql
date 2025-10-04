-- Create function to add admin by email
CREATE OR REPLACE FUNCTION public.add_admin_by_email(admin_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  result json;
BEGIN
  -- Find user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  -- If user not found
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No user found with this email. User must sign up first.'
    );
  END IF;
  
  -- Try to insert into admin_users
  BEGIN
    INSERT INTO public.admin_users (user_id, email)
    VALUES (target_user_id, admin_email);
    
    RETURN json_build_object(
      'success', true,
      'user_id', target_user_id
    );
  EXCEPTION
    WHEN unique_violation THEN
      RETURN json_build_object(
        'success', false,
        'error', 'This user is already an admin.'
      );
    WHEN OTHERS THEN
      RETURN json_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
END;
$$;