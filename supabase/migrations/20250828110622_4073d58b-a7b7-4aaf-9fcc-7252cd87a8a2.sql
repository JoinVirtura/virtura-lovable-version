-- Create storage bucket for reference images
INSERT INTO storage.buckets (id, name, public) VALUES ('reference-images', 'reference-images', true);

-- Create policies for reference image uploads
CREATE POLICY "Users can upload reference images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reference-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view reference images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reference-images');

CREATE POLICY "Users can update their own reference images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reference-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own reference images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'reference-images' AND auth.uid() IS NOT NULL);