-- Update validation function with proper security settings
CREATE OR REPLACE FUNCTION public.validate_avatar_image_url()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if image_url is a video file or blob URL
  IF NEW.image_url ~* '\.(mp4|webm|avi|mov)$' OR NEW.image_url LIKE 'blob:%' THEN
    RAISE EXCEPTION 'image_url cannot be a video file or blob URL. Use a static image instead.';
  END IF;
  
  -- Check if image_url is a base64 data URL
  IF NEW.image_url LIKE 'data:%' THEN
    RAISE EXCEPTION 'image_url cannot be a base64 data URL. Upload to Supabase storage instead.';
  END IF;
  
  RETURN NEW;
END;
$$;