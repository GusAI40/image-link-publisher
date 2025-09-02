@echo off
echo ========================================
echo Image Link Publisher - Critical Fixes
echo ========================================
echo.

echo 1. Stopping development server...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 2. Clearing Next.js cache completely...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 3. IMPORTANT: Run this SQL script in Supabase:
echo    scripts/005_fix_uploaded_images_table.sql
echo.
echo    This fixes the missing user_id column error.
echo.

echo 4. Restarting server...
npm run dev

pause
