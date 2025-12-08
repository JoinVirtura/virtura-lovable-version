-- 1. Add grace period columns to user_verification
ALTER TABLE user_verification 
ADD COLUMN IF NOT EXISTS badge_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS grace_period_days integer DEFAULT 3;

-- 2. Create a function to handle cron-based trial notifications
CREATE OR REPLACE FUNCTION check_trial_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub RECORD;
BEGIN
  -- Find trials expiring in 3 days
  FOR sub IN 
    SELECT cs.*, ca.user_id 
    FROM creator_subscriptions cs
    JOIN creator_accounts ca ON cs.creator_id = ca.id
    WHERE cs.status = 'trialing'
    AND cs.trial_end IS NOT NULL
    AND cs.trial_end::date = (CURRENT_DATE + INTERVAL '3 days')::date
  LOOP
    INSERT INTO notifications (user_id, title, message, category, priority, metadata)
    VALUES (
      sub.user_id,
      'Trial Ending Soon',
      'Your subscription trial ends in 3 days. Subscribe now to keep your benefits!',
      'billing',
      'high',
      jsonb_build_object('subscription_id', sub.id, 'trial_end', sub.trial_end, 'days_remaining', 3)
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Find trials expiring in 1 day
  FOR sub IN 
    SELECT cs.*, ca.user_id 
    FROM creator_subscriptions cs
    JOIN creator_accounts ca ON cs.creator_id = ca.id
    WHERE cs.status = 'trialing'
    AND cs.trial_end IS NOT NULL
    AND cs.trial_end::date = (CURRENT_DATE + INTERVAL '1 day')::date
  LOOP
    INSERT INTO notifications (user_id, title, message, category, priority, metadata)
    VALUES (
      sub.user_id,
      'Trial Ends Tomorrow',
      'Your subscription trial ends tomorrow! Subscribe now to avoid interruption.',
      'billing',
      'high',
      jsonb_build_object('subscription_id', sub.id, 'trial_end', sub.trial_end, 'days_remaining', 1)
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Find trials expiring today
  FOR sub IN 
    SELECT cs.*, ca.user_id 
    FROM creator_subscriptions cs
    JOIN creator_accounts ca ON cs.creator_id = ca.id
    WHERE cs.status = 'trialing'
    AND cs.trial_end IS NOT NULL
    AND cs.trial_end::date = CURRENT_DATE
  LOOP
    INSERT INTO notifications (user_id, title, message, category, priority, metadata)
    VALUES (
      sub.user_id,
      'Trial Expires Today',
      'Your subscription trial expires today. Subscribe now to continue enjoying premium features!',
      'billing',
      'high',
      jsonb_build_object('subscription_id', sub.id, 'trial_end', sub.trial_end, 'days_remaining', 0)
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- 3. Create function to check verification grace period expirations
CREATE OR REPLACE FUNCTION check_verification_grace_period()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v RECORD;
BEGIN
  -- Find verifications where grace period has expired
  FOR v IN 
    SELECT * FROM user_verification
    WHERE subscription_status = 'grace_period'
    AND badge_expires_at IS NOT NULL
    AND badge_expires_at < NOW()
  LOOP
    -- Update status to expired
    UPDATE user_verification
    SET subscription_status = 'expired',
        updated_at = NOW()
    WHERE id = v.id;

    -- Send notification
    INSERT INTO notifications (user_id, title, message, category, priority, metadata)
    VALUES (
      v.user_id,
      'Verification Badge Removed',
      'Your verification badge has been removed due to subscription cancellation. Resubscribe to restore your verified status.',
      'account',
      'high',
      jsonb_build_object('verification_id', v.id)
    );
  END LOOP;
END;
$$;