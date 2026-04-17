import { test, expect } from './fixtures';

test.describe('Landing', () => {
  test('loads marketing home and waitlist section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /modern rails for/i })).toBeVisible({
      timeout: 20_000,
    });
    await page.locator('#infrastructure').scrollIntoViewIfNeeded();
    await expect(page.locator('#infrastructure')).toBeVisible();
    await page.locator('#beta').scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: /private beta/i })).toBeVisible();
  });

  test('submits waitlist form with mocked API', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#beta')).toBeVisible({ timeout: 20_000 });
    await page.locator('#beta').scrollIntoViewIfNeeded();
    await page.getByPlaceholder('John Doe').fill('Playwright User');
    await page.getByPlaceholder('Acme Inc').fill('Acme');
    await page.getByPlaceholder('john@acme.com').fill('pw-test@example.com');
    await page.getByPlaceholder(/banking rails/i).fill('E2E automation');
    await page.getByRole('button', { name: /submit application/i }).click();
    await expect(page.getByText(/application encrypted/i)).toBeVisible({ timeout: 15_000 });
  });
});
