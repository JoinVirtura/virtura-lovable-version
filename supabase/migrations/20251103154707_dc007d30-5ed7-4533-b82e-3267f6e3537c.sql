-- Add privacy and security settings columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS content_visibility_default text DEFAULT 'private' CHECK (content_visibility_default IN ('private', 'unlisted', 'public')),
ADD COLUMN IF NOT EXISTS library_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_training_opt_in boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_delete_old_projects boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS save_voice_clones boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS download_protection boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.content_visibility_default IS 'Default visibility setting for newly created avatars and videos';
COMMENT ON COLUMN public.profiles.library_public IS 'Whether the user library is publicly viewable';
COMMENT ON COLUMN public.profiles.ai_training_opt_in IS 'Whether user consents to their content being used for AI training';
COMMENT ON COLUMN public.profiles.auto_delete_old_projects IS 'Whether to automatically delete projects older than 90 days';
COMMENT ON COLUMN public.profiles.save_voice_clones IS 'Whether to keep voice clones in library after generation';
COMMENT ON COLUMN public.profiles.download_protection IS 'Whether to add download protection to shared content';