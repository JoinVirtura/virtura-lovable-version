-- SECURITY HARDENING: Fix Critical RLS Policy Vulnerabilities

-- 1. Fix social_posts policy bug (incorrect JOIN was: post_unlocks.post_id = post_unlocks.id)
DROP POLICY IF EXISTS "Users can view published posts" ON social_posts;
CREATE POLICY "Users can view published posts" ON social_posts
FOR SELECT USING (
  status = 'published' AND (
    NOT is_paid OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM post_unlocks 
      WHERE post_unlocks.post_id = social_posts.id 
      AND post_unlocks.user_id = auth.uid()
    )
  )
);

-- 2. Secure profiles table - require authentication
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Authenticated users can view profiles" ON profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. Secure follows table - require authentication
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
CREATE POLICY "Authenticated users can view follows" ON follows
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Secure post_likes table - require authentication
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
CREATE POLICY "Authenticated users can view likes" ON post_likes
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 5. Secure post_comments table - require authentication
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
CREATE POLICY "Authenticated users can view comments" ON post_comments
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 6. Create safe view for marketplace campaigns (hides financial data)
CREATE OR REPLACE VIEW public.marketplace_campaigns_public AS
SELECT 
  id, brand_id, title, description, requirements, 
  deliverables, deadline, status, visibility,
  created_at, updated_at
FROM marketplace_campaigns
WHERE visibility = 'public';

-- 7. Secure marketplace_campaigns - require authentication for full data
DROP POLICY IF EXISTS "Anyone can view public campaigns" ON marketplace_campaigns;
DROP POLICY IF EXISTS "Users can view public campaigns" ON marketplace_campaigns;
CREATE POLICY "Authenticated users can view campaigns" ON marketplace_campaigns
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    visibility = 'public' OR 
    brand_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
);