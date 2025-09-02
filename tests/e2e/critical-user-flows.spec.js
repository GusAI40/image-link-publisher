// End-to-End Tests for Critical User Flows
// Tests complete user journeys across the entire application

const { test, expect } = require('@playwright/test');

test.describe('Critical User Flows - Image Link Publisher', () => {
  let page;
  let sessionId;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    sessionId = global.testUtils.generateSessionId();
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.afterEach(async () => {
    await global.testUtils.cleanupTestData();
    await page.close();
  });

  test('Complete Upload Flow - Simple Interface', async () => {
    // Navigate to simple interface
    await page.goto(`${global.TEST_CONFIG.BASE_URL}/simple`);
    
    // Verify page loads correctly
    await expect(page.locator('h1')).toContainText('Simple Image Upload');
    
    // Test file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(global.TEST_FILES.SMALL_IMAGE);
    
    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]', { 
      timeout: global.TEST_CONFIG.UPLOAD_TIMEOUT 
    });
    
    // Verify success message
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    
    // Verify image appears in results
    await expect(page.locator('[data-testid="uploaded-image"]')).toBeVisible();
    
    // Verify public URL is generated
    const publicUrl = await page.locator('[data-testid="public-url"]').textContent();
    expect(publicUrl).toContain('https://');
    
    // Test AI description generation
    await page.click('[data-testid="generate-description"]');
    await page.waitForSelector('[data-testid="ai-description"]', {
      timeout: global.TEST_CONFIG.AI_TIMEOUT
    });
    
    // Verify description is generated
    const description = await page.locator('[data-testid="ai-description"]').textContent();
    expect(description.length).toBeGreaterThan(50);
  });

  test('Authentication Flow - Login/Signup', async () => {
    // Test signup flow
    await page.goto(`${global.TEST_CONFIG.BASE_URL}/auth/sign-up`);
    
    await page.fill('[data-testid="email-input"]', global.TEST_USER.EMAIL);
    await page.fill('[data-testid="password-input"]', global.TEST_USER.PASSWORD);
    await page.fill('[data-testid="name-input"]', global.TEST_USER.FULL_NAME);
    
    await page.click('[data-testid="signup-button"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
    
    // Test logout
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('**/auth/login');
    
    // Test login flow
    await page.fill('[data-testid="email-input"]', global.TEST_USER.EMAIL);
    await page.fill('[data-testid="password-input"]', global.TEST_USER.PASSWORD);
    await page.click('[data-testid="login-button"]');
    
    // Verify successful login
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });

  test('Batch Upload Flow - Premium Interface', async () => {
    // Navigate to premium interface
    await page.goto(`${global.TEST_CONFIG.BASE_URL}/premium`);
    
    // Verify premium features are visible
    await expect(page.locator('[data-testid="batch-upload"]')).toBeVisible();
    
    // Test multiple file upload
    const fileInput = page.locator('input[type="file"][multiple]');
    await fileInput.setInputFiles(global.TEST_FILES.BATCH_IMAGES);
    
    // Wait for all uploads to complete
    await page.waitForSelector('[data-testid="batch-upload-complete"]', {
      timeout: global.TEST_CONFIG.UPLOAD_TIMEOUT * 3
    });
    
    // Verify all images are uploaded
    const uploadedImages = await page.locator('[data-testid="uploaded-image"]').count();
    expect(uploadedImages).toBe(global.TEST_FILES.BATCH_IMAGES.length);
    
    // Test batch AI description generation
    await page.click('[data-testid="generate-all-descriptions"]');
    
    // Wait for all descriptions to be generated
    await page.waitForFunction(() => {
      const descriptions = document.querySelectorAll('[data-testid="ai-description"]');
      return descriptions.length === 3 && 
             Array.from(descriptions).every(desc => desc.textContent.length > 50);
    }, { timeout: global.TEST_CONFIG.AI_TIMEOUT * 3 });
    
    // Verify markdown generation
    await page.click('[data-testid="generate-markdown"]');
    await expect(page.locator('[data-testid="markdown-output"]')).toBeVisible();
    
    const markdownContent = await page.locator('[data-testid="markdown-output"]').textContent();
    expect(markdownContent).toContain('![');
    expect(markdownContent).toContain('](https://');
  });

  test('Dashboard Analytics Flow', async () => {
    // Navigate to dashboard
    await page.goto(`${global.TEST_CONFIG.BASE_URL}/dashboard`);
    
    // Verify analytics components load
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
    
    // Check analytics metrics
    await expect(page.locator('[data-testid="total-images"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-uploads"]')).toBeVisible();
    await expect(page.locator('[data-testid="storage-used"]')).toBeVisible();
    
    // Test image history
    await expect(page.locator('[data-testid="image-history"]')).toBeVisible();
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'test');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Verify search results
    await page.waitForSelector('[data-testid="search-results"]');
    
    // Test filtering
    await page.selectOption('[data-testid="filter-select"]', 'recent');
    await page.waitForSelector('[data-testid="filtered-results"]');
  });

  test('Error Handling and Edge Cases', async () => {
    await page.goto(`${global.TEST_CONFIG.BASE_URL}/simple`);
    
    // Test invalid file upload
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(global.TEST_FILES.INVALID_FILE);
    
    // Verify error message
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('Invalid file type');
    
    // Test oversized file (if available)
    if (global.TEST_FILES.LARGE_IMAGE) {
      await fileInput.setInputFiles(global.TEST_FILES.LARGE_IMAGE);
      
      // Should either upload successfully or show size warning
      const hasError = await page.locator('[data-testid="upload-error"]').isVisible();
      const hasSuccess = await page.locator('[data-testid="upload-success"]').isVisible();
      
      expect(hasError || hasSuccess).toBe(true);
    }
    
    // Test network error simulation
    await page.route('**/api/upload', route => route.abort());
    await fileInput.setInputFiles(global.TEST_FILES.SMALL_IMAGE);
    
    // Verify network error handling
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test('Cross-Browser Compatibility', async () => {
    // This test runs the basic flow to ensure compatibility
    await page.goto(`${global.TEST_CONFIG.BASE_URL}`);
    
    // Test navigation
    await page.click('[data-testid="simple-interface-link"]');
    await expect(page).toHaveURL(/.*\/simple/);
    
    await page.click('[data-testid="premium-interface-link"]');
    await expect(page).toHaveURL(/.*\/premium/);
    
    await page.click('[data-testid="dashboard-link"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    await page.setViewportSize({ width: 1280, height: 720 }); // Desktop
    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
  });

  test('Performance Benchmarks', async () => {
    const startTime = Date.now();
    
    // Measure page load time
    await page.goto(`${global.TEST_CONFIG.BASE_URL}`);
    const loadTime = Date.now() - startTime;
    
    // Verify page loads within acceptable time
    expect(loadTime).toBeLessThan(3000); // 3 seconds max
    
    // Measure file upload performance
    await page.goto(`${global.TEST_CONFIG.BASE_URL}/simple`);
    
    const uploadStartTime = Date.now();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(global.TEST_FILES.SMALL_IMAGE);
    
    await page.waitForSelector('[data-testid="upload-success"]', {
      timeout: global.TEST_CONFIG.UPLOAD_TIMEOUT
    });
    
    const uploadTime = Date.now() - uploadStartTime;
    expect(uploadTime).toBeLessThan(10000); // 10 seconds max for small file
    
    // Measure AI description generation time
    const aiStartTime = Date.now();
    await page.click('[data-testid="generate-description"]');
    
    await page.waitForSelector('[data-testid="ai-description"]', {
      timeout: global.TEST_CONFIG.AI_TIMEOUT
    });
    
    const aiTime = Date.now() - aiStartTime;
    expect(aiTime).toBeLessThan(30000); // 30 seconds max for AI processing
  });
});
