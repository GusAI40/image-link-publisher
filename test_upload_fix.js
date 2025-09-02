// Test the fixed upload API with proper FormData handling
require('dotenv').config({ path: '.env.local' });

async function testUploadFix() {
  console.log('🔧 TESTING UPLOAD API FIX');
  console.log('=' .repeat(50));

  // Create test image data
  const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  
  // Test 1: Direct FormData test
  console.log('\n📤 TEST 1: Direct Upload API Test');
  
  try {
    // Create proper FormData
    const formData = new FormData();
    
    // Create a proper File object
    const file = new File([testImageData], 'test-upload.png', { type: 'image/png' });
    formData.append('files', file);
    formData.append('sessionId', `test-${Date.now()}`);

    console.log('📦 Created FormData with test image');
    console.log('   File name:', file.name);
    console.log('   File size:', file.size);
    console.log('   File type:', file.type);

    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful!');
      console.log('📋 Result:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed');
      console.log('📋 Error response:', errorText);
    }

  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
    console.log('📋 Error details:', error);
  }

  // Test 2: Multiple files test
  console.log('\n📤 TEST 2: Multiple Files Upload');
  
  try {
    const formData = new FormData();
    
    // Create multiple test files
    const file1 = new File([testImageData], 'test-1.png', { type: 'image/png' });
    const file2 = new File([testImageData], 'test-2.png', { type: 'image/png' });
    
    formData.append('files', file1);
    formData.append('files', file2);
    formData.append('sessionId', `multi-test-${Date.now()}`);

    console.log('📦 Created FormData with 2 test images');

    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Multi-file upload successful!');
      console.log('📋 Result:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Multi-file upload failed');
      console.log('📋 Error response:', errorText);
    }

  } catch (error) {
    console.log('❌ Multi-file test failed:', error.message);
  }

  // Test 3: Check if files were saved to database
  console.log('\n📊 TEST 3: Database Verification');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('uploaded_images')
      .select('original_name, created_at, file_size')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('❌ Database query failed:', error.message);
    } else {
      console.log('✅ Recent uploads in database:');
      data.forEach((img, i) => {
        console.log(`   ${i+1}. ${img.original_name} (${img.file_size} bytes) - ${new Date(img.created_at).toLocaleString()}`);
      });
    }

  } catch (error) {
    console.log('❌ Database verification failed:', error.message);
  }

  console.log('\n🏁 UPLOAD FIX TEST COMPLETE');
}

testUploadFix().catch(console.error);
