-- Fix storage bucket policies with proper folder structure
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Create more permissive policies for testing
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars bucket" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to avatars bucket"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to view avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to view avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to update avatars"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete avatars"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
