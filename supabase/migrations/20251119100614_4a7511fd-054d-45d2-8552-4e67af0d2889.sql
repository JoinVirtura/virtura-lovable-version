-- Add trial conversion tracking
CREATE TABLE IF NOT EXISTS trial_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trial_start timestamp with time zone NOT NULL,
  trial_end timestamp with time zone NOT NULL,
  converted_at timestamp with time zone,
  conversion_plan text,
  discount_code text,
  time_to_convert_hours integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Add trial feature usage tracking
CREATE TABLE IF NOT EXISTS trial_feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature_name text NOT NULL,
  usage_count integer DEFAULT 1,
  first_used_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone DEFAULT now(),
  trial_id uuid,
  UNIQUE(user_id, feature_name, trial_id)
);

-- Add trial onboarding checklist
CREATE TABLE IF NOT EXISTS trial_checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add trial extensions tracking
CREATE TABLE IF NOT EXISTS trial_extensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  extended_by uuid NOT NULL,
  original_end_date timestamp with time zone NOT NULL,
  new_end_date timestamp with time zone NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS policies
ALTER TABLE trial_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_extensions ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own trial conversions" ON trial_conversions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feature usage" ON trial_feature_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own checklist" ON trial_checklist_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own extensions" ON trial_extensions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage conversions" ON trial_conversions
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can manage feature usage" ON trial_feature_usage
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Service role can manage extensions" ON trial_extensions
  FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Admins can view all data
CREATE POLICY "Admins can view all conversions" ON trial_conversions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can view all feature usage" ON trial_feature_usage
  FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage extensions" ON trial_extensions
  FOR ALL USING (has_role(auth.uid(), 'admin'::user_role));

-- Create view for trial analytics
CREATE OR REPLACE VIEW trial_analytics_summary AS
SELECT 
  COUNT(DISTINCT s.user_id) as total_trials,
  COUNT(DISTINCT CASE WHEN s.status = 'active' AND s.plan_name IS NOT NULL THEN s.user_id END) as converted_trials,
  ROUND(COUNT(DISTINCT CASE WHEN s.status = 'active' AND s.plan_name IS NOT NULL THEN s.user_id END)::numeric / 
    NULLIF(COUNT(DISTINCT s.user_id), 0) * 100, 2) as conversion_rate,
  AVG(CASE WHEN tc.time_to_convert_hours IS NOT NULL THEN tc.time_to_convert_hours END) as avg_time_to_convert_hours,
  COUNT(DISTINCT CASE WHEN s.trial_start >= NOW() - INTERVAL '7 days' THEN s.user_id END) as trials_last_7_days,
  COUNT(DISTINCT CASE WHEN s.trial_start >= NOW() - INTERVAL '30 days' THEN s.user_id END) as trials_last_30_days
FROM subscriptions s
LEFT JOIN trial_conversions tc ON s.user_id = tc.user_id
WHERE s.trial_used = true OR s.status = 'trialing';

-- Create updated_at trigger for checklist
CREATE TRIGGER update_trial_checklist_updated_at
  BEFORE UPDATE ON trial_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
