
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
    bullets: [
      'Infinite sub-account hierarchy',
      'Real-time KYC/AML orchestration',
      'Native multi-currency support'
    ],
    snippets: {
      ts: `const account = await rails.accounts.create({
  type: 'business_checking',
  currency: 'USD',
  metadata: {
    owner_id: 'user_9921',
    organization: 'Acme Corp'
  }
});`,
      go: `account, err := rails.Accounts.Create(ctx, &rails.AccountParams{
    Type:     rails.AccountTypeBusiness,
    Currency: "USD",
    Metadata: map[string]string{
        "owner_id": "user_9921",
    },
})`,
      rust: `let account = rails.accounts().create(AccountConfig {
    account_type: AccountType::Business,
    currency: Currency::USD,
    metadata: [("owner_id", "user_9921")].into(),
}).await?;`,
      java: `Account account = rails.accounts().create(
    AccountCreateOptions.builder()
        .setType(AccountType.BUSINESS)
        .setCurrency("USD")
        .putMetadata("owner_id", "user_9921")
        .build()
);`
    }
  },
  {
    id: 'payments',
    title: 'Universal Payments',
    description: 'Unified rails for ACH, FedWire, SEPA, and instant internal transfers.',
    bullets: [
      'Intelligent rail routing engine',
      'Automated reconciliation cycles',
      'Built-in fraud prevention'
    ],
    snippets: {
      ts: `const payment = await rails.payments.initiate({
  amount: 500000, 
  source: 'acc_01H2...',
  destination: {
    routing_number: '123456789',
    account_number: '987654321'
  },
  method: 'fedwire'
});`,
      go: `payment, err := rails.Payments.Initiate(ctx, &rails.PaymentParams{
    Amount: 500000,
    Source: "acc_01H2...",
    Destination: rails.BankDetails{
        Routing: "123456789",
    },
    Method: rails.PaymentMethodFedWire,
})`,
      rust: `let payment = rails.payments().initiate(PaymentRequest {
    amount: 500000,
    source: "acc_01H2...".to_string(),
    method: PaymentMethod::FedWire,
    ..Default::default()
}).await?;`,
      java: `Payment payment = rails.payments().initiate(
    PaymentInitiateOptions.builder()
        .setAmount(500000L)
        .setSource("acc_01H2...")
        .setMethod(PaymentMethod.FEDWIRE)
        .build()
);`
    }
  },
  {
    id: 'ledger',
    title: 'Immutable Ledger',
    description: 'Double-entry accounting built into the core, ensuring mathematical correctness.',
    bullets: [
      'Cryptographic transaction signing',
      'Strict double-entry validation',
      'Audit-ready streaming logs'
    ],
    snippets: {
      ts: `const tx = await rails.ledger.record({
  entries: [
    { account_id: 'acc_A', debit: 100 },
    { account_id: 'acc_B', credit: 100 }
  ],
  description: 'Internal platform fee'
});`,
      go: `tx, err := rails.Ledger.Record(ctx, []rails.Entry{
    {AccountID: "acc_A", Debit: 100},
    {AccountID: "acc_B", Credit: 100},
}, "Internal platform fee")`,
      rust: `let tx = rails.ledger().record(vec![
    Entry::debit("acc_A", 100),
    Entry::credit("acc_B", 100),
], "Internal platform fee").await?;`,
      java: `Transaction tx = rails.ledger().record(
    List.of(
        new Entry("acc_A", 100, EntryType.DEBIT),
        new Entry("acc_B", 100, EntryType.CREDIT)
    ),
    "Internal platform fee"
);`
    }
  }
];
