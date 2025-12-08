-- Create marketplace_messages table for real-time chat between brands and creators
CREATE TABLE public.marketplace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketplace_campaigns(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_marketplace_messages_campaign_id ON public.marketplace_messages(campaign_id);
CREATE INDEX idx_marketplace_messages_created_at ON public.marketplace_messages(created_at);

-- RLS Policies: Only campaign participants can view/send messages
-- Users can view messages if they are the brand owner or the assigned creator
CREATE POLICY "Users can view messages for their campaigns"
ON public.marketplace_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM marketplace_campaigns mc
    JOIN brands b ON mc.brand_id = b.id
    LEFT JOIN creator_accounts ca ON mc.creator_id = ca.id
    WHERE mc.id = marketplace_messages.campaign_id
    AND (b.user_id = auth.uid() OR ca.user_id = auth.uid())
  )
);

-- Users can send messages if they are the brand owner or the assigned creator
CREATE POLICY "Users can send messages for their campaigns"
ON public.marketplace_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM marketplace_campaigns mc
    JOIN brands b ON mc.brand_id = b.id
    LEFT JOIN creator_accounts ca ON mc.creator_id = ca.id
    WHERE mc.id = marketplace_messages.campaign_id
    AND (b.user_id = auth.uid() OR ca.user_id = auth.uid())
  )
);

-- Users can mark messages as read
CREATE POLICY "Users can update message read status"
ON public.marketplace_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM marketplace_campaigns mc
    JOIN brands b ON mc.brand_id = b.id
    LEFT JOIN creator_accounts ca ON mc.creator_id = ca.id
    WHERE mc.id = marketplace_messages.campaign_id
    AND (b.user_id = auth.uid() OR ca.user_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_campaigns mc
    JOIN brands b ON mc.brand_id = b.id
    LEFT JOIN creator_accounts ca ON mc.creator_id = ca.id
    WHERE mc.id = marketplace_messages.campaign_id
    AND (b.user_id = auth.uid() OR ca.user_id = auth.uid())
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_messages;