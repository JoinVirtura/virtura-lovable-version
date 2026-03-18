-- Create avatars storage bucket for photo uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create talking_avatars table to store avatar metadata and provider IDs
CREATE TABLE IF NOT EXISTS public.talking_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_image_url TEXT NOT NULL,
  heygen_talking_photo_id TEXT,
  krea_avatar_id TEXT,
  kling_avatar_id TEXT,
  runwayml_avatar_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on talking_avatars
ALTER TABLE public.talking_avatars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for talking_avatars
DROP POLICY IF EXISTS "Users can view their own talking avatars" ON public.talking_avatars;
CREATE POLICY "Users can view their own talking avatars"
ON public.talking_avatars
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own talking avatars" ON public.talking_avatars;
CREATE POLICY "Users can create their own talking avatars"
ON public.talking_avatars
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own talking avatars" ON public.talking_avatars;
CREATE POLICY "Users can update their own talking avatars"
ON public.talking_avatars
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own talking avatars" ON public.talking_avatars;
CREATE POLICY "Users can delete their own talking avatars"
ON public.talking_avatars
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_talking_avatars_updated_at ON public.talking_avatars;
CREATE TRIGGER update_talking_avatars_updated_at
BEFORE UPDATE ON public.talking_avatars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
