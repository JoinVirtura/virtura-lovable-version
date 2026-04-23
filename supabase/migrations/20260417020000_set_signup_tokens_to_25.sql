-- Set free signup tokens to 25 (final launch value)

CREATE OR REPLACE FUNCTION public.initialize_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
  VALUES (NEW.id, 25, 25);

  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    resource_type,
    metadata
  ) VALUES (
    NEW.id,
    25,
    'bonus',
    'welcome_bonus',
    jsonb_build_object('reason', 'New user welcome bonus')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
