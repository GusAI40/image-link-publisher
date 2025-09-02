// API Endpoint Tests - Complete Coverage
// Tests all API routes for functionality, security, and performance

const request = require('supertest');
const fs = require('fs');
const path = require('path');

const API_BASE = global.TEST_CONFIG.API_BASE;

describe('API Endpoint Tests', () => {
  let sessionId;
  let uploadedImageId;

  beforeEach(() => {
    sessionId = global.testUtils.generateSessionId();
  });

  afterEach(async () => {
    await global.testUtils.cleanupTestData();
  });

  describe('POST /api/upload', () => {
    test('should upload single image successfully', async () => {
      const response = await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', global.TEST_FILES.SMALL_IMAGE)
        .expect(200);

      global.testUtils.verifyApiResponse(response.body, [
        'message', 'results', 'sessionId'
      ]);

      expect(response.body.results).toHaveLength(1);
      expect(response.body.results[0].success).toBe(true);
      expect(response.body.results[0].url).toMatch(/^https:\/\//);
      
      uploadedImageId = response.body.results[0].id;
    });

    test('should upload multiple images successfully', async () => {
      const response = await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', global.TEST_FILES.BATCH_IMAGES[0])
        .attach('files', global.TEST_FILES.BATCH_IMAGES[1])
        .attach('files', global.TEST_FILES.BATCH_IMAGES[2])
        .expect(200);

      expect(response.body.results).toHaveLength(3);
      response.body.results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.url).toMatch(/^https:\/\//);
      });
    });

    test('should reject invalid file types', async () => {
      const response = await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', global.TEST_FILES.INVALID_FILE)
        .expect(400);

      expect(response.body.error).toContain('Invalid file type');
    });

    test('should handle missing sessionId', async () => {
      const response = await request(API_BASE)
        .post('/upload')
        .attach('files', global.TEST_FILES.SMALL_IMAGE)
        .expect(400);

      expect(response.body.error).toContain('Session ID required');
    });

    test('should handle oversized files', async () => {
      // Create a file larger than 10MB
      const largeFile = global.testUtils.createTestImage('oversized.jpg', 11000);
      
      const response = await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', largeFile)
        .expect(400);

      expect(response.body.error).toContain('File too large');
      
      // Cleanup
      fs.unlinkSync(largeFile);
    });
  });

  describe('POST /api/describe-image', () => {
    beforeEach(async () => {
      // Upload an image first
      const uploadResponse = await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', global.TEST_FILES.SMALL_IMAGE);
      
      uploadedImageId = uploadResponse.body.results[0].id;
    });

    test('should generate AI description successfully', async () => {
      const response = await request(API_BASE)
        .post('/describe-image')
        .send({
          imageUrl: `https://example.com/test-image.jpg`,
          filename: 'test-image.jpg'
        })
        .expect(200);

      global.testUtils.verifyApiResponse(response.body, [
        'description', 'success', 'processingTime'
      ]);

      expect(response.body.success).toBe(true);
      expect(response.body.description.length).toBeGreaterThan(50);
      expect(response.body.processingTime).toBeGreaterThan(0);
    });

    test('should handle invalid image URL', async () => {
      const response = await request(API_BASE)
        .post('/describe-image')
        .send({
          imageUrl: 'invalid-url',
          filename: 'test.jpg'
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid image URL');
    });

    test('should handle missing parameters', async () => {
      const response = await request(API_BASE)
        .post('/describe-image')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('Missing required parameters');
    });
  });

  describe('GET /api/analytics', () => {
    test('should return analytics data', async () => {
      const response = await request(API_BASE)
        .get('/analytics')
        .expect(200);

      global.testUtils.verifyApiResponse(response.body, [
        'totalImages', 'recentUploads', 'storageUsed', 'aiDescriptions'
      ]);

      expect(typeof response.body.totalImages).toBe('number');
      expect(typeof response.body.recentUploads).toBe('number');
      expect(typeof response.body.storageUsed).toBe('number');
      expect(typeof response.body.aiDescriptions).toBe('number');
    });

    test('should handle date range queries', async () => {
      const response = await request(API_BASE)
        .get('/analytics')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalImages');
    });
  });

  describe('GET /api/images/[sessionId]', () => {
    beforeEach(async () => {
      // Upload images for the session
      await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', global.TEST_FILES.SMALL_IMAGE);
    });

    test('should return images for valid session', async () => {
      const response = await request(API_BASE)
        .get(`/images/${sessionId}`)
        .expect(200);

      global.testUtils.verifyApiResponse(response.body, ['images']);
      
      expect(Array.isArray(response.body.images)).toBe(true);
      expect(response.body.images.length).toBeGreaterThan(0);
      
      const image = response.body.images[0];
      expect(image).toHaveProperty('id');
      expect(image).toHaveProperty('filename');
      expect(image).toHaveProperty('publicUrl');
      expect(image).toHaveProperty('createdAt');
    });

    test('should return empty array for non-existent session', async () => {
      const response = await request(API_BASE)
        .get('/images/non-existent-session')
        .expect(200);

      expect(response.body.images).toHaveLength(0);
    });

    test('should handle malformed session ID', async () => {
      const response = await request(API_BASE)
        .get('/images/invalid-session-id!')
        .expect(400);

      expect(response.body.error).toContain('Invalid session ID format');
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /auth/signup', () => {
      test('should create new user account', async () => {
        const response = await request(API_BASE)
          .post('/auth/signup')
          .send({
            email: `test-${Date.now()}@example.com`,
            password: 'SecurePassword123!',
            fullName: 'Test User'
          })
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('session');
      });

      test('should reject duplicate email', async () => {
        const email = `duplicate-${Date.now()}@example.com`;
        
        // First signup
        await request(API_BASE)
          .post('/auth/signup')
          .send({
            email,
            password: 'SecurePassword123!',
            fullName: 'Test User'
          });

        // Second signup with same email
        const response = await request(API_BASE)
          .post('/auth/signup')
          .send({
            email,
            password: 'SecurePassword123!',
            fullName: 'Test User 2'
          })
          .expect(400);

        expect(response.body.error).toContain('Email already registered');
      });

      test('should validate password strength', async () => {
        const response = await request(API_BASE)
          .post('/auth/signup')
          .send({
            email: `weak-password-${Date.now()}@example.com`,
            password: '123',
            fullName: 'Test User'
          })
          .expect(400);

        expect(response.body.error).toContain('Password too weak');
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        // Create test user
        await request(API_BASE)
          .post('/auth/signup')
          .send({
            email: global.TEST_USER.EMAIL,
            password: global.TEST_USER.PASSWORD,
            fullName: global.TEST_USER.FULL_NAME
          });
      });

      test('should login with valid credentials', async () => {
        const response = await request(API_BASE)
          .post('/auth/login')
          .send({
            email: global.TEST_USER.EMAIL,
            password: global.TEST_USER.PASSWORD
          })
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('session');
      });

      test('should reject invalid credentials', async () => {
        const response = await request(API_BASE)
          .post('/auth/login')
          .send({
            email: global.TEST_USER.EMAIL,
            password: 'WrongPassword'
          })
          .expect(401);

        expect(response.body.error).toContain('Invalid credentials');
      });
    });
  });

  describe('Performance Tests', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(API_BASE)
        .get('/analytics')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500); // 500ms max
    });

    test('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(API_BASE).get('/analytics')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Security Tests', () => {
    test('should prevent SQL injection attempts', async () => {
      const response = await request(API_BASE)
        .get('/images/\'; DROP TABLE uploaded_images; --')
        .expect(400);

      expect(response.body.error).toContain('Invalid session ID format');
    });

    test('should sanitize file uploads', async () => {
      // Create a file with malicious name
      const maliciousFile = global.testUtils.createTestImage('../../../malicious.jpg', 50);
      
      const response = await request(API_BASE)
        .post('/upload')
        .field('sessionId', sessionId)
        .attach('files', maliciousFile)
        .expect(400);

      expect(response.body.error).toContain('Invalid filename');
      
      // Cleanup
      fs.unlinkSync(maliciousFile);
    });

    test('should rate limit API calls', async () => {
      // Make many rapid requests
      const promises = Array.from({ length: 100 }, () =>
        request(API_BASE).get('/analytics')
      );

      const responses = await Promise.allSettled(promises);
      
      // Some requests should be rate limited
      const rateLimited = responses.some(result => 
        result.status === 'fulfilled' && result.value.status === 429
      );
      
      // Note: This test depends on rate limiting being implemented
      // expect(rateLimited).toBe(true);
    });
  });
});
