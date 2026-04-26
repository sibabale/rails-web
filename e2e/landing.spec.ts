import { test, expect } from './fixtures';

test.describe('Landing', () => {
  test('loads marketing home and key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Open-source banking rails/i })).toBeVisible({
      timeout: 20_000,
    });
    await page.locator('#infrastructure').scrollIntoViewIfNeeded();
    await expect(page.locator('#infrastructure')).toBeVisible();
    await page.locator('#beta').scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('heading', { name: /Start building financial products on trusted rails/i })
    ).toBeVisible();
  });

  test('navigates to login from Get Started', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Get Started/i }).first().click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
