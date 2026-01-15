import React, { useState, useEffect } from 'react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isProduction, setIsProduction] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [logs, setLogs] = useState<{id: string, time: string, action: string, status: string, amount: string}[]>([]);

  // Form state for CreateAccountRequest
  const [formData, setFormData] = useState({
    user_id: '',
    account_type: 'checking',
    currency: 'USD'
  });

  // Simulation of real-time ledger events
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

  const navItems = [
    { name: 'Overview', icon: 'dashboard' },
    { name: 'Accounts', icon: 'account_balance' },
    { name: 'Payments', icon: 'payments' },
    { name: 'Ledger', icon: 'book' },
    { name: 'Infrastructure', icon: 'dns' },
  ];

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log('Dispatching CreateAccountRequest:', formData);
    setIsCreateModalOpen(false);
    // In a real app, we'd append the result to the accounts list
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Settled Volume (24h)</p>
                <h2 className="text-3xl font-bold tracking-tighter">$1,242,910.00</h2>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                  <span className="material-symbols-sharp">trending_up</span>
                  +12.5% VS YESTERDAY
                </div>
              </div>
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Active Ledgers</p>
                <h2 className="text-3xl font-bold tracking-tighter">42</h2>
                <div className="mt-4 flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  Across 8 Jurisdictions
                </div>
              </div>
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">API Latency (p99)</p>
                <h2 className="text-3xl font-bold tracking-tighter font-mono">42<span className="text-zinc-500 text-xl font-sans ml-1">ms</span></h2>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  OPTIMIZED (US-EAST-1)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Global Nodes</h3>
                <div className="bg-black border border-zinc-800/50 rounded-2xl divide-y divide-zinc-900 overflow-hidden">
                  {[
                    { region: 'us-east-1', status: 'Healthy', load: '12%' },
                    { region: 'eu-west-1', status: 'Healthy', load: '24%' },
                    { region: 'ap-southeast-1', status: 'Degraded', load: '92%' },
                  ].map((node) => (
                    <div key={node.region} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-xs font-mono font-bold uppercase">{node.region}</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-[10px] text-zinc-500 font-mono">LOAD: {node.load}</span>
                        <span className={`text-[10px] font-bold uppercase ${node.status === 'Healthy' ? 'text-zinc-500' : 'text-amber-500'}`}>{node.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Live Ledger Events</h3>
                <div className="bg-black border border-zinc-800/50 rounded-2xl overflow-hidden">
                  <div className="p-0">
                    <table className="w-full text-left">
                      <thead className="text-[10px] font-mono text-zinc-600 uppercase border-b border-zinc-900">
                        <tr>
                          <th className="px-4 py-3 font-bold">Type</th>
                          <th className="px-4 py-3 font-bold">Transaction ID</th>
                          <th className="px-4 py-3 font-bold text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 font-mono text-[11px]">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors group">
                            <td className="px-4 py-3">
                              <span className="text-white font-bold">{log.action}</span>
                              <span className="block text-zinc-600 text-[9px]">{log.time}</span>
                            </td>
                            <td className="px-4 py-3 text-zinc-400 font-medium group-hover:text-zinc-200">{log.id}</td>
                            <td className="px-4 py-3 text-right">
                               <span className={log.amount.startsWith('$') ? 'text-zinc-300' : 'text-zinc-500'}>{log.amount}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Accounts':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight font-heading">Financial Accounts</h2>
                <p className="text-sm text-zinc-500">Core system accounts based on AccountResponse schema.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${isProduction ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
              >
                <span className="material-symbols-sharp">add</span>
                Create Account
              </button>
            </div>
            
            <div className="bg-black border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="text-[10px] font-mono text-zinc-600 uppercase border-b border-zinc-900 bg-zinc-950">
                  <tr>
                    <th className="px-6 py-4">Account Number / ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">User UUID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono text-xs">
                  {[
                    { 
                      id: '550e8400-e29b-41d4-a716-446655440000',
                      account_number: '1002938475',
                      account_type: 'Checking',
                      user_id: '8a12-99b1-cc09',
                      balance: '842,000.00',
                      currency: 'USD',
                      status: 'Active',
                      created_at: '2024-03-12'
                    },
                    { 
                      id: 'd9b0-a112-f993-8821-443322110011',
                      account_number: '5002194833',
                      account_type: 'Saving',
                      user_id: '4f11-2290-db01',
                      balance: '12,400.00',
                      currency: 'USD',
                      status: 'Active',
                      created_at: '2024-03-14'
                    },
                    { 
                      id: '7721-bb01-e942-0012-332211445566',
                      account_number: '8810293341',
                      account_type: 'Checking',
                      user_id: '9921-axb0-f881',
                      balance: '3,100,502.12',
                      currency: 'USD',
                      status: 'Suspended',
                      created_at: '2024-02-28'
                    },
                  ].map((acc) => (
                    <tr key={acc.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-white font-bold block">{acc.account_number}</span>
                        <span className="text-zinc-600 text-[9px] font-mono group-hover:text-zinc-500 uppercase tracking-tighter truncate w-32 block">{acc.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-zinc-300 font-medium">{acc.account_type}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-zinc-500 text-[10px] font-mono">{acc.user_id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 
                          acc.status === 'Suspended' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-white font-bold">{acc.balance}</span>
                        <span className="text-zinc-500 text-[9px] ml-1">{acc.currency}</span>
                      </td>
                      <td className="px-6 py-5 text-right text-zinc-500 text-[10px] font-mono italic">
                        {acc.created_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-zinc-900/20 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
              <span className="material-symbols-sharp text-zinc-500">info</span>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
                The <span className="text-zinc-300">AccountResponse</span> entity matches the internal Rust binary model. 
                Balances are handled with Decimal precision for high-integrity calculations.
              </p>
            </div>
          </div>
        );
      case 'Payments':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Payment Rails</h2>
                <p className="text-sm text-zinc-500">Real-time ACH, Wire, and Internal routing status.</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-lg hover:bg-zinc-900 transition-colors">
                  <span className="material-symbols-sharp">filter_list</span>
                  Filter
                </button>
                <button className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isProduction ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                  <span className="material-symbols-sharp">send</span>
                  Init Transfer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'ACH', status: 'Nominal', time: '1-2 Days' },
                { label: 'FedWire', status: 'Nominal', time: 'Instant' },
                { label: 'SEPA', status: 'Nominal', time: '4h' },
                { label: 'Internal', status: 'Nominal', time: 'ms' },
              ].map(rail => (
                <div key={rail.label} className="bg-black border border-zinc-800/50 p-4 rounded-xl">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase font-bold">{rail.label}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-white font-bold">{rail.time}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black border border-zinc-800/50 rounded-2xl overflow-hidden">
               <div className="px-6 py-4 border-b border-zinc-900 flex justify-between items-center bg-black/40">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">Recent Transactions</h4>
                  <span className="text-[10px] font-mono text-zinc-700">Displaying last 24h</span>
               </div>
               <div className="divide-y divide-zinc-900">
                  {[
                    { id: 'tx_9921', from: 'Corporate Pool', to: 'Merchant_0x11', val: '$50,000.00', rail: 'FEDWIRE', status: 'Settled' },
                    { id: 'tx_9922', from: 'User_412', to: 'Internal_Holding', val: '$1,200.00', rail: 'INTERNAL', status: 'Settled' },
                    { id: 'tx_9923', from: 'Sweeper_Node', to: 'Wells_Fargo_Ops', val: '$142,900.00', rail: 'ACH', status: 'Pending' },
                  ].map(tx => (
                    <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-sharp text-zinc-500">{tx.rail === 'FEDWIRE' ? 'speed' : 'account_balance_wallet'}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{tx.from} → {tx.to}</p>
                          <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{tx.id} • {tx.rail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">{tx.val}</p>
                        <p className={`text-[9px] font-mono uppercase font-bold mt-1 ${tx.status === 'Settled' ? 'text-emerald-500' : 'text-amber-500'}`}>{tx.status}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );
      case 'Ledger':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Double-Entry Journal</h2>
                <p className="text-sm text-zinc-500">Immutable records of all asset movements with cryptographic integrity.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-lg hover:bg-zinc-900 transition-colors">
                <span className="material-symbols-sharp">verified_user</span>
                Verify State
              </button>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden font-mono text-[11px] md:text-xs">
              <div className="px-6 py-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="text-zinc-600">BLOCK_HEIGHT: <span className="text-white font-bold">942,112</span></span>
                  <span className="text-zinc-600">MERKLE_ROOT: <span className="text-white font-bold">0x9f...a2</span></span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500/80">
                  <span className="material-symbols-sharp text-[16px]">lock</span>
                  <span className="text-[10px] font-bold">INTEGRITY_VERIFIED</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black/20 text-zinc-600 uppercase">
                    <tr>
                      <th className="px-6 py-3 border-b border-white/5">Sequence</th>
                      <th className="px-6 py-3 border-b border-white/5">Account ID</th>
                      <th className="px-6 py-3 border-b border-white/5">Debit</th>
                      <th className="px-6 py-3 border-b border-white/5">Credit</th>
                      <th className="px-6 py-3 border-b border-white/5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { seq: '942112:0', acc: 'acc_treasury_01', d: '-', c: '$1,000.00', desc: 'Fee Income' },
                      { seq: '942112:1', acc: 'acc_ops_04', d: '$1,000.00', c: '-', desc: 'Fee Accrual' },
                      { seq: '942111:0', acc: 'acc_user_421', d: '$4,200.00', c: '-', desc: 'ACH Withdrawal' },
                      { seq: '942111:1', acc: 'acc_holding_pool', d: '-', c: '$4,200.00', desc: 'ACH Liquidity' },
                    ].map(entry => ( entry &&
                      <tr key={entry.seq} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-zinc-500">{entry.seq}</td>
                        <td className="px-6 py-4 text-zinc-300 font-bold">{entry.acc}</td>
                        <td className="px-6 py-4 text-emerald-500">{entry.d}</td>
                        <td className="px-6 py-4 text-zinc-400">{entry.c}</td>
                        <td className="px-6 py-4 text-zinc-600 italic">{entry.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'Infrastructure':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Configuration</h2>
                <p className="text-sm text-zinc-500">Manage API nodes, webhook endpoints, and security keys.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-sharp text-zinc-500">vpn_key</span>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-300">API Credentials</h4>
                </div>
                <div className="space-y-4">
                   <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between">
                      <div className="font-mono">
                        <p className="text-[10px] text-zinc-500">{isProduction ? 'PROD_KEY_01' : 'SANDBOX_KEY_01'}</p>
                        <p className="text-xs font-bold">{isProduction ? 'rails_live_******************2a1' : 'rails_test_******************78d'}</p>
                      </div>
                      <button className="p-2 hover:bg-zinc-800 rounded transition-colors">
                        <span className="material-symbols-sharp text-zinc-600">content_copy</span>
                      </button>
                   </div>
                   <button className={`w-full py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-800 transition-colors ${isProduction ? 'text-red-500 border-red-900/50' : 'text-zinc-500'}`}>
                      Rotate All Keys
                   </button>
                </div>
              </div>

              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-sharp text-zinc-500">webhook</span>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Webhook Endpoints</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { url: 'https://api.acme.co/webhooks/rails', status: 'Healthy', latency: '42ms' },
                  ].map(wh => (
                    <div key={wh.url} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-bold uppercase ${wh.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{wh.status}</span>
                        <span className="text-[9px] font-mono text-zinc-600">{wh.latency}</span>
                      </div>
                      <p className="text-xs font-mono truncate text-zinc-400">{wh.url}</p>
                    </div>
                  ))}
                  <button className="w-full py-2 bg-white text-black rounded-lg text-[10px] font-bold uppercase hover:bg-zinc-200 transition-colors">
                    Add New Endpoint
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <span className="material-symbols-sharp text-white">shield_with_heart</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Automated Compliance Node</h5>
                  <p className="text-xs text-zinc-500">KYC/AML orchestration is currently active for 12,400 entities.</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-zinc-800 text-xs font-bold rounded-lg hover:bg-zinc-900 transition-colors">Configure Engine</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-[#fafafa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 flex flex-col bg-black">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
            <span className="font-heading font-bold text-lg tracking-tight">Rails</span>
            <div className="flex flex-col ml-auto">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold text-center ${isProduction ? 'bg-red-950 text-red-500' : 'bg-zinc-900 text-zinc-500'}`}>
                {isProduction ? 'Production' : 'Sandbox'}
              </span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === item.name 
                    ? 'bg-white text-black font-semibold' 
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <span className="material-symbols-sharp">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-zinc-900">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4 font-bold">Environment</p>
            <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
              <button 
                onClick={() => setIsProduction(false)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${!isProduction ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                SANDBOX
              </button>
              <button 
                onClick={() => setIsProduction(true)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${isProduction ? 'bg-red-950 text-red-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                PROD
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-zinc-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-zinc-700">JS</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate">James Stork</p>
              <p className="text-[10px] text-zinc-500 truncate font-mono">{isProduction ? 'node_live_9221' : 'node_dev_4410'}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-white border border-zinc-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-sharp !text-[14px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Production Warning Banner */}
        {isProduction && (
          <div className="bg-red-950/20 border-b border-red-900/50 px-8 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-sharp text-red-500 animate-pulse !text-[18px]">warning</span>
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                Live Production Environment — Real Assets at Risk
              </span>
            </div>
            <span className="text-[9px] font-mono text-red-500/60 uppercase italic">
              All operations are legally binding and settled via banking rails.
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar bg-zinc-950/50">
          <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight">{activeTab}</h1>
              {isProduction && (
                 <span className="text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">LIVE</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">System Nominal</span>
              </div>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors flex items-center justify-center">
                <span className="material-symbols-sharp">notifications</span>
              </button>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors flex items-center justify-center">
                <span className="material-symbols-sharp">settings</span>
              </button>
            </div>
          </header>

          <div className="p-8 max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Big Modal - Create Account */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0b] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-zinc-900 bg-zinc-950/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold tracking-tight font-heading">Initialize New Account</h3>
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-sharp">close</span>
                  </button>
                </div>
                <p className="text-sm text-zinc-500">Dispatching a <code>CreateAccountRequest</code> to the core infrastructure engine.</p>
              </div>

              <form onSubmit={handleCreateAccount} className="p-8 space-y-8">
                <div className="space-y-6">
                  {/* User ID Section */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                      <span className="material-symbols-sharp !text-[14px]">fingerprint</span>
                      User ID (UUID)
                    </label>
                    <div className="relative group">
                      <input
                        required
                        type="text"
                        placeholder="8a12-99b1-cc09-..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white font-mono text-sm focus:outline-none focus:border-zinc-500 transition-all hover:bg-zinc-800/50"
                        value={formData.user_id}
                        onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-700 pointer-events-none">UUID v4</div>
                    </div>
                  </div>

                  {/* Split Row for Type and Currency */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                        <span className="material-symbols-sharp !text-[14px]">category</span>
                        Account Type
                      </label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-zinc-500 transition-all appearance-none cursor-pointer hover:bg-zinc-800/50"
                        value={formData.account_type}
                        onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                      >
                        <option value="checking">Checking</option>
                        <option value="saving">Saving</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                        <span className="material-symbols-sharp !text-[14px]">payments</span>
                        Base Currency
                      </label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-zinc-500 transition-all appearance-none cursor-pointer hover:bg-zinc-800/50"
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-sharp text-zinc-600 !text-[18px] mt-0.5">verified_user</span>
                    <div className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase">
                      Account number will be auto-generated upon submission. 
                      Initial balance is defaulted to <span className="text-white">0.00</span> in accordance with <code>sqlx::FromRow</code> mapping.
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl transition-all border border-zinc-800"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`flex-1 py-4 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 group ${isProduction ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                  >
                    Initialize Account
                    <span className="material-symbols-sharp !text-[18px] transform group-hover:translate-x-1 transition-transform">rocket_launch</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;