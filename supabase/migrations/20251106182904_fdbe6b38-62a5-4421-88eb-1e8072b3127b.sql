-- Notification types enum
DO $$ BEGIN
  CREATE TYPE notification_category AS ENUM (
    'system',
    'account',
    'billing',
    'marketing',
    'product',
    'security'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category preferences
  system_enabled BOOLEAN DEFAULT true,
  account_enabled BOOLEAN DEFAULT true,
  billing_enabled BOOLEAN DEFAULT true,
  marketing_enabled BOOLEAN DEFAULT false,
  product_enabled BOOLEAN DEFAULT true,
  security_enabled BOOLEAN DEFAULT true,

  -- Delivery methods
  in_app_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,

  -- Sound & visual preferences
  sound_enabled BOOLEAN DEFAULT true,
  sound_file TEXT DEFAULT 'default',
  desktop_notifications BOOLEAN DEFAULT false,

  -- Quiet hours (stored as minutes from midnight)
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start INTEGER DEFAULT 1320,
  quiet_hours_end INTEGER DEFAULT 480,
  quiet_hours_timezone TEXT DEFAULT 'UTC',

  -- Digest preferences
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT false,
  digest_time INTEGER DEFAULT 540,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON notification_preferences;
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON notification_preferences;
CREATE POLICY "Users can insert own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON notification_preferences;
CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Add category field to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category notification_category DEFAULT 'system';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user_category ON notifications(user_id, category);

-- Function to create default preferences on user signup
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();
