-- Campaign Invites Table
CREATE TABLE public.campaign_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketplace_campaigns(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creator_accounts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(campaign_id, creator_id)
);

-- Campaign Disputes Table
CREATE TABLE public.campaign_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketplace_campaigns(id) ON DELETE CASCADE,
  raised_by_user_id UUID NOT NULL,
  raised_by_type TEXT NOT NULL CHECK (raised_by_type IN ('brand', 'creator')),
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('deliverable_quality', 'payment_issue', 'deadline_missed', 'communication', 'scope_disagreement', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_brand_favor', 'resolved_creator_favor', 'resolved_mutual', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  admin_id UUID,
  admin_notes TEXT,
  resolution_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Dispute Messages Table
CREATE TABLE public.dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES campaign_disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_messages ENABLE ROW LEVEL SECURITY;

-- Campaign Invites Policies
CREATE POLICY "Brands can create invites for their campaigns"
ON public.campaign_invites FOR INSERT
WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Brands can view invites they sent"
ON public.campaign_invites FOR SELECT
USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Creators can view their invites"
ON public.campaign_invites FOR SELECT
USING (creator_id IN (SELECT id FROM creator_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Creators can update their invite status"
ON public.campaign_invites FOR UPDATE
USING (creator_id IN (SELECT id FROM creator_accounts WHERE user_id = auth.uid()));

-- Campaign Disputes Policies
CREATE POLICY "Campaign parties can create disputes"
ON public.campaign_disputes FOR INSERT
WITH CHECK (auth.uid() = raised_by_user_id);

CREATE POLICY "Campaign parties can view their disputes"
ON public.campaign_disputes FOR SELECT
USING (
  raised_by_user_id = auth.uid() 
  OR campaign_id IN (
    SELECT id FROM marketplace_campaigns 
    WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
    OR creator_id IN (SELECT id FROM creator_accounts WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Admins can view all disputes"
ON public.campaign_disputes FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update disputes"
ON public.campaign_disputes FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Dispute Messages Policies
CREATE POLICY "Dispute parties can view messages"
ON public.dispute_messages FOR SELECT
USING (
  dispute_id IN (
    SELECT id FROM campaign_disputes 
    WHERE raised_by_user_id = auth.uid()
    OR campaign_id IN (
      SELECT id FROM marketplace_campaigns 
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR creator_id IN (SELECT id FROM creator_accounts WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Dispute parties can add messages"
ON public.dispute_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  dispute_id IN (
    SELECT id FROM campaign_disputes 
    WHERE raised_by_user_id = auth.uid()
    OR campaign_id IN (
      SELECT id FROM marketplace_campaigns 
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR creator_id IN (SELECT id FROM creator_accounts WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Admins can add messages to any dispute"
ON public.dispute_messages FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all dispute messages"
ON public.dispute_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_campaign_disputes_updated_at
BEFORE UPDATE ON public.campaign_disputes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();