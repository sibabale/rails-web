import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
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

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentTheme, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isProduction, setIsProduction] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSchemaVisible, setIsSchemaVisible] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{id: string, time: string, action: string, status: string, amount: string}[]>([]);
  
  // Weekend Settlement State
  const [reserve, setReserve] = useState({ total: 25000000, available: 18450000 });
  const [settlementFees, setSettlementFees] = useState(142900);
  const [banks, setBanks] = useState([
    { name: 'FNB', code: 'FNB001', connected: true, surety: 5000000 },
    { name: 'ABSA', code: 'ABSA01', connected: true, surety: 8000000 },
    { name: 'NEDBANK', code: 'NED001', connected: true, surety: 4000000 },
    { name: 'CAPITEC', code: 'CAP001', connected: true, surety: 3000000 },
    { name: 'STANDARD', code: 'STD001', connected: false, surety: 5000000 }
  ]);

  // Sample Account Data
  const [accounts, setAccounts] = useState<Account[]>([
    { 
      id: '550e8400-e29b-41d4-a716-446655440000',
      account_number: '1002938475',
      account_type: 'Checking',
      user_id: '8a12-99b1-cc09',
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
      user_id: '4f11-2290-db01',
      balance: '12,400.00',
      currency: 'USD',
      status: 'Active',
      created_at: '2024-03-14',
      metadata: { region: 'eu-west-1', compliance_tier: 'standard', ledger_shard: 'shard-002' }
    }
  ]);

  // AI Copilot State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    setIsThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are the Rails Infrastructure Copilot. You help developers build banking applications using the Rails SDK. You know everything about immutable ledgers, double-entry accounting, and the 'Weekend Settlement' feature. You know that Rails takes a 1% fee on weekend transactions and requires banks to provide 'Surety Funds'. Keep answers concise, developer-focused, and slightly technical."
        }
      });
      
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "Connection to core node lost. Retry." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error: AI Node Timeout. Check Infrastructure logs." }]);
    } finally {
      setIsThinking(false);
    }
  };

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
          className="flex-1 bg-zinc-900 dark:bg-white/20 hover:bg-zinc-700 dark:hover:bg-white transition-all rounded-t-sm"
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
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <span className="material-symbols-sharp">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Account Details</h2>
          <p className="text-sm font-mono text-zinc-500">{account.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-8 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Account Number</label>
                <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{account.account_number}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Account Type</label>
                <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{account.account_type}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Balance</label>
                <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{account.balance} {account.currency}</p>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${account.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                    {account.status}
                  </span>
                </div>
              </div>
            </div>

            {account.metadata && (
              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Metadata Shard Context</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(account.metadata).map(([key, value]) => (
                    <div key={key} className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">{key.replace('_', ' ')}</label>
                      <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">{value}</p>
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

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Integrity Check</h4>
            <div className="flex items-center gap-3">
              <span className="material-symbols-sharp text-emerald-500 !text-[18px]">verified</span>
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase">Hash Verified</span>
            </div>
            <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed font-mono">
              Last state proof: <span className="text-zinc-700 dark:text-zinc-300">0x7a2...f81</span>
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
          <h2 className="text-3xl font-bold tracking-tighter mb-2">Identity & Access</h2>
          <p className="text-sm font-mono text-zinc-500">Bank Partner Configuration (Mapped to Bank Prisma Model)</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-emerald-500 text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors">
            Renew API Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-8 space-y-8">
            <div>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Bank Profile</h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Bank Name</label>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">Rails Institutional Bank</p>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Bank Code</label>
                  <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-1">RAILS_INST_001</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Admin User (Identity Management)</h4>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Full Name</label>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">James Stork</p>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase">Email Address</label>
                  <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-1">james@rails.infra</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Credentials</h4>
              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Primary API Key</span>
                     <span className="text-[9px] font-mono text-emerald-500 uppercase">Active</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <p className="text-xs font-mono text-zinc-900 dark:text-white flex-1 truncate">rails_live_9221_********************************</p>
                     <button className="material-symbols-sharp !text-[16px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white">content_copy</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
             <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Auth Service Status</h4>
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
                   <span className="text-xs text-zinc-500">API Key Rotation</span>
                   <span className="text-[10px] font-mono font-bold text-zinc-400">90 DAYS</span>
                </li>
             </ul>
           </div>

           <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-sharp text-emerald-500 !text-[18px]">verified_user</span>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">Partnership Verified</span>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-500/70 leading-relaxed font-mono">
                Your bank entity is fully authenticated. Webhook callbacks are routed via TLS 1.3 tunnels.
              </p>
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
            {/* Real-time Infrastructure Health Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'ACH Rail', status: 'Nominal', p99: '1.2s', health: 100 },
                { label: 'FedWire', status: 'Nominal', p99: '42ms', health: 100 },
                { label: 'Rails Internal', status: 'Nominal', p99: '4ms', health: 100 },
                { label: 'SEPA Bridge', status: 'Degraded', p99: '4.8s', health: 84 },
              ].map((rail) => (
                <div key={rail.label} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-4 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{rail.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${rail.health === 100 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{rail.status}</span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600">p99: {rail.p99}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Operational Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-2xl relative overflow-hidden group transition-colors">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1 font-bold">Settled Volume (24h)</p>
                      <h2 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">$1,242,910.00</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded text-zinc-500">1D</span>
                      <span className="text-[10px] font-mono bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-1 rounded">1H</span>
                    </div>
                  </div>
                  <VolumeChart />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Weekend Surety Monitor */}
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-2xl flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-zinc-400 dark:text-zinc-500">
                    <span className="material-symbols-sharp !text-[16px]">account_balance_wallet</span>
                    <p className="text-xs font-mono uppercase tracking-widest font-bold">Surety Pool Health</p>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">R{(reserve.available / 1000000).toFixed(1)}M</h2>
                  <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 mt-1 italic">Total Reserved: R{(reserve.total / 1000000).toFixed(1)}M</p>
                </div>
                <div className="mt-8 space-y-4">
                   <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                        <span>Liquidity utilization</span>
                        <span>{((reserve.total - reserve.available) / reserve.total * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-zinc-900 dark:bg-white transition-all duration-1000" 
                          style={{ width: `${((reserve.total - reserve.available) / reserve.total * 100)}%` }}
                        ></div>
                      </div>
                   </div>
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-3 rounded-lg">
                      <p className="text-[9px] font-mono text-zinc-500 leading-relaxed">
                        Rails facilitating <span className="text-zinc-900 dark:text-white font-bold">84.2%</span> of out-of-hours transaction volume.
                      </p>
                   </div>
                </div>
              </div>
            </div>

            {/* Distributed Infrastructure Map & Shards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Ledger Shard Sync</h3>
                  <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700">6 Shards Active</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                   {[
                     { id: 'shard-001', region: 'us-east', height: '14,221,009', status: 'Synced' },
                     { id: 'shard-002', region: 'eu-west', height: '12,998,112', status: 'Synced' },
                     { id: 'shard-003', region: 'ap-south', height: '9,221,440', status: 'Lagging (4ms)' },
                   ].map((shard) => (
                      <div key={shard.id} className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-1.5 rounded-full ${shard.status.includes('Lagging') ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                           <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-mono">{shard.id}</p>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-600 uppercase tracking-tighter">{shard.region}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-mono text-zinc-700 dark:text-zinc-400">{shard.height}</p>
                           <p className={`text-[9px] font-bold uppercase tracking-widest ${shard.status.includes('Lagging') ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-700'}`}>{shard.status}</p>
                        </div>
                      </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Recent System Events</h3>
                  <button className="text-[10px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase">View All Logs</button>
                </div>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono text-[11px]">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-white transition-colors"></span>
                              <span className="text-zinc-700 dark:text-zinc-300 font-bold">{log.action}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 dark:text-zinc-600 truncate max-w-[80px]">{log.id}</td>
                          <td className="px-4 py-3 text-right">
                             <span className="text-emerald-600 dark:text-emerald-500/80 font-bold">{log.amount}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Financial Accounts</h2>
                <p className="text-sm text-zinc-500">System ledger accounts. Click row to inspect details.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSchemaVisible(!isSchemaVisible)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="material-symbols-sharp">code</span>
                  {isSchemaVisible ? 'Hide Schema' : 'View Schema'}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${isProduction ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200'}`}
                >
                  <span className="material-symbols-sharp">add</span>
                  Create Account
                </button>
              </div>
            </div>

            {isSchemaVisible && (
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl animate-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Model: AccountResponse (Rust)</span>
                </div>
                <pre className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed overflow-x-auto">
{`#[derive(Debug, Serialize)]
pub struct AccountResponse {
    pub id: Uuid,
    pub account_number: String,
    pub account_type: AccountType,
    pub user_id: Uuid,
    pub balance: Decimal,
    pub currency: String,
    pub status: AccountStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}`}
                </pre>
              </div>
            )}
            
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    <th className="px-6 py-4">Account Number / ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono text-xs">
                  {accounts.map((acc) => (
                    <tr 
                      key={acc.id} 
                      onClick={() => setSelectedAccountId(acc.id)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <span className="text-zinc-900 dark:text-white font-bold block group-hover:underline underline-offset-4">{acc.account_number}</span>
                        <span className="text-zinc-500 dark:text-zinc-600 text-[9px] truncate w-32 block">{acc.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">{acc.account_type}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-red-500/10 text-red-600 dark:text-red-500'}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-zinc-900 dark:text-white">{acc.balance} <span className="text-zinc-500 dark:text-zinc-600 text-[10px] ml-1">{acc.currency}</span></td>
                      <td className="px-6 py-5 text-right text-zinc-400 dark:text-zinc-500 italic">{acc.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Settlements':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Weekend Settlement Engine</h2>
                <p className="text-sm text-zinc-500">Off-hours liquidity routing via Rails Surety Reserve.</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <span className="material-symbols-sharp">receipt_long</span>
                  Audit Logs
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors">
                  <span className="material-symbols-sharp">account_balance_wallet</span>
                  Surety Top-up
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 font-bold">Surety Pool</p>
                <h2 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">R{reserve.total.toLocaleString()}</h2>
                <div className="mt-4 h-1 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                   <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-700" style={{ width: `${((reserve.total - reserve.available) / reserve.total * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 font-bold">Liquidity Injection Available</p>
                <h2 className="text-3xl font-bold tracking-tighter text-emerald-600 dark:text-emerald-500">R{reserve.available.toLocaleString()}</h2>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> SYSTEM READY
                </div>
              </div>
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 font-bold">Weekend Fee Accrual (1%)</p>
                <h2 className="text-3xl font-bold tracking-tighter text-zinc-900 dark:text-white">R{settlementFees.toLocaleString()}</h2>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                  <span className="material-symbols-sharp !text-[14px]">trending_up</span> +14% WEEK-OVER-WEEK
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Bridge Status</h3>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900">
                  {banks.map(bank => (
                    <div key={bank.code} className="p-4 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${bank.connected ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">{bank.name}</p>
                          <p className="text-[9px] font-mono text-zinc-500 dark:text-zinc-600">{bank.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-zinc-500">R{(bank.surety / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <h3 className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Real-time Settlement Feed</h3>
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
                      <tr>
                        <th className="px-6 py-4">Tx Ref</th>
                        <th className="px-6 py-4">Routing</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono text-xs">
                      {[
                        { ref: 'txn_99x221a', sender: 'FNB', receiver: 'ABSA', amount: 142000, status: 'pending' },
                        { ref: 'txn_0x221bb', sender: 'NEDBANK', receiver: 'CAPITEC', amount: 92000, status: 'pending' },
                        { ref: 'txn_99x112c', sender: 'FNB', receiver: 'STD', amount: 450000, status: 'delayed' },
                      ].map(tx => (
                        <tr key={tx.ref} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4 text-zinc-400 dark:text-zinc-500 font-bold">{tx.ref}</td>
                          <td className="px-6 py-4">
                            <span className="text-zinc-900 dark:text-white font-bold">{tx.sender}</span>
                            <span className="text-zinc-300 dark:text-zinc-700 mx-2">→</span>
                            <span className="text-zinc-500">{tx.receiver}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-900 dark:text-white font-bold">R{tx.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              tx.status === 'pending' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Payments':
      case 'Ledger':
      case 'Infrastructure':
        return <div className="p-12 text-center text-zinc-400 dark:text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Endpoint in Stealth... Access Denied</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-[#fafafa] overflow-hidden selection:bg-zinc-900 dark:selection:bg-white selection:text-white dark:selection:text-black transition-all duration-700 ${isProduction ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.05)]' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800/50 flex flex-col bg-zinc-50 dark:bg-black relative z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-5 h-5 bg-zinc-900 dark:bg-white rounded-sm"></div>
            <span className="font-heading font-bold text-lg tracking-tight">Rails</span>
            <div className="flex flex-col ml-auto">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold text-center ${isProduction ? 'bg-red-950 text-red-500' : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500'}`}>
                {isProduction ? 'Production' : 'Sandbox'}
              </span>
            </div>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); setSelectedAccountId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === item.name 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold' 
                    : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <span className="material-symbols-sharp">{item.icon}</span>
                {item.name}
              </button>
            ))}
            
            <div className="my-4 h-px bg-zinc-200 dark:bg-zinc-900/50 mx-3" />
            <a
              href="https://docs.rails.infra"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <span className="material-symbols-sharp">description</span>
              Docs
              <span className="material-symbols-sharp !text-[12px] ml-auto opacity-30">open_in_new</span>
            </a>
          </nav>

          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-900">
            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-4 font-bold">Environment</p>
            <div className="flex bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button onClick={() => setIsProduction(false)} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${!isProduction ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>SANDBOX</button>
              <button onClick={() => setIsProduction(true)} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${isProduction ? 'bg-red-950 text-red-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>PROD</button>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="relative group/avatar">
            <div 
              onClick={() => setActiveTab('Identity')}
              className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 p-2 -m-2 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">JS</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate text-zinc-900 dark:text-white">James Stork</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-mono">{isProduction ? 'node_live_9221' : 'node_dev_4410'}</p>
              </div>
            </div>
            {/* Quick Theme Toggle Button on Avatar */}
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleTheme?.(); }}
              className="absolute right-0 top-0 mt-2 mr-2 p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:scale-110 transition-transform opacity-0 group-hover/avatar:opacity-100"
              title="Quick Toggle Theme"
            >
              <span className="material-symbols-sharp !text-[14px] text-zinc-500 dark:text-zinc-400">
                {currentTheme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-sharp !text-[14px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {isProduction && (
          <div className="bg-red-950/20 border-b border-red-900/50 px-8 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-sharp text-red-500 animate-pulse !text-[18px]">warning</span>
              <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                Live Production Environment — Real Assets at Risk
              </span>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950/50 transition-colors">
          <header className="h-16 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between px-8 bg-white/40 dark:bg-black/40 backdrop-blur-sm sticky top-0 z-10 transition-colors">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500 uppercase font-bold">Nominal</span>
              </div>
              <button className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center">
                <span className="material-symbols-sharp">notifications</span>
              </button>
            </div>
          </header>

          <div className="p-8 max-w-6xl mx-auto pb-32">
            {renderContent()}
          </div>
        </main>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0b] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-12">
                <h3 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Initialize Account</h3>
                <p className="text-zinc-500 mb-8 font-mono text-xs uppercase tracking-widest">Awaiting CreateAccountRequest payload...</p>
                <button onClick={() => setIsCreateModalOpen(false)} className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl">Close Terminal</button>
             </div>
          </div>
        )}

        {/* Rails Copilot AI */}
        <div className={`fixed bottom-8 right-8 z-[50] transition-all duration-500 transform ${isCopilotOpen ? 'w-96 h-[500px]' : 'w-12 h-12'}`}>
          {!isCopilotOpen ? (
            <button 
              onClick={() => setIsCopilotOpen(true)}
              className="w-full h-full bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
            >
              <span className="material-symbols-sharp">smart_toy</span>
            </button>
          ) : (
            <div className="w-full h-full bg-white dark:bg-[#0d0d0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-sharp !text-[16px] text-zinc-400">terminal</span>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 dark:text-zinc-300">Rails Copilot</span>
                </div>
                <button onClick={() => setIsCopilotOpen(false)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                  <span className="material-symbols-sharp !text-[16px]">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-white dark:bg-[#0d0d0e]">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-xs font-mono leading-relaxed ${msg.role === 'user' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' : 'bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-white/5 shadow-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isThinking && <div className="text-[10px] font-mono text-zinc-400 animate-pulse">Thinking...</div>}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask Rails Copilot..." 
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-[11px] font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;