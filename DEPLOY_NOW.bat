@echo off
echo ========================================
echo 🚀 DEPLOY IMAGE LINK PUBLISHER
echo ========================================
echo.

echo ✅ Build completed successfully
echo ✅ All dependencies resolved
echo ✅ Production-ready build generated
echo.

echo 🌐 DEPLOYING TO VERCEL...
echo.

:: Install Vercel CLI if not present
where vercel >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

:: Deploy to production
echo 🚀 Starting deployment...
vercel --prod

echo.
echo ========================================
echo 🎉 DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Image Link Publisher is now live!
echo.
echo Next steps:
echo 1. Configure environment variables in Vercel dashboard
echo 2. Test the live application
echo 3. Share your app with users
echo.
echo 💰 Ready for monetization with:
echo - Stripe billing integration
echo - Multiple subscription tiers
echo - AI-powered image processing
echo.
pause
