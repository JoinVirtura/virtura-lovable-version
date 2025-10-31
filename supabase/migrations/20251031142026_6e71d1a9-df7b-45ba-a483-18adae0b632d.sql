-- =====================================================
-- BRAND MANAGEMENT PLATFORM - COMPLETE DATABASE SCHEMA
-- =====================================================

-- 1. BRANDS TABLE
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#000000", "secondary": "#666666", "accent": "#FF0000"}'::jsonb,
  brand_fonts JSONB DEFAULT '{"heading": "Inter", "body": "Inter"}'::jsonb,
  tone_of_voice TEXT,
  target_audience TEXT,
  industry TEXT,
  social_handles JSONB DEFAULT '{}'::jsonb,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. BRAND COLLECTIONS TABLE
CREATE TABLE public.brand_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT CHECK (collection_type IN ('campaign', 'product', 'character', 'seasonal', 'custom')) DEFAULT 'custom',
  color_label TEXT,
  is_smart_folder BOOLEAN DEFAULT false,
  smart_rules JSONB,
  parent_collection_id UUID REFERENCES public.brand_collections(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. BRAND ASSETS TABLE
CREATE TABLE public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.brand_collections(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  asset_type TEXT CHECK (asset_type IN ('image', 'video', 'animation', 'logo', 'icon')) DEFAULT 'image',
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  generation_prompt TEXT,
  ai_model_used TEXT,
  dimensions JSONB DEFAULT '{"width": 1024, "height": 1024, "aspectRatio": "1:1"}'::jsonb,
  file_size BIGINT,
  format TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  labels JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  performance_score DOUBLE PRECISION,
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. BRAND CAMPAIGNS TABLE
CREATE TABLE public.brand_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT CHECK (campaign_type IN ('launch', 'seasonal', 'promotion', 'awareness', 'custom')) DEFAULT 'custom',
  start_date DATE NOT NULL,
  end_date DATE,
  budget NUMERIC(10, 2),
  target_platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_audience JSONB DEFAULT '{}'::jsonb,
  kpis JSONB DEFAULT '{}'::jsonb,
  brief TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')) DEFAULT 'planning',
  performance_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. CAMPAIGN CONTENT TABLE
CREATE TABLE public.campaign_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.brand_assets(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'linkedin', 'facebook')) NOT NULL,
  caption TEXT,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  scheduled_time TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'published', 'failed')) DEFAULT 'draft',
  platform_post_id TEXT,
  engagement_metrics JSONB DEFAULT '{}'::jsonb,
  auto_formatted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. BRAND CHARACTERS TABLE
CREATE TABLE public.brand_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT NOT NULL,
  character_traits JSONB DEFAULT '{}'::jsonb,
  voice_settings JSONB DEFAULT '{}'::jsonb,
  usage_guidelines TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. BRAND BRIEFS TABLE
CREATE TABLE public.brand_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.brand_campaigns(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  target_audience TEXT,
  key_messages TEXT[] DEFAULT ARRAY[]::TEXT[],
  tone TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  constraints TEXT,
  inspiration_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  deadline DATE,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. BRAND COLLABORATIONS TABLE
CREATE TABLE public.brand_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')) DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE
);

