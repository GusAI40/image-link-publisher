-- Create a table to track uploaded images and their metadata
-- This helps us generate descriptions and manage the uploaded files
CREATE TABLE IF NOT EXISTS public.uploaded_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  description TEXT,
  upload_session_id TEXT NOT NULL, -- Track which upload session this belongs to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE public.uploaded_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public image sharing tool)
-- Anyone can view uploaded images
CREATE POLICY "Anyone can view uploaded images" 
  ON public.uploaded_images FOR SELECT 
  USING (true);

-- Anyone can insert new image records
CREATE POLICY "Anyone can upload images" 
  ON public.uploaded_images FOR INSERT 
  WITH CHECK (true);

-- Create an index for faster queries by session
CREATE INDEX IF NOT EXISTS idx_uploaded_images_session 
  ON public.uploaded_images(upload_session_id);

-- Create an index for faster queries by creation date
CREATE INDEX IF NOT EXISTS idx_uploaded_images_created 
  ON public.uploaded_images(created_at DESC);
