-- Reduce free signup tokens from 50 to 30 to minimize free-trial abuse cost
-- This only affects new signups. Existing users keep their 50-token welcome gift.

CREATE OR REPLACE FUNCTION public.initialize_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
  VALUES (NEW.id, 30, 30); -- 30 free tokens on signup

  -- Record the welcome bonus transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    resource_type,
    metadata
  ) VALUES (
    NEW.id,
    30,
    'bonus',
    'welcome_bonus',
    jsonb_build_object('reason', 'New user welcome bonus')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
