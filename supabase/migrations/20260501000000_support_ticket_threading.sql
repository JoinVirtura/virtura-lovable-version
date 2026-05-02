-- Add generation-context fields to support_tickets so users can attach a
-- specific image/video to a complaint, and so admins know what to credit.
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS prompt text,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS credited_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credited_at timestamp with time zone;

-- Threaded replies between user and admin.
-- A ticket starts with the user's `description` as the first message; subsequent
-- back-and-forth lives here so we keep one canonical conversation log.
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  credited_amount integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_id_idx
  ON public.support_ticket_messages (ticket_id, created_at);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: ticket owner OR admin
CREATE POLICY "support_ticket_messages_select"
  ON public.support_ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets st
      WHERE st.id = ticket_id AND st.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT: ticket owner posting on their own ticket, OR admin posting on any ticket.
-- author_id must match the caller (no impersonation).
CREATE POLICY "support_ticket_messages_insert"
  ON public.support_ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      (
        is_admin = false
        AND EXISTS (
          SELECT 1 FROM public.support_tickets st
          WHERE st.id = ticket_id AND st.user_id = auth.uid()
        )
      )
      OR (
        is_admin = true
        AND EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
      )
    )
  );
