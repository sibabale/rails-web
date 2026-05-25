
import React, { useState, useEffect } from 'react';

interface HeroProps {
  isLoading?: boolean;
}

const Hero: React.FC<HeroProps> = ({ isLoading = false }) => {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<'install' | 'login' | 'logs'>('install');

  useEffect(() => {
    if (isLoading) return;

    let timeout: ReturnType<typeof setTimeout>;

    const runSequence = async () => {
      setTerminalLines([]);
      setTerminalLines(['<span class="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px] font-mono"># Initialize SDK</span>']);
      await delay(800);
      setTerminalLines(prev => [...prev, '<span class="flex gap-2 text-zinc-600 dark:text-zinc-400 font-mono"><span class="text-zinc-400 dark:text-zinc-500">$</span> npm install @rails/infra</span>']);
      await delay(1200);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-500 dark:text-zinc-500 font-mono">added 142 packages in 0.8s</span>']);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-700 dark:text-zinc-300 font-mono font-bold">✓ SDK ready.</span>']);
      
      await delay(1500);
      setPhase('login');
      setTerminalLines(prev => [...prev, '', '<span class="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-[10px] font-mono"># Production Auth</span>']);
      await delay(600);
      setTerminalLines(prev => [...prev, '<span class="flex gap-2 text-zinc-600 dark:text-zinc-400 font-mono"><span class="text-zinc-400 dark:text-zinc-500">$</span> rails auth login --scope="prod"</span>']);
      await delay(1000);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-500 dark:text-zinc-500 font-mono">Verifying security keys...</span>']);
      await delay(1200);
      setTerminalLines(prev => [...prev, '<span class="text-zinc-700 dark:text-zinc-300 font-mono font-bold">✓ Node: prod_east_04 (Session: 0x9f2...)</span>']);
      
      await delay(1500);
      setPhase('logs');
      setTerminalLines(prev => [...prev, '', '<span class="flex gap-2 text-zinc-600 dark:text-zinc-400 font-mono"><span class="text-zinc-400 dark:text-zinc-500">$</span> rails tail -f --json</span>']);
      await delay(800);
      
      const logPool = [
        '<span class="text-cyan-600 dark:text-cyan-400 font-bold font-mono">Account:create</span> <span class="text-zinc-500 dark:text-zinc-500 font-mono">acc_****7721 owner:"H**** L***"</span>',
        '<span class="text-fuchsia-600 dark:text-fuchsia-400 font-bold font-mono">Payment:init</span> <span class="text-zinc-500 dark:text-zinc-500 font-mono">tx_****9912 amount:8,250.00 (WIRE)</span>',
        '<span class="text-amber-600 dark:text-amber-400 font-bold font-mono">Ledger:commit</span> <span class="text-zinc-500 dark:text-zinc-500 font-mono">block:922,111 entries:4 integrity:OK</span>',
        '<span class="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Identity:pass</span> <span class="text-zinc-500 dark:text-zinc-500 font-mono">org_****911 jurisdiction:"US-DE"</span>',
        '<span class="text-zinc-500 dark:text-zinc-500 font-mono">Rail:ach_batch</span> <span class="text-zinc-500 dark:text-zinc-500 font-mono">batch_922 file_gen:OK (42 items)</span>'
      ];

      let logIndex = 0;
      while (true) {
        const now = new Date();
        const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        setTerminalLines(prev => {
          const nextLines = [...prev, `<span class="text-zinc-400 dark:text-zinc-500 mr-2 font-mono">${timestamp}</span> ${logPool[logIndex % logPool.length]}`];
          return nextLines.slice(-14);
        });
        logIndex++;
        await delay(Math.random() * 1200 + 400);
      }
    };

    runSequence();
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (isLoading) {
    return (
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="h-6 w-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full mx-auto mb-8"></div>
          <div className="h-16 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl mx-auto mb-8"></div>
          <div className="h-24 w-1/2 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl mx-auto mb-10"></div>
          <div className="flex gap-4 justify-center">
             <div className="h-12 w-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div>
             <div className="h-12 w-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-full"></div>
          </div>
          <div className="mt-24 h-[460px] max-w-5xl mx-auto bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-900 rounded-2xl animate-pulse"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      <div className="grid-background absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Private Beta
        </div>
        
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] text-zinc-800 dark:text-white">
          Modern rails for<br />
          <span className="text-zinc-400 dark:text-zinc-500 font-medium">programmable finance.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 leading-relaxed font-light">
          The banking-as-a-service infrastructure for fintech pioneers. 
          Move money, create accounts, and manage ledgers with a single, 
          unified SDK.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#beta"
            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-800 text-white dark:bg-white dark:text-black font-semibold rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all transform hover:scale-[1.02] shadow-lg shadow-zinc-200 dark:shadow-none text-center inline-block"
          >
            Join the Waitlist
          </a>
          <a
            href="#infrastructure"
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            Read the Specs
          </a>
        </div>
        
        <div className="mt-24 relative max-w-5xl mx-auto group">
          <div className="absolute -inset-1 bg-zinc-200 dark:bg-white/5 rounded-2xl blur-2xl opacity-20"></div>
          
          <div className="relative bg-zinc-50/50 dark:bg-[#050505] border border-zinc-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl transition-colors duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-100/40 dark:bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF5F57]" title="Close"></div>
                  <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" title="Minimize"></div>
                  <div className="w-2 h-2 rounded-full bg-[#28CA41]" title="Maximize"></div>
                </div>
                <div className="h-4 w-px bg-zinc-100 dark:bg-white/5 mx-2"></div>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.2em]">Live Infrastructure Log</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse"></span>
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">prod_node_04</span>
                </div>
              </div>
            </div>

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
                  <span className="text-zinc-300 dark:text-zinc-500 font-mono">$</span>
                  <span className="w-1.5 h-3.5 bg-zinc-200 dark:bg-white/20 animate-pulse mt-0.5"></span>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.02)_50%),linear-gradient(90deg,rgba(0,0,0,0.01),rgba(0,0,0,0.01),rgba(0,0,0,0.01))] bg-[size:100%_4px,3px_100%] opacity-40"></div>
              <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
