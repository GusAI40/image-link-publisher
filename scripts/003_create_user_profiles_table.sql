-- Create user profiles table for managing user accounts and subscription data
-- This table extends Supabase auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  images_uploaded INTEGER NOT NULL DEFAULT 0,
  images_limit INTEGER NOT NULL DEFAULT 50, -- Free plan limit
  subscription_status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profile access
-- Users can only view and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_profiles_plan 
  ON public.user_profiles(plan_type);

-- Create a trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the uploaded_images table to reference user_id properly
ALTER TABLE public.uploaded_images 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Create index for user_id in uploaded_images
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id 
  ON public.uploaded_images(user_id);

-- Update RLS policies for uploaded_images to be user-specific
DROP POLICY IF EXISTS "Anyone can view uploaded images" ON public.uploaded_images;
DROP POLICY IF EXISTS "Anyone can upload images" ON public.uploaded_images;

-- Users can only view their own uploaded images
CREATE POLICY "Users can view own images" 
  ON public.uploaded_images FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own images
CREATE POLICY "Users can insert own images" 
  ON public.uploaded_images FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own images" 
  ON public.uploaded_images FOR DELETE 
  USING (auth.uid() = user_id);
