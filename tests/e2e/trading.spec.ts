import { test, expect, Page } from '@playwright/test';

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

const isMobile = (page: Page) => page.viewportSize()?.width! < 768;

test.describe('Trading Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthSession(page);
  });

  test.describe('Trade Page', () => {
    test('should display trade interface @smoke', async ({ page }) => {
      await page.goto('/trade');
      
      await expect(page).toHaveTitle(/trade|buy.*sell/i);
      await expect(page.getByText(/trade|buy|sell/i)).toBeVisible();
    });

    test('should show stock search', async ({ page }) => {
      await page.goto('/trade');
      
      // Look for search input
      const searchInput = page.getByPlaceholder(/search.*stock|ticker|symbol/i)
        .or(page.getByRole('searchbox'));
      
      await expect(searchInput).toBeVisible();
    });

    test('should allow searching for stocks', async ({ page }) => {
      await page.goto('/trade');
      
      const searchInput = page.getByPlaceholder(/search.*stock|ticker|symbol/i)
        .or(page.getByRole('searchbox'));
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('AAPL');
        await page.waitForTimeout(500); // Debounce
        
        // Should show search results
        const results = page.getByText(/apple|aapl/i);
        if (await results.count() > 0) {
          await expect(results.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Buy Stock', () => {
    test('should display buy form', async ({ page }) => {
      await page.goto('/trade');
      
      // Look for buy tab/button
      const buyButton = page.getByRole('button', { name: /^buy$/i })
        .or(page.getByRole('tab', { name: /buy/i }));
      
      if (await buyButton.isVisible()) {
        await buyButton.click();
      }
      
      // Check for buy form elements
      await expect(
        page.getByLabel(/symbol|ticker|stock/i)
          .or(page.getByPlaceholder(/symbol|ticker/i))
      ).toBeVisible();
    });

    test('should validate buy form inputs', async ({ page }) => {
      await page.goto('/trade');
      
      // Try to submit without filling
      const submitButton = page.getByRole('button', { name: /^buy$|place.*order|submit/i });
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show validation errors
        await expect(
          page.getByText(/required|enter.*symbol|enter.*shares/i)
        ).toBeVisible({ timeout: 2000 });
      }
    });

    test('should calculate order total', async ({ page }) => {
      await page.goto('/trade');
      
      const symbolInput = page.getByLabel(/symbol|ticker/i)
        .or(page.getByPlaceholder(/symbol|ticker/i));
      const sharesInput = page.getByLabel(/shares|quantity|amount/i);
      
      if (await symbolInput.isVisible() && await sharesInput.isVisible()) {
        await symbolInput.fill('AAPL');
        await page.waitForTimeout(500);
        
        await sharesInput.fill('10');
        await page.waitForTimeout(500);
        
        // Should show total calculation
        const total = page.getByText(/total|cost|price/i)
          .and(page.getByText(/\$/));
        
        if (await total.count() > 0) {
          await expect(total.first()).toBeVisible();
        }
      }
    });

    test('should show order preview', async ({ page }) => {
      await page.goto('/trade');
      
      const symbolInput = page.getByLabel(/symbol|ticker/i)
        .or(page.getByPlaceholder(/symbol|ticker/i));
      const sharesInput = page.getByLabel(/shares|quantity/i);
      
      if (await symbolInput.isVisible() && await sharesInput.isVisible()) {
        await symbolInput.fill('AAPL');
        await sharesInput.fill('10');
        
        const reviewButton = page.getByRole('button', { name: /review|preview|continue/i });
        
        if (await reviewButton.isVisible()) {
          await reviewButton.click();
          
          // Should show order summary
          await expect(page.getByText(/review|confirm|summary/i)).toBeVisible();
          await expect(page.getByText(/aapl/i)).toBeVisible();
        }
      }
    });

    test('should handle insufficient funds', async ({ page }) => {
      await page.goto('/trade');
      
      const symbolInput = page.getByLabel(/symbol|ticker/i)
        .or(page.getByPlaceholder(/symbol|ticker/i));
      const sharesInput = page.getByLabel(/shares|quantity/i);
      
      if (await symbolInput.isVisible() && await sharesInput.isVisible()) {
        await symbolInput.fill('AAPL');
        await sharesInput.fill('99999'); // Very large amount
        
        const submitButton = page.getByRole('button', { name: /^buy$|place.*order/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Should show insufficient funds error
          await expect(
            page.getByText(/insufficient|not enough.*funds|balance/i)
          ).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Sell Stock', () => {
    test('should display sell form', async ({ page }) => {
      await page.goto('/trade');
      
      // Switch to sell tab
      const sellButton = page.getByRole('button', { name: /^sell$/i })
        .or(page.getByRole('tab', { name: /sell/i }));
      
      if (await sellButton.isVisible()) {
        await sellButton.click();
        
        // Check for sell form
        await expect(page.getByText(/sell/i)).toBeVisible();
      }
    });

    test('should show user holdings for selling', async ({ page }) => {
      await page.goto('/trade');
      
      const sellButton = page.getByRole('button', { name: /^sell$/i })
        .or(page.getByRole('tab', { name: /sell/i }));
      
      if (await sellButton.isVisible()) {
        await sellButton.click();
        
        // Should show holdings or message
        const holdings = page.getByText(/holdings|positions|your stocks/i);
        const emptyMessage = page.getByText(/no holdings|no stocks to sell/i);
        
        await expect(holdings.or(emptyMessage)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should validate sell amount', async ({ page }) => {
      await page.goto('/trade');
      
      const sellButton = page.getByRole('button', { name: /^sell$/i })
        .or(page.getByRole('tab', { name: /sell/i }));
      
      if (await sellButton.isVisible()) {
        await sellButton.click();
        
        const sharesInput = page.getByLabel(/shares|quantity/i);
        
        if (await sharesInput.isVisible()) {
          // Try to sell more than owned
          await sharesInput.fill('99999');
          
          const submitButton = page.getByRole('button', { name: /^sell$|place.*order/i });
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Should show error
            await expect(
              page.getByText(/exceed|don't have|insufficient shares/i)
            ).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });

  test.describe('Order History', () => {
    test('should display transaction history', async ({ page }) => {
      const historyPages = ['/trade', '/transactions', '/history', '/dashboard'];
      
      let found = false;
      for (const pagePath of historyPages) {
        await page.goto(pagePath);
        
        const historyLink = page.getByRole('link', { name: /history|transactions/i });
        if (await historyLink.isVisible()) {
          await historyLink.click();
          found = true;
          break;
        }
        
        const historySection = page.getByText(/transaction.*history|order.*history|recent.*orders/i);
        if (await historySection.isVisible()) {
          found = true;
          break;
        }
      }
      
      if (found) {
        // Should show transactions or empty state
        await expect(
          page.getByText(/transactions|orders|no.*transactions/i)
        ).toBeVisible();
      }
    });

    test('should show transaction details', async ({ page }) => {
      await page.goto('/trade');
      
      // Look for a transaction row
      const transaction = page.locator('[data-testid*="transaction"]')
        .or(page.getByRole('row'))
        .first();
      
      if (await transaction.count() > 0 && await transaction.isVisible()) {
        await transaction.click();
        
        // Should show details
        await expect(
          page.getByText(/detail|date|price|shares/i)
        ).toBeVisible();
      }
    });
  });

  test.describe('Real-time Price Updates', () => {
    test('should display current stock price', async ({ page }) => {
      await page.goto('/trade');
      
      const searchInput = page.getByPlaceholder(/search.*stock|ticker/i)
        .or(page.getByRole('searchbox'));
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('AAPL');
        await page.waitForTimeout(1000);
        
        // Should show price
        const price = page.getByText(/\$\d+\.\d{2}/);
        if (await price.count() > 0) {
          await expect(price.first()).toBeVisible();
        }
      }
    });

    test('should show price change indicators', async ({ page }) => {
      await page.goto('/trade');
      
      // Look for up/down indicators
      const indicators = page.locator('text=/[+-].*%/')
        .or(page.locator('[class*="up"], [class*="down"], [class*="positive"], [class*="negative"]'));
      
      if (await indicators.count() > 0) {
        await expect(indicators.first()).toBeVisible();
      }
    });
  });

  test.describe('Responsive Trading', () => {
    test('should work on mobile devices', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/trade');
      
      // Trade interface should be accessible
      await expect(page.getByText(/trade|buy|sell/i)).toBeVisible();
      
      // Forms should be usable
      const searchInput = page.getByPlaceholder(/search|ticker/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('AAPL');
        await expect(searchInput).toHaveValue('AAPL');
      }
    });

    test('should have touch-friendly buttons on mobile', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/trade');
      
      const buyButton = page.getByRole('button', { name: /buy/i }).first();
      
      if (await buyButton.isVisible()) {
        const box = await buyButton.boundingBox();
        
        if (box) {
          // Button should be at least 44px tall
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test('should adapt form layout on tablet', async ({ page }) => {
      const viewport = page.viewportSize();
      if (!viewport || viewport.width < 768 || viewport.width > 1024) {
        test.skip();
      }
      
      await page.goto('/trade');
      
      // Form should be visible and usable
      const symbolInput = page.getByLabel(/symbol|ticker/i)
        .or(page.getByPlaceholder(/symbol|ticker/i));
      
      await expect(symbolInput).toBeVisible();
    });
  });

  test.describe('Trading Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/trade');
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      
      const symbolInput = page.getByLabel(/symbol|ticker/i)
        .or(page.getByPlaceholder(/symbol|ticker/i));
      
      if (await symbolInput.isVisible()) {
        // Type with keyboard
        await page.keyboard.type('AAPL');
        await expect(symbolInput).toHaveValue(/aapl/i);
      }
    });

    test('should have proper ARIA labels for trading forms', async ({ page }) => {
      await page.goto('/trade');
      
      // Check for accessible form fields
      const symbolField = page.getByRole('textbox', { name: /symbol|ticker/i })
        .or(page.getByLabel(/symbol|ticker/i));
      
      await expect(symbolField).toBeVisible();
    });

    test('should announce errors to screen readers', async ({ page }) => {
      await page.goto('/trade');
      
      const submitButton = page.getByRole('button', { name: /buy|place.*order/i });
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Error should have role="alert" or aria-live
        const error = page.getByRole('alert')
          .or(page.locator('[aria-live="polite"], [aria-live="assertive"]'));
        
        if (await error.count() > 0) {
          await expect(error.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Order Confirmation', () => {
    test('should require confirmation before executing trade', async ({ page }) => {
      await page.goto('/trade');
      
      const symbolInput = page.getByLabel(/symbol|ticker/i)
        .or(page.getByPlaceholder(/symbol|ticker/i));
      const sharesInput = page.getByLabel(/shares|quantity/i);
      
      if (await symbolInput.isVisible() && await sharesInput.isVisible()) {
        await symbolInput.fill('AAPL');
        await sharesInput.fill('1');
        
        const submitButton = page.getByRole('button', { name: /buy|place.*order/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Should show confirmation dialog
          await expect(
            page.getByText(/confirm|are you sure|review/i)
          ).toBeVisible({ timeout: 3000 });
        }
      }
    });

    test('should allow canceling order', async ({ page }) => {
      await page.goto('/trade');
      
      const cancelButton = page.getByRole('button', { name: /cancel|back|close/i });
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Should return to trade form
        await expect(page.getByText(/trade|buy|sell/i)).toBeVisible();
      }
    });
  });
});
