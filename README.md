# 🖼️ Image Link Publisher

**Turn your images into shareable links in seconds!**

A simple, powerful tool that uploads your images and creates permanent links you can use anywhere on the web. Perfect for sharing images on websites, social media, or anywhere you need a reliable image URL.

---

## ✨ What Does This App Do?

This app helps you:
- **Upload up to 10 images at once** - Just drag and drop!
- **Get permanent links** - Your images stay online forever
- **Generate descriptions** - AI creates helpful descriptions for each image
- **Copy markdown code** - Ready-to-use code for websites and documents
- **Share anywhere** - Links work on any website or platform

---

## 🚀 Quick Start Guide

### Step 1: Set Up Your Project

1. **Download the code**
   - Click the "Download ZIP" button in v0
   - Or push to GitHub and clone your repository

2. **Install everything you need**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up your database**
   - The app uses Supabase (a free database service)
   - Run these commands to create your database tables:
   \`\`\`bash
   # Create storage bucket for images
   npm run db:migrate scripts/001_create_storage_bucket.sql
   
   # Create table to track your images
   npm run db:migrate scripts/002_create_images_table.sql
   \`\`\`

4. **Start the app**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Open your browser and go to `http://localhost:3000`

### Step 2: Upload Your First Images

1. **Drag and drop** your images onto the upload area
   - Or click "Choose Files" to select them
   - You can upload up to 10 images at once
   - Each image can be up to 10MB

2. **Watch the magic happen**
   - Your images upload automatically
   - AI creates descriptions for each image
   - Permanent links are generated

3. **Copy your markdown**
   - Scroll down to see your generated markdown
   - Click "Copy All Markdown" to copy everything
   - Or copy individual image codes

---

## 📖 How to Use Your Image Links

### For Websites (HTML)
\`\`\`html
<img src="https://your-image-link.com/image.jpg" alt="AI generated description">
\`\`\`

### For Markdown Documents
\`\`\`markdown
![AI generated description](https://your-image-link.com/image.jpg)
\`\`\`

### For Social Media
Just paste the link directly - most platforms will show the image automatically!

---

## 🛠️ What's Inside This App

### Main Files You Should Know About

- **`app/page.tsx`** - The main page where users upload images
- **`components/image-upload.tsx`** - The drag-and-drop upload area
- **`components/markdown-output.tsx`** - Shows the generated markdown code
- **`app/api/upload/route.ts`** - Handles saving images to the cloud
- **`app/api/describe-image/route.ts`** - Uses AI to describe images

### Database Tables

- **`uploaded_images`** - Stores information about each uploaded image
- **`storage.objects`** - Supabase's built-in table that holds the actual image files

---

## 🔧 Troubleshooting

### "Upload failed" Error
- **Check your internet connection** - Large images need good internet
- **Try smaller images** - Each image must be under 10MB
- **Check file type** - Only JPG, PNG, GIF, and WebP images work

### "Database connection failed" Error
- **Check your Supabase setup** - Make sure your database is running
- **Run the setup scripts** - You might have missed creating the database tables
- **Check environment variables** - Your database connection info might be wrong

### Images won't load
- **Wait a few seconds** - Sometimes it takes time for images to process
- **Check the image URL** - Copy and paste it in a new browser tab
- **Try uploading again** - Sometimes uploads fail silently

### AI descriptions aren't working
- **Check your AI integration** - Make sure Grok is connected in your project settings
- **Try again later** - AI services sometimes have temporary issues
- **Check the console** - Look for error messages in your browser's developer tools

---

## 🎨 Customizing Your App

### Change Colors
Edit `app/globals.css` to change the app's colors:
\`\`\`css
:root {
  --primary: oklch(0.506 0.17 162.581); /* Main green color */
  --secondary: oklch(0.588 0.15 162.581); /* Lighter green */
}
\`\`\`

### Change Upload Limits
Edit `app/page.tsx` to change how many files or how big they can be:
\`\`\`tsx
<ImageUpload
  maxFiles={20}  // Allow 20 files instead of 10
  maxFileSize={20 * 1024 * 1024}  // Allow 20MB instead of 10MB
/>
\`\`\`

### Add Your Own Branding
Edit the header in `app/page.tsx`:
\`\`\`tsx
<h1 className="text-4xl font-bold text-foreground">Your Company Name</h1>
<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  Your custom description here
</p>
\`\`\`

---

## 🔒 Privacy & Security

- **Your images are stored securely** - We use Supabase's secure cloud storage
- **Links are permanent** - Once uploaded, your images stay online
- **No tracking** - We don't track what you upload or share
- **Open source** - You can see exactly how everything works

---

## 🆘 Need More Help?

1. **Check the browser console** - Press F12 and look for error messages
2. **Try in a different browser** - Sometimes browser settings cause issues
3. **Clear your browser cache** - Old files might be causing problems
4. **Restart the app** - Stop it with Ctrl+C and run `npm run dev` again

---

## 🚀 Deploy Your App

### Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

### Deploy Anywhere Else
This is a standard Next.js app, so it works on any platform that supports Node.js.

---

**Made with ❤️ using Next.js, Supabase, and AI**
