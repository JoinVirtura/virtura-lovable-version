-- Lower free signup tokens from 30 to 20 to further reduce free-trial abuse exposure.

CREATE OR REPLACE FUNCTION public.initialize_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
  VALUES (NEW.id, 20, 20); -- 20 free tokens on signup

  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    resource_type,
    metadata
  ) VALUES (
    NEW.id,
    20,
    'bonus',
    'welcome_bonus',
    jsonb_build_object('reason', 'New user welcome bonus')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
