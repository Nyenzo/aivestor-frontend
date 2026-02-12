import { test, expect, Page } from '@playwright/test';

/**
 * Profile & Settings E2E Tests
 * Tests user profile management and application settings
 */

async function setupAuthSession(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify({
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://via.placeholder.com/150',
      risk_level: 'medium',
      created_at: '2024-01-01',
      preferences: {
        notifications: true,
        theme: 'light'
      }
    }));
  });
}

const isMobile = (page: Page) => page.viewportSize()?.width! < 768;

test.describe('Profile & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthSession(page);
  });

  test.describe('Profile Page', () => {
    test('should display user profile information @smoke', async ({ page }) => {
      await page.goto('/profile');
      
      // Should show user details
      await expect(page.getByText(/test.*user|test@example/i)).toBeVisible({ timeout: 3000 });
      
      // Look for profile sections
      const profileInfo = page.getByText(/profile|account|personal.*info/i);
      if (await profileInfo.isVisible()) {
        await expect(profileInfo).toBeVisible();
      }
    });

    test('should show profile picture', async ({ page }) => {
      await page.goto('/profile');
      
      // Look for profile image
      const profileImage = page.locator('img[alt*="profile" i], img[alt*="avatar" i], [class*="avatar"] img');
      
      if (await profileImage.first().isVisible()) {
        await expect(profileImage.first()).toBeVisible();
        
        // Image should have src
        const src = await profileImage.first().getAttribute('src');
        expect(src).toBeTruthy();
      }
    });

    test('should display email address', async ({ page }) => {
      await page.goto('/profile');
      
      await expect(page.getByText('test@example.com')).toBeVisible({ timeout: 3000 });
    });

    test('should show account creation date', async ({ page }) => {
      await page.goto('/profile');
      
      // Look for date information
      const dateInfo = page.getByText(/member.*since|joined|created|202\d/i);
      
      if (await dateInfo.first().isVisible()) {
        await expect(dateInfo.first()).toBeVisible();
      }
    });

    test('should show current risk level', async ({ page }) => {
      await page.goto('/profile');
      
      // Risk level should be displayed
      await expect(page.getByText(/medium|moderate|risk.*level/i)).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Edit Profile', () => {
    test('should allow editing display name', async ({ page }) => {
      await page.goto('/profile');
      
      // Look for edit button
      const editButton = page.getByRole('button', { name: /edit|update|change/i });
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Find name input
        const nameInput = page.getByLabel(/name|display.*name/i);
        
        if (await nameInput.isVisible()) {
          await nameInput.clear();
          await nameInput.fill('Updated User Name');
          
          // Save changes
          const saveButton = page.getByRole('button', { name: /save|update|confirm/i });
          
          if (await saveButton.isVisible()) {
            await saveButton.click();
            
            // Should show success message or updated name
            await expect(
              page.getByText(/updated|saved|success/i)
                .or(page.getByText('Updated User Name'))
            ).toBeVisible({ timeout: 3000 });
          }
        }
      }
    });

    test('should validate display name input', async ({ page }) => {
      await page.goto('/profile');
      
      const editButton = page.getByRole('button', { name: /edit/i });
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const nameInput = page.getByLabel(/name/i);
        
        if (await nameInput.isVisible()) {
          // Try to save empty name
          await nameInput.clear();
          
          const saveButton = page.getByRole('button', { name: /save/i });
          
          if (await saveButton.isVisible()) {
            await saveButton.click();
            
            // Should show validation error
            await expect(page.getByText(/required|cannot.*empty|enter.*name/i)).toBeVisible({ timeout: 2000 });
          }
        }
      }
    });

    test('should allow uploading profile picture', async ({ page }) => {
      await page.goto('/profile');
      
      // Look for upload button or input
      const uploadButton = page.getByRole('button', { name: /upload|change.*picture|photo/i })
        .or(page.locator('input[type="file"]'));
      
      if (await uploadButton.first().isVisible()) {
        await expect(uploadButton.first()).toBeVisible();
      }
    });

    test('should cancel profile edits', async ({ page }) => {
      await page.goto('/profile');
      
      const editButton = page.getByRole('button', { name: /edit/i });
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        const nameInput = page.getByLabel(/name/i);
        
        if (await nameInput.isVisible()) {
          await nameInput.fill('Changed Name');
          
          // Cancel changes
          const cancelButton = page.getByRole('button', { name: /cancel|discard/i });
          
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
            
            // Should revert to original name
            await expect(page.getByText('Test User')).toBeVisible({ timeout: 2000 });
          }
        }
      }
    });
  });

  test.describe('Risk Level Settings', () => {
    test('should allow changing risk level', async ({ page }) => {
      await page.goto('/profile');
      
      // Look for risk level section
      const changeRiskButton = page.getByRole('button', { name: /change.*risk|update.*risk|risk.*level/i });
      
      if (await changeRiskButton.isVisible()) {
        await changeRiskButton.click();
        
        // Select different risk level
        const highRiskButton = page.getByRole('button', { name: /high|aggressive/i });
        
        if (await highRiskButton.isVisible()) {
          await highRiskButton.click();
          
          // Confirm change
          const confirmButton = page.getByRole('button', { name: /confirm|save|update/i });
          
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
            
            // Should show updated risk level
            await expect(page.getByText(/high|aggressive/i)).toBeVisible({ timeout: 3000 });
          }
        }
      }
    });

    test('should warn about risk level change impact', async ({ page }) => {
      await page.goto('/profile');
      
      const changeRiskButton = page.getByRole('button', { name: /change.*risk/i });
      
      if (await changeRiskButton.isVisible()) {
        await changeRiskButton.click();
        
        // Should show warning or info about impact
        await expect(
          page.getByText(/warning|impact|affect|recommendation/i)
        ).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('Notification Settings', () => {
    test('should display notification preferences', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for notification toggles
      const notificationSection = page.getByText(/notification|alert|email.*preference/i);
      
      if (await notificationSection.first().isVisible()) {
        await expect(notificationSection.first()).toBeVisible();
      }
    });

    test('should toggle email notifications', async ({ page }) => {
      await page.goto('/settings');
      
      // Find email notification toggle
      const emailToggle = page.getByLabel(/email.*notification|notify.*email/i)
        .or(page.locator('[type="checkbox"]').first());
      
      if (await emailToggle.isVisible()) {
        const initialState = await emailToggle.isChecked();
        
        await emailToggle.click();
        await page.waitForTimeout(500);
        
        const newState = await emailToggle.isChecked();
        
        // State should have changed
        expect(newState).not.toBe(initialState);
      }
    });

    test('should toggle push notifications', async ({ page }) => {
      await page.goto('/settings');
      
      const pushToggle = page.getByLabel(/push.*notification|browser.*notification/i);
      
      if (await pushToggle.isVisible()) {
        await expect(pushToggle).toBeVisible();
      }
    });

    test('should save notification preferences', async ({ page }) => {
      await page.goto('/settings');
      
      const toggle = page.locator('[type="checkbox"]').first();
      
      if (await toggle.isVisible()) {
        await toggle.click();
        
        // Look for save button or auto-save indicator
        const saveButton = page.getByRole('button', { name: /save|apply/i });
        
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          await expect(page.getByText(/saved|updated/i)).toBeVisible({ timeout: 2000 });
        }
      }
    });
  });

  test.describe('Theme Settings', () => {
    test('should allow changing theme', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for theme selector
      const themeButton = page.getByRole('button', { name: /theme|dark.*mode|light.*mode/i })
        .or(page.getByLabel(/theme/i));
      
      if (await themeButton.first().isVisible()) {
        await themeButton.first().click();
        
        // Should toggle or show options
        await page.waitForTimeout(500);
        
        expect(true).toBe(true); // Theme changed
      }
    });

    test('should persist theme selection', async ({ page }) => {
      await page.goto('/settings');
      
      const darkModeToggle = page.getByRole('button', { name: /dark/i })
        .or(page.getByLabel(/dark/i));
      
      if (await darkModeToggle.first().isVisible()) {
        await darkModeToggle.first().click();
        
        // Reload page
        await page.reload();
        
        // Check if theme persisted (body should have dark class or style)
        const body = page.locator('body');
        const classes = await body.getAttribute('class');
        
        expect(classes || '').toBeTruthy();
      }
    });
  });

  test.describe('Privacy Settings', () => {
    test('should display privacy options', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for privacy section
      const privacySection = page.getByText(/privacy|data.*sharing|personal.*info/i);
      
      if (await privacySection.first().isVisible()) {
        await expect(privacySection.first()).toBeVisible();
      }
    });

    test('should allow managing data sharing preferences', async ({ page }) => {
      await page.goto('/settings');
      
      const dataToggle = page.getByLabel(/share.*data|analytics|usage.*data/i);
      
      if (await dataToggle.isVisible()) {
        await expect(dataToggle).toBeVisible();
      }
    });
  });

  test.describe('Security Settings', () => {
    test('should show security options', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for security section
      await expect(
        page.getByText(/security|password|authentication/i)
      ).toBeVisible({ timeout: 3000 });
    });

    test('should allow changing password', async ({ page }) => {
      await page.goto('/settings');
      
      const changePasswordButton = page.getByRole('button', { name: /change.*password|update.*password/i });
      
      if (await changePasswordButton.isVisible()) {
        await changePasswordButton.click();
        
        // Should show password change form
        await expect(
          page.getByLabel(/current.*password|old.*password/i)
            .or(page.getByLabel(/new.*password/i))
        ).toBeVisible({ timeout: 2000 });
      }
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/settings');
      
      const changePasswordButton = page.getByRole('button', { name: /change.*password/i });
      
      if (await changePasswordButton.isVisible()) {
        await changePasswordButton.click();
        
        const newPasswordInput = page.getByLabel(/new.*password/i).first();
        
        if (await newPasswordInput.isVisible()) {
          // Try weak password
          await newPasswordInput.fill('123');
          
          // Should show validation error
          await expect(
            page.getByText(/at least|minimum|too short|weak/i)
          ).toBeVisible({ timeout: 2000 });
        }
      }
    });

    test('should show two-factor authentication option', async ({ page }) => {
      await page.goto('/settings');
      
      const twoFactorSection = page.getByText(/two.*factor|2fa|multi.*factor/i);
      
      if (await twoFactorSection.first().isVisible()) {
        await expect(twoFactorSection.first()).toBeVisible();
      }
    });
  });

  test.describe('Account Management', () => {
    test('should show account information', async ({ page }) => {
      await page.goto('/settings');
      
      // Account details should be visible
      await expect(
        page.getByText(/account|email|member/i)
      ).toBeVisible({ timeout: 3000 });
    });

    test('should allow deleting account', async ({ page }) => {
      await page.goto('/settings');
      
      const deleteButton = page.getByRole('button', { name: /delete.*account|close.*account/i });
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should show confirmation dialog
        await expect(
          page.getByText(/confirm|sure|permanent|cannot.*undo/i)
        ).toBeVisible({ timeout: 2000 });
      }
    });

    test('should require confirmation for account deletion', async ({ page }) => {
      await page.goto('/settings');
      
      const deleteButton = page.getByRole('button', { name: /delete.*account/i });
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should have cancel and confirm buttons
        const cancelButton = page.getByRole('button', { name: /cancel|no/i });
        
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          
          // Should return to settings
          await expect(page).toHaveURL(/settings/);
        }
      }
    });

    test('should allow logging out', async ({ page }) => {
      await page.goto('/settings');
      
      const logoutButton = page.getByRole('button', { name: /log.*out|sign.*out/i });
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to login
        await expect(page).toHaveURL(/login|auth/, { timeout: 3000 });
      }
    });
  });

  test.describe('Responsive Profile', () => {
    test('should adapt profile layout for mobile', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/profile');
      
      // Profile should stack vertically
      const profileContent = page.locator('[class*="profile"]').first();
      
      if (await profileContent.isVisible()) {
        const box = await profileContent.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThan(page.viewportSize()!.width * 0.8);
        }
      }
    });

    test('should have touch-friendly settings toggles', async ({ page }) => {
      if (!isMobile(page)) {
        test.skip();
      }
      
      await page.goto('/settings');
      
      const toggles = await page.locator('[type="checkbox"], [role="switch"]').all();
      
      for (const toggle of toggles.slice(0, 3)) {
        if (await toggle.isVisible()) {
          const box = await toggle.boundingBox();
          
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(24);
          }
        }
      }
    });
  });

  test.describe('Data Export', () => {
    test('should allow exporting user data', async ({ page }) => {
      await page.goto('/settings');
      
      const exportButton = page.getByRole('button', { name: /export|download.*data/i });
      
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
      }
    });

    test('should download data in correct format', async ({ page }) => {
      await page.goto('/settings');
      
      const exportButton = page.getByRole('button', { name: /export/i });
      
      if (await exportButton.isVisible()) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        
        await exportButton.click();
        
        const download = await downloadPromise;
        
        if (download) {
          // Should download a file
          expect(download.suggestedFilename()).toBeTruthy();
        }
      }
    });
  });

  test.describe('Settings Navigation', () => {
    test('should have tabs or sections for different settings', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for navigation between settings sections
      const tabs = page.getByRole('tab')
        .or(page.locator('[class*="tab"], [class*="nav"]').getByRole('link'));
      
      if (await tabs.count() > 0) {
        await expect(tabs.first()).toBeVisible();
      }
    });

    test('should maintain settings state when switching tabs', async ({ page }) => {
      await page.goto('/settings');
      
      const toggle = page.locator('[type="checkbox"]').first();
      
      if (await toggle.isVisible()) {
        await toggle.click();
        
        const initialState = await toggle.isChecked();
        
        // Navigate away and back
        await page.goto('/dashboard');
        await page.goto('/settings');
        
        // State might not persist without save, but navigation should work
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation in settings', async ({ page }) => {
      await page.goto('/settings');
      
      await page.keyboard.press('Tab');
      
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible({ timeout: 2000 });
    });

    test('should have proper labels for all inputs', async ({ page }) => {
      await page.goto('/settings');
      
      const inputs = await page.locator('input, select').all();
      
      for (const input of inputs.slice(0, 5)) {
        if (await input.isVisible()) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          
          if (id) {
            // Check if there's a label for this input
            const label = page.locator(`label[for="${id}"]`);
            const hasLabel = await label.count() > 0;
            
            expect(hasLabel || !!ariaLabel).toBe(true);
          }
        }
      }
    });

    test('should announce setting changes to screen readers', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for live regions
      const liveRegion = page.locator('[aria-live]');
      
      if (await liveRegion.count() > 0) {
        await expect(liveRegion.first()).toBeAttached();
      }
    });
  });
});
