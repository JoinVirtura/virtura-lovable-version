-- Fix function search path security issue for existing function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add password validation function with secure search path
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF LENGTH(password_text) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one number
  IF password_text !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one letter
  IF password_text !~ '[a-zA-Z]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;