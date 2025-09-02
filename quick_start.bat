@echo off
echo ========================================
echo Image Link Publisher - Quick Start
echo ========================================
echo.

echo Checking if Next.js is installed...
if not exist node_modules\next (
    echo Installing dependencies...
    npm install --legacy-peer-deps
)

echo.
echo Starting development server...
echo.
echo Your app will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npm run dev
