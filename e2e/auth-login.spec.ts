import { test, expect } from './fixtures';

test.describe('Login', () => {
  test('signs in and reaches dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /infrastructure auth/i })).toBeVisible();
    await page.getByPlaceholder('admin@example.com').fill('e2e@example.com');
    await page.getByPlaceholder('••••••••••••').fill('not-used-mocked');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  });

  test('opens forgot password from login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /forgot security credentials/i }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });
});
