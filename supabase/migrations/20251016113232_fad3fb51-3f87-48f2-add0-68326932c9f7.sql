-- Priority 4: Add avatar caching column to talking_avatars table
ALTER TABLE talking_avatars 
ADD COLUMN IF NOT EXISTS heygen_avatar_id text;