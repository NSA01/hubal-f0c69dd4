-- Allow authenticated users to upload images for room designs
CREATE POLICY "Authenticated users can upload room design images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'designer-images');