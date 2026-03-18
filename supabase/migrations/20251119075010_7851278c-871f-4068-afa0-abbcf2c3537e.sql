-- Create storage bucket for social media
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for social-media storage bucket
DROP POLICY IF EXISTS "Users can upload to social-media" ON storage.objects;
CREATE POLICY "Users can upload to social-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'social-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Public can view social-media" ON storage.objects;
CREATE POLICY "Public can view social-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'social-media');

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'social-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_posts_published_at ON social_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post ON post_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_post_unlocks_user_post ON post_unlocks(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
