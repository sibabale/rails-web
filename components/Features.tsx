
import React, { useState } from 'react';
import { FEATURES } from '../constants';
import CodeBlock from './CodeBlock';

const Features: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState(FEATURES[0].id);

  const activeFeature = FEATURES.find(f => f.id === activeFeatureId) || FEATURES[0];

  return (
    <section id="infrastructure" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">Core Infrastructure</h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Everything you need to<br /><span className="text-zinc-500">launch a bank.</span>
          </h3>
          <p className="text-zinc-400 max-w-xl text-lg font-light leading-relaxed">
            Stop worrying about ledger consistency and banking core logic. 
            Build your unique product on top of our bulletproof infra.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Feature Navigation List */}
          <div className="lg:col-span-5 space-y-0">
            {FEATURES.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeatureId(feature.id)}
                className={`group relative text-left w-full py-8 border-b border-zinc-800/50 transition-all duration-300 ${
                  activeFeatureId === feature.id 
                    ? 'opacity-100' 
                    : 'opacity-40 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    activeFeatureId === feature.id ? 'bg-white scale-150 shadow-[0_0_8px_white]' : 'bg-zinc-700'
                  }`}></div>
                  <div>
                    <h4 className={`text-xl font-bold mb-2 transition-colors ${
                      activeFeatureId === feature.id ? 'text-white' : 'text-zinc-400'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Inline bullets for the active item to give it more weight */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      activeFeatureId === feature.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <ul className="space-y-2 pb-2">
                        {feature.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                            <span className="w-1 h-px bg-zinc-600"></span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            <div className="pt-8">
              <a 
                href="#beta" 
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-zinc-400 transition-colors group"
              >
                View full API reference
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Code Showcase Terminal */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full opacity-50 group-hover:opacity-70 transition-opacity" />
              
              <div className="relative">
                <div className="absolute top-0 right-0 p-4 z-10 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">Live Sandbox</span>
                  </div>
                </div>
                <CodeBlock snippets={activeFeature.snippets} />
              </div>

              {/* Terminal Footer Metadata */}
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-[10px] font-mono text-zinc-600 uppercase flex gap-4">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    TLS 1.3
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    SOC2 Compliant
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-700">v2.4.0-STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
