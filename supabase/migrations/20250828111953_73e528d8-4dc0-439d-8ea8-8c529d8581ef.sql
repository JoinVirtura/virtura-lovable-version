-- Create table for saved avatar variants in library
CREATE TABLE public.avatar_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  title TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.avatar_library ENABLE ROW LEVEL SECURITY;

-- Create policies for avatar library
CREATE POLICY "Users can view their own library items" 
ON public.avatar_library 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own library items" 
ON public.avatar_library 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own library items" 
ON public.avatar_library 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own library items" 
ON public.avatar_library 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_avatar_library_updated_at
BEFORE UPDATE ON public.avatar_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();