'use client';

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setEnvironment } from '../state/slices/environmentSlice';
import Pagination from './Pagination';
import DashboardOverviewV2 from './DashboardOverviewV2';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { RailsTrackMark } from '@/components/marketing/atoms/RailsTrackMark';
import { DashboardMaterialThemeToggle } from './DashboardMaterialThemeToggle';
import { accountsApi, transactionsApi, ledgerApi, type Account as ApiAccount, type Transaction, type LedgerEntry, type PaginationMeta } from '../lib/api';
import { getMarketingDocsCtaUrl, getWebGithubRepoUrl } from '../lib/env';

function isDocsExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('//');
}

function dashboardTabFromPathname(pathname: string | null): string {
  if (!pathname) return 'Overview';
  const parts = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (parts[0] !== 'dashboard') return 'Overview';
  if (parts.length < 2) return 'Overview';

  switch (parts[1]) {
    case 'accounts':
      return 'Accounts';
    case 'transactions':
      return 'Transactions';
    case 'ledger':
      return 'Ledger';
    case 'identity':
      return 'Identity';
    default:
      return 'Overview';
  }
}

const DASHBOARD_SIDEBAR_NAV_ITEMS: { name: string; icon: string; href: string }[] = [
  { name: 'Overview', icon: 'dashboard', href: '/dashboard' },
  { name: 'Accounts', icon: 'account_balance', href: '/dashboard/accounts' },
  { name: 'Transactions', icon: 'swap_horiz', href: '/dashboard/transactions' },
  { name: 'Ledger', icon: 'book', href: '/dashboard/ledger' },
];

/** Accounts-service amounts are in minor units (e.g. cents). */
function formatTransactionAmountMinor(amount: number, currency: string): string {
  const major = amount / 100;
  return `${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function isTransactionCompletedStatus(status: string | undefined): boolean {
  const s = status?.toLowerCase().trim();
  return s === 'completed' || s === 'posted';
}

function isTransactionPendingStatus(status: string | undefined): boolean {
  return status?.toLowerCase().trim() === 'pending';
}

function isTransactionFailedStatus(status: string | undefined): boolean {
  return status?.toLowerCase().trim() === 'failed';
}

function transactionStatusBadgeClass(status: string | undefined): string {
  if (isTransactionCompletedStatus(status)) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500';
  }
  if (isTransactionPendingStatus(status)) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-500';
  }
  if (isTransactionFailedStatus(status)) {
    return 'bg-red-500/10 text-red-600 dark:text-red-500';
  }
  return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-500';
}

function shortTransactionId(value: string | undefined): string {
  const v = value?.trim();
  if (!v) return '—';
  return v.length <= 8 ? v : `${v.slice(0, 8)}...`;
}

const sidebarNavInactiveClass =
  'text-zinc-600 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-white';

const DashboardSidebarPrimaryNav = memo(function DashboardSidebarPrimaryNav({ activeTab }: { activeTab: string }) {
  return (
    <nav className="space-y-1 px-3 py-4">
      {DASHBOARD_SIDEBAR_NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.name;
        return (
          <Link
            key={item.name}
            href={item.href}
            data-testid={`dashboard-nav-${item.name.toLowerCase()}`}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors outline-none ${
              isActive
                ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
                : sidebarNavInactiveClass
            }`}
          >
            <span
              className={`material-symbols-sharp shrink-0 !text-[16px] leading-none ${
                isActive ? 'text-white dark:text-black' : 'text-zinc-500'
              }`}
              aria-hidden
            >
              {item.icon}
            </span>
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
});

