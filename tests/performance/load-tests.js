// Performance and Load Testing Suite
// Tests application performance under various load conditions

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load testing configuration
const LOAD_TEST_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  CONCURRENT_USERS: [10, 50, 100, 200],
  TEST_DURATION: '30s',
  RAMP_UP_TIME: '10s'
};

// Artillery.js configuration for load testing
const artilleryConfig = {
  config: {
    target: LOAD_TEST_CONFIG.BASE_URL,
    phases: [
      {
        duration: 60,
        arrivalRate: 10,
        name: 'Warm up'
      },
      {
        duration: 120,
        arrivalRate: 50,
        name: 'Load test'
      },
      {
        duration: 60,
        arrivalRate: 100,
        name: 'Spike test'
      }
    ],
    defaults: {
      headers: {
        'User-Agent': 'ImageLinkPublisher-LoadTest/1.0'
      }
    }
  },
  scenarios: [
    {
      name: 'Homepage Load Test',
      weight: 30,
      flow: [
        {
          get: {
            url: '/'
          }
        },
        {
          think: 2
        }
      ]
    },
    {
      name: 'Simple Interface Load Test',
      weight: 25,
      flow: [
        {
          get: {
            url: '/simple'
          }
        },
        {
          think: 3
        }
      ]
    },
    {
      name: 'Premium Interface Load Test',
      weight: 25,
      flow: [
        {
          get: {
            url: '/premium'
          }
        },
        {
          think: 3
        }
      ]
    },
    {
      name: 'Dashboard Load Test',
      weight: 20,
      flow: [
        {
          get: {
            url: '/dashboard'
          }
        },
        {
          get: {
            url: '/api/analytics'
          }
        },
        {
          think: 5
        }
      ]
    }
  ]
};

// API Load Testing Scenarios
const apiLoadTests = {
  config: {
    target: LOAD_TEST_CONFIG.BASE_URL,
    phases: [
      {
        duration: 30,
        arrivalRate: 5,
        name: 'API warm up'
      },
      {
        duration: 60,
        arrivalRate: 20,
        name: 'API load test'
      }
    ]
  },
  scenarios: [
    {
      name: 'Analytics API Load',
      weight: 40,
      flow: [
        {
          get: {
            url: '/api/analytics'
          }
        }
      ]
    },
    {
      name: 'Image Session API Load',
      weight: 30,
      flow: [
        {
          get: {
            url: '/api/images/test-session-{{ $randomString() }}'
          }
        }
      ]
    },
    {
      name: 'Upload API Simulation',
      weight: 30,
      flow: [
        {
          post: {
            url: '/api/upload',
            formData: {
              sessionId: 'load-test-{{ $randomString() }}'
            }
          }
        }
      ]
    }
  ]
};

// Performance benchmarking functions
class PerformanceTestSuite {
  constructor() {
    this.results = {
      pageLoad: {},
      apiResponse: {},
      fileUpload: {},
      concurrentUsers: {}
    };
  }

