-- A1. Dedupe existing signup bonus transactions - keep only the earliest one per user
WITH ranked_bonuses AS (
  SELECT id, user_id, created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC, id ASC) as rn
  FROM public.token_transactions
  WHERE transaction_type = 'bonus'
    AND (resource_type = 'signup_bonus' OR metadata->>'reason' = 'signup_bonus')
)
DELETE FROM public.token_transactions
WHERE id IN (
  SELECT id FROM ranked_bonuses WHERE rn > 1
);

-- A2. Make credit_signup_bonus idempotent to prevent future duplicates
CREATE OR REPLACE FUNCTION public.credit_signup_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    -- Check if user already has a signup bonus transaction
    IF EXISTS (
      SELECT 1 FROM public.token_transactions
      WHERE user_id = NEW.id
        AND transaction_type = 'bonus'
        AND (resource_type = 'signup_bonus' OR metadata->>'reason' = 'signup_bonus')
    ) THEN
      -- Already has signup bonus, skip
      RETURN NEW;
    END IF;

    INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased, lifetime_used)
    VALUES (NEW.id, 50, 50, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
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
      '{"description": "Welcome bonus - 50 free tokens", "auto_credited": true, "reason": "signup_bonus"}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_logs (error_type, error_message, error_stack, context)
    VALUES (
      'auth_signup_trigger',
      SQLERRM,
      SQLSTATE,
      jsonb_build_object('function', 'credit_signup_bonus', 'user_id', NEW.id, 'email', NEW.email)
    );
  END;
  RETURN NEW;
END;
$function$;

-- Also make initialize_user_tokens idempotent
CREATE OR REPLACE FUNCTION public.initialize_user_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    -- Check if user already has a signup bonus transaction (from credit_signup_bonus)
    IF EXISTS (
      SELECT 1 FROM public.token_transactions
      WHERE user_id = NEW.id
        AND transaction_type = 'bonus'
        AND (resource_type = 'signup_bonus' OR metadata->>'reason' = 'signup_bonus')
    ) THEN
      -- Already credited, just ensure user_tokens row exists
      INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
      VALUES (NEW.id, 50, 50)
      ON CONFLICT (user_id) DO NOTHING;
      RETURN NEW;
    END IF;

    INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
    VALUES (NEW.id, 50, 50)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, resource_type, metadata)
    VALUES (NEW.id, 50, 'bonus', 'signup_bonus', '{"reason": "signup_bonus"}'::jsonb);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_logs (error_type, error_message, error_stack, context)
    VALUES (
      'auth_signup_trigger',
      SQLERRM,
      SQLSTATE,
      jsonb_build_object('function', 'initialize_user_tokens', 'user_id', NEW.id, 'email', NEW.email)
    );
  END;
  RETURN NEW;
END;
$function$;