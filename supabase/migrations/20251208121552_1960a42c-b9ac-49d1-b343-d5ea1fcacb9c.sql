-- Create marketplace_contracts table
CREATE TABLE IF NOT EXISTS public.marketplace_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.marketplace_campaigns(id) ON DELETE CASCADE NOT NULL,
  brand_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  contract_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  creator_payout_cents integer NOT NULL,
  deliverables_summary text,
  deadline timestamptz,
  brand_signed_at timestamptz,
  creator_signed_at timestamptz,
  status text NOT NULL DEFAULT 'pending_brand',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add constraint for status values (idempotent with IF NOT EXISTS on constraint)
DO $$ BEGIN
  ALTER TABLE public.marketplace_contracts
  ADD CONSTRAINT marketplace_contracts_status_check
  CHECK (status IN ('draft', 'pending_brand', 'pending_creator', 'signed', 'cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create unique constraint on campaign_id (one contract per campaign)
CREATE UNIQUE INDEX IF NOT EXISTS marketplace_contracts_campaign_id_idx ON public.marketplace_contracts(campaign_id);

-- Enable RLS
ALTER TABLE public.marketplace_contracts ENABLE ROW LEVEL SECURITY;

-- Brands can view contracts for their campaigns
DROP POLICY IF EXISTS "Brands can view their contracts" ON public.marketplace_contracts;
CREATE POLICY "Brands can view their contracts"
ON public.marketplace_contracts
FOR SELECT
USING (
  brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  )
);

-- Creators can view contracts they're part of
DROP POLICY IF EXISTS "Creators can view their contracts" ON public.marketplace_contracts;
CREATE POLICY "Creators can view their contracts"
ON public.marketplace_contracts
FOR SELECT
USING (
  creator_id IN (
    SELECT id FROM public.creator_accounts WHERE user_id = auth.uid()
  )
);

-- Brands can update contracts (for signing)
DROP POLICY IF EXISTS "Brands can update their contracts" ON public.marketplace_contracts;
CREATE POLICY "Brands can update their contracts"
ON public.marketplace_contracts
FOR UPDATE
USING (
  brand_id IN (
    SELECT id FROM public.brands WHERE user_id = auth.uid()
  )
);

-- Creators can update contracts (for signing)
DROP POLICY IF EXISTS "Creators can update their contracts" ON public.marketplace_contracts;
CREATE POLICY "Creators can update their contracts"
ON public.marketplace_contracts
FOR UPDATE
USING (
  creator_id IN (
    SELECT id FROM public.creator_accounts WHERE user_id = auth.uid()
  )
);

-- Service role can manage all contracts (for edge functions)
DROP POLICY IF EXISTS "Service role can manage contracts" ON public.marketplace_contracts;
CREATE POLICY "Service role can manage contracts"
ON public.marketplace_contracts
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_marketplace_contracts_updated_at ON public.marketplace_contracts;
CREATE TRIGGER update_marketplace_contracts_updated_at
BEFORE UPDATE ON public.marketplace_contracts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
