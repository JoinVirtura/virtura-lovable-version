-- Create landing_analytics table for tracking landing page conversions
CREATE TABLE IF NOT EXISTS public.landing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  prompt TEXT,
  user_ip TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_landing_analytics_event_type ON public.landing_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_created_at ON public.landing_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_session_id ON public.landing_analytics(session_id);

-- Enable RLS
ALTER TABLE public.landing_analytics ENABLE ROW LEVEL SECURITY;

-- Public can insert analytics (anonymous tracking)
DROP POLICY IF EXISTS "Anyone can insert landing analytics" ON public.landing_analytics;
CREATE POLICY "Anyone can insert landing analytics"
  ON public.landing_analytics
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all analytics
DROP POLICY IF EXISTS "Admins can view landing analytics" ON public.landing_analytics;
CREATE POLICY "Admins can view landing analytics"
  ON public.landing_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
