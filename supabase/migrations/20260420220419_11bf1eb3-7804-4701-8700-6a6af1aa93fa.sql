-- Fix search path for security
ALTER FUNCTION public.ensure_admin_by_email(TEXT) SET search_path = public;
