-- Trial Reactivation Campaign Tables
CREATE TABLE IF NOT EXISTS public.trial_reactivation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'expired_trial_winback',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_opened BOOLEAN DEFAULT FALSE,
  email_clicked BOOLEAN DEFAULT FALSE,
  offer_code TEXT,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trial_reactivation_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_code TEXT UNIQUE NOT NULL,
  offer_type TEXT NOT NULL, -- 'extended_trial', 'discount', 'both'
  extended_days INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  max_redemptions INTEGER DEFAULT 1,
  times_redeemed INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Testing Tables
CREATE TABLE IF NOT EXISTS public.trial_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  variants JSONB NOT NULL, -- [{"name": "7-day", "trial_days": 7, "weight": 50}, {"name": "14-day", "trial_days": 14, "weight": 50}]
  success_metric TEXT DEFAULT 'conversion_rate',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.trial_experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.trial_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  variant_name TEXT NOT NULL,
  trial_days INTEGER NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(experiment_id, user_id)
);

-- RLS Policies
ALTER TABLE public.trial_reactivation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_reactivation_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_experiment_assignments ENABLE ROW LEVEL SECURITY;

-- Reactivation campaigns: users can view their own
DROP POLICY IF EXISTS "Users can view own reactivation campaigns" ON public.trial_reactivation_campaigns;
CREATE POLICY "Users can view own reactivation campaigns"
  ON public.trial_reactivation_campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage everything
DROP POLICY IF EXISTS "Admins can manage reactivation campaigns" ON public.trial_reactivation_campaigns;
CREATE POLICY "Admins can manage reactivation campaigns"
  ON public.trial_reactivation_campaigns
  FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage reactivation offers" ON public.trial_reactivation_offers;
CREATE POLICY "Admins can manage reactivation offers"
  ON public.trial_reactivation_offers
  FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage experiments" ON public.trial_experiments;
CREATE POLICY "Admins can manage experiments"
  ON public.trial_experiments
  FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view experiment assignments" ON public.trial_experiment_assignments;
CREATE POLICY "Users can view experiment assignments"
  ON public.trial_experiment_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage experiment assignments" ON public.trial_experiment_assignments;
CREATE POLICY "Admins can manage experiment assignments"
  ON public.trial_experiment_assignments
  FOR ALL
  USING (public.is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reactivation_campaigns_user_id ON public.trial_reactivation_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_reactivation_campaigns_sent_at ON public.trial_reactivation_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_reactivation_offers_code ON public.trial_reactivation_offers(offer_code);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON public.trial_experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON public.trial_experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_user ON public.trial_experiment_assignments(user_id);

-- Triggers
DROP TRIGGER IF EXISTS update_trial_reactivation_offers_updated_at ON public.trial_reactivation_offers;
CREATE TRIGGER update_trial_reactivation_offers_updated_at
  BEFORE UPDATE ON public.trial_reactivation_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_trial_experiments_updated_at ON public.trial_experiments;
CREATE TRIGGER update_trial_experiments_updated_at
  BEFORE UPDATE ON public.trial_experiments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to check for active experiments
CREATE OR REPLACE FUNCTION public.get_active_trial_experiment()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT row_to_json(e)::jsonb
  FROM public.trial_experiments e
  WHERE e.status = 'active'
    AND (e.start_date IS NULL OR e.start_date <= NOW())
    AND (e.end_date IS NULL OR e.end_date >= NOW())
  ORDER BY e.created_at DESC
  LIMIT 1;
$$;
