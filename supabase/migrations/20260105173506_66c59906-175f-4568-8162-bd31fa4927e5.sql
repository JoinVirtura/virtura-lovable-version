-- Add admin read policy for token_transactions
CREATE POLICY "Admins can view all token transactions"
ON public.token_transactions
FOR SELECT
USING (public.is_admin());

-- Add admin read policy for user_tokens
CREATE POLICY "Admins can view all user tokens"
ON public.user_tokens
FOR SELECT
USING (public.is_admin());