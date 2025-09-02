@echo off
echo ========================================
echo Image Link Publisher - Installation Fix
echo ========================================
echo.
echo Fixing dependency conflicts and installing...
echo.

REM Delete node_modules and package-lock.json to start fresh
if exist node_modules (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

if exist pnpm-lock.yaml (
    echo Removing pnpm-lock.yaml...
    del pnpm-lock.yaml
)

echo.
echo Installing dependencies with npm...
npm install

echo.
echo Starting development server...
npm run dev

echo.
echo ========================================
echo Your app should now be running at:
echo http://localhost:3000
echo ========================================
pause