-- 9. PUBLISHING QUEUE TABLE
CREATE TABLE public.publishing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.campaign_content(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'linkedin')) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('queued', 'processing', 'published', 'failed', 'cancelled')) DEFAULT 'queued',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 10. BRAND ANALYTICS TABLE
CREATE TABLE public.brand_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.brand_assets(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.brand_campaigns(id) ON DELETE SET NULL,
  platform TEXT,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_brands_user_id ON public.brands(user_id);
CREATE INDEX idx_brands_is_active ON public.brands(is_active);

CREATE INDEX idx_brand_collections_brand_id ON public.brand_collections(brand_id);
CREATE INDEX idx_brand_collections_parent ON public.brand_collections(parent_collection_id);

CREATE INDEX idx_brand_assets_brand_id ON public.brand_assets(brand_id);
CREATE INDEX idx_brand_assets_collection_id ON public.brand_assets(collection_id);
CREATE INDEX idx_brand_assets_tags ON public.brand_assets USING GIN(tags);
CREATE INDEX idx_brand_assets_is_favorite ON public.brand_assets(is_favorite);
CREATE INDEX idx_brand_assets_is_archived ON public.brand_assets(is_archived);

CREATE INDEX idx_brand_campaigns_brand_id ON public.brand_campaigns(brand_id);
CREATE INDEX idx_brand_campaigns_status ON public.brand_campaigns(status);
CREATE INDEX idx_brand_campaigns_dates ON public.brand_campaigns(start_date, end_date);

CREATE INDEX idx_campaign_content_campaign_id ON public.campaign_content(campaign_id);
CREATE INDEX idx_campaign_content_asset_id ON public.campaign_content(asset_id);
CREATE INDEX idx_campaign_content_status ON public.campaign_content(status);
CREATE INDEX idx_campaign_content_scheduled ON public.campaign_content(scheduled_time);

CREATE INDEX idx_brand_characters_brand_id ON public.brand_characters(brand_id);

CREATE INDEX idx_brand_briefs_brand_id ON public.brand_briefs(brand_id);
CREATE INDEX idx_brand_briefs_campaign_id ON public.brand_briefs(campaign_id);

CREATE INDEX idx_brand_collaborations_brand_id ON public.brand_collaborations(brand_id);
CREATE INDEX idx_brand_collaborations_user_id ON public.brand_collaborations(user_id);

CREATE INDEX idx_publishing_queue_scheduled ON public.publishing_queue(scheduled_time);
CREATE INDEX idx_publishing_queue_status ON public.publishing_queue(status);

CREATE INDEX idx_brand_analytics_brand_id ON public.brand_analytics(brand_id);
CREATE INDEX idx_brand_analytics_date ON public.brand_analytics(date);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- BRANDS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brands"
  ON public.brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brands"
  ON public.brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brands"
  ON public.brands FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brands"
  ON public.brands FOR DELETE
  USING (auth.uid() = user_id);

-- BRAND COLLECTIONS
ALTER TABLE public.brand_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collections for their brands"
  ON public.brand_collections FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create collections for their brands"
  ON public.brand_collections FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update collections for their brands"
  ON public.brand_collections FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete collections for their brands"
  ON public.brand_collections FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- BRAND ASSETS
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets for their brands"
  ON public.brand_assets FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create assets for their brands"
  ON public.brand_assets FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update assets for their brands"
  ON public.brand_assets FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete assets for their brands"
  ON public.brand_assets FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- BRAND CAMPAIGNS
ALTER TABLE public.brand_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns for their brands"
  ON public.brand_campaigns FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create campaigns for their brands"
  ON public.brand_campaigns FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update campaigns for their brands"
  ON public.brand_campaigns FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete campaigns for their brands"
  ON public.brand_campaigns FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- CAMPAIGN CONTENT
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content for their campaigns"
  ON public.campaign_content FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.brand_campaigns 
      WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create content for their campaigns"
  ON public.campaign_content FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.brand_campaigns 
      WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update content for their campaigns"
  ON public.campaign_content FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM public.brand_campaigns 
      WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete content for their campaigns"
  ON public.campaign_content FOR DELETE
  USING (
    campaign_id IN (
      SELECT id FROM public.brand_campaigns 
      WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    )
  );

-- BRAND CHARACTERS
ALTER TABLE public.brand_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view characters for their brands"
  ON public.brand_characters FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create characters for their brands"
  ON public.brand_characters FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update characters for their brands"
  ON public.brand_characters FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete characters for their brands"
  ON public.brand_characters FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- BRAND BRIEFS
ALTER TABLE public.brand_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view briefs for their brands"
  ON public.brand_briefs FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create briefs for their brands"
  ON public.brand_briefs FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update briefs for their brands"
  ON public.brand_briefs FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete briefs for their brands"
  ON public.brand_briefs FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- BRAND COLLABORATIONS
ALTER TABLE public.brand_collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborations they're part of"
  ON public.brand_collaborations FOR SELECT
  USING (
    user_id = auth.uid() OR 
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Brand owners can create collaborations"
  ON public.brand_collaborations FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Brand owners can update collaborations"
  ON public.brand_collaborations FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Brand owners can delete collaborations"
  ON public.brand_collaborations FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- PUBLISHING QUEUE
ALTER TABLE public.publishing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view queue for their brands"
  ON public.publishing_queue FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create queue items for their brands"
  ON public.publishing_queue FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update queue for their brands"
  ON public.publishing_queue FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete queue items for their brands"
  ON public.publishing_queue FOR DELETE
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

-- BRAND ANALYTICS
ALTER TABLE public.brand_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics for their brands"
  ON public.brand_analytics FOR SELECT
  USING (
    brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert analytics"
  ON public.brand_analytics FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_brand_collections_updated_at
  BEFORE UPDATE ON public.brand_collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_brand_assets_updated_at
  BEFORE UPDATE ON public.brand_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_brand_campaigns_updated_at
  BEFORE UPDATE ON public.brand_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_campaign_content_updated_at
  BEFORE UPDATE ON public.campaign_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_brand_characters_updated_at
  BEFORE UPDATE ON public.brand_characters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_brand_briefs_updated_at
  BEFORE UPDATE ON public.brand_briefs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_publishing_queue_updated_at
  BEFORE UPDATE ON public.publishing_queue
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();