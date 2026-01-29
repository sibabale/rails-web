
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
  account_type: 'checking',
  user_id: 'user_9921',
  currency: 'USD'
});`,
      go: `account, err := client.Accounts.New(context.TODO(), rails.AccountNewParams{
    AccountType: rails.AccountNewParamsAccountTypeChecking,
    UserID:      "user_9921",
    Currency:    rails.String("USD"),
})`,
      python: `account = client.accounts.create(
    account_type="checking",
    user_id="user_9921",
    currency="USD",
)`,
      java: `AccountCreateResponse account = rails.accounts().create(
    AccountCreateParams.builder()
        .accountType(AccountCreateParams.AccountType.CHECKING)
        .userId("user_9921")
        .currency("USD")
        .build()
);`,
      kotlin: `val account = rails.accounts().create(
    AccountCreateParams.builder()
        .accountType(AccountCreateParams.AccountType.CHECKING)
        .userId("user_9921")
        .currency("USD")
        .build()
)`
    }
  },
  {
    id: 'payments',
    title: 'Universal Payments',
    description: 'Unified transaction workflows for transfers, deposits, and withdrawals across internal accounts.',
    bullets: [
      'Intelligent rail routing engine',
      'Automated reconciliation cycles',
      'Real-time transaction status and metadata'
    ],
    snippets: {
      ts: `const transactions = await rails.transactions.listByAccount(
  'acct_01H2...',
  { limit: 10 }
);

const detail = await rails.transactions.retrieve(transactions[0].id);`,
      go: `transactions, err := client.Transactions.ListByAccount(
    context.TODO(),
    "acct_01H2...",
    rails.TransactionListByAccountParams{
        Limit: rails.Int(10),
    },
)
if err != nil {
    return err
}
transaction, err := client.Transactions.Get(context.TODO(), transactions[0].ID)`,
      python: `transactions = client.transactions.list_by_account(
    "acct_01H2...",
    limit=10,
)

detail = client.transactions.retrieve(transactions[0].id)`,
      java: `List<TransactionListByAccountResponse> transactions =
    rails.transactions().listByAccount("acct_01H2...");

TransactionRetrieveResponse detail =
    rails.transactions().retrieve(transactions.get(0).getId());`,
      kotlin: `val transactions = rails.transactions().listByAccount("acct_01H2...")

val detail = rails.transactions().retrieve(transactions[0].id)`
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
      ts: `const entry = await rails.transactions.retrieve('txn_01H2...');

console.log(entry.balance_after, entry.status);`,
      go: `entry, err := client.Transactions.Get(
    context.TODO(),
    "txn_01H2...",
)
if err != nil {
    return err
}
fmt.Println(entry.BalanceAfter, entry.Status)`,
      python: `entry = client.transactions.retrieve("txn_01H2...")

print(entry.balance_after, entry.status)`,
      java: `TransactionRetrieveResponse entry =
    rails.transactions().retrieve("txn_01H2...");

System.out.println(entry.getBalanceAfter() + " " + entry.getStatus());`,
      kotlin: `val entry = rails.transactions().retrieve("txn_01H2...")

println("\${entry.balanceAfter} \${entry.status}")`
    }
  }
];
