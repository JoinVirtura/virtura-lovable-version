-- Part 2: Create RPC functions for like count management
CREATE OR REPLACE FUNCTION increment_like_count(post_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE social_posts SET like_count = like_count + 1 WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_like_count(post_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE social_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Part 3: Fix Comments Visibility - allow anyone to read comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post_comments' 
    AND policyname = 'Anyone can read comments'
  ) THEN
    CREATE POLICY "Anyone can read comments" ON post_comments
    FOR SELECT USING (true);
  END IF;
END $$;