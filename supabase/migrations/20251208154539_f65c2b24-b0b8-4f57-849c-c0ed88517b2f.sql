-- Update video posts with real working video URLs (using jsonb format)
UPDATE social_posts 
SET media_urls = '["https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"]'::jsonb
WHERE content_type = 'video' AND id = (SELECT id FROM social_posts WHERE content_type = 'video' LIMIT 1);

UPDATE social_posts 
SET media_urls = '["https://videos.pexels.com/video-files/4434242/4434242-uhd_2560_1440_24fps.mp4"]'::jsonb
WHERE content_type = 'video' AND id = (SELECT id FROM social_posts WHERE content_type = 'video' OFFSET 1 LIMIT 1);

-- Also add a sample video post if none exist
INSERT INTO social_posts (user_id, caption, content_type, media_urls, is_paid, price_cents, view_count, like_count, comment_count, status, published_at)
SELECT 
  '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
  '✨ Check out this amazing AI-generated content! The future of digital creation is here. #AI #Digital #CreativeContent',
  'video',
  '["https://videos.pexels.com/video-files/5532773/5532773-uhd_2560_1440_25fps.mp4"]'::jsonb,
  false,
  0,
  8500,
  320,
  45,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM social_posts WHERE content_type = 'video' LIMIT 1);