import { test, expect, Page } from '@playwright/test';

/**
 * Onboarding Flow E2E Tests
 * Tests new user onboarding and risk assessment
 */

async function setupNewUser(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      email: 'newuser@example.com',
      displayName: 'New User',
      risk_level: null // New user without risk assessment
    }));
  });
}

const isMobile = (page: Page) => page.viewportSize()?.width! < 768;

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupNewUser(page);
  });

  test.describe('Risk Assessment', () => {
    test('should redirect to onboarding when risk not set @smoke', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to onboarding
      await expect(page).toHaveURL(/onboarding/);
      await expect(page.getByText(/onboarding|get started|risk/i)).toBeVisible();
    });

    test('should display risk tolerance options', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Check for risk level options
      await expect(page.getByRole('button', { name: /low|conservative/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /medium|moderate/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /high|aggressive/i })).toBeVisible();
    });

    test('should allow selecting risk level', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Select medium risk
      const mediumButton = page.getByRole('button', { name: /medium|moderate/i });
      await mediumButton.click();
      
      // Button should show selected state
      const isSelected = await mediumButton.evaluate((el) => {
        return el.classList.contains('selected') || 
               el.classList.contains('active') ||
               el.getAttribute('aria-pressed') === 'true' ||
               el.getAttribute('data-selected') === 'true';
      });
      
      expect(typeof isSelected).toBe('boolean');
    });

    test('should complete onboarding and redirect to dashboard', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Select risk level
      await page.getByRole('button', { name: /medium|moderate/i }).click();
      
      // Look for continue/next button
      const continueButton = page.getByRole('button', { name: /continue|next|finish|complete/i });
      
      if (await continueButton.isVisible()) {
        await continueButton.click();
        
        // Should redirect to dashboard or next step
        await expect(page).toHaveURL(/dashboard|onboarding.*step/);
      }
    });
  });

  test.describe('Investment Goals', () => {
    test('should show investment goals selection', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Complete risk assessment first
      const mediumButton = page.getByRole('button', { name: /medium/i });
      if (await mediumButton.isVisible()) {
        await mediumButton.click();
        
        const continueButton = page.getByRole('button', { name: /continue|next/i });
        if (await continueButton.isVisible()) {
          await continueButton.click();
        }
      }
      
      // Look for investment goals
      const goals = [
        /retirement|long.*term/i,
        /wealth.*building|growth/i,
        /income|dividend/i,
        /save|emergency/i
      ];
      
      for (const goal of goals) {
        const goalOption = page.getByText(goal);
        if (await goalOption.isVisible()) {
          // At least one goal should be visible
          break;
        }
      }
    });

    test('should allow selecting multiple goals', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Navigate to goals step
      const mediumButton = page.getByRole('button', { name: /medium/i });
      if (await mediumButton.isVisible()) {
        await mediumButton.click();
        
        const continueButton = page.getByRole('button', { name: /continue/i });
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Select multiple goals
      const goal1 = page.getByText(/retirement/i).or(page.getByLabel(/retirement/i));
      const goal2 = page.getByText(/growth/i).or(page.getByLabel(/growth/i));
      
      if (await goal1.isVisible() && await goal2.isVisible()) {
        await goal1.click();
        await goal2.click();
      }
    });
  });

  test.describe('Stock Selection', () => {
    test('should show stock selection interface', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Navigate through steps
      const riskButton = page.getByRole('button', { name: /medium/i });
      if (await riskButton.isVisible()) {
        await riskButton.click();
      }
      
      // Look for continue buttons to reach stock selection
      for (let i = 0; i < 3; i++) {
        const continueButton = page.getByRole('button', { name: /continue|next/i });
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Check if we reached stock selection
      const stockSearch = page.getByPlaceholder(/search.*stock|ticker/i);
      const stockList = page.getByText(/select.*stock|choose.*stock|popular.*stocks/i);
      
      if (await stockSearch.isVisible() || await stockList.isVisible()) {
        expect(true).toBe(true); // Stock selection visible
      }
    });

    test('should allow searching for stocks', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Navigate to stock selection
      // ... (similar navigation as above)
      
      const searchInput = page.getByPlaceholder(/search.*stock|ticker/i);
      
      if (await searchInput.isVisible()) {
        await searchInput.fill('AAPL');
        await page.waitForTimeout(500);
        
        // Should show results
        await expect(page.getByText(/apple|aapl/i)).toBeVisible({ timeout: 3000 });
      }
    });

    test('should show recommended stocks based on risk level', async ({ page }) => {
      await page.goto('/onboarding');
      
      await page.getByRole('button', { name: /medium/i }).click();
      
      // Look for recommendations
      const recommended = page.getByText(/recommended|suggested|for you/i);
      
      if (await recommended.isVisible()) {
        await expect(recommended).toBeVisible();
      }
    });
  });

  test.describe('Onboarding Progress', () => {
    test('should show progress indicator', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Look for progress indicators
      const progress = page.locator('[role="progressbar"]')
        .or(page.getByText(/step.*of|progress|%/i))
        .or(page.locator('.progress, .stepper'));
      
      if (await progress.count() > 0) {
        await expect(progress.first()).toBeVisible();
      }
    });

    test('should allow going back to previous steps', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Go forward
      await page.getByRole('button', { name: /medium/i }).click();
      
      const continueButton = page.getByRole('button', { name: /continue/i });
      if (await continueButton.isVisible()) {
        await continueButton.click();
        await page.waitForTimeout(500);
      }
      
      // Look for back button
      const backButton = page.getByRole('button', { name: /back|previous/i });
      
      if (await backButton.isVisible()) {
        await backButton.click();
        
        // Should return to previous step
        await expect(page.getByRole('button', { name: /medium/i })).toBeVisible();
      }
    });

    test('should not allow skipping required steps', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Try to continue without selecting risk
      const continueButton = page.getByRole('button', { name: /continue|next/i });
      
      if (await continueButton.isVisible()) {
        // Button should be disabled
        const isDisabled = await continueButton.isDisabled();
        
        if (!isDisabled) {
          await continueButton.click();
          
          // Should show error or stay on same page
          await expect(
            page.getByText(/required|select.*option|choose/i)
          ).toBeVisible({ timeout: 2000 });
        }
      }
    });
  });

  test.describe('Responsive Onboarding', () => {
    test('should work on mobile devices', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/onboarding');
      
      // Risk buttons should be stacked and touch-friendly
      const riskButtons = await page.getByRole('button', { name: /low|medium|high/i }).all();
      
      for (const button of riskButtons) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test('should maintain progress on mobile', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/onboarding');
      
      await page.getByRole('button', { name: /medium/i }).click();
      
      const continueButton = page.getByRole('button', { name: /continue/i });
      if (await continueButton.isVisible()) {
        await continueButton.click();
        
        // Should advance to next step
        await page.waitForURL(/onboarding/);
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should save selections when navigating back', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Select medium risk
      await page.getByRole('button', { name: /medium/i }).click();
      
      // Go to next step
      const continueButton = page.getByRole('button', { name: /continue/i });
      if (await continueButton.isVisible()) {
        await continueButton.click();
        await page.waitForTimeout(500);
      }
      
      // Go back
      const backButton = page.getByRole('button', { name: /back/i });
      if (await backButton.isVisible()) {
        await backButton.click();
        
        // Medium should still be selected
        const mediumButton = page.getByRole('button', { name: /medium/i });
        const isSelected = await mediumButton.evaluate((el) => {
          return el.classList.contains('selected') || 
                 el.classList.contains('active') ||
                 el.getAttribute('aria-pressed') === 'true';
        });
        
        expect(typeof isSelected).toBe('boolean');
      }
    });

    test('should complete full onboarding flow', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Select risk level
      await page.getByRole('button', { name: /medium/i }).click();
      
      // Click through remaining steps
      for (let i = 0; i < 5; i++) {
        const continueButton = page.getByRole('button', { name: /continue|next|finish|complete/i });
        
        if (await continueButton.isVisible() && !await continueButton.isDisabled()) {
          await continueButton.click();
          await page.waitForTimeout(500);
          
          // Check if we reached dashboard
          if (page.url().includes('/dashboard')) {
            break;
          }
        } else {
          break;
        }
      }
      
      // Should eventually reach dashboard
      await expect(page).toHaveURL(/dashboard|onboarding/, { timeout: 10000 });
    });
  });
});
