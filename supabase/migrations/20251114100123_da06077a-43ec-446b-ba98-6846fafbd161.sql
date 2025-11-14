-- Create notification analytics and AB testing tables
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID,
  event_type TEXT NOT NULL CHECK (event_type IN ('received', 'read', 'clicked', 'dismissed', 'action_taken')),
  event_data JSONB DEFAULT '{}',
  device_type TEXT,
  browser TEXT,
  os TEXT,
  event_timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  control_group_percentage INTEGER NOT NULL DEFAULT 50 CHECK (control_group_percentage >= 0 AND control_group_percentage <= 100),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES notification_ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'system',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES notification_ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES notification_ab_variants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_id UUID,
  assigned_at TIMESTAMPTZ DEFAULT now()
);

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
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_event_type ON notification_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_notification_id ON notification_analytics(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_ab_tests_status ON notification_ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_notification_ab_variants_test_id ON notification_ab_variants(test_id);
CREATE INDEX IF NOT EXISTS idx_notification_ab_assignments_user_id ON notification_ab_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_ab_assignments_test_id ON notification_ab_assignments(test_id);
CREATE INDEX IF NOT EXISTS idx_notification_ab_metrics_variant_id ON notification_ab_metrics(variant_id);
CREATE INDEX IF NOT EXISTS idx_notification_ab_metrics_test_id ON notification_ab_metrics(test_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_codes_user_id ON phone_verification_codes(user_id);

-- Enable RLS
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_ab_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON notification_analytics;
CREATE POLICY "Users can view own analytics" ON notification_analytics FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert analytics" ON notification_analytics;
CREATE POLICY "System can insert analytics" ON notification_analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all analytics" ON notification_analytics;
CREATE POLICY "Admins can view all analytics" ON notification_analytics FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_ab_tests
DROP POLICY IF EXISTS "Admins can manage AB tests" ON notification_ab_tests;
CREATE POLICY "Admins can manage AB tests" ON notification_ab_tests FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_ab_variants
DROP POLICY IF EXISTS "Admins can manage variants" ON notification_ab_variants;
CREATE POLICY "Admins can manage variants" ON notification_ab_variants FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_ab_assignments
DROP POLICY IF EXISTS "Users can view own assignments" ON notification_ab_assignments;
CREATE POLICY "Users can view own assignments" ON notification_ab_assignments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert assignments" ON notification_ab_assignments;
CREATE POLICY "System can insert assignments" ON notification_ab_assignments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all assignments" ON notification_ab_assignments;
CREATE POLICY "Admins can view all assignments" ON notification_ab_assignments FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for notification_ab_metrics
DROP POLICY IF EXISTS "Admins can view all AB metrics" ON notification_ab_metrics;
CREATE POLICY "Admins can view all AB metrics" ON notification_ab_metrics FOR SELECT USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "System can manage AB metrics" ON notification_ab_metrics;
CREATE POLICY "System can manage AB metrics" ON notification_ab_metrics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "System can update AB metrics" ON notification_ab_metrics;
CREATE POLICY "System can update AB metrics" ON notification_ab_metrics FOR UPDATE USING (true);

-- RLS Policies for phone_verification_codes
DROP POLICY IF EXISTS "Users can manage own verification codes" ON phone_verification_codes;
CREATE POLICY "Users can manage own verification codes" ON phone_verification_codes FOR ALL USING (auth.uid() = user_id);