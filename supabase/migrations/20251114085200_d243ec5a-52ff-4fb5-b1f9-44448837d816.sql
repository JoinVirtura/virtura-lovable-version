-- =============================================
-- PHASE 3 & 4: COMPLETE NOTIFICATION INFRASTRUCTURE
-- A/B Testing, SMS Notifications, Analytics, Phone Verification
-- =============================================

-- =============================================
-- PART 1: A/B TESTING SYSTEM
-- =============================================

-- A/B test campaigns
CREATE TABLE IF NOT EXISTS notification_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',

  control_group_percentage INTEGER DEFAULT 50,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (control_group_percentage >= 0 AND control_group_percentage <= 100),
  CHECK (status IN ('draft', 'active', 'paused', 'completed'))
);

-- A/B test variant definitions
CREATE TABLE IF NOT EXISTS notification_ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES notification_ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category notification_category DEFAULT 'system',
  priority TEXT DEFAULT 'normal',

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(test_id, variant_name)
);

-- A/B test user assignments
CREATE TABLE IF NOT EXISTS notification_ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES notification_ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES notification_ab_variants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,

  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(test_id, user_id)
);

-- A/B test metrics
CREATE TABLE IF NOT EXISTS notification_ab_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES notification_ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES notification_ab_variants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  notification_sent BOOLEAN DEFAULT false,
  notification_received BOOLEAN DEFAULT false,
  notification_read BOOLEAN DEFAULT false,
  notification_clicked BOOLEAN DEFAULT false,
  notification_dismissed BOOLEAN DEFAULT false,

  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  time_to_read INTEGER,
  time_to_click INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 2: SMS NOTIFICATIONS
-- =============================================

-- Add SMS fields to notification preferences
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Phone verification codes
CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS notification log
CREATE TABLE IF NOT EXISTS notification_sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,

  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  twilio_sid TEXT,

  status TEXT DEFAULT 'pending',
  error_message TEXT,

  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (status IN ('pending', 'sent', 'delivered', 'failed'))
);

-- SMS rate limiting
CREATE TABLE IF NOT EXISTS notification_sms_limits (
  user_id UUID PRIMARY KEY,
  daily_count INTEGER DEFAULT 0,
  weekly_count INTEGER DEFAULT 0,
  monthly_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  last_reset_week INTEGER DEFAULT EXTRACT(WEEK FROM CURRENT_DATE)::INTEGER,
  last_reset_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
);

-- Function to check SMS limits
CREATE OR REPLACE FUNCTION check_sms_limit(
  p_user_id UUID,
  daily_limit INTEGER DEFAULT 10,
  weekly_limit INTEGER DEFAULT 50,
  monthly_limit INTEGER DEFAULT 200
) RETURNS BOOLEAN AS $$
DECLARE
  v_limits RECORD;
BEGIN
  INSERT INTO notification_sms_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_limits
  FROM notification_sms_limits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_limits.last_reset_date < CURRENT_DATE THEN
    UPDATE notification_sms_limits
    SET daily_count = 0, last_reset_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    v_limits.daily_count := 0;
  END IF;

  IF v_limits.daily_count >= daily_limit OR
     v_limits.weekly_count >= weekly_limit OR
     v_limits.monthly_count >= monthly_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE notification_sms_limits
  SET
    daily_count = daily_count + 1,
    weekly_count = weekly_count + 1,
    monthly_count = monthly_count + 1
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- PART 3: NOTIFICATION ANALYTICS & CTR TRACKING
-- =============================================

-- General notification analytics
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',

  device_type TEXT,
  browser TEXT,
  os TEXT,

  event_timestamp TIMESTAMPTZ DEFAULT NOW(),

  CHECK (event_type IN ('received', 'read', 'clicked', 'dismissed', 'action_taken'))
);

