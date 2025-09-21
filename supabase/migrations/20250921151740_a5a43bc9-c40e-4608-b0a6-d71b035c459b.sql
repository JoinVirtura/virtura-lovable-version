-- Fix remaining functions with missing search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1),
    'owner'::public.user_role
  );
$function$;

CREATE OR REPLACE FUNCTION public.check_usage_limit(user_uuid uuid, resource_type_param text, daily_limit integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(
    (SELECT SUM(amount) FROM public.usage_tracking 
     WHERE user_id = user_uuid 
       AND resource_type = resource_type_param 
       AND created_at >= CURRENT_DATE),
    0
  ) < daily_limit;
$function$;