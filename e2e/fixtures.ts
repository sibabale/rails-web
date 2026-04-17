import { test as base } from '@playwright/test';
import { installApiMocksOnContext } from './mock-api';

/**
 * Installs gateway mocks on every browser context so all specs get consistent API behavior.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await installApiMocksOnContext(context);
    await use(context);
  },
});

export { expect } from '@playwright/test';
