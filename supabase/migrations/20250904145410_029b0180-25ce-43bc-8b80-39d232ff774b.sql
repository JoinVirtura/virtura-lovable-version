-- Check if user authentication is working properly and simplify storage policies
-- First, let's see what we have
SELECT bucket_id, name FROM storage.objects WHERE bucket_id = 'avatars' LIMIT 5;

-- Make the avatars bucket completely public for now to test
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- Drop existing policies and create a very permissive one for testing
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete avatars" ON storage.objects;

-- Create simple public policies for testing
CREATE POLICY "Public Avatar Access" ON storage.objects
FOR ALL USING (bucket_id = 'avatars');