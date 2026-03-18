-- Create storage bucket for talking avatar pipeline
INSERT INTO storage.buckets (id, name, public) VALUES ('virtura-media', 'virtura-media', true) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for virtura-media bucket
DROP POLICY IF EXISTS "Public read access for virtura-media" ON storage.objects;
CREATE POLICY "Public read access for virtura-media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'virtura-media');

DROP POLICY IF EXISTS "Authenticated users can upload to virtura-media" ON storage.objects;
CREATE POLICY "Authenticated users can upload to virtura-media"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'virtura-media' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own files in virtura-media" ON storage.objects;
CREATE POLICY "Users can update their own files in virtura-media"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'virtura-media' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete their own files in virtura-media" ON storage.objects;
CREATE POLICY "Users can delete their own files in virtura-media"
ON storage.objects
FOR DELETE
USING (bucket_id = 'virtura-media' AND auth.uid() IS NOT NULL);
