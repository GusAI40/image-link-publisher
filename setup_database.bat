@echo off
echo ========================================
echo Image Link Publisher - Database Setup
echo ========================================
echo.
echo Your environment variables are configured!
echo Supabase URL: https://emtwbizmorqwhboebgzw.supabase.co
echo.
echo NEXT STEPS:
echo.
echo 1. Go to your Supabase Dashboard:
echo    https://supabase.com/dashboard/project/emtwbizmorqwhboebgzw
echo.
echo 2. Click "SQL Editor" in the left sidebar
echo.
echo 3. Run these SQL scripts IN ORDER:
echo    - scripts/001_create_storage_bucket.sql
echo    - scripts/002_create_images_table.sql  
echo    - scripts/003_create_user_profiles_table.sql
echo    - scripts/004_create_analytics_tables.sql
echo.
echo 4. Install dependencies and start the app:
echo    npm install
echo    npm run dev
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo ========================================
echo Your Image Link Publisher is READY! 🚀
echo ========================================
pause
