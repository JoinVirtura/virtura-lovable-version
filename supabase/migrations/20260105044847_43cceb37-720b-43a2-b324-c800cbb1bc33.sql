-- Fix SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.marketplace_campaigns_public;
CREATE VIEW public.marketplace_campaigns_public 
WITH (security_invoker = true) AS
SELECT 
  id, brand_id, title, description, requirements, 
  deliverables, deadline, status, visibility,
  created_at, updated_at
FROM marketplace_campaigns
WHERE visibility = 'public';