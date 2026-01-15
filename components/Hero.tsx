import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<'install' | 'login' | 'logs'>('install');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const runSequence = async () => {
      // Clear for a fresh start
      setTerminalLines([]);

      // 1. Install Phase
      setTerminalLines(['<span class="text-zinc-600 font-bold uppercase tracking-widest text-[10px] font-mono"># Initialize SDK</span>']);
      await delay(800);
      setTerminalLines(prev => [...prev, '<span class="flex gap-2 text-zinc-500 font-mono"><span class="text-zinc-700">$</span> npm install @rails/infra</span>']);
      await delay(1200);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-700 font-mono">added 142 packages in 0.8s</span>']);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-400 font-mono">✓ SDK ready.</span>']);
      
      await delay(1500);
      
      // 2. Login Phase
      setPhase('login');
      setTerminalLines(prev => [...prev, '', '<span class="text-zinc-600 font-bold uppercase tracking-widest text-[10px] font-mono"># Production Auth</span>']);
      await delay(600);
      setTerminalLines(prev => [...prev, '<span class="flex gap-2 text-zinc-500 font-mono"><span class="text-zinc-700">$</span> rails auth login --scope="prod"</span>']);
      await delay(1000);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-700 font-mono">Verifying security keys...</span>']);
      await delay(1200);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-400 font-mono">✓ Node: prod_east_04 (Session: 0x9f2...)</span>']);
      
      await delay(1500);

      // 3. Monitor Logs Phase (Looping)
      setPhase('logs');
      setTerminalLines(prev => [...prev, '', '<span class="flex gap-2 text-zinc-500 font-mono"><span class="text-zinc-700">$</span> rails tail -f --json</span>']);
      await delay(800);
      
      const logPool = [
        '<span class="text-cyan-900/80 font-bold font-mono">Account:create</span> <span class="text-zinc-600 font-mono">acc_****7721 owner:"H**** L***"</span>',
        '<span class="text-fuchsia-900/80 font-bold font-mono">Payment:init</span> <span class="text-zinc-600 font-mono">tx_****9912 amount:8,250.00 (WIRE)</span>',
        '<span class="text-amber-900/80 font-bold font-mono">Ledger:commit</span> <span class="text-zinc-600 font-mono">block:922,111 entries:4 integrity:OK</span>',
        '<span class="text-emerald-900/80 font-bold font-mono">Identity:pass</span> <span class="text-zinc-600 font-mono">org_****911 jurisdiction:"US-DE"</span>',
        '<span class="text-zinc-700 font-mono">Rail:ach_batch</span> <span class="text-zinc-600 font-mono">batch_922 file_gen:OK (42 items)</span>',
        '<span class="text-cyan-900/80 font-bold font-mono">Account:upd</span> <span class="text-zinc-600 font-mono">acc_****0012 limits:updated</span>',
        '<span class="text-fuchsia-900/80 font-bold font-mono">Payment:settle</span> <span class="text-zinc-600 font-mono">tx_****8811 settled (Lat: 142ms)</span>',
        '<span class="text-zinc-700 font-mono">Core:shard_sync</span> <span class="text-zinc-600 font-mono">node_02 delta:0.00ms status:SYNC</span>',
        '<span class="text-amber-900/80 font-bold font-mono">Ledger:recon</span> <span class="text-zinc-600 font-mono">reconciled vol_092 check:PASSED</span>',
        '<span class="text-emerald-900/80 font-bold font-mono">Webhook:sent</span> <span class="text-zinc-600 font-mono">evt_****11a -> payload:encrypted</span>'
      ];

      let logIndex = 0;
      while (true) {
        const now = new Date();
        const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        setTerminalLines(prev => {
          const nextLines = [...prev, `<span class="text-zinc-700 mr-2 font-mono">${timestamp}</span> ${logPool[logIndex % logPool.length]}`];
          return nextLines.slice(-14);
        });
        logIndex++;
        await delay(Math.random() * 1200 + 400);
      }
    };

    runSequence();

    return () => clearTimeout(timeout);
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="grid-background absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Building in Stealth • Private Beta
        </div>
        
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
          Modern rails for<br />
          <span className="text-zinc-500 font-medium">programmable finance.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-light">
          The banking-as-a-service infrastructure for fintech pioneers. 
          Move money, create accounts, and manage ledgers with a single, 
          unified SDK.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#beta"
            className="w-full sm:w-auto px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all transform hover:scale-105"
          >
            Join the Waitlist
          </a>
          <a
            href="#beta"
            className="w-full sm:w-auto px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded-full hover:bg-zinc-800 transition-all"
          >
            Read the Specs
          </a>
        </div>
        
        {/* Terminal Visualizer Section */}
        <div className="mt-24 relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-900 via-white/5 to-zinc-900 rounded-2xl blur-2xl opacity-10"></div>
          
          <div className="relative bg-[#050505] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                </div>
                <div className="h-4 w-px bg-white/5 mx-2"></div>
                <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-[0.2em]">Live Infrastructure Log</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">prod_node_04</span>
                </div>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="relative font-mono text-[11px] md:text-[12px] text-left p-6 md:p-10 min-h-[360px] max-h-[460px] flex flex-col justify-start overflow-hidden leading-loose">
              <div className="space-y-1 transition-all duration-300 relative z-10">
                {terminalLines.map((line, i) => (
                  <div 
                    key={i} 
                    className="animate-in slide-in-from-bottom-1 fade-in duration-500 flex gap-1 items-start" 
                    dangerouslySetInnerHTML={{ __html: line }} 
                  />
                ))}
                <div className="flex gap-2 mt-2">
                  <span className="text-zinc-700 font-mono">$</span>
                  <span className="w-1.5 h-3.5 bg-white/20 animate-pulse mt-0.5"></span>
                </div>
              </div>

              {/* Scanline / CRT Effect Overlay */}
              <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,255,255,0.01),rgba(255,255,255,0.01),rgba(255,255,255,0.01))] bg-[size:100%_4px,3px_100%] opacity-40"></div>
              
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;