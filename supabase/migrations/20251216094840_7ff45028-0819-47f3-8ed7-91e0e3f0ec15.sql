-- Create library_folders table for simple folder organization
CREATE TABLE IF NOT EXISTS public.library_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add folder_id column to avatar_library
ALTER TABLE public.avatar_library
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.library_folders(id) ON DELETE SET NULL;

-- Enable RLS on library_folders
ALTER TABLE public.library_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for library_folders
DROP POLICY IF EXISTS "Users can view their own folders" ON public.library_folders;
CREATE POLICY "Users can view their own folders"
ON public.library_folders FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own folders" ON public.library_folders;
CREATE POLICY "Users can create their own folders"
ON public.library_folders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own folders" ON public.library_folders;
CREATE POLICY "Users can update their own folders"
ON public.library_folders FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own folders" ON public.library_folders;
CREATE POLICY "Users can delete their own folders"
ON public.library_folders FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster folder lookups
CREATE INDEX IF NOT EXISTS idx_avatar_library_folder_id ON public.avatar_library(folder_id);
CREATE INDEX IF NOT EXISTS idx_library_folders_user_id ON public.library_folders(user_id);
