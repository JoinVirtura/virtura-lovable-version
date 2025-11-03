-- Create table for tracking API costs
CREATE TABLE public.api_cost_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  api_provider TEXT NOT NULL,
  model_used TEXT,
  cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  tokens_charged INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_cost_tracking ENABLE ROW LEVEL SECURITY;

-- Admins can view all cost tracking
CREATE POLICY "Admins can view all cost tracking"
  ON public.api_cost_tracking
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Service role can insert cost tracking
CREATE POLICY "Service role can insert cost tracking"
  ON public.api_cost_tracking
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create index for performance
CREATE INDEX idx_api_cost_tracking_user_id ON public.api_cost_tracking(user_id);
CREATE INDEX idx_api_cost_tracking_created_at ON public.api_cost_tracking(created_at DESC);
CREATE INDEX idx_api_cost_tracking_resource_type ON public.api_cost_tracking(resource_type);
CREATE INDEX idx_api_cost_tracking_api_provider ON public.api_cost_tracking(api_provider);