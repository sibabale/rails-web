import { test, expect } from './fixtures';

test.describe('Landing', () => {
  test('loads marketing home and key sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('marketing-hero-heading')).toContainText(/Bank/, { timeout: 20_000 });
    await page.locator('#infrastructure').scrollIntoViewIfNeeded();
    await expect(page.locator('#infrastructure')).toBeVisible();
    await page.locator('#beta').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('marketing-cta-heading')).toContainText(/Ship accounts and transfers faster/);
  });

  test('navigates to login from Get Started', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('marketing-get-started-hero').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
