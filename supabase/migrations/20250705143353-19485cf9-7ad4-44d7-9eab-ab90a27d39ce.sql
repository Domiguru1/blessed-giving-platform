-- Create admin user and assign admin role
-- Note: In production, users should sign up through the auth flow
-- This is for development/testing purposes

-- Insert admin user into auth.users (this is a special case for setup)
-- The user will need to sign up normally through the app first, then we'll assign the role

-- For now, let's create a function to assign admin role to a user by email
CREATE OR REPLACE FUNCTION public.assign_admin_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email;
  
  IF _user_id IS NOT NULL THEN
    -- Insert admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Assign admin role to the specified email
-- This will work once the user signs up through the normal flow
DO $$
BEGIN
  -- Try to assign admin role to the email (will only work if user exists)
  PERFORM public.assign_admin_role('mdnmbugua@gmail.com');
END;
$$;