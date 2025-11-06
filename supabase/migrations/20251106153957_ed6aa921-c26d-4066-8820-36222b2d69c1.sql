-- Add onboarding tracking fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS signup_bonus_claimed BOOLEAN DEFAULT FALSE;

-- Create function to credit signup bonus (50 tokens)
CREATE OR REPLACE FUNCTION public.credit_signup_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize user_tokens record with 50 free tokens
  INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased, lifetime_used)
  VALUES (NEW.id, 50, 50, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the signup bonus transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    resource_type,
    metadata
  ) VALUES (
    NEW.id,
    50,
    'bonus',
    'signup_bonus',
    '{"description": "Welcome bonus - 50 free tokens", "auto_credited": true}'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically credit signup bonus
DROP TRIGGER IF EXISTS on_user_signup_bonus ON profiles;
CREATE TRIGGER on_user_signup_bonus
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_signup_bonus();

-- Add comment for documentation
COMMENT ON FUNCTION public.credit_signup_bonus() IS 'Automatically credits 50 free tokens to new users as a signup bonus';