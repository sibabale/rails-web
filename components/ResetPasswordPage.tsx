import React, { useState, useEffect } from 'react';
import { passwordResetApi } from '../lib/api';

interface ResetPasswordPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await passwordResetApi.reset(token, formData.password);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-md mx-auto">
          <div className="mb-12 text-center">
            <div className="mb-8">
              <span className="material-symbols-sharp !text-[48px] text-green-500 dark:text-green-400 mb-4">check_circle</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tighter mb-4 text-zinc-800 dark:text-white">
              Password Reset Successful
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light mb-8">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-mono">
              Redirecting to login...
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
          <h1 className="text-4xl font-bold tracking-tighter mb-4 text-zinc-800 dark:text-white">
            Set New Password
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">New Password</label>
            <input 
              type="password" 
              name="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-mono text-sm"
            />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono ml-1">
              Must be at least 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              required
              minLength={8}
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              disabled={loading || !token}
              className="w-full bg-zinc-800 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-zinc-100 dark:shadow-white/5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-mono">Resetting...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Reset Password</span>
                  <span className="material-symbols-sharp !text-[18px]">lock_reset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
