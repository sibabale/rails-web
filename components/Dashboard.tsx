import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import ApiKeyManager from './ApiKeyManager';

interface DashboardProps {
  onLogout: () => void;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  isProduction?: boolean;
  onToggleEnvironment?: () => void;
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

const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
  currentTheme,
  onToggleTheme,
  isProduction = false,
  onToggleEnvironment,
  session,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{id: string, time: string, action: string, status: string, amount: string}[]>([]);
  
  const [reserve, setReserve] = useState({ total: 25000000, available: 18450000 });
  const [accounts, setAccounts] = useState<Account[]>([
    { 
      id: '550e8400-e29b-41d4-a716-446655440000',
      account_number: '1002938475',
      account_type: 'Checking',
      user_id: profile?.id || '8a12-99b1-cc09',
      balance: '842,000.00',
      currency: 'USD',
      status: 'Active',
      created_at: '2024-03-12',
      metadata: { region: 'us-east-1', compliance_tier: 'high-frequency', ledger_shard: 'shard-001' }
    },
    { 
      id: 'd9b0-a112-f993-8821-443322110011',
      account_number: '5002194833',
      account_type: 'Saving',
      user_id: profile?.id || '4f11-2290-db01',
      balance: '12,400.00',
      currency: 'USD',
      status: 'Active',
      created_at: '2024-03-14',
      metadata: { region: 'eu-west-1', compliance_tier: 'standard', ledger_shard: 'shard-002' }
    }
  ]);

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

  useEffect(() => {
    if (activeTab === 'Accounts') {
      setIsLoadingAccounts(true);
      const timer = setTimeout(() => setIsLoadingAccounts(false), 800);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

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

  const handleDecommission = (id: string) => {
    if (confirm("Are you sure you want to decommission this account? This will permanently freeze all ledger entries for this UUID in the merkle tree.")) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      setSelectedAccountId(null);
    }
  };

  const navItems = [
    { name: 'Overview', icon: 'dashboard' },
    { name: 'Accounts', icon: 'account_balance' },
    { name: 'Settlements', icon: 'account_tree' },
    { name: 'Payments', icon: 'payments' },
    { name: 'Ledger', icon: 'book' },
    { name: 'Infrastructure', icon: 'dns' },
  ];

  const VolumeChart = () => (
    <div className="h-24 w-full flex items-end gap-1 px-1">
      {[40, 70, 45, 90, 65, 80, 55, 30, 85, 95, 40, 50, 70, 40, 80, 90, 100, 60, 45, 75, 85, 95, 40, 30].map((h, i) => (
        <div 
          key={i} 
          className="flex-1 bg-zinc-200 dark:bg-white/20 hover:bg-zinc-400 dark:hover:bg-white transition-all rounded-t-sm"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );

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
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${account.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
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
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 mb-4">Danger Zone</h4>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Decommissioning an account is irreversible. It will freeze the ledger state in the Merkle root.
            </p>
            <button 
              onClick={() => handleDecommission(account.id)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-red-500/10"
            >
              Decommission Account
            </button>
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

  const renderContent = () => {
    if (activeTab === 'Identity') return renderIdentityView();

    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'ACH Rail', status: 'Nominal', p99: '1.2s', health: 100 },
                { label: 'FedWire', status: 'Nominal', p99: '42ms', health: 100 },
                { label: 'Rails Internal', status: 'Nominal', p99: '4ms', health: 100 },
                { label: 'SEPA Bridge', status: 'Degraded', p99: '4.8s', health: 84 },
              ].map((rail) => (
                <div key={rail.label} className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{rail.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${rail.health === 100 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold tracking-tight text-zinc-800 dark:text-white">{rail.status}</span>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">p99: {rail.p99}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden group transition-colors shadow-sm">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 font-bold">Settled Volume (24h)</p>
                      <h2 className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-white">$1,242,910.00</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded text-zinc-400">1D</span>
                      <span className="text-[10px] font-mono bg-zinc-800 dark:bg-white text-white dark:text-black px-2 py-1 rounded">1H</span>
                    </div>
                  </div>
                  <VolumeChart />
                </div>
              </div>

              <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-between transition-colors shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-zinc-400 dark:text-zinc-500">
                    <span className="material-symbols-sharp !text-[16px]">account_balance_wallet</span>
                    <p className="text-xs font-mono uppercase tracking-widest font-bold">Surety Pool Health</p>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter text-zinc-800 dark:text-white">R{(reserve.available / 1000000).toFixed(1)}M</h2>
                </div>
              </div>
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
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-5"><div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div></td>
                        <td className="px-6 py-5"><div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div></td>
                        <td className="px-6 py-5 text-right"><div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded ml-auto"></div></td>
                      </tr>
                    ))
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
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                            {acc.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-zinc-800 dark:text-white">{acc.balance}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
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
      case 'Ledger':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Immutable Ledger</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Syncing Merkle Root...</div>
          </div>
        );
      case 'Infrastructure':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-white">Infrastructure Status</h2>
            <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Scanning Global Nodes...</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-50 overflow-hidden selection:bg-zinc-100 dark:selection:bg-white selection:text-zinc-900 dark:selection:text-black transition-all duration-700 ${isProduction ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.05)]' : ''}`}>
      <aside className="w-64 border-r border-zinc-100 dark:border-zinc-800/50 flex flex-col bg-zinc-50 dark:bg-black relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-5 h-5 bg-zinc-800 dark:bg-white rounded-sm"></div>
            <span className="font-heading font-bold text-lg tracking-tight text-zinc-800 dark:text-white">Rails</span>
            <div className="flex flex-col ml-auto">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold text-center ${isProduction ? 'bg-red-950 text-red-500 shadow-lg shadow-red-900/20' : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500'}`}>
                {isProduction ? 'Production' : 'Sandbox'}
              </span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); setSelectedAccountId(null); }}
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
              <button onClick={() => { if (isProduction && onToggleEnvironment) onToggleEnvironment(); }} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${!isProduction ? 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>SANDBOX</button>
              <button onClick={() => { if (!isProduction && onToggleEnvironment) onToggleEnvironment(); }} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all cursor-pointer ${isProduction ? 'bg-red-950 text-red-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>PROD</button>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-zinc-100 dark:border-zinc-800/50">
          <button 
            onClick={() => { setActiveTab('Identity'); setSelectedAccountId(null); }}
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
          <div className="bg-red-950/10 border-b border-red-900/30 px-8 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-sharp text-red-500 animate-pulse !text-[18px]">warning</span>
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
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
