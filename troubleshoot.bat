@echo off
echo ========================================
echo Image Link Publisher - Troubleshooting
echo ========================================
echo.

echo 1. Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo 2. Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

echo.
echo 3. Checking if port 3000 is in use...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use
    echo Killing processes on port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
)

echo.
echo 4. Cleaning up old installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo.
echo 5. Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    echo Trying with --force flag...
    npm install --force
)

echo.
echo 6. Checking environment file...
if not exist .env.local (
    echo ERROR: .env.local file not found
    pause
    exit /b 1
) else (
    echo .env.local file exists
)

echo.
echo 7. Starting development server...
echo Opening browser in 10 seconds...
start "" cmd /c "timeout /t 10 >nul && start http://localhost:3000"
npm run dev

pause
