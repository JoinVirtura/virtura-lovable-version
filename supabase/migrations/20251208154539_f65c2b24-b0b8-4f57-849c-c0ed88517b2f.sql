-- Update video posts with real working video URLs (using jsonb format)
UPDATE social_posts 
SET media_urls = '["https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4"]'::jsonb
WHERE content_type = 'video' AND id = (SELECT id FROM social_posts WHERE content_type = 'video' LIMIT 1);

UPDATE social_posts 
SET media_urls = '["https://videos.pexels.com/video-files/4434242/4434242-uhd_2560_1440_24fps.mp4"]'::jsonb
WHERE content_type = 'video' AND id = (SELECT id FROM social_posts WHERE content_type = 'video' OFFSET 1 LIMIT 1);

-- Sample video post skipped - original user does not exist in new project