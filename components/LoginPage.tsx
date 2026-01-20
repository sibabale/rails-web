
import React, { useState } from 'react';

interface LoginPageProps {
  onBack: () => void;
  onSuccess: (sessionData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_BASE_URL = process.env.USERS_SERVICE || 'https://rails-client-server-production.up.railway.app';
    const endpoint = `${API_BASE_URL.replace(/\/$/, '')}/api/v1/auth/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid credentials. Please verify your email and password.");
        }
        
        let errorMessage = `Auth Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonErr) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError(`Connection failed to Rails Auth node at ${endpoint}. Check network status.`);
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-md mx-auto">
        <div className="mb-12 text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors mb-8 group"
          >
            <span className="material-symbols-sharp !text-[18px] transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to landing
          </button>
          
          <h1 className="text-4xl font-bold tracking-tighter mb-4 text-zinc-800 dark:text-white">
            Infrastructure <span className="text-zinc-400 dark:text-zinc-500">Auth</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
            Authenticate to your business node. Access restricted to institutional partners.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Work Email</label>
            <input 
              type="email" 
              name="email"
              required
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 ml-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs animate-in shake duration-300">
              <span className="material-symbols-sharp !text-[18px] mt-0.5">lock_reset</span>
              <div className="flex-1">
                <p className="font-bold mb-0.5 uppercase tracking-tighter">Auth Failure</p>
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
                  <span className="text-sm font-mono">Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Sign In</span>
                  <span className="material-symbols-sharp !text-[18px]">key</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-4">
            <a href="#" className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors">
              Forgot security credentials?
            </a>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-mono">
              SECURE SESSION • TLS 1.3 ENFORCED
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
