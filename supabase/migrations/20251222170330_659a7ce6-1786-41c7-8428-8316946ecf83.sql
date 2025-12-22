-- =====================================================
-- Fix all 4 remaining functions with mutable search_path
-- =====================================================

-- Drop and recreate handle_updated_at with proper search_path
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop and recreate increment_like_count with proper search_path
DROP FUNCTION IF EXISTS public.increment_like_count(uuid);
CREATE FUNCTION public.increment_like_count(post_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.social_posts SET like_count = like_count + 1 WHERE id = post_id_param;
END;
$$;

-- Drop and recreate decrement_like_count with proper search_path
DROP FUNCTION IF EXISTS public.decrement_like_count(uuid);
CREATE FUNCTION public.decrement_like_count(post_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.social_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = post_id_param;
END;
$$;

-- Drop and recreate increment_comment_count with proper search_path
DROP FUNCTION IF EXISTS public.increment_comment_count(uuid);
CREATE FUNCTION public.increment_comment_count(post_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.social_posts SET comment_count = comment_count + 1 WHERE id = post_id_param;
END;
$$;