-- Creator Monetization Tables

-- Creator accounts with Stripe Connect
CREATE TABLE creator_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  stripe_account_id TEXT UNIQUE,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  platform_fee_percentage NUMERIC(5,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE creator_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for creator_accounts
CREATE POLICY "Users can view their own creator account"
  ON creator_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creator account"
  ON creator_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator account"
  ON creator_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all creator accounts"
  ON creator_accounts FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Earnings and payouts tracking
CREATE TABLE creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  creator_amount_cents INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('subscription', 'unlock', 'tip', 'marketplace_campaign')),
  source_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  payout_date TIMESTAMPTZ,
  stripe_payout_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;

-- Policies for creator_earnings
CREATE POLICY "Creators can view their own earnings"
  ON creator_earnings FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all earnings"
  ON creator_earnings FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Subscriptions to creators
CREATE TABLE creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  subscriber_id UUID REFERENCES auth.users(id) NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'vip')),
  amount_cents INTEGER NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, subscriber_id, tier)
);

-- Enable RLS
ALTER TABLE creator_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for creator_subscriptions
CREATE POLICY "Creators can view their subscriptions"
  ON creator_subscriptions FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Subscribers can view their own subscriptions"
  ON creator_subscriptions FOR SELECT
  USING (auth.uid() = subscriber_id);

CREATE POLICY "Service role can manage all subscriptions"
  ON creator_subscriptions FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Content unlocks
CREATE TABLE content_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('asset', 'post')),
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE content_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies for content_unlocks
CREATE POLICY "Users can view their own unlocks"
  ON content_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can view unlocks of their content"
  ON content_unlocks FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all unlocks"
  ON content_unlocks FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Tips to creators
CREATE TABLE creator_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  tipper_id UUID REFERENCES auth.users(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  message TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE creator_tips ENABLE ROW LEVEL SECURITY;

-- Policies for creator_tips
CREATE POLICY "Creators can view their tips"
  ON creator_tips FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tippers can view their own tips"
  ON creator_tips FOR SELECT
  USING (auth.uid() = tipper_id);

CREATE POLICY "Service role can manage all tips"
  ON creator_tips FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Marketplace Campaigns Tables

-- Marketplace campaigns
CREATE TABLE marketplace_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  creator_id UUID REFERENCES creator_accounts(id),
  title TEXT NOT NULL,
  description TEXT,
  budget_cents INTEGER NOT NULL,
  creator_rate_cents INTEGER,
  deliverables JSONB NOT NULL DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'in_progress', 'completed', 'canceled')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'invited_only')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE marketplace_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_campaigns
CREATE POLICY "Anyone can view public campaigns"
  ON marketplace_campaigns FOR SELECT
  USING (visibility = 'public' OR auth.uid() IS NOT NULL);

CREATE POLICY "Brands can create campaigns"
  ON marketplace_campaigns FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can update their campaigns"
  ON marketplace_campaigns FOR UPDATE
  USING (
    brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can delete their campaigns"
  ON marketplace_campaigns FOR DELETE
  USING (
    brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  );

-- Applications from creators
CREATE TABLE marketplace_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketplace_campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  pitch TEXT NOT NULL,
  proposed_rate_cents INTEGER NOT NULL,
  portfolio_links TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(campaign_id, creator_id)
);

-- Enable RLS
ALTER TABLE marketplace_applications ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_applications
CREATE POLICY "Creators can view their own applications"
  ON marketplace_applications FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can view applications to their campaigns"
  ON marketplace_applications FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM marketplace_campaigns WHERE brand_id IN (
        SELECT id FROM brands WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can insert their own applications"
  ON marketplace_applications FOR INSERT
  WITH CHECK (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their own applications"
  ON marketplace_applications FOR UPDATE
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can update applications to their campaigns"
  ON marketplace_applications FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM marketplace_campaigns WHERE brand_id IN (
        SELECT id FROM brands WHERE user_id = auth.uid()
      )
    )
  );

-- Deliverables submitted by creators
CREATE TABLE marketplace_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketplace_campaigns(id) NOT NULL,
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  asset_id UUID REFERENCES brand_assets(id),
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('image', 'video', 'caption', 'package')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'revision_requested', 'rejected')),
  feedback TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE marketplace_deliverables ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_deliverables
CREATE POLICY "Creators can view their own deliverables"
  ON marketplace_deliverables FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can view deliverables for their campaigns"
  ON marketplace_deliverables FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM marketplace_campaigns WHERE brand_id IN (
        SELECT id FROM brands WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Creators can insert their own deliverables"
  ON marketplace_deliverables FOR INSERT
  WITH CHECK (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their own deliverables"
  ON marketplace_deliverables FOR UPDATE
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can update deliverables for their campaigns"
  ON marketplace_deliverables FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM marketplace_campaigns WHERE brand_id IN (
        SELECT id FROM brands WHERE user_id = auth.uid()
      )
    )
  );

-- Payments for marketplace campaigns
CREATE TABLE marketplace_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketplace_campaigns(id) NOT NULL,
  brand_id UUID REFERENCES brands(id) NOT NULL,
  creator_id UUID REFERENCES creator_accounts(id) NOT NULL,
  total_amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  creator_amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'escrowed', 'released', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE marketplace_payments ENABLE ROW LEVEL SECURITY;

-- Policies for marketplace_payments
CREATE POLICY "Creators can view their payments"
  ON marketplace_payments FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM creator_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can view their payments"
  ON marketplace_payments FOR SELECT
  USING (
    brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all payments"
  ON marketplace_payments FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add updated_at trigger for tables
CREATE TRIGGER update_creator_accounts_updated_at
  BEFORE UPDATE ON creator_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_subscriptions_updated_at
  BEFORE UPDATE ON creator_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_campaigns_updated_at
  BEFORE UPDATE ON marketplace_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();