import { test, expect } from './fixtures';

test.describe('Password reset', () => {
  test('forgot password shows confirmation', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('admin@example.com').fill('user@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible({
      timeout: 15_000,
    });
  });

  test('reset password with token', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/reset-password?token=e2e-reset-token');
    await page.locator('input[name="password"]').fill('newpass-e2e-12');
    await page.locator('input[name="confirmPassword"]').fill('newpass-e2e-12');
    await page.getByRole('button', { name: /reset password/i }).click();
    await expect(page.getByText(/password reset successful/i)).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  });
});
