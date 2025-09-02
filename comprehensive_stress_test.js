// Comprehensive stress test for Image Link Publisher
// Tests database operations, AI API, and description updates
require('dotenv').config({ path: '.env.local' });

async function comprehensiveStressTest() {
  console.log('🚀 COMPREHENSIVE STRESS TEST');
  console.log('=' .repeat(50));

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Database Connection
  totalTests++;
  console.log('\n📊 TEST 1: Database Connection');
  try {
    const { data, error } = await supabase
      .from('uploaded_images')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) throw error;
    console.log('✅ Database connection successful');
    testsPassed++;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }

  // Test 2: Direct Database Insert
  totalTests++;
  console.log('\n📊 TEST 2: Direct Database Insert');
  let testRecordId = null;
  try {
    const testRecord = {
      user_id: '7af7e40d-d5bb-427b-adec-80dd95208529',
      upload_session_id: `stress-test-${Date.now()}`,
      filename: `stress-test-${Date.now()}.png`,
      original_name: `stress-test-${Date.now()}.png`,
      file_size: 1024,
      mime_type: 'image/png',
      storage_path: `test/${Date.now()}.png`,
      public_url: `https://example.com/test-${Date.now()}.png`,
      description: null
    };

    const { data, error } = await supabase
      .from('uploaded_images')
      .insert(testRecord)
      .select()
      .single();

    if (error) throw error;
    testRecordId = data.id;
    console.log('✅ Database insert successful');
    testsPassed++;
  } catch (error) {
    console.log('❌ Database insert failed:', error.message);
  }

  // Test 3: AI Description API
  totalTests++;
  console.log('\n📊 TEST 3: AI Description API');
  let generatedDescription = null;
  try {
    const testImageUrl = 'https://emtwbizmorqwhboebgzw.supabase.co/storage/v1/object/public/images/uploads/1756766521138-9breag.jpg';
    
    const response = await fetch('http://localhost:3001/api/describe-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: testImageUrl,
        filename: 'test-image.jpg'
      }),
    });

    if (!response.ok) throw new Error(`API returned ${response.status}`);
    
    const result = await response.json();
    generatedDescription = result.description;
    
    if (!generatedDescription || generatedDescription.length < 50) {
      throw new Error('Description too short or empty');
    }

    console.log('✅ AI description API working');
    console.log(`📝 Generated ${generatedDescription.length} characters`);
    testsPassed++;
  } catch (error) {
    console.log('❌ AI description API failed:', error.message);
  }

  // Test 4: Description Database Update
  totalTests++;
  console.log('\n📊 TEST 4: Description Database Update');
  if (testRecordId && generatedDescription) {
    try {
      const { error } = await supabase
        .from('uploaded_images')
        .update({ description: generatedDescription })
        .eq('id', testRecordId);

      if (error) throw error;
      console.log('✅ Description update successful');
      testsPassed++;
    } catch (error) {
      console.log('❌ Description update failed:', error.message);
    }
  } else {
    console.log('❌ Skipping - missing test record or description');
  }

  // Test 5: Verification Query
  totalTests++;
  console.log('\n📊 TEST 5: Verification Query');
  if (testRecordId) {
    try {
      const { data, error } = await supabase
        .from('uploaded_images')
        .select('description')
        .eq('id', testRecordId)
        .single();

      if (error) throw error;
      
      if (data.description && data.description.length > 50) {
        console.log('✅ Description verification successful');
        testsPassed++;
      } else {
        console.log('❌ Description not found or too short');
      }
    } catch (error) {
      console.log('❌ Verification query failed:', error.message);
    }
  } else {
    console.log('❌ Skipping - no test record to verify');
  }

  // Test 6: Concurrent AI API Calls
  totalTests++;
  console.log('\n📊 TEST 6: Concurrent AI API Calls (5x)');
  try {
    const testImageUrl = 'https://emtwbizmorqwhboebgzw.supabase.co/storage/v1/object/public/images/uploads/1756766521138-9breag.jpg';
    
    const promises = Array.from({ length: 5 }, (_, i) => 
      fetch('http://localhost:3001/api/describe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          filename: `concurrent-test-${i}.jpg`
        }),
      })
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.ok).length;
    
    if (successCount === 5) {
      console.log('✅ All 5 concurrent API calls successful');
      testsPassed++;
    } else {
      console.log(`❌ Only ${successCount}/5 concurrent calls successful`);
    }
  } catch (error) {
    console.log('❌ Concurrent API test failed:', error.message);
  }

  // Cleanup
  if (testRecordId) {
    console.log('\n🧹 Cleaning up test record...');
    await supabase.from('uploaded_images').delete().eq('id', testRecordId);
  }

  // Final Results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 STRESS TEST RESULTS');
  console.log('=' .repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`📈 Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED - SYSTEM FULLY FUNCTIONAL!');
    console.log('💡 Ready for production stress testing');
  } else {
    console.log('⚠️  Some tests failed - review issues above');
  }

  return testsPassed === totalTests;
}

// Add fetch polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

comprehensiveStressTest().catch(console.error);
