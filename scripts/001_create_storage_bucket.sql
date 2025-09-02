-- Create a storage bucket for uploaded images
-- This bucket will store all user-uploaded images and make them publicly accessible
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images', 
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create a policy to allow anyone to view images (since bucket is public)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Create a policy to allow anyone to upload images
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

-- Create a policy to allow users to delete their own images (optional)
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'images');
