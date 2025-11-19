-- Update initialize_trial_on_signup to integrate with A/B testing
CREATE OR REPLACE FUNCTION public.initialize_trial_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trial_days integer := 7;
  v_trial_response jsonb;
BEGIN
  -- Call assign-trial-experiment edge function to get A/B test variant
  BEGIN
    SELECT content::jsonb INTO v_trial_response
    FROM net.http_post(
      url := 'https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/assign-trial-experiment',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU"}'::jsonb,
      body := json_build_object('userId', NEW.id)::jsonb
    );
    
    -- Extract trialDays from response
    IF v_trial_response IS NOT NULL AND v_trial_response->>'trialDays' IS NOT NULL THEN
      v_trial_days := (v_trial_response->>'trialDays')::integer;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If experiment assignment fails, use default 7 days and log error
    RAISE WARNING 'Failed to assign trial experiment for user %, using default 7 days: %', NEW.id, SQLERRM;
    v_trial_days := 7;
  END;

  -- Insert trial subscription with assigned trial duration
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
  
  RETURN NEW;
END;
$$;