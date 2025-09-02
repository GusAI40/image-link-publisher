-- Add billing-related columns to user_profiles table
-- These columns track Stripe customer and subscription information

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS customer_id TEXT, -- Stripe customer ID
ADD COLUMN IF NOT EXISTS subscription_id TEXT, -- Stripe subscription ID
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'incomplete'));

-- Update existing users to have proper plan limits based on their plan_type
UPDATE user_profiles 
SET images_limit = CASE 
  WHEN plan_type = 'free' THEN 100
  WHEN plan_type = 'basic' THEN 1000
  WHEN plan_type = 'professional' THEN 10000
  WHEN plan_type = 'enterprise' THEN 999999
  ELSE 100
END
WHERE images_limit IS NULL OR images_limit = 0;

-- Create indexes for better performance on billing queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_customer_id ON user_profiles(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id ON user_profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_type ON user_profiles(plan_type);
