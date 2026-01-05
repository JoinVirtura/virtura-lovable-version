-- Fix materialized view exposure by revoking public access
REVOKE ALL ON public.notification_ctr_metrics FROM anon, authenticated;

-- Create a security definer function for admin access only
CREATE OR REPLACE FUNCTION public.get_notification_ctr_metrics()
RETURNS TABLE (
  category notification_category,
  priority text,
  date timestamptz,
  total_sent bigint,
  total_read bigint,
  total_clicked bigint,
  open_rate numeric,
  ctr numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT category, priority, date, total_sent, total_read, total_clicked, open_rate, ctr
  FROM public.notification_ctr_metrics
  WHERE public.is_admin();
$$;