-- Check if descriptions are being saved to database
SELECT 
  id,
  original_name,
  description,
  created_at
FROM public.uploaded_images 
ORDER BY created_at DESC 
LIMIT 10;
