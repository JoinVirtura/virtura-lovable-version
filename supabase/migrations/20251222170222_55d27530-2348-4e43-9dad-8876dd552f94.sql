-- Drop the non-functional trial_analytics_summary view
-- It references tables that don't exist (trial_experiment_variants)
DROP VIEW IF EXISTS public.trial_analytics_summary;