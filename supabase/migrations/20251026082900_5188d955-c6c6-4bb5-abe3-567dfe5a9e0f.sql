-- Create voice_clones table for user-created custom voices
CREATE TABLE IF NOT EXISTS public.voice_clones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'elevenlabs',
  audio_samples TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voice_clones ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own cloned voices" ON public.voice_clones;
CREATE POLICY "Users can view their own cloned voices"
  ON public.voice_clones
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own cloned voices" ON public.voice_clones;
CREATE POLICY "Users can create their own cloned voices"
  ON public.voice_clones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cloned voices" ON public.voice_clones;
CREATE POLICY "Users can update their own cloned voices"
  ON public.voice_clones
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cloned voices" ON public.voice_clones;
CREATE POLICY "Users can delete their own cloned voices"
  ON public.voice_clones
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_voice_clones_updated_at ON public.voice_clones;
CREATE TRIGGER update_voice_clones_updated_at
  BEFORE UPDATE ON public.voice_clones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_voice_clones_user_id ON public.voice_clones(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_clones_voice_id ON public.voice_clones(voice_id);
