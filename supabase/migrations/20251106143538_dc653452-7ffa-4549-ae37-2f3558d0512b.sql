-- Create user_tokens table to track token balances
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create token_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  resource_type TEXT,
  resource_id UUID,
  cost_usd NUMERIC(10, 4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own token balance"
  ON public.user_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all token balances"
  ON public.user_tokens FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- RLS Policies for token_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
  ON public.token_transactions FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Create indexes for performance
CREATE INDEX idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_created_at ON public.token_transactions(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_user_tokens_updated_at
  BEFORE UPDATE ON public.user_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user tokens on signup
CREATE OR REPLACE FUNCTION public.initialize_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
  VALUES (NEW.id, 50, 50); -- Give 50 free tokens on signup
  
  INSERT INTO public.token_transactions (user_id, amount, transaction_type, metadata)
  VALUES (NEW.id, 50, 'bonus', '{"reason": "signup_bonus"}'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to initialize tokens for new users
CREATE TRIGGER on_auth_user_created_tokens
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_tokens();

-- Function to deduct tokens (atomic operation)
CREATE OR REPLACE FUNCTION public.deduct_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_cost_usd NUMERIC DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Lock the row and get current balance
  SELECT balance INTO v_current_balance
  FROM public.user_tokens
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user has enough tokens
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct tokens
  UPDATE public.user_tokens
  SET 
    balance = balance - p_amount,
    lifetime_used = lifetime_used + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, 
    amount, 
    transaction_type, 
    resource_type, 
    resource_id,
    cost_usd,
    metadata
  )
  VALUES (
    p_user_id, 
    -p_amount, 
    'usage', 
    p_resource_type,
    p_resource_id,
    p_cost_usd,
    p_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to add tokens (for purchases)
CREATE OR REPLACE FUNCTION public.add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'purchase',
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update balance
  INSERT INTO public.user_tokens (user_id, balance, lifetime_purchased)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_tokens.balance + p_amount,
    lifetime_purchased = user_tokens.lifetime_purchased + p_amount,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, 
    amount, 
    transaction_type,
    metadata
  )
  VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type,
    p_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;