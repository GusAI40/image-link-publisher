-- Create bypass RLS policy for stress testing
-- This allows all operations without authentication checks

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own images" ON uploaded_images;
DROP POLICY IF EXISTS "Users can update own images" ON uploaded_images;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON uploaded_images;

-- Create permissive policy for testing
CREATE POLICY "Allow all for testing" 
ON uploaded_images 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'uploaded_images';
