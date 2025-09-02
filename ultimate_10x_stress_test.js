// Ultimate 10x Stress Test - Entire Application
require('dotenv').config({ path: '.env.local' });

async function ultimate10xStressTest() {
  console.log('🚀 ULTIMATE 10X STRESS TEST - ENTIRE APPLICATION');
  console.log('=' .repeat(80));
  console.log('Testing ALL interfaces, APIs, and features simultaneously');
  console.log('Target: 10x normal load with 1000+ concurrent operations\n');

  const results = {
    interfaces: { simple: [], premium: [], dashboard: [] },
    apis: { upload: [], describe: [], analytics: [], images: [] },
    database: { reads: [], writes: [], concurrent: [] },
    ai: { descriptions: [], batch: [], performance: [] },
    errors: [],
    totalOperations: 0,
    startTime: Date.now()
  };

  // Test 1: Interface Load Testing (10x Concurrent Users)
  console.log('🖥️  TEST 1: Interface Load Testing (100 concurrent users per interface)');
  
  const interfaceTests = [
    { name: 'simple', url: 'http://localhost:3001/simple' },
    { name: 'premium', url: 'http://localhost:3001/premium' },
    { name: 'dashboard', url: 'http://localhost:3001/dashboard' }
  ];

  const interfacePromises = [];
  
  for (const iface of interfaceTests) {
    console.log(`\n   Testing ${iface.name} interface with 100 concurrent loads...`);
    
    for (let i = 1; i <= 100; i++) {
      interfacePromises.push(
        (async () => {
          const startTime = Date.now();
          try {
            const response = await fetch(iface.url, {
              headers: { 'User-Agent': `StressTest-${iface.name}-${i}` }
            });
            const loadTime = Date.now() - startTime;
            
            if (response.ok) {
              results.interfaces[iface.name].push(loadTime);
              if (i % 20 === 0) console.log(`     ${iface.name} ${i}/100: ${loadTime}ms ✅`);
            } else {
              results.errors.push(`${iface.name} load ${i}: ${response.status}`);
            }
            results.totalOperations++;
          } catch (error) {
            results.errors.push(`${iface.name} load ${i}: ${error.message}`);
          }
        })()
      );
    }
  }

  await Promise.all(interfacePromises);

  // Test 2: API Endpoint Stress Testing (500 concurrent calls per endpoint)
  console.log('\n🔌 TEST 2: API Endpoint Stress Testing (500 calls per endpoint)');
  
  const apiEndpoints = [
    { name: 'analytics', url: '/api/analytics' },
    { name: 'images', url: '/api/images/test-session' },
    { name: 'describe', url: '/api/describe-image', method: 'POST' }
  ];

  const apiPromises = [];
  
  for (const api of apiEndpoints) {
    console.log(`\n   Stress testing ${api.name} API with 500 concurrent calls...`);
    
    for (let i = 1; i <= 500; i++) {
      apiPromises.push(
        (async () => {
          const startTime = Date.now();
          try {
            const options = {
              method: api.method || 'GET',
              headers: { 'Content-Type': 'application/json' }
            };
            
            if (api.method === 'POST' && api.name === 'describe') {
              options.body = JSON.stringify({
                imageUrl: 'https://via.placeholder.com/300x200',
                filename: `stress-test-${i}.jpg`
              });
            }
            
            const response = await fetch(`http://localhost:3001${api.url}`, options);
            const responseTime = Date.now() - startTime;
            
            if (response.ok) {
              results.apis[api.name].push(responseTime);
              if (i % 100 === 0) console.log(`     ${api.name} ${i}/500: ${responseTime}ms ✅`);
            } else {
              results.errors.push(`${api.name} API ${i}: ${response.status}`);
            }
            results.totalOperations++;
          } catch (error) {
            results.errors.push(`${api.name} API ${i}: ${error.message}`);
          }
        })()
      );
    }
  }

  await Promise.all(apiPromises);

  // Test 3: Upload API Stress Test (100 concurrent uploads)
  console.log('\n📤 TEST 3: Upload API Stress Test (100 concurrent file uploads)');
  
  const uploadPromises = [];
  const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
  
  for (let i = 1; i <= 100; i++) {
    uploadPromises.push(
      (async () => {
        const startTime = Date.now();
        try {
          const formData = new FormData();
          const file = new File([testImageData], `stress-test-${i}.png`, { type: 'image/png' });
          formData.append('files', file);
          formData.append('sessionId', `stress-test-${Date.now()}-${i}`);

          const response = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            body: formData
          });
          
          const uploadTime = Date.now() - startTime;
          
          if (response.ok) {
            results.apis.upload.push(uploadTime);
            if (i % 20 === 0) console.log(`     Upload ${i}/100: ${uploadTime}ms ✅`);
          } else {
            results.errors.push(`Upload ${i}: ${response.status}`);
          }
          results.totalOperations++;
        } catch (error) {
          results.errors.push(`Upload ${i}: ${error.message}`);
        }
      })()
    );
  }

  await Promise.all(uploadPromises);

  // Test 4: Database Stress Test (Direct Supabase Operations)
  console.log('\n🗄️  TEST 4: Database Stress Test (200 concurrent operations)');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const dbPromises = [];
    
    // 100 concurrent reads
    for (let i = 1; i <= 100; i++) {
      dbPromises.push(
        (async () => {
          const startTime = Date.now();
          try {
            const { data, error } = await supabase
              .from('uploaded_images')
              .select('id, original_name, created_at')
              .limit(10);
            
            const queryTime = Date.now() - startTime;
            
            if (!error) {
              results.database.reads.push(queryTime);
              if (i % 25 === 0) console.log(`     DB Read ${i}/100: ${queryTime}ms ✅`);
            } else {
              results.errors.push(`DB Read ${i}: ${error.message}`);
            }
            results.totalOperations++;
          } catch (error) {
            results.errors.push(`DB Read ${i}: ${error.message}`);
          }
        })()
      );
    }

    // 100 concurrent analytics queries
    for (let i = 1; i <= 100; i++) {
      dbPromises.push(
        (async () => {
          const startTime = Date.now();
          try {
            const { count, error } = await supabase
              .from('uploaded_images')
              .select('*', { count: 'exact', head: true });
            
            const queryTime = Date.now() - startTime;
            
            if (!error) {
              results.database.concurrent.push(queryTime);
              if (i % 25 === 0) console.log(`     DB Analytics ${i}/100: ${queryTime}ms ✅`);
            } else {
              results.errors.push(`DB Analytics ${i}: ${error.message}`);
            }
            results.totalOperations++;
          } catch (error) {
            results.errors.push(`DB Analytics ${i}: ${error.message}`);
          }
        })()
      );
    }

    await Promise.all(dbPromises);
  } catch (error) {
    console.log(`     Database test failed: ${error.message} ❌`);
    results.errors.push(`Database setup: ${error.message}`);
  }

  // Test 5: AI Processing Stress Test (50 concurrent AI descriptions)
  console.log('\n🧠 TEST 5: AI Processing Stress Test (50 concurrent AI operations)');
  
  const aiPromises = [];
  
  for (let i = 1; i <= 50; i++) {
    aiPromises.push(
      (async () => {
        const startTime = Date.now();
        try {
          const response = await fetch('http://localhost:3001/api/describe-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl: `https://picsum.photos/300/200?random=${i}`,
              filename: `ai-stress-test-${i}.jpg`
            })
          });
          
          const aiTime = Date.now() - startTime;
          
          if (response.ok) {
            results.ai.descriptions.push(aiTime);
            if (i % 10 === 0) console.log(`     AI Process ${i}/50: ${aiTime}ms ✅`);
          } else {
            results.errors.push(`AI Process ${i}: ${response.status}`);
          }
          results.totalOperations++;
        } catch (error) {
          results.errors.push(`AI Process ${i}: ${error.message}`);
        }
      })()
    );
  }

  await Promise.all(aiPromises);

  // Calculate Final Results
  const totalTime = Date.now() - results.startTime;
  
  console.log('\n🎯 ULTIMATE 10X STRESS TEST RESULTS');
  console.log('=' .repeat(80));
  
  // Interface Performance
  console.log('\n🖥️  INTERFACE PERFORMANCE:');
  for (const [name, times] of Object.entries(results.interfaces)) {
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      console.log(`   ${name.toUpperCase()}: Avg ${avg.toFixed(0)}ms | Min ${min}ms | Max ${max}ms | Success: ${times.length}/100`);
    }
  }

  // API Performance
  console.log('\n🔌 API PERFORMANCE:');
  for (const [name, times] of Object.entries(results.apis)) {
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const expectedCount = name === 'upload' ? 100 : 500;
      console.log(`   ${name.toUpperCase()}: Avg ${avg.toFixed(0)}ms | Min ${min}ms | Max ${max}ms | Success: ${times.length}/${expectedCount}`);
    }
  }

  // Database Performance
  console.log('\n🗄️  DATABASE PERFORMANCE:');
  for (const [name, times] of Object.entries(results.database)) {
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      console.log(`   ${name.toUpperCase()}: Avg ${avg.toFixed(0)}ms | Min ${min}ms | Max ${max}ms | Success: ${times.length}/100`);
    }
  }

  // AI Performance
  console.log('\n🧠 AI PERFORMANCE:');
  if (results.ai.descriptions.length > 0) {
    const avg = results.ai.descriptions.reduce((a, b) => a + b, 0) / results.ai.descriptions.length;
    const min = Math.min(...results.ai.descriptions);
    const max = Math.max(...results.ai.descriptions);
    console.log(`   AI DESCRIPTIONS: Avg ${avg.toFixed(0)}ms | Min ${min}ms | Max ${max}ms | Success: ${results.ai.descriptions.length}/50`);
  }

  // Overall Statistics
  console.log('\n📊 OVERALL STATISTICS:');
  console.log(`   Total Operations: ${results.totalOperations.toLocaleString()}`);
  console.log(`   Total Test Time: ${(totalTime / 1000).toFixed(1)} seconds`);
  console.log(`   Operations/Second: ${(results.totalOperations / (totalTime / 1000)).toFixed(1)}`);
  console.log(`   Error Rate: ${((results.errors.length / results.totalOperations) * 100).toFixed(2)}%`);
  console.log(`   Success Rate: ${(((results.totalOperations - results.errors.length) / results.totalOperations) * 100).toFixed(2)}%`);

  // Performance Rating
  const errorRate = (results.errors.length / results.totalOperations) * 100;
  const opsPerSecond = results.totalOperations / (totalTime / 1000);
  
  let rating = '🔥 EXCEPTIONAL';
  if (errorRate > 5 || opsPerSecond < 10) {
    rating = '⚠️  NEEDS OPTIMIZATION';
  } else if (errorRate > 2 || opsPerSecond < 20) {
    rating = '✅ GOOD';
  } else if (errorRate > 1 || opsPerSecond < 50) {
    rating = '🚀 EXCELLENT';
  }
  
  console.log(`\n🎯 PERFORMANCE RATING: ${rating}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ ERRORS (${results.errors.length} total):`);
    const errorSample = results.errors.slice(0, 10);
    errorSample.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    if (results.errors.length > 10) {
      console.log(`   ... and ${results.errors.length - 10} more errors`);
    }
  }

  console.log('\n🏁 10X STRESS TEST COMPLETE!');
  console.log('Application tested under extreme load conditions.');
}

// Run the ultimate stress test
ultimate10xStressTest().catch(console.error);
