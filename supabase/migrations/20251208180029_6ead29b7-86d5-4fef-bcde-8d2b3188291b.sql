-- Add RLS policies for admin operations on marketplace_access table

-- Allow admins to view all marketplace access requests
DROP POLICY IF EXISTS "Admins can view all marketplace access" ON public.marketplace_access;
CREATE POLICY "Admins can view all marketplace access"
ON public.marketplace_access
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Allow admins to update marketplace access (approve/deny)
DROP POLICY IF EXISTS "Admins can update marketplace access" ON public.marketplace_access;
CREATE POLICY "Admins can update marketplace access"
ON public.marketplace_access
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));
