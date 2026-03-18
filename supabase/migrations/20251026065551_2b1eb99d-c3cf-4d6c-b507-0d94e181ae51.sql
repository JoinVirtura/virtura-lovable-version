-- Fix subscriptions table RLS policies to prevent user manipulation
-- Users should only be able to READ their subscription, not INSERT/UPDATE
-- Only the service role (webhooks) should be able to modify subscriptions

-- Drop the permissive INSERT and UPDATE policies
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

-- Keep the SELECT policy (already exists, but recreate for clarity)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Keep the service role policy (already exists)
-- CREATE POLICY "Service role can manage all subscriptions"
-- ON public.subscriptions FOR ALL
-- USING ((auth.jwt() ->> 'role') = 'service_role');

-- Keep the DELETE restriction (already exists)
-- CREATE POLICY "Users cannot delete subscriptions"
-- ON public.subscriptions FOR DELETE
-- USING (false);
