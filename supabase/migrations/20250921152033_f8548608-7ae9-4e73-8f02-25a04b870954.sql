-- Fix the remaining functions
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid uuid DEFAULT auth.uid())
 RETURNS TABLE(has_active_subscription boolean, plan_name text, status text, current_period_end timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    CASE WHEN s.status = 'active' AND s.plan_name IS NOT NULL THEN true ELSE false END as has_active_subscription,
    COALESCE(s.plan_name, 'free') as plan_name,
    COALESCE(s.status, 'inactive') as status,
    s.current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
  LIMIT 1;
$function$;