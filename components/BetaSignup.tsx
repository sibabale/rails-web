
import React, { useState } from 'react';
import { ApplicationStatus } from '../types';

const BetaSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>(ApplicationStatus.IDLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus(ApplicationStatus.SUBMITTING);
    // Simulate API call
    setTimeout(() => {
      setStatus(ApplicationStatus.SUCCESS);
      setEmail('');
    }, 1500);
  };

  return (
    <section id="beta" className="py-32 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
          Apply for early access.
        </h2>
        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
          We're hand-selecting a small cohort of partners to build on Rails 
          during our stealth phase. Be the first to know when we exit beta.
        </p>
        
        {status === ApplicationStatus.SUCCESS ? (
          <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 animate-in fade-in zoom-in duration-500">
            <h3 className="text-2xl font-bold mb-2">Application Received.</h3>
            <p className="text-zinc-400">Our team will reach out to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="Enter your work email"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-6 py-4 text-white focus:outline-none focus:border-white transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                disabled={status === ApplicationStatus.SUBMITTING}
                className="bg-white text-black font-bold rounded-full px-8 py-4 hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {status === ApplicationStatus.SUBMITTING ? 'Applying...' : 'Apply'}
              </button>
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              By applying, you agree to our confidential beta terms.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default BetaSignup;
