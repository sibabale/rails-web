
import { Feature, NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Infrastructure', href: '#infrastructure' },
  { label: 'Documentation', href: '#docs' },
  { label: 'Changelog', href: '#changelog' },
  { label: 'Stealth Beta', href: '#beta' },
];

export const FEATURES: Feature[] = [
  {
    id: 'accounts',
    title: 'Programmable Accounts',
    description: 'Create multi-currency ledgers and virtual accounts with built-in compliance logic.',
    code: `const account = await rails.accounts.create({
  type: 'business_checking',
  currency: 'USD',
  metadata: {
    owner_id: 'user_9921',
    organization: 'Acme Corp'
  }
});

console.log(account.id); // "acc_01H2..."`
  },
  {
    id: 'payments',
    title: 'Universal Payments',
    description: 'Unified rails for ACH, FedWire, SEPA, and instant internal transfers.',
    code: `const payment = await rails.payments.initiate({
  amount: 500000, // $5,000.00
  source: 'acc_01H2...',
  destination: {
    routing_number: '123456789',
    account_number: '987654321'
  },
  method: 'fedwire'
});`
  },
  {
    id: 'ledger',
    title: 'Immutable Ledger',
    description: 'Double-entry accounting built into the core, ensuring mathematical correctness.',
    code: `const tx = await rails.ledger.record({
  entries: [
    { account_id: 'acc_A', debit: 100 },
    { account_id: 'acc_B', credit: 100 }
  ],
  description: 'Internal platform fee settlement'
});

// Transaction is cryptographically signed.`
  }
];
