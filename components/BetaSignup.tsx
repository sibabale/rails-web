import React, { useRef, useState } from 'react';
import { betaApplyApi } from '../lib/api';
import { trackEvent } from '../lib/analytics';
import { ApplicationStatus } from '../types';

const BetaSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: ''
  });
  const [status, setStatus] = useState<ApplicationStatus>(ApplicationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const formStarted = useRef(false);
  const submitStartedAt = useRef<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(ApplicationStatus.SUBMITTING);
    submitStartedAt.current = Date.now();
    trackEvent('waitlist_submit_attempt', {
      name_length: formData.name.trim().length,
      email_length: formData.email.trim().length,
      company_length: formData.company.trim().length,
      use_case_length: formData.useCase.trim().length,
    });
    try {
      await betaApplyApi.apply({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        use_case: formData.useCase.trim()
      });
      setStatus(ApplicationStatus.SUCCESS);
      trackEvent('waitlist_submit_success', {
        latency_ms: submitStartedAt.current ? Date.now() - submitStartedAt.current : null,
      });
    } catch (err) {
      setStatus(ApplicationStatus.ERROR);
      const message = err instanceof Error ? err.message : '';
      const isNetworkError = message === 'Failed to fetch';
      trackEvent('waitlist_submit_error', {
        error_type: isNetworkError ? 'network' : 'api',
        has_message: Boolean(message),
        latency_ms: submitStartedAt.current ? Date.now() - submitStartedAt.current : null,
      });
      setError(
        isNetworkError
          ? 'Unable to reach the server. Please check your connection and try again.'
          : message || 'Something went wrong. Please try again.'
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (!formStarted.current) {
      formStarted.current = true;
      trackEvent('waitlist_form_started', {
        first_field: e.target.name,
      });
    }
    if (error) setError(null);
  };

  const handleFieldFocus = (fieldName: string) => {
    trackEvent('waitlist_field_focus', {
      field: fieldName,
    });
  };

  return (
    <section id="beta" className="py-32 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 text-zinc-800 dark:text-white">
            Apply for the Private Beta.
          </h2>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Rails is currently in a closed-access phase. We are onboarding a limited number of teams building critical financial infrastructure.
          </p>
        </div>
        
        {status === ApplicationStatus.SUCCESS ? (
          <div className="max-w-xl mx-auto p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 bg-zinc-800 dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-sharp text-white dark:text-black !text-[32px]">check</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-zinc-800 dark:text-white">Application Encrypted & Sent</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8">
              Thank you for your interest in Rails. Our infrastructure team will review your application and contact you via secure channel.
            </p>
            <button 
              onClick={() => {
                trackEvent('waitlist_form_reset');
                setStatus(ApplicationStatus.IDLE);
              }}
              className="text-sm font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              Submit another application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm" role="alert">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-800 dark:focus:border-white transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('name')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Company</label>
                <input
                  name="company"
                  type="text"
                  required
                  placeholder="Acme Inc"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-800 dark:focus:border-white transition-all"
                  value={formData.company}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('company')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Work Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="john@acme.com"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-800 dark:focus:border-white transition-all"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFieldFocus('email')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Primary Use Case</label>
              <textarea
                name="useCase"
                required
                rows={4}
                placeholder="Tell us about the banking rails you're looking to build..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-800 dark:focus:border-white transition-all resize-none"
                value={formData.useCase}
                onChange={handleChange}
                onFocus={() => handleFieldFocus('useCase')}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={status === ApplicationStatus.SUBMITTING}
                className="w-full bg-zinc-800 dark:bg-white text-white dark:text-black font-bold rounded-xl py-4 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group shadow-md shadow-zinc-100 dark:shadow-none"
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
            
            <p className="text-center text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-mono">
              Access is strictly confidential. All data is encrypted at rest.
            </p>
          </form>
        )}
      </div>
    </section>
  );
};

export default BetaSignup;