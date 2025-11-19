-- Add missing columns to scheduled_posts table for post creation data
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN scheduled_posts.content_type IS 'Type of post content: text, image, video, carousel';
COMMENT ON COLUMN scheduled_posts.is_paid IS 'Whether the post requires payment to unlock';
COMMENT ON COLUMN scheduled_posts.price_cents IS 'Price in cents if paid post';