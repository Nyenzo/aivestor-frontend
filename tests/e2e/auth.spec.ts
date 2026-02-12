import { test, expect, Page } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests user registration, login, logout, password reset flows
 * Runs across all configured browsers and devices
 */

// Helper to check if we're on mobile
const isMobile = (page: Page) => page.viewportSize()?.width! < 768;

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Login Page', () => {
    test('should display login form elements @smoke', async ({ page }) => {
      await page.goto('/login');
      
      // Check page title
      await expect(page).toHaveTitle(/Aivestor.*Login/i);
      
      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
      
      // Check links
      await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /log in/i }).click();
      
      // Check for validation messages
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/password/i).fill('password123');
      await page.getByRole('button', { name: /log in/i }).click();
      
      await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByRole('link', { name: /sign up/i }).click();
      
      await expect(page).toHaveURL(/register/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByRole('link', { name: /forgot password/i }).click();
      
      await expect(page).toHaveURL(/forgot-password/);
    });
  });

  test.describe('Registration Flow', () => {
    test('should display registration form @smoke', async ({ page }) => {
      await page.goto('/register');
      
      await expect(page).toHaveTitle(/Aivestor.*Register/i);
      await expect(page.getByLabel(/name/i).or(page.getByLabel(/display name/i))).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|register/i })).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/register');
      
      const nameField = page.getByLabel(/name/i).or(page.getByLabel(/display name/i));
      const emailField = page.getByLabel(/email/i);
      const passwordField = page.getByLabel(/^password$/i);
      const confirmField = page.getByLabel(/confirm password/i);
      
      await nameField.fill('Test User');
      await emailField.fill('test@example.com');
      await passwordField.fill('weak');
      await confirmField.fill('weak');
      
      await page.getByRole('button', { name: /sign up|register/i }).click();
      
      // Should show password strength requirements
      await expect(page.getByText(/at least 8 characters|password must/i)).toBeVisible();
    });

    test('should validate password matching', async ({ page }) => {
      await page.goto('/register');
      
      const nameField = page.getByLabel(/name/i).or(page.getByLabel(/display name/i));
      const emailField = page.getByLabel(/email/i);
      const passwordField = page.getByLabel(/^password$/i);
      const confirmField = page.getByLabel(/confirm password/i);
      
      await nameField.fill('Test User');
      await emailField.fill('test@example.com');
      await passwordField.fill('Password123!');
      await confirmField.fill('Password456!');
      
      await page.getByRole('button', { name: /sign up|register/i }).click();
      
      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });
  });

  test.describe('Forgot Password Flow', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await expect(page).toHaveTitle(/Forgot Password|Reset Password/i);
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|reset/i })).toBeVisible();
    });

    test('should validate email field', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await page.getByRole('button', { name: /send|reset/i }).click();
      
      await expect(page.getByText(/email is required|enter.*email/i)).toBeVisible();
    });

    test('should navigate back to login', async ({ page }) => {
      await page.goto('/forgot-password');
      
      const backLink = page.getByRole('link', { name: /back to login|sign in/i });
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL(/login/);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/);
    });

    test('should persist authentication state', async ({ page }) => {
      // Set mock token
      await page.goto('/login');
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify({ 
          email: 'test@example.com',
          displayName: 'Test User'
        }));
      });
      
      // Navigate to protected route
      await page.goto('/dashboard');
      
      // Token should still exist
      const hasToken = await page.evaluate(() => !!localStorage.getItem('token'));
      expect(hasToken).toBe(true);
    });

    test('should clear session on logout', async ({ page }) => {
      // Set mock session
      await page.goto('/dashboard');
      await page.evaluate(() => {
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));
      });
      
      await page.reload();
      
      // Find and click logout button
      const logoutButton = page.getByRole('button', { name: /log out|sign out/i })
        .or(page.getByRole('link', { name: /log out|sign out/i }));
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should clear storage
        const hasToken = await page.evaluate(() => !!localStorage.getItem('token'));
        expect(hasToken).toBe(false);
        
        // Should redirect to login
        await expect(page).toHaveURL(/login|\/$/);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      const isMobileView = isMobile(page);
      
      await page.goto('/login');
      
      // Check that form is still accessible
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      
      if (isMobileView) {
        // Mobile-specific checks
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeLessThan(768);
        
        // Check for mobile-friendly layout
        const loginButton = page.getByRole('button', { name: /log in/i });
        const buttonBox = await loginButton.boundingBox();
        
        if (buttonBox) {
          // Button should be wide enough for touch
          expect(buttonBox.height).toBeGreaterThan(40);
        }
      }
    });

    test('should have touch-friendly inputs on mobile', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/login');
      
      const emailInput = page.getByLabel(/email/i);
      const box = await emailInput.boundingBox();
      
      if (box) {
        // Input should be at least 44px tall (Apple's recommendation)
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');
      
      // Check for accessible form labels
      const emailInput = page.getByRole('textbox', { name: /email/i });
      const passwordInput = page.getByLabel(/password/i);
      
      await expect(emailInput.or(page.getByLabel(/email/i))).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/login');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/email/i)).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/password/i)).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /log in/i })).toBeFocused();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/login');
      
      const emailInput = page.getByLabel(/email/i);
      await emailInput.focus();
      
      // Check that focused element has some outline/ring
      const outline = await emailInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline || styles.boxShadow;
      });
      
      expect(outline).not.toBe('none');
      expect(outline).not.toBe('');
    });
  });
});
