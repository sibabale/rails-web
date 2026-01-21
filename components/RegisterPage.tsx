
import React, { useState } from 'react';

interface RegisterPageProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_BASE_URL =
      (import.meta.env.VITE_USERS_SERVICE as string | undefined) || '';
    const endpoint = `${API_BASE_URL.replace(/\/$/, '')}/api/v1/business/register`;

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
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonErr) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(true);
      setTimeout(() => {
        onSuccess(data);
      }, 2000);
    } catch (err: any) {
      console.error('Registration Error:', err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError(`Unable to connect to the Rails node at ${endpoint}. Check network or CORS configuration for the production host.`);
      } else {
        setError(err.message || 'An unexpected error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors mb-8 group"
          >
            <span className="material-symbols-sharp !text-[18px] transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to landing
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-zinc-800 dark:text-white">
            Ready to build <br />
            <span className="text-zinc-400 dark:text-zinc-500">on Rails?</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light">
            Create your institutional account and get instant access to our banking infrastructure.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 p-8 rounded-2xl text-center shadow-sm">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-sharp text-white !text-[24px]">check</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">Registration Successful</h2>
            <p className="text-emerald-600 dark:text-emerald-600/80 text-sm">
              Your business node is being initialized. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Company Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Acme Institutional"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Website <span className="text-[10px] opacity-60">(Optional)</span></label>
                <input 
                  type="url" 
                  name="website"
                  placeholder="https://acme.com"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Admin First Name</label>
                <input 
                  type="text" 
                  name="admin_first_name"
                  required
                  placeholder="Alice"
                  value={formData.admin_first_name}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Admin Last Name</label>
                <input 
                  type="text" 
                  name="admin_last_name"
                  required
                  placeholder="Admin"
                  value={formData.admin_last_name}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Admin Email</label>
              <input 
                type="email" 
                name="admin_email"
                required
                placeholder="admin@acme.com"
                value={formData.admin_email}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Password</label>
              <input 
                type="password" 
                name="admin_password"
                required
                placeholder="••••••••••••"
                value={formData.admin_password}
                onChange={handleChange}
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-800 dark:text-white focus:outline-none focus:border-zinc-300 dark:focus:border-white transition-all font-medium"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in duration-300">
                <span className="material-symbols-sharp !text-[18px] mt-0.5">error</span>
                <div className="flex-1">
                  <p className="font-bold mb-1">Infrastructure Error</p>
                  <p className="leading-relaxed">{error}</p>
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
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Initializing Node...</span>
                  </>
                ) : (
                  <>
                    <span>Create My Account</span>
                    <span className="material-symbols-sharp !text-[20px]">arrow_right_alt</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-mono">
              By registering, you agree to the Rails Institutional Terms of Service.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
