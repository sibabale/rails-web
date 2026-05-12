import { test, expect } from './fixtures';

test.describe('Register', () => {
  test('registers and lands on dashboard', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/register');
    await expect(page.getByPlaceholder('Acme Institutional')).toBeVisible();

    await page.getByPlaceholder('Acme Institutional').fill('E2E Bank');
    await page.getByPlaceholder('Alice').fill('Test');
    await page.locator('input[name="admin_last_name"]').fill('User');
    await page.getByPlaceholder('admin@acme.com').fill('register-e2e@example.com');
    await page.locator('input[name="admin_password"]').fill('long-password-e2e-1');

    await page.getByRole('button', { name: /create my account/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
  });
});
