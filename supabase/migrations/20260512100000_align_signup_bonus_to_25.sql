-- Align signup welcome bonus to 25 tokens.
--
-- Previously the credit_signup_bonus function granted 50 tokens, but the
-- WelcomeModal and 20260417020000_set_signup_tokens_to_25.sql migration both
-- expected 25. The earlier "tokens_to_25" migration patched a now-dropped
-- function (initialize_user_tokens), so it had no effect. This migration
-- updates the function that actually fires (credit_signup_bonus) and brings
-- the three sources of truth (DB, modal, email templates) in sync at 25.

CREATE OR REPLACE FUNCTION public.credit_signup_bonus()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.token_transactions
      WHERE user_id = NEW.id
        AND transaction_type = 'bonus'
        AND (resource_type = 'signup_bonus' OR metadata->>'reason' = 'signup_bonus')
    ) THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased, lifetime_used)
    VALUES (NEW.id, 25, 25, 0)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.token_transactions (
      user_id, amount, transaction_type, resource_type, metadata
    ) VALUES (
      NEW.id, 25, 'bonus', 'signup_bonus',
      '{"description": "Welcome bonus - 25 free tokens", "auto_credited": true, "reason": "signup_bonus"}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_logs (error_type, error_message, error_stack, context)
    VALUES (
      'auth_signup_trigger', SQLERRM, SQLSTATE,
      jsonb_build_object('function', 'credit_signup_bonus', 'user_id', NEW.id, 'email', NEW.email)
    );
  END;
  RETURN NEW;
END;
$function$;
