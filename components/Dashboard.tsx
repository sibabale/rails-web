import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isProduction, setIsProduction] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSchemaVisible, setIsSchemaVisible] = useState(false);
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
          systemInstruction: "You are the Rails Infrastructure Copilot. You help developers build banking applications using the Rails SDK. You know everything about immutable ledgers, double-entry accounting, and the 'Weekend Settlement' feature where Rails provides 24/7 liquidity when traditional banks are closed. You know that Rails takes a 1% fee on weekend transactions and requires banks to provide 'Surety Funds' to the Rails Reserve. Keep answers concise, developer-focused, and slightly technical."
        }
      });
      
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "Connection to core node lost. Retry." }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error: AI Node Timeout. Check Infrastructure logs." }]);
    } finally {
      setIsThinking(false);
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
          className="flex-1 bg-white/20 hover:bg-white transition-all rounded-t-sm"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Settled Volume (24h)</p>
                  <h2 className="text-3xl font-bold tracking-tighter mb-4">$1,242,910.00</h2>
                  <VolumeChart />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">Active Ledgers</p>
                  <h2 className="text-3xl font-bold tracking-tighter">42</h2>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['US', 'EU', 'SG', 'UK'].map(region => (
                    <span key={region} className="text-[9px] font-mono border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{region}</span>
                  ))}
                </div>
              </div>
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl shadow-sm">
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-2">p99 Latency</p>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-3xl font-bold tracking-tighter font-mono">42</h2>
                   <span className="text-emerald-500 text-xs font-mono">ms</span>
                </div>
                <div className="mt-8 space-y-2">
                   <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[92%]"></div>
                   </div>
                   <p className="text-[9px] font-mono text-zinc-600 uppercase">System Availability: 99.998%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Global Node Status</h3>
                <div className="grid grid-cols-4 gap-2">
                   {Array.from({length: 16}).map((_, i) => (
                      <div key={i} className={`h-8 rounded border border-zinc-900 flex items-center justify-center ${i === 12 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                         <span className="material-symbols-sharp !text-[14px]">{i === 12 ? 'warning' : 'check_circle'}</span>
                      </div>
                   ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Live Ledger Events</h3>
                <div className="bg-black border border-zinc-800/50 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-zinc-900 font-mono text-[11px]">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-900/30 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-white"></span>
                              <span className="text-white font-bold">{log.action}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 truncate max-w-[80px]">{log.id}</td>
                          <td className="px-4 py-3 text-right">
                             <span className="text-zinc-400">{log.amount}</span>
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
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight font-heading">Financial Accounts</h2>
                <p className="text-sm text-zinc-500">Core system accounts based on <code>AccountResponse</code> schema.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSchemaVisible(!isSchemaVisible)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <span className="material-symbols-sharp">code</span>
                  {isSchemaVisible ? 'Hide Schema' : 'View Schema'}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm ${isProduction ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                >
                  <span className="material-symbols-sharp">add</span>
                  Create Account
                </button>
              </div>
            </div>

            {isSchemaVisible && (
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl animate-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Model: AccountResponse (Rust)</span>
                  <span className="text-[10px] font-mono text-zinc-700">source: infra/src/models/account.rs</span>
                </div>
                <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed overflow-x-auto">
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
                  ].map((acc) => (
                    <tr key={acc.id} className="hover:bg-zinc-900/30 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-white font-bold block">{acc.account_number}</span>
                        <span className="text-zinc-600 text-[9px] font-mono uppercase tracking-tighter truncate w-32 block">{acc.id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-zinc-300 font-medium">{acc.account_type}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-zinc-500 text-[10px] font-mono">{acc.user_id}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${acc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-white">{acc.balance} <span className="text-zinc-600 text-[10px] ml-1">{acc.currency}</span></td>
                      <td className="px-6 py-5 text-right text-zinc-500 font-mono italic">{acc.created_at}</td>
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
                <h2 className="text-2xl font-bold tracking-tight font-heading">Weekend Settlement Engine</h2>
                <p className="text-sm text-zinc-500">Manage 24/7 liquidity and bank surety funds.</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                  <span className="material-symbols-sharp">receipt_long</span>
                  Export Audit Log
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors">
                  <span className="material-symbols-sharp">account_balance_wallet</span>
                  Top-up Surety Reserve
                </button>
              </div>
            </div>

            {/* Reserve Monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-bold">Total Surety Pool</p>
                <h2 className="text-3xl font-bold tracking-tighter">R{reserve.total.toLocaleString()}</h2>
                <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-600">
                  <span>CAPACITY UTILIZATION</span>
                  <span>{((reserve.total - reserve.available) / reserve.total * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                   <div className="h-full bg-white transition-all duration-700" style={{ width: `${((reserve.total - reserve.available) / reserve.total * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-bold">Available Reserve</p>
                <h2 className="text-3xl font-bold tracking-tighter text-emerald-500">R{reserve.available.toLocaleString()}</h2>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  READY FOR LIQUIDITY INJECTION
                </div>
              </div>
              <div className="bg-black border border-zinc-800/50 p-6 rounded-2xl border-white/5">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2 font-bold">Projected Rails Fees (1%)</p>
                <h2 className="text-3xl font-bold tracking-tighter">R{settlementFees.toLocaleString()}</h2>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                  <span className="material-symbols-sharp !text-[14px]">auto_graph</span>
                  +14% VS PREVIOUS WEEKEND
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Bank Connectivity Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">Bank Bridge Status</h3>
                <div className="bg-black border border-zinc-800/50 rounded-2xl overflow-hidden divide-y divide-zinc-900">
                  {banks.map(bank => (
                    <div key={bank.code} className="p-4 flex items-center justify-between group hover:bg-zinc-900/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${bank.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`}></div>
                        <div>
                          <p className="text-xs font-bold text-white tracking-tight">{bank.name}</p>
                          <p className="text-[9px] font-mono text-zinc-600">{bank.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-zinc-400">R{(bank.surety / 1000000).toFixed(1)}M Surety</p>
                        <p className={`text-[9px] font-bold uppercase tracking-tighter ${bank.connected ? 'text-zinc-600' : 'text-zinc-800'}`}>
                          {bank.connected ? 'Bridged' : 'Standby'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Settlement Transactions */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">Live Settlement Feed</h3>
                  <div className="flex gap-4">
                    <span className="text-[9px] font-mono text-zinc-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PENDING
                    </span>
                    <span className="text-[9px] font-mono text-zinc-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> DELAYED
                    </span>
                  </div>
                </div>
                <div className="bg-black border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-mono text-zinc-600 uppercase bg-zinc-950 border-b border-zinc-900">
                      <tr>
                        <th className="px-6 py-4">Transaction Ref</th>
                        <th className="px-6 py-4">Flow (Source → Dest)</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 font-mono text-xs">
                      {[
                        { ref: 'txn_99x221a', sender: 'FNB', receiver: 'ABSA', amount: 142000, status: 'pending', time: '14:22:01' },
                        { ref: 'txn_0x221bb', sender: 'NEDBANK', receiver: 'CAPITEC', amount: 92000, status: 'pending', time: '14:21:44' },
                        { ref: 'txn_99x112c', sender: 'FNB', receiver: 'STANDARD', amount: 4500000, status: 'delayed', time: '14:20:12' },
                        { ref: 'txn_88z224d', sender: 'ABSA', receiver: 'FNB', amount: 12500, status: 'pending', time: '14:19:55' },
                      ].map(tx => (
                        <tr key={tx.ref} className="hover:bg-zinc-900/30 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="text-zinc-400 font-bold block">{tx.ref}</span>
                            <span className="text-zinc-600 text-[9px]">{tx.time}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{tx.sender}</span>
                              <span className="text-zinc-800">→</span>
                              <span className="text-zinc-400">{tx.receiver}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-white font-bold">R{tx.amount.toLocaleString()}</p>
                            <p className="text-[9px] text-zinc-600">FEE: R{(tx.amount * 0.01).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              tx.status === 'pending' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-sharp text-zinc-600">info</span>
                    <p className="text-[10px] font-mono text-zinc-500">
                      Transactions marked as <span className="text-amber-500 font-bold">DELAYED</span> require additional surety funds from the source bank.
                    </p>
                  </div>
                  <button className="text-[10px] font-mono font-bold uppercase underline underline-offset-4 text-zinc-400 hover:text-white transition-colors">
                    Release Delayed Batch
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Payments':
      case 'Ledger':
      case 'Infrastructure':
        return <div className="p-12 text-center text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">Endpoint in Stealth... Access Denied</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen bg-[#09090b] text-[#fafafa] overflow-hidden selection:bg-white selection:text-black transition-all duration-700 ${isProduction ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.05)]' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 flex flex-col bg-black relative z-20">
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

        <main className="flex-1 overflow-y-auto no-scrollbar bg-zinc-950/50">
          <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold tracking-tight">{activeTab}</h1>
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

          <div className="p-8 max-w-6xl mx-auto pb-32">
            {renderContent()}
          </div>
        </main>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="w-full max-w-2xl bg-[#0a0a0b] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-12">
                <h3 className="text-2xl font-bold mb-6">Initialize Account</h3>
                <p className="text-zinc-500 mb-8 font-mono text-xs uppercase tracking-widest">Awaiting CreateAccountRequest payload...</p>
                <button onClick={() => setIsCreateModalOpen(false)} className="w-full py-4 bg-white text-black font-bold rounded-xl">Close Terminal</button>
             </div>
          </div>
        )}

        {/* Rails Copilot AI */}
        <div className={`fixed bottom-8 right-8 z-[50] transition-all duration-500 transform ${isCopilotOpen ? 'w-96 h-[500px]' : 'w-12 h-12'}`}>
          {!isCopilotOpen ? (
            <button 
              onClick={() => setIsCopilotOpen(true)}
              className="w-full h-full bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
            >
              <span className="material-symbols-sharp">smart_toy</span>
            </button>
          ) : (
            <div className="w-full h-full bg-[#0d0d0e] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-sharp !text-[16px] text-zinc-400">terminal</span>
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-300">Rails Copilot v1.2</span>
                </div>
                <button onClick={() => setIsCopilotOpen(false)} className="text-zinc-500 hover:text-white">
                  <span className="material-symbols-sharp !text-[16px]">close</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {chatHistory.length === 0 && (
                  <div className="text-center py-10">
                    <span className="material-symbols-sharp text-zinc-800 !text-[48px] mb-4">forum</span>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Query the infrastructure node...</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-xs font-mono leading-relaxed ${msg.role === 'user' ? 'bg-zinc-800 text-zinc-300' : 'bg-white/5 text-zinc-400 border border-white/5'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-3 rounded-xl">
                      <span className="flex gap-1">
                        <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask Rails Copilot..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-[11px] font-mono text-white focus:outline-none focus:border-zinc-500"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-sharp !text-[16px]">send</span>
                  </button>
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