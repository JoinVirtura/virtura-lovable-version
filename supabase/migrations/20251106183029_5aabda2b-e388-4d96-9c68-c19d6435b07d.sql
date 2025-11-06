-- Scheduled notifications table
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  
  -- Notification content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category notification_category DEFAULT 'system',
  priority TEXT DEFAULT 'normal',
  
  -- Targeting
  target_audience TEXT NOT NULL,
  target_user_ids JSONB DEFAULT '[]',
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  recurrence_end_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

-- RLS Policies
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all scheduled notifications"
  ON scheduled_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert scheduled notifications"
  ON scheduled_notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scheduled notifications"
  ON scheduled_notifications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scheduled notifications"
  ON scheduled_notifications FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_admin_id ON scheduled_notifications(admin_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_notifications;
ALTER TABLE scheduled_notifications REPLICA IDENTITY FULL;

-- Admin digest preferences table
CREATE TABLE admin_digest_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  admin_email TEXT NOT NULL,
  
  -- Digest settings
  daily_enabled BOOLEAN DEFAULT true,
  weekly_enabled BOOLEAN DEFAULT true,
  monthly_enabled BOOLEAN DEFAULT false,
  
  -- Delivery settings
  send_time INTEGER DEFAULT 540,
  timezone TEXT DEFAULT 'UTC',
  
  -- Content preferences
  include_metrics BOOLEAN DEFAULT true,
  include_charts BOOLEAN DEFAULT true,
  include_top_users BOOLEAN DEFAULT true,
  include_failed_jobs BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(admin_id)
);

ALTER TABLE admin_digest_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage own digest preferences"
  ON admin_digest_preferences FOR ALL
  USING (has_role(auth.uid(), 'admin') AND auth.uid() = admin_id);