-- Updated script with IF NOT EXISTS checks and better error handling
-- Create uploaded_images table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS uploaded_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_id (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_uploaded_images_session_id ON uploaded_images(session_id);

-- Create index on user_id (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON uploaded_images(user_id);

-- Create index on created_at (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON uploaded_images(created_at);

-- Enable RLS
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own images (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'uploaded_images' 
    AND policyname = 'Users can view own images'
  ) THEN
    CREATE POLICY "Users can view own images" ON uploaded_images FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create policy for public access to images by session (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'uploaded_images' 
    AND policyname = 'Anyone can view uploaded images'
  ) THEN
    CREATE POLICY "Anyone can view uploaded images" ON uploaded_images FOR SELECT USING (true);
  END IF;
END $$;

-- Create policy for authenticated users to insert images (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'uploaded_images' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images" ON uploaded_images FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create policy for users to update their own images (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'uploaded_images' 
    AND policyname = 'Users can update own images'
  ) THEN
    CREATE POLICY "Users can update own images" ON uploaded_images FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
