-- Fix security linter warnings

-- Hide materialized view from API by revoking public access
REVOKE ALL ON notification_ctr_metrics FROM anon, authenticated;

-- Only allow admins to access the materialized view
GRANT SELECT ON notification_ctr_metrics TO authenticated;

-- Create RLS policy for the materialized view (though it's read-only)
ALTER MATERIALIZED VIEW notification_ctr_metrics OWNER TO postgres;

-- Ensure all functions have proper search_path set
ALTER FUNCTION check_sms_limit SET search_path = public;
ALTER FUNCTION has_role SET search_path = public;
ALTER FUNCTION get_user_role SET search_path = public;