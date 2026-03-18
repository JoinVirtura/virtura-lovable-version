-- Create all tables and functions that were manually created in the original Lovable project
-- but never had CREATE TABLE/FUNCTION in any migration file.

-- handle_updated_at function (used by many triggers, never created in migrations)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. brands
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  tone_of_voice TEXT,
  target_audience TEXT,
  brand_colors JSONB,
  brand_fonts JSONB,
  social_handles JSONB,
  organization_id UUID,
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 2. brand_collections
CREATE TABLE IF NOT EXISTS public.brand_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  parent_collection_id UUID REFERENCES public.brand_collections(id),
  collection_type TEXT,
  description TEXT,
  color_label TEXT,
  sort_order INTEGER,
  is_smart_folder BOOLEAN DEFAULT false,
  smart_rules JSONB,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_collections ENABLE ROW LEVEL SECURITY;

-- 3. brand_assets
CREATE TABLE IF NOT EXISTS public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.brand_collections(id),
  asset_type TEXT,
  format TEXT,
  description TEXT,
  tags TEXT[],
  thumbnail_url TEXT,
  file_size INTEGER,
  dimensions JSONB,
  labels JSONB,
  metadata JSONB,
  generation_prompt TEXT,
  ai_model_used TEXT,
  performance_score NUMERIC,
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

-- 4. brand_campaigns
CREATE TABLE IF NOT EXISTS public.brand_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  description TEXT,
  campaign_type TEXT,
  status TEXT DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  budget NUMERIC,
  brief TEXT,
  target_audience JSONB,
  target_platforms TEXT[],
  kpis JSONB,
  performance_data JSONB,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_campaigns ENABLE ROW LEVEL SECURITY;

-- 5. brand_analytics
CREATE TABLE IF NOT EXISTS public.brand_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.brand_assets(id),
  campaign_id UUID REFERENCES public.brand_campaigns(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  platform TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_analytics ENABLE ROW LEVEL SECURITY;

-- 6. brand_briefs
CREATE TABLE IF NOT EXISTS public.brand_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.brand_campaigns(id),
  target_audience TEXT,
  tone TEXT,
  key_messages TEXT[],
  constraints TEXT,
  deliverables JSONB,
  deadline TIMESTAMP WITH TIME ZONE,
  inspiration_urls TEXT[],
  ai_generated BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_briefs ENABLE ROW LEVEL SECURITY;

-- 7. brand_characters
CREATE TABLE IF NOT EXISTS public.brand_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  description TEXT,
  character_traits JSONB,
  voice_settings JSONB,
  usage_guidelines TEXT,
  tags TEXT[],
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_characters ENABLE ROW LEVEL SECURITY;

-- 8. brand_collaborations
CREATE TABLE IF NOT EXISTS public.brand_collaborations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  inviter_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT DEFAULT 'viewer',
  status TEXT DEFAULT 'pending',
  permissions JSONB,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.brand_collaborations ENABLE ROW LEVEL SECURITY;

-- 9. campaign_content
CREATE TABLE IF NOT EXISTS public.campaign_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.brand_assets(id),
  platform TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  scheduled_time TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  platform_post_id TEXT,
  status TEXT DEFAULT 'draft',
  auto_formatted BOOLEAN DEFAULT false,
  engagement_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;

-- 10. publishing_queue
CREATE TABLE IF NOT EXISTS public.publishing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.campaign_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.publishing_queue ENABLE ROW LEVEL SECURITY;

-- 11. projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  metadata JSONB,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 12. jobs (depends on projects)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  stage TEXT,
  project_id UUID REFERENCES public.projects(id),
  worker_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  input_data JSONB,
  output_data JSONB,
  gpu_requirements JSONB DEFAULT '{}',
  processing_phases TEXT[] DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 13. renders (depends on projects, jobs)
CREATE TABLE IF NOT EXISTS public.renders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  project_id UUID REFERENCES public.projects(id),
  job_id UUID REFERENCES public.jobs(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  format TEXT,
  resolution TEXT,
  duration NUMERIC,
  file_size INTEGER,
  watermark BOOLEAN DEFAULT false,
  share_url TEXT,
  download_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

-- 14. usage_tracking
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  resource_type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- 15. user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role user_role NOT NULL DEFAULT 'viewer',
  organization_id UUID,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 16. voice_cache
CREATE TABLE IF NOT EXISTS public.voice_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  voice_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  script_hash TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  voice_settings JSONB NOT NULL DEFAULT '{}',
  duration NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.voice_cache ENABLE ROW LEVEL SECURITY;

-- 17. subscriptions (also missing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_name TEXT,
  price_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for tables with user_id column
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'brands', 'brand_collections', 'brand_assets', 'brand_campaigns',
    'brand_briefs', 'brand_characters',
    'projects', 'jobs', 'renders',
    'usage_tracking', 'user_roles', 'voice_cache', 'subscriptions'
  ]) LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can view own %s" ON public.%I FOR SELECT USING (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %s" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %s" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can update own %s" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %s" ON public.%I', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can delete own %s" ON public.%I FOR DELETE USING (auth.uid() = user_id)', tbl, tbl);
  END LOOP;
END $$;

-- RLS for brand_analytics (no user_id, use brand ownership)
DROP POLICY IF EXISTS "Users can view own brand_analytics" ON public.brand_analytics;
CREATE POLICY "Users can view own brand_analytics" ON public.brand_analytics
FOR SELECT USING (EXISTS (SELECT 1 FROM public.brands WHERE brands.id = brand_analytics.brand_id AND brands.user_id = auth.uid()));

-- RLS for brand_collaborations (user_id exists)
DROP POLICY IF EXISTS "Users can view own brand_collaborations" ON public.brand_collaborations;
CREATE POLICY "Users can view own brand_collaborations" ON public.brand_collaborations
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = inviter_id);

-- RLS for campaign_content (no user_id, use campaign ownership chain)
DROP POLICY IF EXISTS "Users can view own campaign_content" ON public.campaign_content;
CREATE POLICY "Users can view own campaign_content" ON public.campaign_content
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.brand_campaigns bc
  JOIN public.brands b ON b.id = bc.brand_id
  WHERE bc.id = campaign_content.campaign_id AND b.user_id = auth.uid()
));

-- RLS for publishing_queue (no user_id, use brand ownership)
DROP POLICY IF EXISTS "Users can view own publishing_queue" ON public.publishing_queue;
CREATE POLICY "Users can view own publishing_queue" ON public.publishing_queue
FOR SELECT USING (EXISTS (SELECT 1 FROM public.brands WHERE brands.id = publishing_queue.brand_id AND brands.user_id = auth.uid()));
