-- Delete corrupted avatar records with base64 data
DELETE FROM avatar_library
WHERE id IN (
  '128a4bd1-0230-474f-81ee-bf656291335b',
  '6f16ef6b-800a-4f86-af09-2f3e58fb26ec'
);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS check_avatar_image_url ON public.avatar_library;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.validate_avatar_image_url();

-- Create validation function to prevent base64/blob URLs
CREATE OR REPLACE FUNCTION public.validate_avatar_image_url()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to validate image_url before insert/update
DROP TRIGGER IF EXISTS check_avatar_image_url ON public.avatar_library;
CREATE TRIGGER check_avatar_image_url
  BEFORE INSERT OR UPDATE ON public.avatar_library
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_avatar_image_url();
