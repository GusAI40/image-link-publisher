// Authenticated stress test: 10x upload with proper auth
require('dotenv').config({ path: '.env.local' });

async function authenticatedStressTest() {
  console.log('🚀 10x AUTHENTICATED STRESS TEST');
  console.log('=' .repeat(50));

  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Test authentication first
  console.log('🔐 Testing authentication...');
  
  try {
    // Try to get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('❌ No active session. Need to authenticate through browser first.');
      console.log('💡 INSTRUCTIONS:');
      console.log('   1. Go to http://localhost:3001');
      console.log('   2. Sign in/up to your account');
      console.log('   3. Upload images through the web interface');
      console.log('   4. Check Image History for descriptions');
      console.log('\n🎯 MANUAL STRESS TEST:');
      console.log('   - Upload 10 images at once using drag & drop');
      console.log('   - Wait 60 seconds');
      console.log('   - Refresh Image History page');
      console.log('   - Verify all images have AI descriptions');
      return;
    }

    console.log('✅ Authenticated as:', session.user.email);

  } catch (authError) {
    console.log('❌ Auth check failed:', authError.message);
  }

  // Create test data for API calls
  const testImages = Array.from({ length: 10 }, (_, i) => ({
    name: `stress-test-${i + 1}-${Date.now()}.png`,
    url: 'https://via.placeholder.com/100x100.png?text=' + (i + 1)
  }));

  console.log('\n🧪 TESTING DESCRIPTION API DIRECTLY (10x)');
  console.log('This tests the AI description generation at scale...');

  const descriptionPromises = testImages.map(async (img, index) => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:3001/api/describe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: img.url,
          filename: img.name,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const { description } = await response.json();
      
      console.log(`✅ [${index + 1}] Generated in ${duration}ms: ${description.substring(0, 60)}...`);
      
      return {
        index: index + 1,
        success: true,
        duration,
        description: description.substring(0, 100)
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ [${index + 1}] Failed in ${duration}ms: ${error.message}`);
      
      return {
        index: index + 1,
        success: false,
        duration,
        error: error.message
      };
    }
  });

  const startTime = Date.now();
  const results = await Promise.allSettled(descriptionPromises);
  const totalTime = Date.now() - startTime;

  // Analyze results
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected' || !r.value.success).map(r => r.value || { error: 'Promise rejected' });

  console.log('\n📊 DESCRIPTION API STRESS TEST RESULTS:');
  console.log(`   ✅ Successful: ${successful.length}/10`);
  console.log(`   ❌ Failed: ${failed.length}/10`);
  console.log(`   ⏱️  Total time: ${totalTime}ms`);
  console.log(`   📈 Average per request: ${Math.round(totalTime / 10)}ms`);
  
  if (successful.length > 0) {
    const avgSuccessTime = Math.round(successful.reduce((sum, r) => sum + r.duration, 0) / successful.length);
    console.log(`   🚀 Average successful request: ${avgSuccessTime}ms`);
  }

  // Rate limiting analysis
  const rateLimitErrors = failed.filter(f => f.error && f.error.includes('429'));
  if (rateLimitErrors.length > 0) {
    console.log(`   ⚠️  Rate limit hits: ${rateLimitErrors.length}`);
  }

  console.log('\n🎯 STRESS TEST CONCLUSIONS:');
  
  if (successful.length >= 8) {
    console.log('   🟢 EXCELLENT: System handles 10x load well');
  } else if (successful.length >= 5) {
    console.log('   🟡 GOOD: System handles moderate load with some failures');
  } else {
    console.log('   🔴 POOR: System struggles with concurrent load');
  }

  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Test actual uploads through web interface');
  console.log('   2. Monitor console logs during upload');
  console.log('   3. Verify descriptions appear in Image History');
  console.log('   4. Check for any rate limiting or timeout issues');

  console.log('\n🏁 STRESS TEST COMPLETE');
}

authenticatedStressTest().catch(console.error);
