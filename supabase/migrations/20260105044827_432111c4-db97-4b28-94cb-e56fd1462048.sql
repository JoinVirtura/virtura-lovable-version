-- Create auth_attempts table for tracking login/signup attempts
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'signup')),
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created_at ON public.auth_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON public.auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_type_success ON public.auth_attempts(attempt_type, success);

-- RLS: Admin-only access
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view auth attempts" ON public.auth_attempts;
CREATE POLICY "Admins can view auth attempts"
ON public.auth_attempts
FOR SELECT
USING (public.is_admin());

-- Allow edge function to insert (service role)
DROP POLICY IF EXISTS "Service role can insert auth attempts" ON public.auth_attempts;
CREATE POLICY "Service role can insert auth attempts"
ON public.auth_attempts
FOR INSERT
WITH CHECK (true);
