-- Fix critical RLS security issues

-- 1. Fix usage_tracking table - prevent users from deleting/updating their usage records
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;

-- Users can only view their usage (read-only)
CREATE POLICY "Users can view own usage"
ON public.usage_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert usage records
CREATE POLICY "Service role can insert usage"
ON public.usage_tracking
FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Block all user updates and deletes
CREATE POLICY "No user updates on usage"
ON public.usage_tracking
FOR UPDATE
USING (false);

CREATE POLICY "No user deletes on usage"
ON public.usage_tracking
FOR DELETE
USING (false);

-- 2. Fix user_roles table - prevent users from self-assigning roles
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;

-- Users can only view their own roles (read-only)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Service role can manage roles (for initial setup and automation)
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);