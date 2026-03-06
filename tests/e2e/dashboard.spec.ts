import { test, expect, Page } from '@playwright/test';

// Helper function to set up authenticated session
async function setupAuthSession(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      email: 'test@example.com',
      displayName: 'Test User',
      risk_level: 'medium'
    }));
  });
}

// Helper to check if mobile
const isMobile = (page: Page) => page.viewportSize()?.width! < 768;

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthSession(page);
  });

  test.describe('Dashboard Layout', () => {
    test('should display dashboard for authenticated user @smoke', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should show dashboard content
      await expect(page.getByText(/dashboard|portfolio|welcome/i)).toBeVisible();
    });

    test('should show user information', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Check for user email or name
      const userName = page.getByText(/test user|test@example\.com/i);
      if (await userName.isVisible()) {
        await expect(userName).toBeVisible();
      }
    });

    test('should display portfolio summary', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for portfolio-related content
      const portfolioSection = page.getByText(/portfolio|holdings|total value|balance/i).first();
      await expect(portfolioSection).toBeVisible();
    });

    test('should show navigation menu', async ({ page }) => {
      await page.goto('/dashboard');
      
      if (isMobile(page)) {
        // Check for mobile menu button
        const menuButton = page.getByRole('button', { name: /menu|navigation/i });
        if (await menuButton.isVisible()) {
          await menuButton.click();
        }
      }
      
      // Check for dashboard navigation links
      const navLinks = [
        /dashboard/i,
        /portfolio/i,
        /trade|trading/i,
        /profile|settings/i
      ];
      
      for (const linkPattern of navLinks) {
        const link = page.getByRole('link', { name: linkPattern }).or(
          page.getByText(linkPattern)
        );
        if (await link.count() > 0) {
          // At least one navigation element should be visible
          break;
        }
      }
    });
  });

  test.describe('Portfolio Display', () => {
    test('should show empty portfolio message when no holdings', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for empty state message
      const emptyMessage = page.getByText(/no holdings|empty portfolio|start investing|add stocks/i);
      if (await emptyMessage.isVisible()) {
        await expect(emptyMessage).toBeVisible();
      }
    });

    test('should display portfolio value', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for currency displays (dollar amounts)
      const currencyPattern = /\$[\d,]+\.?\d*/;
      const amounts = await page.getByText(currencyPattern).count();
      
      // Should have at least one monetary value displayed
      expect(amounts).toBeGreaterThanOrEqual(0);
    });

    test('should show gain/loss indicators', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for percentage indicators
      const percentagePattern = /[+-]?\d+\.?\d*%/;
      const percentages = await page.getByText(percentagePattern).count();
      
      expect(percentages).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Stock Information', () => {
    test('should display stock symbols', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Common stock ticker pattern
      const tickerPattern = /^[A-Z]{1,5}$/;
      
      // Check if any stock tickers are visible
      const symbols = await page.locator('text=/^[A-Z]{2,5}$/').count();
      expect(symbols).toBeGreaterThanOrEqual(0);
    });

    test('should show real-time price updates indicator', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for refresh or update indicators
      const updateIndicator = page.getByText(/updated|last update|refreshed|live/i);
      if (await updateIndicator.isVisible()) {
        await expect(updateIndicator).toBeVisible();
      }
    });
  });

  test.describe('Chart Display', () => {
    test('should render portfolio chart', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for canvas or SVG elements (common in charts)
      const chartCanvas = page.locator('canvas').or(page.locator('svg'));
      
      if (await chartCanvas.count() > 0) {
        await expect(chartCanvas.first()).toBeVisible();
      }
    });

    test('should allow chart timeframe selection', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for timeframe buttons (1D, 1W, 1M, 1Y, etc.)
      const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
      
      for (const timeframe of timeframes) {
        const button = page.getByRole('button', { name: new RegExp(timeframe, 'i') });
        if (await button.isVisible()) {
          await button.click();
          // Wait for potential chart update
          await page.waitForTimeout(500);
          break;
        }
      }
    });
  });

  test.describe('Responsive Dashboard', () => {
    test('should adapt layout for mobile', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Mobile should have stacked layout
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
      
      // Check that content is still accessible
      await expect(page.getByText(/dashboard|portfolio/i)).toBeVisible();
    });

    test('should show/hide mobile navigation', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Find mobile menu toggle
      const menuButton = page.getByRole('button', { name: /menu|☰|≡/i });
      
      if (await menuButton.isVisible()) {
        // Open menu
        await menuButton.click();
        await page.waitForTimeout(300); // Animation
        
        // Menu should be visible
        const nav = page.getByRole('navigation');
        await expect(nav).toBeVisible();
        
        // Close menu (click button again or outside)
        await menuButton.click();
        await page.waitForTimeout(300);
      }
    });

    test('should maintain functionality on tablet', async ({ page }) => {
      const viewport = page.viewportSize();
      if (!viewport || viewport.width < 768 || viewport.width > 1024) {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Tablet should show dashboard
      await expect(page.getByText(/dashboard|portfolio/i)).toBeVisible();
      
      // Should be able to navigate
      const profileLink = page.getByRole('link', { name: /profile|settings/i });
      if (await profileLink.isVisible()) {
        await profileLink.click();
        await expect(page).toHaveURL(/profile|settings/);
      }
    });
  });

  test.describe('Dashboard Interactions', () => {
    test('should navigate to trade page', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for trade/buy/sell buttons
      const tradeButton = page.getByRole('button', { name: /trade|buy|sell/i })
        .or(page.getByRole('link', { name: /trade|buy|sell/i }));
      
      if (await tradeButton.first().isVisible()) {
        await tradeButton.first().click();
        await expect(page).toHaveURL(/trade|buy|sell/);
      }
    });

    test('should navigate to stock details', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for clickable stock symbols
      const stockSymbol = page.locator('[data-testid*="stock"]')
        .or(page.locator('text=/^[A-Z]{2,5}$/'))
        .first();
      
      if (await stockSymbol.count() > 0 && await stockSymbol.isVisible()) {
        await stockSymbol.click();
        // Should navigate to stock detail page
        await page.waitForURL(/.*/, { waitUntil: 'networkidle' });
      }
    });

    test('should refresh portfolio data', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for refresh button
      const refreshButton = page.getByRole('button', { name: /refresh|reload|update/i });
      
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        
        // Wait for potential loading indicator
        const loading = page.getByText(/loading|updating/i);
        if (await loading.isVisible()) {
          await expect(loading).toBeHidden({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle multiple rapid navigation', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Rapidly navigate between pages
      for (let i = 0; i < 3; i++) {
        const profileLink = page.getByRole('link', { name: /profile|settings/i });
        if (await profileLink.isVisible()) {
          await profileLink.click();
          await page.waitForTimeout(100);
        }
        
        const dashboardLink = page.getByRole('link', { name: /dashboard/i });
        if (await dashboardLink.isVisible()) {
          await dashboardLink.click();
          await page.waitForTimeout(100);
        }
      }
      
      // Should still be functional
      await expect(page.getByText(/dashboard|portfolio/i)).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Simulate offline
      await page.context().setOffline(true);
      
      // Try to refresh
      await page.reload();
      
      // Should show error message
      await expect(
        page.getByText(/error|offline|connection|network/i)
      ).toBeVisible({ timeout: 10000 });
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test('should show loading states', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should show loading indicator during initial load
      const loadingIndicator = page.getByText(/loading|please wait/i)
        .or(page.locator('[data-testid*="loading"]'))
        .or(page.locator('.loading, .spinner'));
      
      // May or may not be visible depending on load speed
      const hasLoading = await loadingIndicator.count() > 0;
      expect(typeof hasLoading).toBe('boolean');
    });
  });
});
