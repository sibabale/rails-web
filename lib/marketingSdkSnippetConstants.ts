/**
 * Single source of truth for marketing / infrastructure SDK sample literals
 * (import paths, stable IDs, amounts) so hero, infra blocks, and future docs stay aligned.
 */
export const MARKETING_TYPESCRIPT_NPM_IMPORT = '@railsinfra/rails-typescript';

export const MARKETING_GO_MODULE = 'github.com/railsinfra/rails-go';

export const MARKETING_GO_MODULE_OPTION = `${MARKETING_GO_MODULE}/option`;

export const MARKETING_SAMPLE_TRANSFER = {
  fromAccountId: 'acc_checking_123',
  amount: '5000',
  toAccountId: 'acc_savings_456',
  description: 'Monthly savings',
} as const;

/** Reserved for account-create samples (infra block, future snippets). */
export const MARKETING_SAMPLE_ACCOUNT = {
  userId: '182bd5e5-6e1a-4fe4-a799-aa6d9a6ab26e',
  currency: 'USD',
  accountTypeChecking: 'checking',
} as const;

export const MARKETING_API_DEFAULT_BASE_URL = 'https://api.railsinfra.com';
