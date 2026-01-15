import React, { useState } from 'react';
import { ApplicationStatus } from '../types';

const BetaSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: ''
  });
  const [status, setStatus] = useState<ApplicationStatus>(ApplicationStatus.IDLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(ApplicationStatus.SUBMITTING);
    
    // Simulate API call with a slight delay for realism
    setTimeout(() => {
      setStatus(ApplicationStatus.SUCCESS);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="beta" className="py-32 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Apply for the Private Beta.
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Rails is currently in a closed-access phase. We are onboarding a limited number of teams 
            building critical financial infrastructure.
          </p>
        </div>
        
        {status === ApplicationStatus.SUCCESS ? (
          <div className="max-w-xl mx-auto p-12 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-sharp text-black !text-[32px]">check</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Application Encrypted & Sent</h3>
            <p className="text-zinc-400 mb-8">
              Thank you for your interest in Rails. Our infrastructure team will review your application 
              and contact you via secure channel if there is a fit for the current cohort.
            </p>
            <button 
              onClick={() => setStatus(ApplicationStatus.IDLE)}
              className="text-sm font-medium text-zinc-500 hover:text-white transition-colors"
            >
              Submit another application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-all hover:bg-zinc-800/50"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 ml-1">Company</label>
                <input
                  name="company"
                  type="text"
                  required
                  placeholder="Acme Inc"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-all hover:bg-zinc-800/50"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 ml-1">Work Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="john@acme.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-all hover:bg-zinc-800/50"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 ml-1">Primary Use Case</label>
              <textarea
                name="useCase"
                required
                rows={4}
                placeholder="Tell us about the banking rails you're looking to build..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white transition-all hover:bg-zinc-800/50 resize-none"
                value={formData.useCase}
                onChange={handleChange}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === ApplicationStatus.SUBMITTING}
                className="w-full bg-white text-black font-bold rounded-xl py-4 hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {status === ApplicationStatus.SUBMITTING ? (
                  <>
                    <span className="material-symbols-sharp animate-spin">refresh</span>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <span className="material-symbols-sharp !text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-[10px] uppercase tracking-widest text-zinc-600 font-mono">
              Access is strictly confidential. All data is encrypted at rest.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default BetaSignup;