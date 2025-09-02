-- Fix the uploaded_images table to add missing user_id column
-- This addresses the database error: "Could not find the 'user_id' column"

-- Add user_id column to existing table
ALTER TABLE public.uploaded_images 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Anyone can view uploaded images" ON public.uploaded_images;
DROP POLICY IF EXISTS "Anyone can upload images" ON public.uploaded_images;

-- Users can view their own images
CREATE POLICY "Users can view own images" 
  ON public.uploaded_images FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own images
CREATE POLICY "Users can insert own images" 
  ON public.uploaded_images FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own images" 
  ON public.uploaded_images FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for user_id for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id 
  ON public.uploaded_images(user_id);
