-- Fix search_path for increment_post_view_count function
CREATE OR REPLACE FUNCTION public.increment_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.social_posts
  SET view_count = view_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';