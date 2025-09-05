-- Update the status check constraint to include 'failed' status
ALTER TABLE public.talking_avatars 
DROP CONSTRAINT talking_avatars_status_check;

ALTER TABLE public.talking_avatars 
ADD CONSTRAINT talking_avatars_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'error'::text, 'failed'::text]));