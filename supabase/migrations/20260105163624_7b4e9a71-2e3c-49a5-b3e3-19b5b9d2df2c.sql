-- Update handle_new_user to never break signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'User'),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_logs (error_type, error_message, error_stack, context)
    VALUES (
      'auth_signup_trigger',
      SQLERRM,
      SQLSTATE,
      jsonb_build_object('function', 'handle_new_user', 'user_id', NEW.id, 'email', NEW.email)
    );
  END;
  RETURN NEW;
END;
$function$;

-- Update create_default_notification_preferences to never break signup
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_logs (error_type, error_message, error_stack, context)
    VALUES (
      'auth_signup_trigger',
      SQLERRM,
      SQLSTATE,
      jsonb_build_object('function', 'create_default_notification_preferences', 'user_id', NEW.id, 'email', NEW.email)
    );
  END;
  RETURN NEW;
END;
$function$;

-- Update initialize_user_tokens to never break signup
CREATE OR REPLACE FUNCTION public.initialize_user_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
    VALUES (NEW.id, 50, 50)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.token_transactions (user_id, amount, transaction_type, metadata)
    VALUES (NEW.id, 50, 'bonus', '{"reason": "signup_bonus"}'::jsonb);
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

-- Update initialize_trial_on_signup to never break signup
CREATE OR REPLACE FUNCTION public.initialize_trial_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_trial_days integer := 7;
BEGIN
  BEGIN
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
      NOW() + (v_trial_days || ' days')::INTERVAL,
      false,
      'pro'
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.error_logs (error_type, error_message, error_stack, context)
    VALUES (
      'auth_signup_trigger',
      SQLERRM,
      SQLSTATE,
      jsonb_build_object('function', 'initialize_trial_on_signup', 'user_id', NEW.id, 'email', NEW.email)
    );
  END;
  RETURN NEW;
END;
$function$;

-- Update credit_signup_bonus to never break signup
CREATE OR REPLACE FUNCTION public.credit_signup_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
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
      '{"description": "Welcome bonus - 50 free tokens", "auto_credited": true}'::jsonb
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