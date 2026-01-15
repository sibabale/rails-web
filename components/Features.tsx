
import React from 'react';
import { FEATURES } from '../constants';
import CodeBlock from './CodeBlock';

const Features: React.FC = () => {
  return (
    <section id="infrastructure" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
            Everything you need to<br />launch a bank.
          </h2>
          <p className="text-zinc-400 max-w-xl text-lg">
            Stop worrying about ledger consistency and banking core logic. 
            Build your unique product on top of our bulletproof infra.
          </p>
        </div>

        <div className="space-y-32">
          {FEATURES.map((feature, index) => (
            <div 
              key={feature.id} 
              className={`flex flex-col lg:flex-row items-center gap-16 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  {feature.description}
                </p>
                <ul className="space-y-4">
                  {['Instant instantiation', 'Full audit trail', 'Regulatory ready'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <CodeBlock code={feature.code} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
