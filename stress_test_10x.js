// Stress test: Upload 10 images simultaneously and verify description generation
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function stressTest10x() {
  console.log('🚀 Starting 10x Stress Test for Image Upload & Description Generation');
  console.log('=' .repeat(70));

  // Create test images (simple 1x1 pixel PNGs with different names)
  const testImages = [];
  for (let i = 1; i <= 10; i++) {
    const imageName = `stress-test-${i}-${Date.now()}.png`;
    // Minimal PNG data (1x1 transparent pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    testImages.push({
      name: imageName,
      data: pngData,
      type: 'image/png'
    });
  }

  console.log(`📦 Created ${testImages.length} test images`);

  // Function to upload a single image
  async function uploadImage(imageData, index) {
    const startTime = Date.now();
    
    try {
      const formData = new FormData();
      const blob = new Blob([imageData.data], { type: imageData.type });
      formData.append('files', blob, imageData.name);

      console.log(`🔄 [${index}] Uploading ${imageData.name}...`);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Add auth header if needed - you may need to get this from browser
          // 'Authorization': 'Bearer your-token-here'
        }
      });

      const uploadTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ [${index}] Upload completed in ${uploadTime}ms`);
      
      return {
        index,
        success: true,
        uploadTime,
        result,
        imageName: imageData.name
      };

    } catch (error) {
      const uploadTime = Date.now() - startTime;
      console.log(`❌ [${index}] Upload failed in ${uploadTime}ms: ${error.message}`);
      
      return {
        index,
        success: false,
        uploadTime,
        error: error.message,
        imageName: imageData.name
      };
    }
  }

  // Upload all images simultaneously
  console.log('\n🚀 Starting simultaneous uploads...');
  const uploadStartTime = Date.now();

  const uploadPromises = testImages.map((imageData, index) => 
    uploadImage(imageData, index + 1)
  );

  const uploadResults = await Promise.allSettled(uploadPromises);
  const totalUploadTime = Date.now() - uploadStartTime;

  // Analyze upload results
  const successful = uploadResults.filter(r => r.status === 'fulfilled' && r.value.success);
  const failed = uploadResults.filter(r => r.status === 'rejected' || !r.value.success);

  console.log('\n📊 UPLOAD RESULTS:');
  console.log(`   ✅ Successful: ${successful.length}/10`);
  console.log(`   ❌ Failed: ${failed.length}/10`);
  console.log(`   ⏱️  Total time: ${totalUploadTime}ms`);
  console.log(`   📈 Average per upload: ${Math.round(totalUploadTime / 10)}ms`);

  if (successful.length === 0) {
    console.log('\n❌ All uploads failed. Cannot proceed with description test.');
    return;
  }

  // Wait for async description generation
  console.log('\n⏳ Waiting 60 seconds for async description generation...');
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Check description generation results
  console.log('\n🔍 Checking description generation...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Try to fetch recent images (may fail due to RLS)
    const { data: recentImages, error } = await supabase
      .from('uploaded_images')
      .select('original_name, description, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error || !recentImages) {
      console.log('❌ Cannot verify descriptions due to RLS policies');
      console.log('💡 Check manually in the web interface');
    } else {
      const testImageNames = testImages.map(img => img.name);
      const foundTestImages = recentImages.filter(img => 
        testImageNames.some(testName => img.original_name.includes('stress-test'))
      );

      console.log(`\n📋 Found ${foundTestImages.length} test images in database:`);
      foundTestImages.forEach((img, index) => {
        const hasDesc = img.description && img.description.trim() !== '';
        console.log(`   ${index + 1}. ${img.original_name}: ${hasDesc ? '✅ HAS DESC' : '❌ NO DESC'}`);
      });

      const withDescriptions = foundTestImages.filter(img => img.description && img.description.trim() !== '');
      console.log(`\n🎯 DESCRIPTION GENERATION RESULTS:`);
      console.log(`   ✅ Generated: ${withDescriptions.length}/${foundTestImages.length}`);
      console.log(`   📊 Success rate: ${Math.round((withDescriptions.length / foundTestImages.length) * 100)}%`);
    }

  } catch (dbError) {
    console.log('❌ Database check failed:', dbError.message);
    console.log('💡 Manually check the Image History page in your browser');
  }

  console.log('\n🏁 STRESS TEST COMPLETE');
  console.log('=' .repeat(70));
  console.log('💡 Check the Image History page at http://localhost:3001/dashboard');
  console.log('🔍 Look for images named "stress-test-*" with AI descriptions');
}

// Add FormData polyfill for Node.js
if (typeof FormData === 'undefined') {
  global.FormData = require('form-data');
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

stressTest10x().catch(console.error);
