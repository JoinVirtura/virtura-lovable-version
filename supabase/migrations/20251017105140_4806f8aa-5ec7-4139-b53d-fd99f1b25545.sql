-- Add video support fields to avatar_library table
ALTER TABLE avatar_library
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Update existing records to mark as non-videos
UPDATE avatar_library SET is_video = FALSE WHERE is_video IS NULL;

-- Create index for better performance when filtering by video type
CREATE INDEX IF NOT EXISTS idx_avatar_library_is_video ON avatar_library(user_id, is_video, created_at DESC);