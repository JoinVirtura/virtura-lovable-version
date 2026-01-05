-- Insert user_tokens records for users that don't have them (including admins)
INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased, lifetime_used)
SELECT 
  p.id,
  0,
  0,
  0
FROM profiles p
LEFT JOIN user_tokens ut ON p.id = ut.user_id
WHERE ut.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Set trial users to Pro tier if they don't have a plan_name set
UPDATE subscriptions 
SET plan_name = 'pro'
WHERE status = 'trialing' AND plan_name IS NULL;