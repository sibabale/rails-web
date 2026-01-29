
import React, { useState } from 'react';
import { FEATURES } from '../constants';
import CodeBlock from './CodeBlock';

const Features: React.FC = () => {
  const [activeFeatureId, setActiveFeatureId] = useState(FEATURES[0].id);

  const activeFeature = FEATURES.find(f => f.id === activeFeatureId) || FEATURES[0];

  return (
    <section id="infrastructure" className="py-24 bg-white dark:bg-black relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-sm font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.3em] mb-4">Core Infrastructure</h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-zinc-800 dark:text-white">
            Everything you need to<br /><span className="text-zinc-400 dark:text-zinc-500">launch a bank.</span>
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl text-lg font-light leading-relaxed">
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
                className={`group relative text-left w-full py-8 border-b border-zinc-100 dark:border-zinc-800/50 transition-all duration-300 ${
                  activeFeatureId === feature.id 
                    ? 'opacity-100' 
                    : 'opacity-40 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                    activeFeatureId === feature.id ? 'bg-zinc-800 dark:bg-white scale-150 shadow-[0_0_8px_rgba(0,0,0,0.05)] dark:shadow-[0_0_8px_white]' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}></div>
                  <div>
                    <h4 className={`text-xl font-bold mb-2 transition-colors ${
                      activeFeatureId === feature.id ? 'text-zinc-800 dark:text-white' : 'text-zinc-400'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    {/* Inline bullets */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      activeFeatureId === feature.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <ul className="space-y-2 pb-2">
                        {feature.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">
                            <span className="w-1 h-px bg-zinc-200 dark:bg-zinc-600"></span>
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
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-white hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors group"
              >
                View full API reference
                <span className="material-symbols-sharp !text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="relative group">
              <div className="absolute -inset-4 bg-zinc-100 dark:bg-white/5 blur-3xl rounded-full opacity-40 group-hover:opacity-60 transition-opacity" />
              
              <div className="relative">
                <CodeBlock snippets={activeFeature.snippets} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;