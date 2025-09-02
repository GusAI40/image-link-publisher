-- Check all uploaded images and their description status
SELECT 
  id,
  original_name,
  CASE 
    WHEN description IS NULL THEN 'NULL'
    WHEN description = '' THEN 'EMPTY'
    WHEN LENGTH(description) > 0 THEN 'HAS_DESCRIPTION (' || LENGTH(description) || ' chars)'
    ELSE 'UNKNOWN'
  END as description_status,
  created_at,
  user_id
FROM public.uploaded_images 
ORDER BY created_at DESC 
LIMIT 15;
