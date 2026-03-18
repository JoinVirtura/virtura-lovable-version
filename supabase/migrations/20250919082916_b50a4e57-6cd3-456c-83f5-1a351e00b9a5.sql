-- Drop the existing overly broad policy
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- Create more granular policies for better security
-- Users can only SELECT their own subscription data
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can only INSERT their own subscription data (typically done via webhooks)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own subscription data (typically done via webhooks)
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users cannot DELETE subscription data (only service role should do this)
DROP POLICY IF EXISTS "Users cannot delete subscriptions" ON public.subscriptions;
CREATE POLICY "Users cannot delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (false);

-- Service role can manage all subscriptions (for webhook operations)
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage all subscriptions"
ON public.subscriptions
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add a function to safely check subscription status without exposing sensitive data
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(
  has_active_subscription boolean,
  plan_name text,
  status text,
  current_period_end timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE WHEN s.status = 'active' AND s.plan_name IS NOT NULL THEN true ELSE false END as has_active_subscription,
    COALESCE(s.plan_name, 'free') as plan_name,
    COALESCE(s.status, 'inactive') as status,
    s.current_period_end
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid
  LIMIT 1;
$$;
