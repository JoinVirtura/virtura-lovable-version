-- Fix existing avatar_library records with video URLs
-- Replace video URLs with original_image_url from talking_avatars
UPDATE avatar_library
SET image_url = (
  SELECT ta.original_image_url
  FROM talking_avatars ta
  WHERE ta.user_id = avatar_library.user_id
  ORDER BY ta.created_at DESC
  LIMIT 1
)
WHERE 
  (image_url ~* '\.(mp4|webm|avi|mov)$' OR image_url LIKE 'blob:%')
  AND EXISTS (
    SELECT 1 FROM talking_avatars ta 
    WHERE ta.user_id = avatar_library.user_id
  );

-- Delete records that couldn't be fixed (no matching talking_avatar with original image)
DELETE FROM avatar_library
WHERE 
  (image_url ~* '\.(mp4|webm|avi|mov)$' OR image_url LIKE 'blob:%')
  AND NOT EXISTS (
    SELECT 1 FROM talking_avatars ta 
    WHERE ta.user_id = avatar_library.user_id
      AND ta.original_image_url IS NOT NULL
  );

-- Create validation function to prevent video URLs in image_url field
CREATE OR REPLACE FUNCTION validate_avatar_image_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if image_url is a video file or blob URL
  IF NEW.image_url ~* '\.(mp4|webm|avi|mov)$' OR NEW.image_url LIKE 'blob:%' THEN
    RAISE EXCEPTION 'image_url cannot be a video file or blob URL. Use a static image instead.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate image_url on insert and update
DROP TRIGGER IF EXISTS check_avatar_image_url ON avatar_library;
CREATE TRIGGER check_avatar_image_url
  BEFORE INSERT OR UPDATE ON avatar_library
  FOR EACH ROW
  EXECUTE FUNCTION validate_avatar_image_url();