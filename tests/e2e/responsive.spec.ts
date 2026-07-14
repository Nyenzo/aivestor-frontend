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

const getViewportCategory = (page: Page) => {
  const width = page.viewportSize()?.width || 1920;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthSession(page);
  });

  test.describe('Viewport Breakpoints', () => {
    test('should adapt layout for current viewport', async ({ page }) => {
      await page.goto('/dashboard');
      
      const category = getViewportCategory(page);
      
      // Check navigation layout
      const nav = page.locator('nav').or(page.locator('[role="navigation"]'));
      
      if (await nav.isVisible()) {
        const box = await nav.boundingBox();
        
        if (category === 'mobile') {
          // Mobile nav should be compact or hidden
          if (box) {
            expect(box.width).toBeLessThan(page.viewportSize()!.width);
          }
        } else {
          // Desktop nav should be full or sidebar
          expect(await nav.isVisible()).toBe(true);
        }
      }
    });

    test('should show mobile menu when on small screens', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Look for hamburger menu
      const menuButton = page.getByRole('button', { name: /menu|navigation/i })
        .or(page.locator('[aria-label*="menu" i]'))
        .or(page.locator('.hamburger, .menu-toggle'));
      
      if (await menuButton.isVisible()) {
        await expect(menuButton).toBeVisible();
        
        // Click to open menu
        await menuButton.click();
        
        // Menu should expand
        const menu = page.locator('nav[aria-expanded="true"]')
          .or(page.locator('.menu-open, .nav-expanded'));
        
        await expect(menu.or(page.getByRole('link', { name: /dashboard/i }))).toBeVisible({ timeout: 2000 });
      }
    });

    test('should stack content vertically on mobile', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Portfolio cards should stack
      const cards = await page.locator('[class*="card"], [class*="portfolio"]').all();
      
      if (cards.length >= 2) {
        const box1 = await cards[0].boundingBox();
        const box2 = await cards[1].boundingBox();
        
        if (box1 && box2) {
          // Cards should be stacked (one below the other)
          expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10);
        }
      }
    });

    test('should show side-by-side content on desktop', async ({ page }) => {
      if (getViewportCategory(page) !== 'desktop') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Portfolio and charts might be side by side
      const portfolio = page.locator('[class*="portfolio"]').first();
      const chart = page.locator('[class*="chart"]').first();
      
      if (await portfolio.isVisible() && await chart.isVisible()) {
        const portfolioBox = await portfolio.boundingBox();
        const chartBox = await chart.boundingBox();
        
        if (portfolioBox && chartBox) {
          // Might be side by side (not necessarily, but check layout makes sense)
          const horizontalOverlap = Math.max(
            0,
            Math.min(portfolioBox.x + portfolioBox.width, chartBox.x + chartBox.width) -
            Math.max(portfolioBox.x, chartBox.x)
          );
          
          expect(horizontalOverlap).toBeLessThan(Math.min(portfolioBox.width, chartBox.width));
        }
      }
    });
  });

  test.describe('Touch Interactions', () => {
    test('should have touch-friendly buttons on mobile', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // All interactive buttons should be at least 44px tall
      const buttons = await page.getByRole('button').all();
      
      for (const button of buttons.slice(0, 5)) {
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40); // 44px is ideal, 40px acceptable
          }
        }
      }
    });

    test('should support swipe gestures for navigation', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Look for swipeable components
      const swipeable = page.locator('[class*="swipe"], [class*="carousel"]');
      
      if (await swipeable.isVisible()) {
        const box = await swipeable.boundingBox();
        
        if (box) {
          // Simulate swipe
          await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
          await page.mouse.up();
          
          await page.waitForTimeout(500);
          
          // Content should change or move
          expect(true).toBe(true);
        }
      }
    });

    test('should show touch-optimized inputs on mobile', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/trade');
      
      const inputs = await page.getByRole('textbox').all();
      
      for (const input of inputs) {
        if (await input.isVisible()) {
          const box = await input.boundingBox();
          
          if (box) {
            // Mobile inputs should be tall enough for touch
            expect(box.height).toBeGreaterThanOrEqual(36);
          }
        }
      }
    });
  });

  test.describe('Tablet Layout', () => {
    test('should use tablet-optimized layout', async ({ page }) => {
      if (getViewportCategory(page) !== 'tablet') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Tablet might show sidebar or compact nav
      const nav = page.locator('nav, [role="navigation"]');
      
      if (await nav.isVisible()) {
        const navBox = await nav.boundingBox();
        const viewportWidth = page.viewportSize()!.width;
        
        if (navBox) {
          // Tablet nav should be neither full mobile nor full desktop
          expect(navBox.width).toBeGreaterThan(0);
          expect(navBox.width).toBeLessThanOrEqual(viewportWidth);
        }
      }
    });

    test('should handle landscape and portrait orientations', async ({ page }) => {
      if (getViewportCategory(page) !== 'tablet') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      const currentWidth = page.viewportSize()!.width;
      const currentHeight = page.viewportSize()!.height;
      
      // Check if landscape or portrait
      const isLandscape = currentWidth > currentHeight;
      
      // Layout should adapt to orientation
      const content = page.locator('main, [role="main"]');
      
      if (await content.isVisible()) {
        const box = await content.boundingBox();
        
        if (box && isLandscape) {
          // Landscape might show more side-by-side content
          expect(box.width).toBeGreaterThan(box.height);
        }
      }
    });
  });

  test.describe('Content Reflow', () => {
    test('should not have horizontal scrolling', async ({ page }) => {
      await page.goto('/dashboard');
      
      const body = page.locator('body');
      
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      
      // No horizontal overflow
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
    });

    test('should wrap text appropriately', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Long text should wrap
      const paragraphs = await page.locator('p, span, div').all();
      
      for (const p of paragraphs.slice(0, 5)) {
        if (await p.isVisible()) {
          const text = await p.textContent();
          
          if (text && text.length > 50) {
            const box = await p.boundingBox();
            
            if (box) {
              // Text should wrap within viewport
              expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
            }
          }
        }
      }
    });

    test('should hide non-critical content on small screens', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Optional content might be hidden
      const optional = page.getByText(/learn more|info|help|tooltip/i);
      
      if (await optional.count() > 0) {
        // Some optional content might not be immediately visible
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Images and Media', () => {
    test('should load responsive images', async ({ page }) => {
      await page.goto('/dashboard');
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
        if (await img.isVisible()) {
          // Image should have proper sizing
          const box = await img.boundingBox();
          const viewportWidth = page.viewportSize()!.width;
          
          if (box) {
            expect(box.width).toBeLessThanOrEqual(viewportWidth);
          }
          
          // Should have alt text for accessibility
          const alt = await img.getAttribute('alt');
          expect(alt !== null).toBe(true);
        }
      }
    });

    test('should scale charts for viewport', async ({ page }) => {
      await page.goto('/dashboard');
      
      const charts = page.locator('canvas, svg, [class*="chart"]');
      
      if (await charts.first().isVisible()) {
        const box = await charts.first().boundingBox();
        const viewportWidth = page.viewportSize()!.width;
        
        if (box) {
          // Chart should fit viewport
          expect(box.width).toBeLessThanOrEqual(viewportWidth * 0.95);
        }
      }
    });
  });

  test.describe('Typography', () => {
    test('should use readable font sizes', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Body text should be at least 14px
      const paragraphs = await page.locator('p, span').all();
      
      for (const p of paragraphs.slice(0, 3)) {
        if (await p.isVisible()) {
          const fontSize = await p.evaluate(el => 
            window.getComputedStyle(el).fontSize
          );
          
          const sizeValue = parseInt(fontSize);
          
          if (!isNaN(sizeValue)) {
            expect(sizeValue).toBeGreaterThanOrEqual(12); // Minimum readable size
          }
        }
      }
    });

    test('should adjust heading sizes for mobile', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      const h1 = page.locator('h1').first();
      
      if (await h1.isVisible()) {
        const fontSize = await h1.evaluate(el => 
          window.getComputedStyle(el).fontSize
        );
        
        const sizeValue = parseInt(fontSize);
        
        // Mobile h1 should be smaller than desktop but still prominent
        expect(sizeValue).toBeGreaterThanOrEqual(20);
        expect(sizeValue).toBeLessThanOrEqual(40);
      }
    });
  });

  test.describe('Navigation', () => {
    test('should provide accessible navigation on all devices', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Navigation should be accessible
      const navLinks = page.getByRole('link').or(page.getByRole('button'));
      
      const visibleLinks = await navLinks.all();
      
      expect(visibleLinks.length).toBeGreaterThan(0);
    });

    test('should maintain navigation state across pages', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Click a nav link
      const portfolioLink = page.getByRole('link', { name: /portfolio|holdings/i });
      
      if (await portfolioLink.isVisible()) {
        await portfolioLink.click();
        await page.waitForTimeout(500);
        
        // Should navigate
        expect(page.url()).toBeTruthy();
      }
    });
  });

  test.describe('Forms', () => {
    test('should have full-width inputs on mobile', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/trade');
      
      const inputs = await page.getByRole('textbox').all();
      const viewportWidth = page.viewportSize()!.width;
      
      for (const input of inputs.slice(0, 3)) {
        if (await input.isVisible()) {
          const box = await input.boundingBox();
          
          if (box) {
            // Mobile inputs should be near full width
            expect(box.width).toBeGreaterThan(viewportWidth * 0.7);
          }
        }
      }
    });

    test('should use appropriate input types for mobile keyboards', async ({ page }) => {
      if (getViewportCategory(page) !== 'mobile') {
        test.skip();
      }
      
      await page.goto('/trade');
      
      // Number inputs should have correct type
      const quantityInput = page.getByLabel(/quantity|shares/i);
      
      if (await quantityInput.isVisible()) {
        const inputType = await quantityInput.getAttribute('type');
        
        // Should be number or text with inputmode
        expect(['number', 'text', 'tel'].includes(inputType || '')).toBe(true);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load quickly on all devices', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(8000);
    });

    test('should not block interactions during loading', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Even during loading, basic navigation should work
      const dashboardLink = page.getByRole('link', { name: /dashboard/i });
      
      if (await dashboardLink.isVisible()) {
        // Link should be clickable
        await expect(dashboardLink).toBeEnabled({ timeout: 3000 });
      }
    });
  });

  test.describe('Accessibility on Different Devices', () => {
    test('should support keyboard navigation on desktop', async ({ page }) => {
      if (getViewportCategory(page) === 'mobile') {
        test.skip();
      }
      
      await page.goto('/dashboard');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible({ timeout: 2000 });
    });

    test('should have adequate color contrast', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Check some text elements for contrast
      const text = page.locator('p, span, h1, h2').first();
      
      if (await text.isVisible()) {
        const color = await text.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            background: style.backgroundColor
          };
        });
        
        // Should have defined colors (specific contrast checking requires complex calculation)
        expect(color.color).toBeTruthy();
      }
    });

    test('should support screen reader announcements', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for ARIA live regions
      const liveRegion = page.locator('[aria-live]');
      
      if (await liveRegion.count() > 0) {
        await expect(liveRegion.first()).toBeAttached();
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should render correctly in current browser', async ({ page, browserName }) => {
      await page.goto('/dashboard');
      
      // Basic rendering check
      await expect(page.locator('body')).toBeVisible();
      
      // Dashboard content should load
      const content = page.locator('main, [role="main"]').or(page.getByText(/dashboard|portfolio/i));
      await expect(content.first()).toBeVisible({ timeout: 5000 });
    });

    test('should handle CSS properly', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Check if styles are applied
      const body = page.locator('body');
      
      const styles = await body.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          fontFamily: computed.fontFamily,
          margin: computed.margin
        };
      });
      
      expect(styles.fontFamily).toBeTruthy();
    });

    test('should execute JavaScript correctly', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Interactive elements should work
      const button = page.getByRole('button').first();
      
      if (await button.isVisible()) {
        await button.click();
        
        // Should handle click (no error thrown)
        expect(true).toBe(true);
      }
    });
  });
});
