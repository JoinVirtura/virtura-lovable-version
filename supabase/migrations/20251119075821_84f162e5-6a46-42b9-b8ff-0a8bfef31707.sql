-- Create saved_posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  folder TEXT DEFAULT 'default',
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create post_reports table
CREATE TABLE IF NOT EXISTS public.post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Create post_views table for analytics
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON public.blocked_users(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewer_id ON public.post_views(viewer_id);

-- Enable RLS
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_posts
CREATE POLICY "Users can view their own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for post_reports
CREATE POLICY "Users can view their own reports"
  ON public.post_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON public.post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.post_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update reports"
  ON public.post_reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_id != blocked_user_id);

CREATE POLICY "Users can unblock others"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for post_views
CREATE POLICY "Anyone can track views"
  ON public.post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Post creators can view their post analytics"
  ON public.post_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.social_posts
      WHERE id = post_views.post_id AND user_id = auth.uid()
    )
  );

-- Add view count to social_posts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'social_posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public.social_posts ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_post_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.social_posts
  SET view_count = view_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment view count
DROP TRIGGER IF EXISTS on_post_view_created ON public.post_views;
CREATE TRIGGER on_post_view_created
  AFTER INSERT ON public.post_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_post_view_count();