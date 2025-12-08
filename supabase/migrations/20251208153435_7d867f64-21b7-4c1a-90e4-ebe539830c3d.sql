-- Create increment_comment_count RPC function
CREATE OR REPLACE FUNCTION public.increment_comment_count(post_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE social_posts SET comment_count = comment_count + 1 WHERE id = post_id_param;
END;
$function$;