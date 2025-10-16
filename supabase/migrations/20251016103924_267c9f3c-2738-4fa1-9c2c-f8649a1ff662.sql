-- Security Enhancement: Update database functions with proper security settings

-- Update update_gpu_worker_heartbeat function
CREATE OR REPLACE FUNCTION public.update_gpu_worker_heartbeat(worker_id_param text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  UPDATE gpu_workers 
  SET last_heartbeat = now(), updated_at = now()
  WHERE worker_id = worker_id_param;
$function$;

-- Update assign_job_to_gpu function
CREATE OR REPLACE FUNCTION public.assign_job_to_gpu(job_id_param uuid, required_vram integer DEFAULT 8192)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  WITH available_worker AS (
    SELECT worker_id 
    FROM gpu_workers 
    WHERE status = 'idle' 
      AND vram_available >= required_vram
      AND last_heartbeat > now() - INTERVAL '5 minutes'
    ORDER BY vram_available DESC
    LIMIT 1
  )
  UPDATE jobs 
  SET worker_id = (SELECT worker_id FROM available_worker),
      status = CASE 
        WHEN (SELECT worker_id FROM available_worker) IS NOT NULL 
        THEN 'processing' 
        ELSE 'queued' 
      END,
      updated_at = now()
  WHERE id = job_id_param
  RETURNING worker_id;
$function$;

-- Update update_updated_at_column function (already has proper settings)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update get_user_role function (already has proper settings)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1),
    'owner'::public.user_role
  );
$function$;

-- Update check_usage_limit function (already has proper settings)
CREATE OR REPLACE FUNCTION public.check_usage_limit(user_uuid uuid, resource_type_param text, daily_limit integer)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT SUM(amount) FROM public.usage_tracking 
     WHERE user_id = user_uuid 
       AND resource_type = resource_type_param 
       AND created_at >= CURRENT_DATE),
    0
  ) < daily_limit;
$function$;

-- Update validate_password_strength function (already has proper settings)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Update get_user_subscription_status function (already has proper settings)
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(has_active_subscription boolean, plan_name text, status text, current_period_end timestamp with time zone)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
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