-- Fix uploaded_images table schema to match API expectations
-- Add missing columns and fix column names

-- First, check if we need to add the original_name column
ALTER TABLE uploaded_images 
ADD COLUMN IF NOT EXISTS original_name TEXT;

-- Update existing records to have original_name if missing
UPDATE uploaded_images 
SET original_name = filename 
WHERE original_name IS NULL;

-- Make original_name NOT NULL after updating
ALTER TABLE uploaded_images 
ALTER COLUMN original_name SET NOT NULL;

-- Check current schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'uploaded_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;