-- Aggregated CTR metrics (materialized view) - drop and recreate for idempotency
DROP MATERIALIZED VIEW IF EXISTS notification_ctr_metrics;
CREATE MATERIALIZED VIEW notification_ctr_metrics AS
SELECT
  n.category,
  n.priority,
  DATE_TRUNC('day', n.created_at) as date,
  COUNT(DISTINCT n.id) as total_sent,
  COUNT(DISTINCT CASE WHEN na.event_type = 'read' THEN na.notification_id END) as total_read,
  COUNT(DISTINCT CASE WHEN na.event_type = 'clicked' THEN na.notification_id END) as total_clicked,
  ROUND(
    (COUNT(DISTINCT CASE WHEN na.event_type = 'read' THEN na.notification_id END)::NUMERIC /
     NULLIF(COUNT(DISTINCT n.id), 0) * 100), 2
  ) as open_rate,
  ROUND(
    (COUNT(DISTINCT CASE WHEN na.event_type = 'clicked' THEN na.notification_id END)::NUMERIC /
     NULLIF(COUNT(DISTINCT CASE WHEN na.event_type = 'read' THEN na.notification_id END), 0) * 100), 2
  ) as ctr
FROM notifications n
LEFT JOIN notification_analytics na ON n.id = na.notification_id
GROUP BY n.category, n.priority, DATE_TRUNC('day', n.created_at);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- A/B Testing indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON notification_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_test_user ON notification_ab_assignments(test_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ab_metrics_test_variant ON notification_ab_metrics(test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_metrics_clicked ON notification_ab_metrics(notification_clicked);

-- SMS indexes
CREATE INDEX IF NOT EXISTS idx_sms_log_user_id ON notification_sms_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_log_status ON notification_sms_log(status);
CREATE INDEX IF NOT EXISTS idx_phone_verification_user ON phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_expires ON phone_verification_codes(expires_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_notification_id ON notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON notification_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON notification_analytics(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_ctr_metrics_date ON notification_ctr_metrics(date);
CREATE INDEX IF NOT EXISTS idx_ctr_metrics_category ON notification_ctr_metrics(category);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- A/B Testing RLS
ALTER TABLE notification_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage A/B tests" ON notification_ab_tests;
CREATE POLICY "Admins can manage A/B tests"
  ON notification_ab_tests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage variants" ON notification_ab_variants;
CREATE POLICY "Admins can manage variants"
  ON notification_ab_variants FOR ALL
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view own assignments" ON notification_ab_assignments;
CREATE POLICY "Users can view own assignments"
  ON notification_ab_assignments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all assignments" ON notification_ab_assignments;
CREATE POLICY "Admins can view all assignments"
  ON notification_ab_assignments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert assignments" ON notification_ab_assignments;
CREATE POLICY "System can insert assignments"
  ON notification_ab_assignments FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all AB metrics" ON notification_ab_metrics;
CREATE POLICY "Admins can view all AB metrics"
  ON notification_ab_metrics FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can manage AB metrics" ON notification_ab_metrics;
CREATE POLICY "System can manage AB metrics"
  ON notification_ab_metrics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update AB metrics" ON notification_ab_metrics;
CREATE POLICY "System can update AB metrics"
  ON notification_ab_metrics FOR UPDATE
  USING (true);

-- SMS RLS
ALTER TABLE phone_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_sms_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own verification codes" ON phone_verification_codes;
CREATE POLICY "Users can manage own verification codes"
  ON phone_verification_codes FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own SMS logs" ON notification_sms_log;
CREATE POLICY "Users can view own SMS logs"
  ON notification_sms_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all SMS logs" ON notification_sms_log;
CREATE POLICY "Admins can view all SMS logs"
  ON notification_sms_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can insert SMS logs" ON notification_sms_log;
CREATE POLICY "System can insert SMS logs"
  ON notification_sms_log FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update SMS logs" ON notification_sms_log;
CREATE POLICY "System can update SMS logs"
  ON notification_sms_log FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can view own SMS limits" ON notification_sms_limits;
CREATE POLICY "Users can view own SMS limits"
  ON notification_sms_limits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage SMS limits" ON notification_sms_limits;
CREATE POLICY "System can manage SMS limits"
  ON notification_sms_limits FOR ALL
  USING (true);

-- Analytics RLS
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own analytics" ON notification_analytics;
CREATE POLICY "Users can insert own analytics"
  ON notification_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all analytics" ON notification_analytics;
CREATE POLICY "Admins can view all analytics"
  ON notification_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can manage analytics" ON notification_analytics;
CREATE POLICY "System can manage analytics"
  ON notification_analytics FOR ALL
  USING (true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

DROP TRIGGER IF EXISTS update_ab_tests_updated_at ON notification_ab_tests;
CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON notification_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
