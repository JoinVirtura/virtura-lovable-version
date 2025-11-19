-- Add trial tracking columns to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN trial_start timestamptz,
ADD COLUMN trial_end timestamptz,
ADD COLUMN trial_used boolean DEFAULT false,
ADD COLUMN trial_plan_name text DEFAULT 'pro';

-- Add index for efficient trial queries
CREATE INDEX idx_subscriptions_trial_status ON subscriptions(user_id, trial_end) 
WHERE trial_used = false;

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.trial_start IS 'Start of 7-day trial period';
COMMENT ON COLUMN subscriptions.trial_end IS 'End of 7-day trial period';
COMMENT ON COLUMN subscriptions.trial_used IS 'Whether user has already used their trial';
COMMENT ON COLUMN subscriptions.trial_plan_name IS 'Plan name during trial (default: pro)';

-- Create function to initialize trial on signup
CREATE OR REPLACE FUNCTION public.initialize_trial_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert trial subscription for new users
  INSERT INTO public.subscriptions (
    user_id, 
    status, 
    trial_start, 
    trial_end, 
    trial_used,
    trial_plan_name
  ) VALUES (
    NEW.id,
    'trialing',
    NOW(),
    NOW() + INTERVAL '7 days',
    false,
    'pro'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to initialize trial on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_trial ON public.profiles;
CREATE TRIGGER on_auth_user_created_initialize_trial
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_trial_on_signup();

-- Grant 7-day trials to existing users without subscriptions
INSERT INTO subscriptions (user_id, status, trial_start, trial_end, trial_used, trial_plan_name)
SELECT 
  p.id,
  'trialing',
  NOW(),
  NOW() + INTERVAL '7 days',
  false,
  'pro'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE subscriptions.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;