  async runPageLoadTests() {
    console.log('🚀 Running Page Load Performance Tests...');
    
    const pages = ['/', '/simple', '/premium', '/dashboard'];
    
    for (const page of pages) {
      console.log(`Testing page: ${page}`);
      
      const times = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        try {
          const response = await fetch(`${LOAD_TEST_CONFIG.BASE_URL}${page}`);
          const endTime = Date.now();
          
          if (response.ok) {
            times.push(endTime - startTime);
          }
        } catch (error) {
          console.error(`Error testing ${page}:`, error.message);
        }
      }
      
      this.results.pageLoad[page] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        samples: times.length
      };
    }
  }

  async runApiResponseTests() {
    console.log('🔌 Running API Response Performance Tests...');
    
    const endpoints = [
      '/api/analytics',
      '/api/images/test-session'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`Testing API: ${endpoint}`);
      
      const times = [];
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        try {
          const response = await fetch(`${LOAD_TEST_CONFIG.BASE_URL}${endpoint}`);
          const endTime = Date.now();
          
          times.push(endTime - startTime);
        } catch (error) {
          console.error(`Error testing ${endpoint}:`, error.message);
        }
      }
      
      this.results.apiResponse[endpoint] = {
        average: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        samples: times.length
      };
    }
  }

  async runConcurrentUserTests() {
    console.log('👥 Running Concurrent User Tests...');
    
    for (const userCount of LOAD_TEST_CONFIG.CONCURRENT_USERS) {
      console.log(`Testing with ${userCount} concurrent users...`);
      
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < userCount; i++) {
        promises.push(
          fetch(`${LOAD_TEST_CONFIG.BASE_URL}/`)
            .then(response => ({
              status: response.status,
              time: Date.now() - startTime
            }))
            .catch(error => ({
              error: error.message,
              time: Date.now() - startTime
            }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.status === 200).length;
      const failed = results.filter(r => r.error).length;
      const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
      
      this.results.concurrentUsers[userCount] = {
        successful,
        failed,
        successRate: (successful / userCount) * 100,
        averageResponseTime: avgTime,
        totalRequests: userCount
      };
    }
  }

  generateReport() {
    console.log('\n📊 PERFORMANCE TEST REPORT');
    console.log('=' .repeat(50));
    
    // Page Load Performance
    console.log('\n🌐 PAGE LOAD PERFORMANCE:');
    Object.entries(this.results.pageLoad).forEach(([page, metrics]) => {
      console.log(`${page}:`);
      console.log(`  Average: ${metrics.average.toFixed(2)}ms`);
      console.log(`  Min: ${metrics.min}ms | Max: ${metrics.max}ms`);
      console.log(`  Status: ${metrics.average < 3000 ? '✅ GOOD' : '⚠️ SLOW'}`);
    });
    
    // API Response Performance
    console.log('\n🔌 API RESPONSE PERFORMANCE:');
    Object.entries(this.results.apiResponse).forEach(([endpoint, metrics]) => {
      console.log(`${endpoint}:`);
      console.log(`  Average: ${metrics.average.toFixed(2)}ms`);
      console.log(`  Min: ${metrics.min}ms | Max: ${metrics.max}ms`);
      console.log(`  Status: ${metrics.average < 500 ? '✅ FAST' : '⚠️ SLOW'}`);
    });
    
    // Concurrent User Performance
    console.log('\n👥 CONCURRENT USER PERFORMANCE:');
    Object.entries(this.results.concurrentUsers).forEach(([users, metrics]) => {
      console.log(`${users} concurrent users:`);
      console.log(`  Success Rate: ${metrics.successRate.toFixed(1)}%`);
      console.log(`  Avg Response: ${metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`  Status: ${metrics.successRate > 95 ? '✅ EXCELLENT' : '⚠️ DEGRADED'}`);
    });
    
    // Overall Assessment
    console.log('\n🎯 OVERALL ASSESSMENT:');
    const pageLoadOk = Object.values(this.results.pageLoad).every(m => m.average < 3000);
    const apiOk = Object.values(this.results.apiResponse).every(m => m.average < 500);
    const concurrencyOk = Object.values(this.results.concurrentUsers).every(m => m.successRate > 95);
    
    if (pageLoadOk && apiOk && concurrencyOk) {
      console.log('✅ ALL PERFORMANCE TESTS PASSED - PRODUCTION READY');
    } else {
      console.log('⚠️ PERFORMANCE ISSUES DETECTED - OPTIMIZATION NEEDED');
      if (!pageLoadOk) console.log('  - Page load times exceed 3 seconds');
      if (!apiOk) console.log('  - API response times exceed 500ms');
      if (!concurrencyOk) console.log('  - Success rate drops under load');
    }
  }

  async saveResults() {
    const reportPath = path.join(__dirname, '..', 'reports', 'performance-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      testConfig: LOAD_TEST_CONFIG,
      results: this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Artillery.js test runner
function runArtilleryTests() {
  console.log('🔥 Running Artillery Load Tests...');
  
  // Save artillery config
  const configPath = path.join(__dirname, 'artillery-config.yml');
  fs.writeFileSync(configPath, `
config:
  target: '${LOAD_TEST_CONFIG.BASE_URL}'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Load test'
    - duration: 60
      arrivalRate: 100
      name: 'Spike test'

scenarios:
  - name: 'Full Application Load Test'
    flow:
      - get:
          url: '/'
      - think: 2
      - get:
          url: '/simple'
      - think: 3
      - get:
          url: '/api/analytics'
      - think: 1
  `);
  
  try {
    // Run artillery test
    const result = execSync(`npx artillery run ${configPath}`, { 
      encoding: 'utf8',
      timeout: 300000 // 5 minutes
    });
    
    console.log('Artillery Test Results:');
    console.log(result);
    
    // Cleanup
    fs.unlinkSync(configPath);
    
  } catch (error) {
    console.error('Artillery test failed:', error.message);
  }
}

// Main test execution
async function runAllPerformanceTests() {
  console.log('🚀 Starting Comprehensive Performance Test Suite...\n');
  
  const testSuite = new PerformanceTestSuite();
  
  try {
    await testSuite.runPageLoadTests();
    await testSuite.runApiResponseTests();
    await testSuite.runConcurrentUserTests();
    
    testSuite.generateReport();
    await testSuite.saveResults();
    
    // Run Artillery load tests if available
    if (process.argv.includes('--artillery')) {
      runArtilleryTests();
    }
    
  } catch (error) {
    console.error('Performance test suite failed:', error);
    process.exit(1);
  }
}

// Export for use in other test files
module.exports = {
  PerformanceTestSuite,
  runAllPerformanceTests,
  LOAD_TEST_CONFIG
};

// Run tests if called directly
if (require.main === module) {
  runAllPerformanceTests();
}
