import { test, expect } from './fixtures';

test.describe('Landing', () => {
  test('loads marketing home and key sections (copy variant A)', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('rails_marketing_copy_variant', 'a');
    });
    await page.goto('/');
    await expect(page.getByTestId('marketing-hero-heading')).toContainText(/spin up a banking core in seconds/i, {
      timeout: 20_000,
    });
    await expect(page.getByTestId('marketing-hero-section')).toContainText(
      /bank without building the rails yourself/i
    );
    await page.locator('#infrastructure').scrollIntoViewIfNeeded();
    await expect(page.locator('#infrastructure')).toBeVisible();
    await page.locator('#beta').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('marketing-cta-heading')).toContainText(/Ship accounts and transfers faster/);
  });

  test('marketing copy variant D on homepage', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('rails_marketing_copy_variant', 'd');
    });
    await page.goto('/');
    await expect(page.getByTestId('marketing-hero-heading')).toContainText(/spin up a banking core in seconds/i, {
      timeout: 20_000,
    });
    await expect(page.getByTestId('marketing-hero-section')).toContainText(
      /The backend behind balances and payouts/
    );
  });

  test('marketing copy variant D on infrastructure overview', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('rails_marketing_copy_variant', 'd');
    });
    await page.goto('/infrastructure');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /A reliable backbone for balances and payouts/,
      { timeout: 20_000 }
    );
  });

  test('navigates to login from Get Started', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('marketing-get-started-hero').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
