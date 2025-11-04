-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  issue_type text NOT NULL,
  priority text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  attachment_url text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create feature_suggestions table
CREATE TABLE public.feature_suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  use_case text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  votes integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can insert their own tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update all tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::user_role));

-- RLS Policies for feature_suggestions
CREATE POLICY "Users can insert their own suggestions"
  ON public.feature_suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own suggestions"
  ON public.feature_suggestions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all suggestions"
  ON public.feature_suggestions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update all suggestions"
  ON public.feature_suggestions
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on feature_suggestions
CREATE TRIGGER update_feature_suggestions_updated_at
  BEFORE UPDATE ON public.feature_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();