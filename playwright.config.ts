import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10 * 1000,
  },
  webServer: process.env.PW_E2E === '1' ? {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  } : undefined,
  
  // Cross-browser testing projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'edge-desktop',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Tablet devices
    {
      name: 'tablet-ipad',
      use: { 
        ...devices['iPad Pro'],
      },
    },
    {
      name: 'tablet-landscape',
      use: {
        ...devices['iPad (gen 7) landscape'],
      },
    },

    // Mobile devices
    {
      name: 'mobile-iphone',
      use: { 
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'mobile-android',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-iphone-landscape',
      use: {
        ...devices['iPhone 13 landscape'],
      },
    },

    // Responsive breakpoints
    {
      name: 'responsive-small',
      use: {
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'responsive-medium',
      use: {
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'responsive-large',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'responsive-xlarge',
      use: {
        viewport: { width: 2560, height: 1440 },
      },
    },
  ],
});
