console.log('--- SCRIPT EXECUTION STARTED ---');
// Direct API stress test - 10x concurrent description generation
require('dotenv').config({ path: '.env.local' });

async function apiStressTest10x() {
  console.log('🚀 AI DESCRIPTION API - 10x STRESS TEST');
  console.log('=' .repeat(50));

  // Test images from different sources
  const testImages = [
    { name: 'test-1.jpg', url: 'https://picsum.photos/400/300?random=1' },
    { name: 'test-2.jpg', url: 'https://picsum.photos/400/300?random=2' },
    { name: 'test-3.jpg', url: 'https://picsum.photos/400/300?random=3' },
    { name: 'test-4.jpg', url: 'https://picsum.photos/400/300?random=4' },
    { name: 'test-5.jpg', url: 'https://picsum.photos/400/300?random=5' },
    { name: 'test-6.jpg', url: 'https://picsum.photos/400/300?random=6' },
    { name: 'test-7.jpg', url: 'https://picsum.photos/400/300?random=7' },
    { name: 'test-8.jpg', url: 'https://picsum.photos/400/300?random=8' },
    { name: 'test-9.jpg', url: 'https://picsum.photos/400/300?random=9' },
    { name: 'test-10.jpg', url: 'https://picsum.photos/400/300?random=10' }
  ];

  console.log(`📦 Testing with ${testImages.length} random images`);
  console.log('🎯 This will test Gemini 2.5 Flash API under concurrent load...\n');

  // Function to test single API call
  async function testDescriptionAPI(image, index) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 [${index}] Starting: ${image.name}`);

      const response = await fetch('https://image-link-publisher.vercel.app/api/describe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: image.url,
          filename: image.name,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }

      const { description } = await response.json();
      
      if (!description) {
        throw new Error('No description returned');
      }

      console.log(`✅ [${index}] Success in ${duration}ms (${description.length} chars)`);
      console.log(`   Preview: ${description.substring(0, 80)}...`);
      
      return {
        index,
        success: true,
        duration,
        descriptionLength: description.length,
        image: image.name
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ [${index}] Failed in ${duration}ms: ${error.message}`);
      
      return {
        index,
        success: false,
        duration,
        error: error.message,
        image: image.name
      };
    }
  }

  // Execute all requests concurrently
  console.log('🚀 Launching 10 concurrent API requests...\n');
  const overallStartTime = Date.now();

  const promises = testImages.map((image, index) => 
    testDescriptionAPI(image, index + 1)
  );

  const results = await Promise.allSettled(promises);
  const totalDuration = Date.now() - overallStartTime;

  // Analyze results
  const successful = results
    .filter(r => r.status === 'fulfilled' && r.value.success)
    .map(r => r.value);
    
  const failed = results
    .filter(r => r.status === 'rejected' || !r.value.success)
    .map(r => r.value || { error: 'Promise rejected' });

  console.log('\n📊 STRESS TEST RESULTS:');
  console.log('=' .repeat(50));
  console.log(`✅ Successful requests: ${successful.length}/10`);
  console.log(`❌ Failed requests: ${failed.length}/10`);
  console.log(`⏱️  Total duration: ${totalDuration}ms`);
  console.log(`📈 Average per request: ${Math.round(totalDuration / 10)}ms`);

  if (successful.length > 0) {
    const avgSuccessTime = Math.round(
      successful.reduce((sum, r) => sum + r.duration, 0) / successful.length
    );
    const avgDescLength = Math.round(
      successful.reduce((sum, r) => sum + r.descriptionLength, 0) / successful.length
    );
    
    console.log(`🚀 Avg successful duration: ${avgSuccessTime}ms`);
    console.log(`📝 Avg description length: ${avgDescLength} chars`);
  }

  // Error analysis
  if (failed.length > 0) {
    console.log('\n❌ FAILURE ANALYSIS:');
    const errorTypes = {};
    failed.forEach(f => {
      const errorType = f.error?.includes('429') ? 'Rate Limit' :
                       f.error?.includes('timeout') ? 'Timeout' :
                       f.error?.includes('500') ? 'Server Error' : 'Other';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });
    
    Object.entries(errorTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} failures`);
    });
  }

  // Performance assessment
  console.log('\n🎯 PERFORMANCE ASSESSMENT:');
  const successRate = (successful.length / 10) * 100;
  
  if (successRate >= 90) {
    console.log('🟢 EXCELLENT: System handles 10x concurrent load perfectly');
  } else if (successRate >= 70) {
    console.log('🟡 GOOD: System handles concurrent load with minor issues');
  } else if (successRate >= 50) {
    console.log('🟠 FAIR: System struggles under heavy concurrent load');
  } else {
    console.log('🔴 POOR: System fails under concurrent load');
  }

  // Rate limiting check
  const rateLimited = failed.filter(f => f.error?.includes('429')).length;
  if (rateLimited > 0) {
    console.log(`⚠️  Rate limiting detected: ${rateLimited} requests blocked`);
    console.log('💡 Consider adding request queuing or delays');
  }

  console.log('\n🔬 TECHNICAL INSIGHTS:');
  console.log(`   • Gemini 2.5 Flash API performance under load`);
  console.log(`   • Network latency and timeout handling`);
  console.log(`   • Concurrent request processing capability`);
  console.log(`   • Error handling and recovery mechanisms`);

  console.log('\n🏁 STRESS TEST COMPLETE');
  console.log('=' .repeat(50));
}

// Add fetch polyfill if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

apiStressTest10x().catch(console.error);
