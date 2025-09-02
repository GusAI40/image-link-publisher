// Test the fixed upload API with stress test
require('dotenv').config({ path: '.env.local' });

async function testFixedUpload() {
  console.log('🚀 TESTING FIXED UPLOAD API');
  console.log('=' .repeat(40));

  const FormData = require('form-data');

  // Create test image
  const testImage = {
    name: `fixed-test-${Date.now()}.png`,
    data: Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]),
    type: 'image/png'
  };

  console.log(`📦 Testing upload: ${testImage.name}`);

  try {
    const form = new FormData();
    form.append('files', testImage.data, {
      filename: testImage.name,
      contentType: testImage.type
    });

    console.log('🔄 Uploading with auth bypass...');
    
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing',
        ...form.getHeaders()
      }
    });

    console.log(`📊 Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful!');
      console.log('📋 Result:', JSON.stringify(result, null, 2));

      // Wait for async description generation
      console.log('\n⏳ Waiting 45 seconds for description generation...');
      await new Promise(resolve => setTimeout(resolve, 45000));

      // Try to verify in database
      console.log('🔍 Attempting to verify description...');
      
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: recentImages, error } = await supabase
        .from('uploaded_images')
        .select('original_name, description, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.log('❌ Cannot verify due to RLS:', error.message);
        console.log('💡 Check manually in web interface');
      } else {
        console.log(`📊 Found ${recentImages.length} recent images:`);
        recentImages.forEach(img => {
          const hasDesc = img.description && img.description.trim() !== '';
          console.log(`   ${img.original_name}: ${hasDesc ? '✅ HAS DESC' : '❌ NO DESC'}`);
        });
      }

      console.log('\n🎉 UPLOAD TEST COMPLETE');
      console.log('💡 Check Image History at http://localhost:3001/dashboard');

    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', errorText);
      
      if (response.status === 401) {
        console.log('🔧 Auth bypass not working - need to restart server');
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Add fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testFixedUpload().catch(console.error);
