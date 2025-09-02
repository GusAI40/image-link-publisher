// Test setup configuration for Image Link Publisher
// This file configures the testing environment and global test utilities

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Global test configuration
global.TEST_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  API_BASE: 'http://localhost:3001/api',
  TEST_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 60000,
  AI_TIMEOUT: 45000
};

// Test database configuration
global.TEST_DB = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

// Test user credentials
global.TEST_USER = {
  EMAIL: 'test@imagelink.com',
  PASSWORD: 'TestPassword123!',
  FULL_NAME: 'Test User'
};

// Test file paths
global.TEST_FILES = {
  SMALL_IMAGE: path.join(__dirname, 'fixtures', 'test-image-small.jpg'),
  LARGE_IMAGE: path.join(__dirname, 'fixtures', 'test-image-large.jpg'),
  INVALID_FILE: path.join(__dirname, 'fixtures', 'test-file.txt'),
  BATCH_IMAGES: [
    path.join(__dirname, 'fixtures', 'batch-1.jpg'),
    path.join(__dirname, 'fixtures', 'batch-2.jpg'),
    path.join(__dirname, 'fixtures', 'batch-3.jpg')
  ]
};

// Utility functions for tests
global.testUtils = {
  // Wait for element to be visible
  waitForElement: async (page, selector, timeout = 10000) => {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
  },

  // Generate random session ID
  generateSessionId: () => {
    return 'test-session-' + Math.random().toString(36).substr(2, 9);
  },

  // Clean up test data
  cleanupTestData: async () => {
    // Implementation for cleaning up test uploads and database entries
    console.log('Cleaning up test data...');
  },

  // Create test image file
  createTestImage: (filename, sizeKB = 100) => {
    const buffer = Buffer.alloc(sizeKB * 1024, 'test-data');
    const filepath = path.join(__dirname, 'fixtures', filename);
    fs.writeFileSync(filepath, buffer);
    return filepath;
  },

  // Verify API response structure
  verifyApiResponse: (response, expectedKeys) => {
    expectedKeys.forEach(key => {
      if (!(key in response)) {
        throw new Error(`Missing key '${key}' in API response`);
      }
    });
  }
};

// Setup test fixtures directory
const fixturesDir = path.join(__dirname, 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Create test image files if they don't exist
if (!fs.existsSync(global.TEST_FILES.SMALL_IMAGE)) {
  global.testUtils.createTestImage('test-image-small.jpg', 50);
}

if (!fs.existsSync(global.TEST_FILES.LARGE_IMAGE)) {
  global.testUtils.createTestImage('test-image-large.jpg', 5000);
}

// Create invalid test file
if (!fs.existsSync(global.TEST_FILES.INVALID_FILE)) {
  fs.writeFileSync(global.TEST_FILES.INVALID_FILE, 'This is not an image file');
}

console.log('✅ Test environment setup complete');
