import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setEnvironment } from '../state/slices/environmentSlice';
import ApiKeyManager from './ApiKeyManager';
import Pagination from './Pagination';
import SettledVolumeChart from './SettledVolumeChart';
import DashboardOverviewV2 from './DashboardOverviewV2';
import { accountsApi, usersApi, transactionsApi, ledgerApi, type Account as ApiAccount, type Transaction, type User, type LedgerEntry, type PaginationMeta } from '../lib/api';

interface DashboardProps {
  onLogout: () => void;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  session?: any;
  profile?: any;
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

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentTheme, onToggleTheme, session, profile }) => {
  const dispatch = useAppDispatch();
  const environment = useAppSelector((state) => state.environment.current);
  const isProduction = environment === 'production';

  const [activeTab, setActiveTab] = useState('Overview');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoadingTransactionDetails, setIsLoadingTransactionDetails] = useState(false);
  const [transactionDetailsError, setTransactionDetailsError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{id: string, time: string, action: string, status: string, amount: string}[]>([]);
  
  const [reserve, setReserve] = useState({ total: 25000000, available: 18450000 });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [settledVolumeAllTime, setSettledVolumeAllTime] = useState<number | null>(null);
  const [settledVolume24h, setSettledVolume24h] = useState<number | null>(null);
  const [settledVolume1h, setSettledVolume1h] = useState<number | null>(null);
  const [settledVolumeCurrency, setSettledVolumeCurrency] = useState('USD');
  const [isLoadingSettledVolume, setIsLoadingSettledVolume] = useState(false);
  const [settledVolumeRange, setSettledVolumeRange] = useState<'ALL' | '1D' | '1H'>('ALL');
  const [overviewStats, setOverviewStats] = useState({
    activeUsers: 0,
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
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState<PaginationMeta | null>(null);
  const [accountsPage, setAccountsPage] = useState(1);
  const [accountsPagination, setAccountsPagination] = useState<PaginationMeta | null>(null);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPagination, setTransactionsPagination] = useState<PaginationMeta | null>(null);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPagination, setLedgerPagination] = useState<PaginationMeta | null>(null);

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
    if (activeTab === 'Users') {
      setUsersPage(1);
    } else if (activeTab === 'Accounts') {
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

  // Fetch users when Users tab is active or environment changes
  useEffect(() => {
    if (activeTab === 'Users' && session) {
      setIsLoadingUsers(true);
      setUsersError(null);
      usersApi.list(session, usersPage, 10)
        .then((response) => {
          setUsers(response.data || []);
          setUsersPagination(response.pagination);
        })
        .catch((err) => {
          console.error('Failed to fetch users:', err);
          setUsersError(err.message || 'Failed to load users');
        })
        .finally(() => {
          setIsLoadingUsers(false);
        });
    }
  }, [activeTab, session, usersPage, environment]);

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
      ledgerApi.listEntries(session, undefined, ledgerPage, 10)
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

  const fetchAllUsers = async () => {
    const perPage = 100;
    let page = 1;
    let allUsers: User[] = [];
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await usersApi.list(session, page, perPage);
      allUsers = allUsers.concat(response.data || []);
      totalPages = response.pagination?.total_pages ?? page;
      page += 1;
    }

    return allUsers;
  };

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
        const allUsers = await fetchAllUsers();
        const adminUserIds = new Set(
          allUsers
            .filter((user) => user.role?.toLowerCase() === 'admin')
            .map((user) => user.id)
        );
        const activeUsersCount = allUsers.filter(
          (user) => user.status?.toLowerCase() === 'active' && !adminUserIds.has(user.id)
        ).length;

        const allAccounts = await fetchAllAccounts();
        const activeAccountsCount = allAccounts.filter((account) => {
          const isActive = account.status?.toLowerCase() === 'active';
          const userId = account.user_id || '';
          return isActive && (userId === '' || !adminUserIds.has(userId));
        }).length;

        const allTransactions = await fetchAllTransactions();
        const postedTransactions = allTransactions.filter((tx) => tx.status?.toLowerCase() === 'posted');
        const postedTransactionsCount = postedTransactions.length;

        return {
          activeUsersCount,
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
            activeUsers: stats.activeUsersCount,
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
          setOverviewStats({ activeUsers: 0, activeAccounts: 0, postedEntries: 0, settledVolume: 0 });
          setSettledVolumeAllTime(0);
          setSettledVolumeBucketsAll([]);
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

  const settledVolumeDisplay = (() => {
    if (isLoadingSettledVolume) return '—';
    const amount = settledVolumeRange === 'ALL'
      ? settledVolumeAllTime ?? 0
      : settledVolumeRange === '1H'
      ? settledVolume1h ?? 0
      : settledVolume24h ?? 0;
    return formatCurrency(amount, settledVolumeCurrency);
  })();

  const handleSettledVolumeStats = (stats: { totalAmount: number; currency: string }) => {
    setSettledVolumeCurrency(stats.currency);
    if (settledVolumeRange === 'ALL') {
      setSettledVolumeAllTime(stats.totalAmount);
    } else if (settledVolumeRange === '1H') {
      setSettledVolume1h(stats.totalAmount);
    } else {
      setSettledVolume24h(stats.totalAmount);
    }
  };

  useEffect(() => {
    if (session && activeTab === 'Overview') {
      setIsLoadingSettledVolume(true);
    }
  }, [session, settledVolumeRange, activeTab]);

  const overviewTiles = [
    {
      label: 'Active Users',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.activeUsers),
      sublabel: 'users',
    },
    {
      label: 'Active Accounts',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.activeAccounts),
      sublabel: 'accounts',
    },
    {
      label: 'Posted Transactions',
      value: isLoadingOverviewStats ? '—' : formatCount(overviewStats.postedEntries),
      sublabel: 'transactions',
    },
    {
      label: 'Settled Volume',
      value: isLoadingSettledVolume
        ? '—'
        : formatCurrency(settledVolumeAllTime ?? 0, settledVolumeCurrency),
      sublabel: 'ledger',
    },
  ];

  // Removed handleDecommission - admin users have read-only access, no destructive actions

  const useOverviewV2 = true;

  const navItems = [
    { name: 'Overview', icon: 'dashboard' },
    { name: 'Users', icon: 'people' },
    { name: 'Accounts', icon: 'account_balance' },
    { name: 'Transactions', icon: 'swap_horiz' },
    // { name: 'Settlements', icon: 'account_tree' },
    // { name: 'Payments', icon: 'payments' },
    { name: 'Ledger', icon: 'book' },
    // { name: 'Infrastructure', icon: 'dns' },
  ];

  const renderAccountDetails = (account: Account) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSelectedAccountId(null)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
        >
          <span className="material-symbols-sharp">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Account Details</h2>
          <p className="text-sm font-mono text-zinc-500">{account.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest">Account Number</label>
                <p className="text-lg font-bold text-zinc-800 dark:text-white mt-1">{account.account_number}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest">Account Type</label>
                <p className="text-lg font-bold text-zinc-800 dark:text-white mt-1">{account.account_type}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest">Balance</label>
                <p className="text-lg font-bold text-zinc-800 dark:text-white mt-1">{account.balance} {account.currency}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest">Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${account.status === 'Active' || account.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                    {account.status}
                  </span>
                </div>
              </div>
            </div>

            {account.metadata && (
              <div className="pt-8 border-t border-zinc-50 dark:border-zinc-900">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Metadata Shard Context</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(account.metadata).map(([key, value]) => (
                    <div key={key} className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <label className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">{key.replace('_', ' ')}</label>
                      <p className="text-xs font-mono font-bold text-zinc-800 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAccountId && (
              <div className="pt-8 border-t border-zinc-50 dark:border-zinc-900">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Recent Transactions</h4>
                {transactionsError ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-xs font-mono text-red-600 dark:text-red-500">{transactionsError}</p>
                  </div>
                ) : isLoadingTransactions ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-900 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 text-center">
                    <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-zinc-800 dark:text-white">{tx.transaction_type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            tx.status?.toLowerCase() === 'posted' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                              : tx.status?.toLowerCase() === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                              : tx.status?.toLowerCase() === 'failed'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-500'
                              : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-800 dark:text-white">
                            {typeof tx.amount === 'number' 
                              ? tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : tx.amount} {tx.currency}
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
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 mb-4">Danger Zone</h4>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Decommissioning an account is irreversible. It will freeze the ledger state in the Merkle root.
            </p>
              <div className="w-full py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs font-bold rounded-xl text-center">
                Read-Only Access
              </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Integrity Check</h4>
            <div className="flex items-center gap-3">
              <span className="material-symbols-sharp text-emerald-500 !text-[18px]">verified</span>
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
          >
            <span className="material-symbols-sharp">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Transaction</h2>
            <p className="text-sm text-zinc-500">Transaction details and metadata</p>
          </div>
        </div>

        {/* Section 1: Summary */}
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8 space-y-6">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-2">Transaction ID</label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono font-bold text-zinc-800 dark:text-white">{transaction.id}</p>
                <button
                  onClick={() => copyToClipboard(transaction.id)}
                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  <span className="material-symbols-sharp !text-[16px]">content_copy</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-2">Type</label>
              <p className="text-sm font-bold text-zinc-800 dark:text-white uppercase">{transaction.transaction_kind}</p>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-2">Status</label>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                transaction.status?.toLowerCase().trim() === 'posted' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                  : transaction.status?.toLowerCase().trim() === 'pending'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                  : transaction.status?.toLowerCase().trim() === 'failed'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-500'
                  : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-500'
              }`}>
                {transaction.status}
              </span>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-2">Amount</label>
              <p className="text-lg font-bold text-zinc-800 dark:text-white">
                {formatAmount(transaction.amount)} {transaction.currency}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-2">Environment</label>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block ${
                transaction.environment === 'production'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-500'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
              }`}>
                {transaction.environment || 'sandbox'}
              </span>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-2">Created At</label>
              <p className="text-sm font-mono text-zinc-800 dark:text-white">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Parties Involved */}
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8 space-y-6">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Parties Involved</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-4">From Account</label>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Account ID</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold text-zinc-800 dark:text-white break-all">{transaction.from_account_id}</p>
                    <button
                      onClick={() => copyToClipboard(transaction.from_account_id)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      <span className="material-symbols-sharp !text-[16px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-widest block mb-4">To Account</label>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Account ID</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold text-zinc-800 dark:text-white break-all">{transaction.to_account_id}</p>
                    <button
                      onClick={() => copyToClipboard(transaction.to_account_id)}
                      className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      <span className="material-symbols-sharp !text-[16px]">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Metadata */}
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8 space-y-6">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">Technical Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transaction.organization_id && (
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Organization ID</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-zinc-800 dark:text-white break-all">{transaction.organization_id}</p>
                  <button
                    onClick={() => copyToClipboard(transaction.organization_id)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <span className="material-symbols-sharp !text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>
            )}
            {transaction.idempotency_key && (
              <div>
                <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Idempotency Key</label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-zinc-800 dark:text-white break-all">{transaction.idempotency_key}</p>
                  <button
                    onClick={() => copyToClipboard(transaction.idempotency_key)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    <span className="material-symbols-sharp !text-[16px]">content_copy</span>
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
              <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Updated At</label>
              <p className="text-sm font-mono text-zinc-800 dark:text-white">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIdentityView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-zinc-800 dark:text-white">Identity & Profile</h2>
          <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Business Information Node Context</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-emerald-500 text-white dark:text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-sm">
            Renew API Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-8 space-y-8 shadow-sm">
            <section className="space-y-6">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Business Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">Legal Entity Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.business_name || "Rails Institutional Bank"} 
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-bold text-zinc-800 dark:text-white outline-none cursor-default" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">Infrastructure ID</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.id?.slice(0, 12).toUpperCase() || "RAILS_INST_001"} 
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-mono font-bold text-zinc-800 dark:text-white outline-none cursor-default" 
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">Official Website</label>
                  <input 
                    type="text" 
                    readOnly 
                    value="https://rails.finance" 
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 outline-none cursor-default" 
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-zinc-50 dark:border-zinc-900">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Admin Identity Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">First Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.name?.split(' ')[0] || "James"} 
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-bold text-zinc-800 dark:text-white outline-none cursor-default" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Last Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.name?.split(' ')[1] || "Stork"} 
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-bold text-zinc-800 dark:text-white outline-none cursor-default" 
                  />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Administrative Email</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={profile?.email || 'james@rails.infra'} 
                    className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-2 text-sm font-mono font-bold text-zinc-800 dark:text-white outline-none cursor-default" 
                  />
                </div>
              </div>
            </section>

            <ApiKeyManager session={session} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
             <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Auth Service Policy</h4>
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

  const renderUsersView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Users</h2>
          <p className="text-sm text-zinc-500">View all users in your organization. User creation is done via SDK.</p>
        </div>
      </div>

      {usersError ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-sharp text-amber-500 !text-[18px]">info</span>
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500">Unable to Load Users</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{usersError}</p>
        </div>
      ) : isLoadingUsers ? (
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900 font-mono text-xs">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-5"><div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div></td>
                  <td className="px-6 py-5"><div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-12 text-center">
          <span className="material-symbols-sharp text-zinc-300 dark:text-zinc-700 !text-[48px] mb-4 block">people</span>
          <p className="text-sm font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No Users Found</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">Users are created via SDK, not through the dashboard.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900 font-mono text-xs">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-5">
                    <span className="text-zinc-700 dark:text-white font-bold">{user.first_name} {user.last_name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300">{user.email}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300 uppercase">{user.role}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      user.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usersPagination && (
            <Pagination
              page={usersPagination.page}
              totalPages={usersPagination.total_pages}
              totalCount={usersPagination.total_count}
              onPageChange={setUsersPage}
            />
          )}
        </div>
      )}
    </div>
  );

  const renderTransactionsView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Transactions</h2>
          <p className="text-sm text-zinc-500">View all transactions in your organization. Transactions are created via SDK.</p>
        </div>
      </div>

      {transactionsListError ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-sharp text-amber-500 !text-[18px]">info</span>
            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500">Unable to Load Transactions</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{transactionsListError}</p>
        </div>
      ) : isLoadingTransactionsList ? (
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">From Account</th>
                <th className="px-6 py-4">To Account</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900 font-mono text-xs">
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
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-12 text-center">
          <span className="material-symbols-sharp text-zinc-300 dark:text-zinc-700 !text-[48px] mb-4 block">swap_horiz</span>
          <p className="text-sm font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No Transactions Found</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">Transactions are created via SDK, not through the dashboard.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">From Account</th>
                <th className="px-6 py-4">To Account</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900 font-mono text-xs">
              {transactionsList.map((tx) => (
                <tr 
                  key={tx.id} 
                  onClick={() => setSelectedTransactionId(tx.id)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <span className="text-zinc-700 dark:text-white font-bold">{tx.id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300 uppercase">{tx.transaction_kind}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-800 dark:text-white font-bold">
                      {(tx.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      (tx.status?.toLowerCase().trim() === 'posted') 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                        : (tx.status?.toLowerCase().trim() === 'pending')
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                        : (tx.status?.toLowerCase().trim() === 'failed')
                        ? 'bg-red-500/10 text-red-600 dark:text-red-500'
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-500'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300">{tx.from_account_id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-zinc-500 dark:text-zinc-300">{tx.to_account_id.slice(0, 8)}...</span>
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
      case 'Users':
        return renderUsersView();
      case 'Transactions':
        if (selectedTransactionId) {
          if (isLoadingTransactionDetails) {
            return (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedTransactionId(null)}
                    className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                  >
                    <span className="material-symbols-sharp">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Transaction</h2>
                    <p className="text-sm text-zinc-500">Loading transaction details...</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-12">
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-900 rounded-lg animate-pulse"></div>
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
                  >
                    <span className="material-symbols-sharp">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Transaction</h2>
                    <p className="text-sm text-zinc-500">Transaction details and metadata</p>
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-sharp text-red-500 !text-[18px]">error</span>
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
          return <DashboardOverviewV2 onGetStarted={() => setActiveTab('Accounts')} />;
        }
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {overviewTiles.map((tile) => (
                <div key={tile.label} className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{tile.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${overviewStatsError ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-bold tracking-tight text-zinc-800 dark:text-white ${isLoadingOverviewStats ? 'animate-pulse' : ''}`}>
                      {tile.value}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">{tile.sublabel}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden group transition-colors shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                        Settled Volume ({settledVolumeRange === 'ALL' ? 'All Time' : settledVolumeRange === '1H' ? '1h' : '24h'})
                      </p>
                      <h2 className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-white">{settledVolumeDisplay}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSettledVolumeRange('ALL')}
                        className={`text-[10px] font-mono border px-2 py-1 rounded ${
                          settledVolumeRange === 'ALL'
                            ? 'bg-zinc-800 dark:bg-white text-white dark:text-black border-zinc-800 dark:border-white'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        }`}
                        aria-pressed={settledVolumeRange === 'ALL'}
                      >
                        All Time
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettledVolumeRange('1D')}
                        className={`text-[10px] font-mono border px-2 py-1 rounded ${
                          settledVolumeRange === '1D'
                            ? 'bg-zinc-800 dark:bg-white text-white dark:text-black border-zinc-800 dark:border-white'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        }`}
                        aria-pressed={settledVolumeRange === '1D'}
                      >
                        1D
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettledVolumeRange('1H')}
                        className={`text-[10px] font-mono border px-2 py-1 rounded ${
                          settledVolumeRange === '1H'
                            ? 'bg-zinc-800 dark:bg-white text-white dark:text-black border-zinc-800 dark:border-white'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        }`}
                        aria-pressed={settledVolumeRange === '1H'}
                      >
                        1H
                      </button>
                    </div>
                  </div>
                  <SettledVolumeChart
                    session={session}
                    range={settledVolumeRange}
                    onStatsChange={handleSettledVolumeStats}
                    onLoadingChange={setIsLoadingSettledVolume}
                  />
                </div>
              </div>
              {/*
              <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-between transition-colors shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-zinc-400 dark:text-zinc-500">
                    <span className="material-symbols-sharp !text-[16px]">account_balance_wallet</span>
                    <p className="text-xs font-mono uppercase tracking-widest font-bold">Surety Pool Health</p>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-white">R{(reserve.available / 1000000).toFixed(1)}M</h2>
                </div>
              </div>
              */}
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
                <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Financial Accounts</h2>
                <p className="text-sm text-zinc-500">System ledger accounts. Click row to inspect details.</p>
              </div>
            </div>
            
            {accountsError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-sharp text-red-500 !text-[16px]">error</span>
                  <p className="text-xs font-mono text-red-600 dark:text-red-500">{accountsError}</p>
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    <th className="px-6 py-4">Account Number / ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900 font-mono text-xs">
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
                        <span className="material-symbols-sharp text-zinc-300 dark:text-zinc-700 !text-[32px] mb-2 block">account_balance</span>
                        <p className="text-sm font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">No Accounts Found</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">Accounts are created via SDK, not through the dashboard.</p>
                      </td>
                    </tr>
                  ) : (
                    accounts.map((acc) => (
                      <tr 
                        key={acc.id} 
                        onClick={() => setSelectedAccountId(acc.id)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <span className="text-zinc-700 dark:text-white font-bold block group-hover:underline underline-offset-4">{acc.account_number}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-zinc-500 dark:text-zinc-300 font-medium">{acc.account_type}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${acc.status === 'Active' || acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                            {acc.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-zinc-800 dark:text-white">{acc.balance} {acc.currency}</td>
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
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Settlements</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Endpoint in Stealth... Access Denied</div>
          </div>
        );
      case 'Payments':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Universal Payments</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Payment Engine Initializing...</div>
          </div>
        );
      */
      case 'Ledger':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Immutable Ledger</h2>
                <p className="text-sm text-zinc-500">View ledger entries and transactions. Ledger entries are created via SDK.</p>
              </div>
            </div>
            
            {ledgerError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-sharp text-red-500 !text-[16px]">error</span>
                  <p className="text-xs font-mono text-red-600 dark:text-red-500">{ledgerError}</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-white mb-4">Recent Transactions</h3>
                {isLoadingLedger ? (
                  <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-900 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-sharp text-zinc-300 dark:text-zinc-700 !text-[32px] mb-2 block">receipt_long</span>
                    <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">No transactions found</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {ledgerEntries.map((entry) => (
                        <div key={entry.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-white">
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
                            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-white">
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
              
              <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-white mb-4">Ledger Summary</h3>
                <div className="space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Total Entries</span>
                      <span className="text-lg font-bold text-zinc-800 dark:text-white">
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
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Infrastructure Status</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Scanning Global Nodes...</div>
          </div>
        );
      */
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen bg-white dark:bg-[#09090b] text-zinc-800 dark:text-[#fafafa] overflow-hidden selection:bg-zinc-100 dark:selection:bg-white selection:text-zinc-900 dark:selection:text-black transition-all duration-700 ${isProduction ? 'shadow-[inset_0_0_100px_rgba(217,119,6,0.05)]' : ''}`}>
      <aside className="w-64 border-r border-zinc-100 dark:border-zinc-800/50 flex flex-col bg-zinc-50 dark:bg-black relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-5 h-5 bg-zinc-800 dark:bg-white rounded-sm"></div>
            <span className="font-heading font-bold text-lg tracking-tight text-zinc-800 dark:text-white">Rails</span>
            <div className="flex flex-col ml-auto">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold text-center ${isProduction ? 'bg-amber-950 text-amber-500 shadow-lg shadow-amber-900/20' : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500'}`}>
                {isProduction ? 'Production' : 'Sandbox'}
              </span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); setSelectedAccountId(null); setSelectedTransactionId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer outline-none ${
                  activeTab === item.name 
                    ? 'bg-zinc-800 dark:bg-white text-white dark:text-black font-semibold shadow-sm' 
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900'
                }`}
              >
                <span className="material-symbols-sharp">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900">
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4 font-bold">Environment</p>
            <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button onClick={() => dispatch(setEnvironment('sandbox'))} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${!isProduction ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>SANDBOX</button>
              <button onClick={() => dispatch(setEnvironment('production'))} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${isProduction ? 'bg-amber-950 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>PROD</button>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-zinc-100 dark:border-zinc-800/50">
          <button 
            onClick={() => { setActiveTab('Identity'); setSelectedAccountId(null); setSelectedTransactionId(null); }}
            className={`w-full flex items-center gap-3 mb-6 cursor-pointer p-2 -m-2 rounded-xl transition-colors text-left outline-none ${activeTab === 'Identity' ? 'bg-white dark:bg-zinc-900' : 'hover:bg-white dark:hover:bg-zinc-900'}`}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-300">
                {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'JS'}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate text-zinc-800 dark:text-white">{profile?.name || "James Stork"}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">{isProduction ? 'node_live_9221' : 'node_dev_4410'}</p>
            </div>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-sharp !text-[14px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {isProduction && (
          <div className="bg-amber-950/10 border-b border-amber-900/30 px-8 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-sharp text-amber-500 animate-pulse !text-[18px]">warning</span>
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                Live Production Environment — Real Assets at Risk
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950/50 transition-colors">
          <header className="h-16 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between px-8 bg-white/40 dark:bg-black/40 backdrop-blur-sm sticky top-0 z-10 transition-colors">
            <h1 className="text-lg font-bold tracking-tight text-zinc-800 dark:text-white">{activeTab}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 uppercase font-bold">Nominal</span>
              </div>
              <button 
                onClick={onToggleTheme}
                className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-sharp">{currentTheme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
          </header>

          <div className="p-8 max-w-6xl mx-auto pb-32">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