const DashboardSidebarFooterTools = memo(function DashboardSidebarFooterTools() {
  const dispatch = useAppDispatch();
  const environment = useAppSelector((state) => state.environment.current);
  const isProduction = environment === 'production';
  const docsHref = getMarketingDocsCtaUrl();
  const docsExternal = isDocsExternalHref(docsHref);
  const docsLinkClass = `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors outline-none ${sidebarNavInactiveClass}`;

  const docsRow = (
    <>
      <span className="material-symbols-sharp shrink-0 !text-[16px] leading-none text-zinc-500" aria-hidden>
        menu_book
      </span>
      <span className="min-w-0 flex-1">Docs</span>
      {docsExternal ? (
        <span className="material-symbols-sharp shrink-0 !text-[14px] leading-none text-zinc-400" aria-hidden>
          open_in_new
        </span>
      ) : null}
    </>
  );

  return (
    <div className="space-y-5">
      <div>
        {docsExternal ? (
          <a
            href={docsHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="dashboard-nav-docs"
            className={docsLinkClass}
          >
            {docsRow}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link href={docsHref} data-testid="dashboard-nav-docs" className={docsLinkClass}>
            {docsRow}
          </Link>
        )}
      </div>
      <div>
        <div className="mb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Environment</div>
        <div className="flex bg-zinc-100 dark:bg-black p-1 border border-zinc-200 dark:border-zinc-800 transition-colors">
          <button
            type="button"
            onClick={() => dispatch(setEnvironment('sandbox'))}
            className={`flex-1 cursor-pointer border py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-black ${
              !isProduction
                ? 'border-zinc-200 bg-white text-black shadow-sm focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus-visible:ring-zinc-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 focus-visible:ring-amber-400/60 dark:hover:text-zinc-300 dark:focus-visible:ring-amber-600/50'
            }`}
          >
            SANDBOX
          </button>
          <button
            type="button"
            onClick={() => dispatch(setEnvironment('production'))}
            className={`flex-1 cursor-pointer border py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-black ${
              isProduction
                ? 'border-amber-300 bg-amber-100 text-amber-950 focus-visible:ring-amber-500 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100 dark:focus-visible:ring-amber-400'
                : 'border-transparent text-zinc-500 hover:text-amber-800 focus-visible:ring-amber-400/50 dark:hover:text-amber-200/90 dark:focus-visible:ring-amber-600/50'
            }`}
          >
            PROD
          </button>
        </div>
      </div>
    </div>
  );
});

interface DashboardProps {
  onLogout: () => void;
  session?: any;
  profile?: any;
  isLoadingProfile?: boolean;
}

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  user_id: string;
  balance: string;
  currency: string;
  status: string;
  created_at: string;
  metadata?: Record<string, string>;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, session, profile, isLoadingProfile = false }) => {
  const dispatch = useAppDispatch();
  const environment = useAppSelector((state) => state.environment.current);
  const isProduction = environment === 'production';
  const pathname = usePathname();
  const router = useRouter();
  const prevPathnameRef = useRef<string | null>(null);

  const activeTab = useMemo(() => dashboardTabFromPathname(pathname), [pathname]);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoadingTransactionDetails, setIsLoadingTransactionDetails] = useState(false);
  const [transactionDetailsError, setTransactionDetailsError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{id: string, time: string, action: string, status: string, amount: string}[]>([]);
  
  const [reserve, setReserve] = useState({ total: 25000000, available: 18450000 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [overviewStats, setOverviewStats] = useState({
    activeAccounts: 0,
    postedEntries: 0,
    settledVolume: 0,
  });
  const [overviewCurrency, setOverviewCurrency] = useState('USD');
  const [isLoadingOverviewStats, setIsLoadingOverviewStats] = useState(false);
  const [overviewStatsError, setOverviewStatsError] = useState<string | null>(null);
  const [isLoadingTransactionsList, setIsLoadingTransactionsList] = useState(false);
  const [transactionsListError, setTransactionsListError] = useState<string | null>(null);
  
  // Pagination state
  const [accountsPage, setAccountsPage] = useState(1);
  const [accountsPagination, setAccountsPagination] = useState<PaginationMeta | null>(null);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPagination, setTransactionsPagination] = useState<PaginationMeta | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPagination, setLedgerPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setSelectedAccountId(null);
      setSelectedTransactionId(null);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (session?.timestamp && session?.expires_in) {
      const updateTimer = () => {
        const expiry = session.timestamp + (session.expires_in * 1000);
        const diff = expiry - Date.now();
        if (diff <= 0) {
          setTimeLeft('Expired');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Reset pagination when switching tabs
  useEffect(() => {
    if (activeTab === 'Accounts') {
      setAccountsPage(1);
    } else if (activeTab === 'Ledger') {
      setLedgerPage(1);
    }
  }, [activeTab]);

  // Fetch accounts when Accounts tab is active or environment changes
  useEffect(() => {
    if (activeTab === 'Accounts' && session) {
      setIsLoadingAccounts(true);
      setAccountsError(null);
      accountsApi.list(session, accountsPage, 10)
        .then((response) => {
          // Transform API response to match local Account interface
          const transformed = response.data.map((acc: ApiAccount) => ({
            id: acc.id,
            account_number: acc.account_number || acc.id.slice(0, 10),
            account_type: acc.account_type,
            user_id: acc.user_id || '',
            balance: typeof acc.balance === 'number' 
              ? acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : acc.balance || '0.00',
            currency: acc.currency,
            status: acc.status,
            created_at: acc.created_at,
            metadata: acc.metadata,
          }));
          setAccounts(transformed);
          setAccountsPagination(response.pagination);
        })
        .catch((err) => {
          console.error('Failed to fetch accounts:', err);
          setAccountsError(err.message || 'Failed to load accounts');
          // Keep existing mock data as fallback for now
        })
        .finally(() => {
          setIsLoadingAccounts(false);
        });
    }
  }, [activeTab, session, accountsPage, environment]);

  // Reset transactions page when environment changes
  const prevEnvironmentRef = useRef(environment);
  useEffect(() => {
    if (prevEnvironmentRef.current !== environment && activeTab === 'Transactions') {
      setTransactionsPage(1);
      setSelectedTransactionId(null);
    }
    prevEnvironmentRef.current = environment;
  }, [environment, activeTab]);

  // Fetch transactions when Transactions tab is active or environment changes
  useEffect(() => {
    if (activeTab === 'Transactions' && session) {
      setIsLoadingTransactionsList(true);
      setTransactionsListError(null);
      transactionsApi.list(session, transactionsPage, 10)
        .then((response) => {
          setTransactionsList(response.data || []);
          setTransactionsPagination(response.pagination);
        })
        .catch((err) => {
          console.error('Failed to fetch transactions:', err);
          setTransactionsListError(err.message || 'Failed to load transactions');
        })
        .finally(() => {
          setIsLoadingTransactionsList(false);
        });
    }
  }, [activeTab, session, transactionsPage, environment]);

  // Fetch transactions when account is selected or environment changes
  useEffect(() => {
    if (selectedAccountId && session) {
      setIsLoadingTransactions(true);
      setTransactionsError(null);
      accountsApi.getTransactions(selectedAccountId, session)
        .then((data) => {
          setTransactions(data);
        })
        .catch((err) => {
          console.error('Failed to fetch transactions:', err);
          setTransactionsError(err.message || 'Failed to load transactions');
        })
        .finally(() => {
          setIsLoadingTransactions(false);
        });
    } else {
      setTransactions([]);
    }
  }, [selectedAccountId, session, environment]);

  // Fetch transaction details when transaction is selected or environment changes
  useEffect(() => {
    if (selectedTransactionId && session) {
      setIsLoadingTransactionDetails(true);
      setTransactionDetailsError(null);
      transactionsApi.get(selectedTransactionId, session)
        .then((data) => {
          setSelectedTransaction(data);
        })
        .catch((err) => {
          console.error('Failed to fetch transaction details:', err);
          setTransactionDetailsError(err.message || 'Failed to load transaction details');
          setSelectedTransaction(null);
        })
        .finally(() => {
          setIsLoadingTransactionDetails(false);
        });
    } else {
      setSelectedTransaction(null);
    }
  }, [selectedTransactionId, session, environment]);

  useEffect(() => {
    const actions = ['Transfer', 'Ledger:Commit', 'Account:Create', 'ACH:Sweep', 'Wire:Init', 'Auth:Success'];
    const statuses = ['Success', 'Pending', 'Processing'];
    
    const interval = setInterval(() => {
      const newLog = {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        time: new Date().toLocaleTimeString([], { hour12: false }),
        action: actions[Math.floor(Math.random() * actions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        amount: (Math.random() * 10000).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch ledger entries when Ledger tab is active or environment changes
  useEffect(() => {
    if (activeTab === 'Ledger' && session) {
      setIsLoadingLedger(true);
      setLedgerError(null);
      ledgerApi.listEntries(session, undefined, ledgerPage, 10, environment)
        .then((response) => {
          setLedgerEntries(response.data || []);
          setLedgerPagination(response.pagination);
        })
        .catch((err) => {
          console.error('Failed to fetch ledger entries:', err);
          setLedgerError(err.message || 'Failed to load ledger data');
        })
        .finally(() => {
          setIsLoadingLedger(false);
        });
    }
  }, [activeTab, session, ledgerPage, environment]);

  const fetchAllAccounts = async () => {
    const perPage = 100;
    let page = 1;
    let allAccounts: ApiAccount[] = [];
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await accountsApi.list(session, page, perPage);
      allAccounts = allAccounts.concat(response.data || []);
      totalPages = response.pagination?.total_pages ?? page;
      page += 1;
    }

    return allAccounts;
  };

  const fetchAllTransactions = async () => {
    const perPage = 100;
    let page = 1;
    let allTransactions: Transaction[] = [];
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await transactionsApi.list(session, page, perPage);
      allTransactions = allTransactions.concat(response.data || []);
      totalPages = response.pagination?.total_pages ?? page;
      page += 1;
    }

    return allTransactions;
  };

  // Fetch overview stats when Overview tab is active or environment changes
  useEffect(() => {
    if (activeTab === 'Overview' && session) {
      let isActive = true;
      setIsLoadingOverviewStats(true);
      setOverviewStatsError(null);

      const loadOverviewStats = async () => {
        const allAccounts = await fetchAllAccounts();
        const activeAccountsCount = allAccounts.filter((account) => account.status?.toLowerCase() === 'active').length;

        const allTransactions = await fetchAllTransactions();
        const postedTransactionsCount = allTransactions.filter((tx) => isTransactionCompletedStatus(tx.status))
          .length;

        return {
          activeAccountsCount,
          postedEntriesCount: postedTransactionsCount,
          settledVolumeTotal: 0,
          currency: 'USD',
        };
      };

      loadOverviewStats()
        .then((stats) => {
          if (!isActive) return;
          setOverviewStats({
            activeAccounts: stats.activeAccountsCount,
            postedEntries: stats.postedEntriesCount,
            settledVolume: stats.settledVolumeTotal,
          });
          setOverviewCurrency(stats.currency);
        })
        .catch((err) => {
          if (!isActive) return;
          console.error('Failed to fetch overview stats:', err);
          setOverviewStatsError(err.message || 'Failed to load overview stats');
          setOverviewStats({ activeAccounts: 0, postedEntries: 0, settledVolume: 0 });
        })
        .finally(() => {
          if (isActive) {
            setIsLoadingOverviewStats(false);
          }
        });

      return () => {
        isActive = false;
      };
    }
  }, [activeTab, session, environment]);

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatCount = (value: number) => value.toLocaleString('en-US');


  const overviewTiles = [
    {
      label: 'Active Accounts',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.activeAccounts),
      sublabel: 'accounts',
    },
    {
      label: 'Completed Transactions',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.postedEntries),
      sublabel: 'transactions',
    },
    {
      label: 'Settled Volume',
      value: isLoadingOverviewStats
        ? '—'
        : formatCurrency(overviewStats.settledVolume, overviewCurrency),
      sublabel: 'ledger',
    },
  ];

  // Removed handleDecommission - admin users have read-only access, no destructive actions

  const useOverviewV2 = true;

  const renderAccountDetails = (account: Account) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSelectedAccountId(null)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
          type="button"
          aria-label="Back to accounts"
        >
          <span className="material-symbols-sharp !text-[20px] leading-none" aria-hidden>
            arrow_back
          </span>
        </button>
        <div>
          <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Account Details</h2>
          <p className="text-sm font-mono text-zinc-500">{account.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Account Number</label>
                <p className="text-lg font-bold text-black dark:text-white mt-1">{account.account_number}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Account Type</label>
                <p className="text-lg font-bold text-black dark:text-white mt-1">{account.account_type}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Balance</label>
                <p className="text-lg font-bold text-black dark:text-white mt-1">{account.balance} {account.currency}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${account.status === 'Active' || account.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                    {account.status}
                  </span>
                </div>
              </div>
            </div>

            {account.metadata && (
              <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Metadata Shard Context</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(account.metadata).map(([key, value]) => (
                    <div key={key} className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black p-3 transition-colors">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">{key.replace('_', ' ')}</label>
                      <p className="text-xs font-mono font-bold text-black dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAccountId && (
              <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Recent Transactions</h4>
                {transactionsError ? (
                  <div className="border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-950/20 p-4 transition-colors">
                    <p className="text-xs font-mono text-red-600 dark:text-red-500">{transactionsError}</p>
                  </div>
                ) : isLoadingTransactions ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black" />
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-6 text-center transition-colors">
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-4 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-black dark:text-white">{tx.transaction_type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${transactionStatusBadgeClass(tx.status)}`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                          <span className="text-xs font-mono font-bold text-black dark:text-white">
                            {formatTransactionAmountMinor(tx.amount, tx.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#050505] p-6 transition-colors">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-4">Danger Zone</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              Decommissioning an account is irreversible. It will freeze the ledger state in the Merkle root.
            </p>
              <div className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black py-3 text-zinc-600 dark:text-zinc-400 text-xs font-bold text-center transition-colors">
                Read-Only Access
              </div>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] p-6 transition-colors">
            <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Integrity Check</h4>
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-sharp shrink-0 text-emerald-500 !text-[18px] leading-none"
                aria-hidden
              >
                verified
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Hash Verified</span>
            </div>
            <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed font-mono">
              Last state proof: <span className="text-zinc-600 dark:text-zinc-300">0x7a2...f81</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactionDetails = (transaction: Transaction) => {
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        // Could add a toast notification here if needed
      });
    };

    const formatAmount = (amount: number) => {
      return (amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedTransactionId(null)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white flex items-center justify-center"
            type="button"
            aria-label="Back to transactions"
          >
            <span className="material-symbols-sharp !text-[20px] leading-none" aria-hidden>
              arrow_back
            </span>
          </button>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Transaction</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Transaction details and metadata</p>
          </div>
        </div>

        {/* Section 1: Summary */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-8 space-y-6">
          <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Transaction ID</label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono font-bold text-black dark:text-white">{transaction.id}</p>
                <button
                  onClick={() => copyToClipboard(transaction.id)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                  title="Copy to clipboard"
                  type="button"
                >
                  <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    content_copy
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Type</label>
              <p className="text-sm font-bold text-black dark:text-white uppercase">{transaction.transaction_type}</p>
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Status</label>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${transactionStatusBadgeClass(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Amount</label>
              <p className="text-lg font-bold text-black dark:text-white">
                {formatAmount(transaction.amount)} {transaction.currency}
              </p>
            </div>
            {transaction.environment != null && transaction.environment !== '' && (
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Environment</label>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                  transaction.environment === 'production'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-500'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                }`}>
                  {transaction.environment}
                </span>
              </div>
            )}
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-2">Created At</label>
              <p className="text-sm font-mono text-black dark:text-white">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Parties Involved */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-8 space-y-6">
          <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Parties Involved</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-4">Account</label>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Account ID</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold text-black dark:text-white break-all">{transaction.account_id}</p>
                    <button
                      onClick={() => copyToClipboard(transaction.account_id)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                      type="button"
                    >
                      <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    content_copy
                  </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 block mb-4">Recipient</label>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Recipient account / external</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold text-black dark:text-white break-all">
                      {[transaction.recipient_account_id, transaction.external_recipient_id].find((x) => x?.trim())
                        ?? '—'}
                    </p>
                    {(transaction.recipient_account_id?.trim() || transaction.external_recipient_id?.trim()) && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            transaction.recipient_account_id?.trim() ||
                              transaction.external_recipient_id?.trim() ||
                              ''
                          )
                        }
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                        title="Copy to clipboard"
                        type="button"
                      >
                      <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    content_copy
                  </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Metadata */}
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-8 space-y-6">
          <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Technical Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transaction.organization_id && (
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Organization ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-black dark:text-white break-all">{transaction.organization_id}</p>
                  <button
                    onClick={() => copyToClipboard(transaction.organization_id)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                    type="button"
                  >
                    <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    content_copy
                  </span>
                  </button>
                </div>
              </div>
            )}
            {transaction.idempotency_key && (
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Idempotency Key</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-black dark:text-white break-all">{transaction.idempotency_key}</p>
                  <button
                    onClick={() => copyToClipboard(transaction.idempotency_key)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                    type="button"
                  >
                    <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    content_copy
                  </span>
                  </button>
                </div>
              </div>
            )}
            {transaction.failure_reason && (
              <div className="md:col-span-2">
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Failure Reason</label>
                <p className="text-sm font-mono text-red-600 dark:text-red-500 break-all">{transaction.failure_reason}</p>
              </div>
            )}
            <div>
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Balance after</label>
              <p className="text-sm font-mono text-black dark:text-white">{formatAmount(transaction.balance_after)}</p>
            </div>
            {transaction.reference_id?.trim() && (
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Reference ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-black dark:text-white break-all">{transaction.reference_id}</p>
                  <button
                    onClick={() => copyToClipboard(transaction.reference_id || '')}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                    type="button"
                  >
                    <span className="material-symbols-sharp !text-[16px] leading-none" aria-hidden>
                    content_copy
                  </span>
                  </button>
                </div>
              </div>
            )}
            {transaction.description?.trim() && (
              <div className="md:col-span-2">
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Description</label>
                <p className="text-sm font-mono text-black dark:text-white break-all">{transaction.description}</p>
              </div>
            )}
            <div>
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Updated At</label>
              <p className="text-sm font-mono text-black dark:text-white">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIdentityProfileLoader = () => (
    <div
      className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-8 space-y-8"
      aria-busy="true"
      aria-label="Loading identity profile"
      role="status"
    >
      <span className="sr-only">Loading identity profile</span>
      <section className="space-y-6">
        <div className="h-3 w-36 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <div className="h-2.5 w-28 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <div className="h-3 w-44 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <div className="h-2.5 w-24 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-full animate-pulse border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
            </div>
          ))}
          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <div className="h-2.5 w-36 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-full animate-pulse border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
      </section>
    </div>
  );

  const renderIdentityView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-black dark:text-white md:text-3xl mb-2">Identity & Profile</h2>
        <p className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Business Information Node Context</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {isLoadingProfile ? renderIdentityProfileLoader() : (
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-8 space-y-8">
            <section className="space-y-6">
              <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Business Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-tight text-zinc-500">Legal Entity Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.business_name?.trim() ?? ''}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black px-4 py-2 text-sm font-bold text-black dark:text-white outline-none transition-colors cursor-default" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-tight text-zinc-500">Official Website</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.website?.trim() ?? ''}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 outline-none transition-colors cursor-default" 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Admin Identity Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">First Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.name?.trim()?.split(/\s+/)?.[0] ?? ''}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black px-4 py-2 text-sm font-bold text-black dark:text-white outline-none transition-colors cursor-default" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.name?.trim()?.split(/\s+/)?.slice(1)?.join(' ') ?? ''}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black px-4 py-2 text-sm font-bold text-black dark:text-white outline-none transition-colors cursor-default" 
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Administrative Email</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.email?.trim() ?? ''}
                    className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black px-4 py-2 text-sm font-mono font-bold text-black dark:text-white outline-none transition-colors cursor-default" 
                  />
                </div>
              </div>
            </section>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] p-6 transition-colors">
             <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Auth Service Policy</h4>
             <ul className="space-y-4">
                <li className="flex items-center justify-between">
                   <span className="text-xs text-zinc-500">JWT Enforcement</span>
                   <span className="text-[10px] font-mono font-bold text-emerald-500">ENABLED</span>
                </li>
                <li className="flex items-center justify-between">
                   <span className="text-xs text-zinc-500">MFA Policy</span>
                   <span className="text-[10px] font-mono font-bold text-emerald-500">STRICT</span>
                </li>
                <li className="flex items-center justify-between">
                   <span className="text-xs text-zinc-500">Session Remaining</span>
                   <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-tighter">{timeLeft}</span>
                </li>
                <li className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                   <span className="text-xs text-zinc-500">Node Compliance</span>
                   <span className="text-[10px] font-mono font-bold text-emerald-500">PASSING</span>
                </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );

  const renderTransactionsView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Transactions</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">View all transactions in your organization. Transactions are created via SDK.</p>
        </div>
      </div>

      {transactionsListError ? (
        <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/25 p-6 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-sharp shrink-0 text-amber-500 !text-[18px] leading-none" aria-hidden>
              info
            </span>
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500">Unable to Load Transactions</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{transactionsListError}</p>
        </div>
      ) : isLoadingTransactionsList ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-5"><div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : transactionsList.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-12 text-center">
          <span
            className="material-symbols-sharp mx-auto mb-4 block text-zinc-300 dark:text-zinc-600 !text-[48px] leading-none"
            aria-hidden
          >
            swap_horiz
          </span>
          <p className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">No Transactions Found</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">Transactions are created via SDK, not through the dashboard.</p>
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
              {transactionsList.map((tx) => (
                <tr 
                  key={tx.id} 
                  onClick={() => setSelectedTransactionId(tx.id)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <span className="font-bold text-black dark:text-white">{tx.id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300 uppercase">{tx.transaction_type}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-black dark:text-white font-bold">
                      {formatTransactionAmountMinor(tx.amount, tx.currency)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${transactionStatusBadgeClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300">{shortTransactionId(tx.account_id)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300">
                      {shortTransactionId(
                        tx.recipient_account_id?.trim() ? tx.recipient_account_id : tx.external_recipient_id
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactionsPagination && (
            <Pagination
              page={transactionsPagination.page}
              totalPages={transactionsPagination.total_pages}
              totalCount={transactionsPagination.total_count}
              onPageChange={setTransactionsPage}
            />
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'Identity') return renderIdentityView();

    switch (activeTab) {
      case 'Transactions':
        if (selectedTransactionId) {
          if (isLoadingTransactionDetails) {
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedTransactionId(null)}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                    type="button"
                    aria-label="Back to transactions"
                  >
                    <span className="material-symbols-sharp !text-[20px] leading-none" aria-hidden>
                      arrow_back
                    </span>
                  </button>
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Transaction</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading transaction details...</p>
                  </div>
                </div>
                <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-12">
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black" />
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          if (transactionDetailsError) {
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedTransactionId(null)}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                    type="button"
                    aria-label="Back to transactions"
                  >
                    <span className="material-symbols-sharp !text-[20px] leading-none" aria-hidden>
                      arrow_back
                    </span>
                  </button>
                  <div>
                    <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Transaction</h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Transaction details and metadata</p>
                  </div>
                </div>
                <div className="border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-950/20 p-6 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-sharp shrink-0 text-red-500 !text-[18px] leading-none" aria-hidden>
                      error
                    </span>
                    <h3 className="text-sm font-bold text-red-600 dark:text-red-500">Unable to Load Transaction</h3>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{transactionDetailsError}</p>
                </div>
              </div>
            );
          }
          if (selectedTransaction) {
            return renderTransactionDetails(selectedTransaction);
          }
        }
        return renderTransactionsView();
      case 'Overview':
        if (useOverviewV2) {
          return (
            <DashboardOverviewV2
              overviewStats={overviewStats}
              isLoadingOverviewStats={isLoadingOverviewStats}
              overviewCurrency={overviewCurrency}
              session={session}
            />
          );
        }
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {overviewTiles.map((tile) => (
                <div
                  key={tile.label}
                  className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] p-6 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono font-semibold text-zinc-500 tracking-widest uppercase">{tile.label}</span>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${overviewStatsError ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="flex items-end justify-between">
                    <span
                      className={`text-3xl font-medium tracking-tight text-black dark:text-white ${isLoadingOverviewStats ? 'animate-pulse' : ''}`}
                    >
                      {tile.value}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{tile.sublabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Accounts':
        const selectedAccount = accounts.find(a => a.id === selectedAccountId);
        if (selectedAccount) return renderAccountDetails(selectedAccount);

        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Financial Accounts</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">System ledger accounts. Click row to inspect details.</p>
              </div>
            </div>
            
            {accountsError && (
              <div className="border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-950/20 p-4 mb-4 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-sharp shrink-0 text-red-500 !text-[16px] leading-none" aria-hidden>
                    error
                  </span>
                  <p className="text-xs font-mono text-red-600 dark:text-red-500">{accountsError}</p>
                </div>
              </div>
            )}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors overflow-hidden">
              <table className="w-full text-left">
                <thead className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                  <tr>
                    <th className="px-6 py-4">Account Number / ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
                  {isLoadingAccounts ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-5"><div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div></td>
                        <td className="px-6 py-5 text-right"><div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded ml-auto"></div></td>
                      </tr>
                    ))
                  ) : accounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <span
                          className="material-symbols-sharp mx-auto mb-2 block text-zinc-300 dark:text-zinc-600 !text-[32px] leading-none"
                          aria-hidden
                        >
                          account_balance
                        </span>
                        <p className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">No Accounts Found</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">Accounts are created via SDK, not through the dashboard.</p>
                      </td>
                    </tr>
                  ) : (
                    accounts.map((acc) => (
                      <tr 
                        key={acc.id} 
                        onClick={() => setSelectedAccountId(acc.id)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <span className="block font-bold text-black dark:text-white group-hover:underline underline-offset-4">{acc.account_number}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-zinc-500 dark:text-zinc-300 font-medium">{acc.account_type}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${acc.status === 'Active' || acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                            {acc.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-black dark:text-white">{acc.balance} {acc.currency}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {accountsPagination && (
                <Pagination
                  page={accountsPagination.page}
                  totalPages={accountsPagination.total_pages}
                  totalCount={accountsPagination.total_count}
                  onPageChange={setAccountsPage}
                />
              )}
            </div>
          </div>
        );
      /*
      case 'Settlements':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Settlements</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Endpoint in Stealth... Access Denied</div>
          </div>
        );
      case 'Payments':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Universal Payments</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Payment Engine Initializing...</div>
          </div>
        );
      */
      case 'Ledger':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Immutable Ledger</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">View ledger entries and transactions. Ledger entries are created via SDK.</p>
              </div>
            </div>
            
            {ledgerError && (
              <div className="border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-950/20 p-4 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-sharp shrink-0 text-red-500 !text-[16px] leading-none" aria-hidden>
                    error
                  </span>
                  <p className="text-xs font-mono text-red-600 dark:text-red-500">{ledgerError}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-6">
                <h3 className="mb-4 text-sm font-medium text-black dark:text-white">Recent ledger entries</h3>
                {isLoadingLedger ? (
                  <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black" />
                    ))}
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <span
                      className="material-symbols-sharp mx-auto mb-2 block text-zinc-300 dark:text-zinc-600 !text-[32px] leading-none"
                      aria-hidden
                    >
                      receipt_long
                    </span>
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">No ledger entries found</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {ledgerEntries.map((entry) => (
                        <div key={entry.id} className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#050505] p-3 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-black dark:text-white">
                              {entry.external_transaction_id || entry.transaction_id.slice(0, 8)}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              entry.entry_type === 'debit'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-500'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                            }`}>
                              {entry.entry_type}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                              {entry.external_account_id || entry.ledger_account_id.slice(0, 8)}
                            </span>
                            <span className="text-xs font-mono font-bold text-black dark:text-white">
                              {typeof entry.amount === 'number' 
                                ? entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : entry.amount} {entry.currency}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {ledgerPagination && (
                      <div className="mt-4">
                        <Pagination
                          page={ledgerPagination.page}
                          totalPages={ledgerPagination.total_pages}
                          totalCount={ledgerPagination.total_count}
                          onPageChange={setLedgerPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] transition-colors p-6">
                <h3 className="mb-4 text-sm font-medium text-black dark:text-white">Ledger Summary</h3>
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black p-4 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Total Entries</span>
                      <span className="text-lg font-bold text-black dark:text-white">
                        {ledgerPagination?.total_count ?? ledgerEntries.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Debits</span>
                      <span className="text-sm font-mono font-bold text-red-600 dark:text-red-500">
                        {ledgerEntries.filter(e => e.entry_type === 'debit').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Credits</span>
                      <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-500">
                        {ledgerEntries.filter(e => e.entry_type === 'credit').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      /*
      case 'Infrastructure':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-medium tracking-tight text-black dark:text-white">Infrastructure Status</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Scanning Global Nodes...</div>
          </div>
        );
      */
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex h-screen min-h-0 bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-200 ${isProduction ? 'shadow-[inset_0_0_100px_rgba(217,119,6,0.05)]' : ''}`}
    >
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#050505] flex flex-col transition-colors z-20 relative">
        <div className="h-16 flex items-center px-6 justify-between border-b border-transparent shrink-0">
          <Link href="/" className="flex items-center gap-3 outline-none">
            <div className="w-5 h-5 bg-black dark:bg-white flex items-center justify-center">
              <RailsTrackMark className="h-3 w-3 text-white dark:text-black" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-black dark:text-white">Rails</span>
          </Link>
          <span
            className={`inline-flex items-center border font-mono text-[10px] font-semibold leading-none tracking-wider px-2 py-1 ${
              isProduction
                ? 'border-amber-400 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100'
                : 'border-zinc-300 bg-zinc-200 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {isProduction ? 'PRODUCTION' : 'SANDBOX'}
          </span>
        </div>

        <DashboardSidebarPrimaryNav activeTab={activeTab} />

        <div className="mt-auto px-3 py-6 border-t border-zinc-200 dark:border-zinc-900 transition-colors">
          <DashboardSidebarFooterTools />
          <button
            type="button"
            onClick={onLogout}
            data-testid="dashboard-sign-out"
            className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-4 border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-sharp shrink-0 !text-[16px] leading-none" aria-hidden>
              logout
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative bg-zinc-50 dark:bg-[#0a0a0a]">
        {isProduction && (
          <div
            role="alert"
            className="flex shrink-0 animate-in items-center justify-between border-b border-amber-300 bg-amber-100 px-8 py-2.5 duration-300 slide-in-from-top dark:border-amber-800 dark:bg-amber-950/50"
          >
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-sharp shrink-0 text-amber-900 dark:text-amber-300 !text-[18px] leading-none"
                aria-hidden
              >
                warning
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-950 dark:text-amber-100">
                Live Production Environment — Real Assets at Risk
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden transition-colors">
          <header className="h-16 shrink-0 px-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm transition-colors z-10">
            <h1 className="text-xl font-medium tracking-tight text-black dark:text-white">{activeTab}</h1>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href={getWebGithubRepoUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100/90 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                data-testid="dashboard-header-github"
              >
                <SiGithub className="w-[14px] h-[14px] shrink-0" aria-hidden />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">GitHub</span>
              </a>
              <DashboardMaterialThemeToggle />
              <Link
                href="/dashboard/identity"
                data-testid="dashboard-nav-identity"
                title={profile?.name?.trim() || undefined}
                aria-label={
                  profile?.name?.trim()
                    ? `Identity and profile — ${profile.name.trim()}`
                    : 'Identity and profile'
                }
                className={`inline-flex shrink-0 rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-[#0a0a0a] ${
                  activeTab === 'Identity'
                    ? 'ring-2 ring-black ring-offset-2 ring-offset-zinc-50 dark:ring-white dark:ring-offset-[#0a0a0a]'
                    : 'ring-1 ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-600'
                }`}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className={`h-9 w-9 rounded-full object-cover ${
                      activeTab === 'Identity'
                        ? 'border border-white/30 dark:border-black/20'
                        : 'border border-zinc-200 dark:border-zinc-700'
                    }`}
                  />
                ) : (
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      activeTab === 'Identity'
                        ? 'border border-zinc-300 bg-zinc-900 text-white dark:border-zinc-600 dark:bg-zinc-100 dark:text-black'
                        : 'border border-zinc-200 bg-zinc-200 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {(() => {
                      const initials = profile?.name
                        ?.trim()
                        .split(/\s+/)
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                      if (initials) return initials;
                      return (
                        <span className="material-symbols-sharp !text-[20px] leading-none opacity-80" aria-hidden>
                          person
                        </span>
                      );
                    })()}
                  </div>
                )}
              </Link>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <div className="p-8 max-w-6xl mx-auto w-full pb-32">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
