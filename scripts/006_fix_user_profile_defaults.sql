-- Fix user profile data to prevent NaN values in dashboard
-- This script ensures all users have proper default values

-- First, add missing columns to match the dashboard expectations
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS images_uploaded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS images_limit INTEGER DEFAULT 50;

-- Rename subscription_tier to plan_type if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'user_profiles' 
             AND column_name = 'subscription_tier') THEN
    -- Copy data from subscription_tier to plan_type
    UPDATE public.user_profiles 
    SET plan_type = COALESCE(subscription_tier, 'free')
    WHERE plan_type IS NULL;
  END IF;
END $$;

-- Map monthly uploads to total uploads if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'user_profiles' 
             AND column_name = 'images_uploaded_this_month') THEN
    UPDATE public.user_profiles 
    SET images_uploaded = COALESCE(images_uploaded_this_month, 0)
    WHERE images_uploaded IS NULL;
  END IF;
END $$;

-- Create missing user profiles for existing auth users
INSERT INTO public.user_profiles (id, email, full_name, plan_type, images_uploaded, images_limit, subscription_status)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'free',
  0,
  50,
  'active'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);

-- Update any existing profiles with null or invalid values
UPDATE public.user_profiles 
SET 
  images_uploaded = COALESCE(images_uploaded, 0),
  images_limit = CASE 
    WHEN images_limit IS NULL OR images_limit <= 0 THEN 
      CASE 
        WHEN plan_type = 'free' THEN 50
        WHEN plan_type = 'basic' THEN 1000
        WHEN plan_type = 'premium' THEN 10000
        ELSE 50
      END
    ELSE images_limit
  END,
  plan_type = COALESCE(plan_type, 'free'),
  subscription_status = COALESCE(subscription_status, 'active'),
  email = COALESCE(email, (SELECT email FROM auth.users WHERE auth.users.id = user_profiles.id)),
  updated_at = NOW()
WHERE 
  images_uploaded IS NULL 
  OR images_limit IS NULL 
  OR images_limit <= 0
  OR plan_type IS NULL
  OR subscription_status IS NULL
  OR email IS NULL;

-- Ensure all numeric fields have proper constraints
ALTER TABLE public.user_profiles 
ALTER COLUMN images_uploaded SET NOT NULL,
ALTER COLUMN images_uploaded SET DEFAULT 0,
ALTER COLUMN images_limit SET NOT NULL,
ALTER COLUMN images_limit SET DEFAULT 50;

-- Add check constraints to prevent invalid values
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS check_images_uploaded_positive,
ADD CONSTRAINT check_images_uploaded_positive CHECK (images_uploaded >= 0);

ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS check_images_limit_positive,
ADD CONSTRAINT check_images_limit_positive CHECK (images_limit > 0);
