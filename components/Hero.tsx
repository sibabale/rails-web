
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="grid-background absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Building in Stealth • Private Beta
        </div>
        
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
          Modern rails for<br />
          <span className="text-zinc-500">programmable finance.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
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
            href="#docs"
            className="w-full sm:w-auto px-8 py-3 bg-zinc-900 border border-zinc-800 text-white font-semibold rounded-full hover:bg-zinc-800 transition-all"
          >
            Read the Specs
          </a>
        </div>
        
        <div className="mt-24 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-white/5 to-zinc-800 rounded-2xl blur-lg opacity-20"></div>
          <div className="relative bg-black border border-zinc-800 rounded-2xl p-4 glow-effect">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              <div className="ml-4 text-xs font-mono text-zinc-500">Terminal — rails sdk — 80x24</div>
            </div>
            <div className="font-mono text-sm text-left text-zinc-300 p-4 space-y-2">
              <div className="text-zinc-500"># Install the SDK</div>
              <div className="flex gap-2">
                <span className="text-zinc-600">$</span>
                <span>npm install @rails/infra</span>
              </div>
              <div className="mt-4 text-zinc-500"># Authenticate</div>
              <div className="flex gap-2">
                <span className="text-zinc-600">$</span>
                <span className="text-white">rails auth login</span>
              </div>
              <div className="text-zinc-600 mt-2">Connecting to secure cluster... [OK]</div>
              <div className="text-zinc-600">Syncing schema definitions... [OK]</div>
              <div className="text-green-500">✓ Ready to build.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
