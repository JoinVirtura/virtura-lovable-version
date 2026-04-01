-- Feature waitlist for "Coming Soon" early access signups
CREATE TABLE IF NOT EXISTS public.feature_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  feature_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(email, feature_id)
);

-- Enable RLS
ALTER TABLE public.feature_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can insert (sign up for waitlist)
CREATE POLICY "Users can join waitlist" ON public.feature_waitlist
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow anonymous inserts too (in case we want non-logged-in signups)
CREATE POLICY "Anon can join waitlist" ON public.feature_waitlist
  FOR INSERT TO anon
  WITH CHECK (true);

-- Users can see their own waitlist entries
CREATE POLICY "Users can view own waitlist entries" ON public.feature_waitlist
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all waitlist entries" ON public.feature_waitlist
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
