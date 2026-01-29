import React, { useState } from 'react';
import { passwordResetApi } from '../lib/api';

interface ForgotPasswordPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await passwordResetApi.request(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-md mx-auto">
          <div className="mb-12 text-center">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors mb-8 group"
            >
              <span className="material-symbols-sharp !text-[18px] transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
              Back to login
            </button>
            
            <div className="mb-8">
              <span className="material-symbols-sharp !text-[48px] text-green-500 dark:text-green-400 mb-4">check_circle</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tighter mb-4 text-zinc-800 dark:text-white">
              Check Your Email
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light mb-8">
              If an account exists with that email, a password reset link has been sent.
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-mono">
              The link will expire in 1 hour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-md mx-auto">
        <div className="mb-12 text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors mb-8 group"
          >
            <span className="material-symbols-sharp !text-[18px] transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to login
          </button>
          
          <h1 className="text-4xl font-bold tracking-tighter mb-4 text-zinc-800 dark:text-white">
            Reset Password
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Email Address</label>
            <input 
              type="email" 
              autoComplete="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs animate-in shake duration-300">
              <span className="material-symbols-sharp !text-[18px] mt-0.5">error</span>
              <div className="flex-1">
                <p className="font-bold mb-0.5 uppercase tracking-tighter">Error</p>
                <p className="leading-relaxed opacity-80">{error}</p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-800 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-zinc-100 dark:shadow-white/5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-mono">Sending...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Send Reset Link</span>
                  <span className="material-symbols-sharp !text-[18px]">send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
