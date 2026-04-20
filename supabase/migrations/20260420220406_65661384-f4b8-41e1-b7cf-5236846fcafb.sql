-- Function to ensure a specific email is admin
CREATE OR REPLACE FUNCTION public.ensure_admin_by_email(target_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Try to find user ID by email in auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Check if role already exists
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (target_user_id, 'admin');
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run it for the requested email
SELECT public.ensure_admin_by_email('4kconsultoriadigital@gmail.com');

-- Update the signup handler to auto-assign admin for this email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );

  -- Auto-assign admin role for specific emails
  IF NEW.email = '4kconsultoriadigital@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;
