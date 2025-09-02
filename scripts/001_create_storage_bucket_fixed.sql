-- Updated script with proper error handling and IF NOT EXISTS checks
-- Create storage bucket for images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
SELECT 'images', 'images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'images'
);

-- Create policy for public access to images (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
  END IF;
END $$;

-- Create policy for authenticated uploads (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Create policy for users to delete their own images (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete own images'
  ) THEN
    CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
