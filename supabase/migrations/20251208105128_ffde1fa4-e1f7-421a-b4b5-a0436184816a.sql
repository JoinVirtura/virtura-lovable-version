-- Phase 2: Add trial columns to creator_subscriptions table
ALTER TABLE public.creator_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_used boolean DEFAULT false;

-- Update platform_fee_percentage default to 10% (ensure consistency)
ALTER TABLE public.creator_accounts 
ALTER COLUMN platform_fee_percentage SET DEFAULT 10.00;

-- Update any existing accounts with 20% to 10%
UPDATE public.creator_accounts 
SET platform_fee_percentage = 10.00 
WHERE platform_fee_percentage = 20.00;