@echo off
echo ========================================
echo Clearing Next.js Cache and Restarting
echo ========================================
echo.

echo Stopping any running servers...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Clearing Next.js cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Clearing npm cache...
npm cache clean --force

echo.
echo Restarting development server...
npm run dev

pause
