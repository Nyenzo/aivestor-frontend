import { test, expect, Page } from '@playwright/test';

async function setupAuthSession(page: Page) {
    await page.goto('/');
    await page.evaluate(() => {
        // Create a valid mock JWT that won't fail decodeToken and isn't expired
        const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, user_id: 'mock-user-id-12345' }));
        localStorage.setItem('token', `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.signature`);
        localStorage.setItem('user', JSON.stringify({
            uid: 'mock-user-id-12345',
            email: 'test@example.com',
            displayName: 'Test User'
        }));
    });
}

test.describe('Chatbot Flow', () => {
    test.beforeEach(async ({ page }) => {
        await setupAuthSession(page);
    });

    test('should display chat interface', async ({ page }) => {
        // Block Firestore to prevent infinite loading state due to missing Firebase Auth
        await page.route('***firestore.googleapis.com*firestore.googleapis.com/**', route => route.abort());
        await page.goto('/chat');

        const chatInput = page.locator('input[type="text"]').or(page.locator('textarea')).first();
        await chatInput.fill('How do I reset my password?');
        await chatInput.press('Enter');

        // Message should appear in chat history
        await expect(page.getByText('How do I reset my password?')).toBeVisible();
    });
});
