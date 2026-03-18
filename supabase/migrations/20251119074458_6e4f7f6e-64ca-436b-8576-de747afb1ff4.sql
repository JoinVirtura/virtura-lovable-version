-- ============================================
-- VIRTURA PLATFORM REVISION - PHASE 1
-- Social Feed, Marketplace Access, Verification
-- ============================================

-- 1. SOCIAL POSTS TABLE
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'text', 'carousel')),
  caption TEXT,
  media_urls JSONB DEFAULT '[]',
  thumbnail_url TEXT,

  -- Monetization
  is_paid BOOLEAN DEFAULT false,
  price_cents INTEGER DEFAULT 0,

  -- AI generated or not
  is_ai_generated BOOLEAN DEFAULT false,
  ai_metadata JSONB DEFAULT '{}',

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Publishing
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ DEFAULT NOW(),

  -- Cross-platform
  cross_posted_to JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- 2. POST UNLOCKS TABLE
CREATE TABLE IF NOT EXISTS post_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_unlocks ENABLE ROW LEVEL SECURITY;

-- 3. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 4. POST LIKES TABLE
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- 5. POST COMMENTS TABLE
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- 6. MARKETPLACE ACCESS TABLE
CREATE TABLE IF NOT EXISTS marketplace_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_requested TEXT NOT NULL CHECK (role_requested IN ('creator', 'brand')),

  -- Application data
  portfolio_links TEXT[],
  pitch TEXT,
  experience TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  denial_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

ALTER TABLE marketplace_access ENABLE ROW LEVEL SECURITY;

-- 7. USER VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS user_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Verification status
  status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'pending', 'verified', 'denied')),

  -- ID verification
  id_document_url TEXT,
  id_document_type TEXT,

  -- Subscription
  verification_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_started_at TIMESTAMPTZ,

  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  denial_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_verification ENABLE ROW LEVEL SECURITY;

-- 8. SCHEDULED POSTS TABLE
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  platforms TEXT[] NOT NULL,

  -- Content
  caption TEXT,
  media_urls JSONB,
  hashtags TEXT[],

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed')),
  published_to JSONB DEFAULT '{}',
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- 9. UPDATE CREATOR ACCOUNTS TABLE
ALTER TABLE creator_accounts
  ADD COLUMN IF NOT EXISTS total_earnings_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_earnings_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_out_cents INTEGER DEFAULT 0;

-- Set platform fee to 10% for all
UPDATE creator_accounts SET platform_fee_percentage = 10.00;

-- 10. UPDATE CREATOR EARNINGS TABLE
ALTER TABLE creator_earnings
  ADD COLUMN IF NOT EXISTS revenue_type TEXT CHECK (revenue_type IN ('subscription', 'tip', 'pay_per_view', 'brand_deal', 'content_unlock')),
  ADD COLUMN IF NOT EXISTS net_earnings_cents INTEGER DEFAULT 0;

-- ============================================
-- RLS POLICIES
-- ============================================

-- SOCIAL POSTS POLICIES
DROP POLICY IF EXISTS "Users can view published posts" ON social_posts;
CREATE POLICY "Users can view published posts" ON social_posts
  FOR SELECT USING (
    status = 'published' AND (
      is_paid = false OR
      EXISTS (SELECT 1 FROM post_unlocks WHERE post_unlocks.post_id = id AND post_unlocks.user_id = auth.uid()) OR
      user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create posts" ON social_posts;
CREATE POLICY "Users can create posts" ON social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON social_posts;
CREATE POLICY "Users can update own posts" ON social_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON social_posts;
CREATE POLICY "Users can delete own posts" ON social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- POST UNLOCKS POLICIES
DROP POLICY IF EXISTS "Users can view own unlocks" ON post_unlocks;
CREATE POLICY "Users can view own unlocks" ON post_unlocks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create unlocks" ON post_unlocks;
CREATE POLICY "Users can create unlocks" ON post_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- FOLLOWS POLICIES
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
CREATE POLICY "Users can view all follows" ON follows
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- POST LIKES POLICIES
DROP POLICY IF EXISTS "Users can view all likes" ON post_likes;
CREATE POLICY "Users can view all likes" ON post_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- POST COMMENTS POLICIES
DROP POLICY IF EXISTS "Users can view comments" ON post_comments;
CREATE POLICY "Users can view comments" ON post_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON post_comments;
CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON post_comments;
CREATE POLICY "Users can update own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- MARKETPLACE ACCESS POLICIES
DROP POLICY IF EXISTS "Users can view own marketplace access" ON marketplace_access;
CREATE POLICY "Users can view own marketplace access" ON marketplace_access
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can apply for marketplace access" ON marketplace_access;
CREATE POLICY "Users can apply for marketplace access" ON marketplace_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- VERIFICATION POLICIES
DROP POLICY IF EXISTS "Users can view own verification" ON user_verification;
CREATE POLICY "Users can view own verification" ON user_verification
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create verification" ON user_verification;
CREATE POLICY "Users can create verification" ON user_verification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own verification" ON user_verification;
CREATE POLICY "Users can update own verification" ON user_verification
  FOR UPDATE USING (auth.uid() = user_id);

-- SCHEDULED POSTS POLICIES
DROP POLICY IF EXISTS "Users can view own scheduled posts" ON scheduled_posts;
CREATE POLICY "Users can view own scheduled posts" ON scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create scheduled posts" ON scheduled_posts;
CREATE POLICY "Users can create scheduled posts" ON scheduled_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scheduled posts" ON scheduled_posts;
CREATE POLICY "Users can update own scheduled posts" ON scheduled_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scheduled posts" ON scheduled_posts;
CREATE POLICY "Users can delete own scheduled posts" ON scheduled_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_published_at ON social_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_access_user_id ON marketplace_access(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_access_status ON marketplace_access(status);
