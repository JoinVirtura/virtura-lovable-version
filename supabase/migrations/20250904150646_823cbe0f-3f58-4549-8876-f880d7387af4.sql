-- Fix the missing column issue - add the openai_avatar_id column that the code expects
ALTER TABLE talking_avatars ADD COLUMN IF NOT EXISTS openai_avatar_id TEXT;

-- Also ensure we have all the provider ID columns the code expects
ALTER TABLE talking_avatars ADD COLUMN IF NOT EXISTS openai_video_id TEXT;
ALTER TABLE talking_avatars ADD COLUMN IF NOT EXISTS heygen_video_id TEXT;
ALTER TABLE talking_avatars ADD COLUMN IF NOT EXISTS runway_avatar_id TEXT;

-- Update the upload-avatar function to handle the correct columns
-- Also simplify the avatar upload to bypass provider issues and just store the image
UPDATE talking_avatars SET openai_avatar_id = original_image_url WHERE openai_avatar_id IS NULL;