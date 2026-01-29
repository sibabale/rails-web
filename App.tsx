import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './state/hooks';
import { resetToSandbox, setEnvironment } from './state/slices/environmentSlice';
import { getStoreState } from './state/store';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BetaSignup from './components/BetaSignup';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

interface EnvironmentInfo {
  id: string;
  type: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  timestamp: number;
  environment_id: string; // IMPORTANT: required for X-Environment-Id
  environments: EnvironmentInfo[]; // All available environments for the business
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  business_name?: string;
}

const DashboardSkeleton = () => (
  <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
    <aside className="w-64 border-r border-zinc-100 dark:border-zinc-800/50 flex flex-col bg-zinc-50 dark:bg-black p-6">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-sm animate-pulse"></div>
        <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-2 w-16 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>

    <div className="flex-1 flex flex-col">
      <header className="h-16 border-b border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between px-8 bg-white/40 dark:bg-black/40">
        <div className="h-5 w-32 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse"></div>
        <div className="flex gap-4">
          <div className="h-6 w-24 bg-emerald-500/10 rounded-full animate-pulse"></div>
          <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse"></div>
        </div>
      </header>
      <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-24 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-64 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <div className="h-48 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-2xl animate-pulse"></div>
      </main>
    </div>
  </div>
);

function App() {
  const dispatch = useAppDispatch();
  const environment = useAppSelector((state) => state.environment.current);
  
  // ✅ CRITICAL: Initialize theme from localStorage synchronously to avoid flash
  // This prevents the default 'dark' theme from being applied before useEffect runs
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    return savedTheme || 'dark';
  };
  
  const [view, setView] = useState<'landing' | 'dashboard' | 'register' | 'login' | 'forgotPassword' | 'resetPassword'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLandingLoading, setIsLandingLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const CLIENT_SERVER_URL =
    (import.meta.env.VITE_CLIENT_SERVER as string | undefined) || '';

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const handleLogout = () => {
    setSession(null);
    setProfile(null);
    localStorage.removeItem('rails_session');
    // Reset environment to sandbox on logout (safety requirement)
    dispatch(resetToSandbox());
    setView('landing');
  };

  const fetchProfile = async (token: string, environmentId: string) => {
    setIsProfileLoading(true);

    if (!environmentId) {
      console.warn('Missing environment_id in session. Forcing logout.');
      handleLogout();
      return;
    }

    if (!CLIENT_SERVER_URL) {
      console.error('VITE_CLIENT_SERVER is not configured. All API calls must go through rails-client-server.');
      setIsProfileLoading(false);
      return;
    }

    // Get current environment from Redux store to send X-Environment header
    const currentEnv = getStoreState().environment.current || 'sandbox';

    try {
      const response = await fetch(`${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'X-Environment-Id': environmentId, // ✅ REQUIRED by users-service AuthContext
          'X-Environment': currentEnv, // ✅ REQUIRED for environment-aware routing
        },
      });

      if (response.status === 401) {
        console.warn('Session unauthorized. Clearing state.');
        handleLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();

        // users-service /me returns { user, business, environment }
        const user = data.user ?? data;
        setProfile({
          id: user.id,
          name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          business_name: data.business?.name || user.business_name,
        });
      } else {
        const text = await response.text();
        console.error('Failed to fetch profile:', response.status, text);
      }
    } catch (err) {
      console.error('Network error during profile sync:', err);
    } finally {
      setTimeout(() => setIsProfileLoading(false), 800);
    }
  };

  // Check for password reset token in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setView('resetPassword');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // ✅ CRITICAL: redux-persist handles rehydration via PersistGate
    // The environment slice's REHYDRATE handler ensures sandbox default if no persisted state
    // We don't need to check here because PersistGate waits for rehydration before rendering App
    // The initialState in environmentSlice already defaults to 'sandbox'
    // The REHYDRATE handler validates and defaults to sandbox if persisted state is invalid
    
    // ✅ Theme is already initialized from localStorage in useState initializer
    // This useEffect only needs to sync theme changes to localStorage (handled by separate useEffect)
    // No need to read theme here again as it's already set correctly on mount

    const savedSession = localStorage.getItem('rails_session');
    if (savedSession) {
      try {
        const parsedSession: Session = JSON.parse(savedSession);
        const now = Date.now();
        const expiryTime = parsedSession.timestamp + parsedSession.expires_in * 1000;

        // ✅ require env id for a restored session
        if (now < expiryTime && parsedSession.environment_id) {
          // ✅ CRITICAL: Redux persisted state is the source of truth for environment
          // Do NOT override the persisted environment state from session
          // The persisted state (via redux-persist) already contains the user's selected environment
          // The session's environment_id is just used for API calls, not for environment selection
          
          setSession(parsedSession);
          // Use the current environment from Redux (persisted state) to find matching environment_id
          const currentEnv = getStoreState().environment.current;
          const matchingEnv = parsedSession.environments?.find(e => e.type === currentEnv);
          const envIdToUse = matchingEnv?.id || parsedSession.environment_id;
          fetchProfile(parsedSession.access_token, envIdToUse);
          setView('dashboard');
        } else {
          localStorage.removeItem('rails_session');
          // Session expired - environment state remains in Redux (persisted)
        }
      } catch {
        localStorage.removeItem('rails_session');
        // Session corrupted - environment state remains in Redux (persisted)
      }
    }
    // ✅ No session - environment state is already set by redux-persist rehydration
    // No need to reset here, as the slice's initialState and REHYDRATE handler ensure sandbox default

    const timer = setTimeout(() => setIsLandingLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Apply theme class to DOM and sync to localStorage
  // This runs on mount (with initial theme from localStorage) and whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session) return;
    const expiryTime = session.timestamp + session.expires_in * 1000;
    const timeUntilExpiry = expiryTime - Date.now();
    if (timeUntilExpiry <= 0) {
      handleLogout();
      return;
    }
    const timer = setTimeout(() => handleLogout(), timeUntilExpiry);
    return () => clearTimeout(timer);
  }, [session]);

  // ✅ Refetch profile when environment changes (e.g., switching from sandbox to production)
  useEffect(() => {
    if (!session || !session.access_token) return;
    
    // Find environment_id that matches the current environment type
    const matchingEnv = session.environments?.find(e => e.type === environment);
    const envIdToUse = matchingEnv?.id || session.environment_id;
    
    if (envIdToUse) {
      fetchProfile(session.access_token, envIdToUse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  const handleAuthSuccess = (data: any) => {
    // ✅ users-service login returns selected_environment_id and environments array
    const envId =
      data.selected_environment_id ||
      data.environment?.id ||
      data.user?.environment_id ||
      data.environment_id;

    if (!envId) {
      console.error('Login success response missing selected_environment_id; cannot proceed.');
      return;
    }

    // Store all available environments (sandbox + production)
    const environments: EnvironmentInfo[] = data.environments || [];
    
    // ✅ CRITICAL: On login, set environment based on selected_environment_id
    // This is the ONLY place where we set environment from session data
    // After this, the persisted Redux state becomes the source of truth
    const selectedEnv = environments.find(e => e.id === envId);
    const environmentType = (selectedEnv?.type || 'sandbox') as 'sandbox' | 'production';
    
    // Update Redux store with environment type (will be persisted by redux-persist)
    dispatch(setEnvironment(environmentType));

    const sessionData: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      timestamp: Date.now(),
      environment_id: envId,
      environments: environments,
    };

    setSession(sessionData);
    localStorage.setItem('rails_session', JSON.stringify(sessionData));
    fetchProfile(sessionData.access_token, sessionData.environment_id);
    setView('dashboard');
  };

  if (isProfileLoading) {
    return <DashboardSkeleton />;
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        onLogout={handleLogout}
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        session={session}
        profile={profile}
      />
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-800 dark:text-white transition-colors duration-300">
        <Navbar onLogin={() => setView('login')} onRegister={() => setView('register')} />
        <RegisterPage onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />
        <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-800 dark:text-white transition-colors duration-300">
        <Navbar onLogin={() => setView('login')} onRegister={() => setView('register')} />
        <LoginPage 
          onBack={() => setView('landing')} 
          onSuccess={handleAuthSuccess}
          onForgotPassword={() => setView('forgotPassword')}
        />
        <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
      </div>
    );
  }

  if (view === 'forgotPassword') {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-800 dark:text-white transition-colors duration-300">
        <Navbar onLogin={() => setView('login')} onRegister={() => setView('register')} />
        <ForgotPasswordPage 
          onBack={() => setView('login')} 
          onSuccess={() => setView('login')}
        />
        <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
      </div>
    );
  }

  if (view === 'resetPassword') {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-800 dark:text-white transition-colors duration-300">
        <Navbar onLogin={() => setView('login')} onRegister={() => setView('register')} />
        <ResetPasswordPage 
          onBack={() => setView('login')} 
          onSuccess={() => setView('login')}
        />
        <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-800 dark:text-white selection:bg-zinc-100 dark:selection:bg-white selection:text-zinc-900 dark:selection:text-black transition-colors duration-300">
      <Navbar onLogin={() => setView('login')} onRegister={() => setView('register')} />
      <main>
        <Hero onStart={() => setView('register')} isLoading={isLandingLoading} />
        {!isLandingLoading && (
          <>
            <div className="max-w-7xl mx-auto px-6">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent"></div>
            </div>
            <Features />
            <BetaSignup />
          </>
        )}
      </main>
      <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
    </div>
  );
}

export default App;