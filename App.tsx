import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './state/hooks';
import { resetToSandbox, setEnvironment } from './state/slices/environmentSlice';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BetaSignup from './components/BetaSignup';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';

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
  <div className="flex h-screen bg-white dark:bg-[#09090b] overflow-hidden">
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
  
  const [view, setView] = useState<'landing' | 'dashboard' | 'register' | 'login'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
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

    try {
      const response = await fetch(`${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'X-Environment-Id': environmentId, // ✅ REQUIRED by users-service AuthContext
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);

    const savedSession = localStorage.getItem('rails_session');
    if (savedSession) {
      try {
        const parsedSession: Session = JSON.parse(savedSession);
        const now = Date.now();
        const expiryTime = parsedSession.timestamp + parsedSession.expires_in * 1000;

        // ✅ require env id for a restored session
        if (now < expiryTime && parsedSession.environment_id) {
          // Determine environment type from stored session
          if (parsedSession.environments && parsedSession.environments.length > 0) {
            const selectedEnv = parsedSession.environments.find(e => e.id === parsedSession.environment_id);
            const environmentType = selectedEnv?.type || 'sandbox';
            dispatch(setEnvironment(environmentType as 'sandbox' | 'production'));
          }
          
          setSession(parsedSession);
          fetchProfile(parsedSession.access_token, parsedSession.environment_id);
          setView('dashboard');
        } else {
          localStorage.removeItem('rails_session');
        }
      } catch {
        localStorage.removeItem('rails_session');
      }
    }

    const timer = setTimeout(() => setIsLandingLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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
    
    // Determine current environment type from selected_environment_id
    const selectedEnv = environments.find(e => e.id === envId);
    const environmentType = selectedEnv?.type || 'sandbox';
    
    // Update Redux store with environment type
    dispatch(setEnvironment(environmentType as 'sandbox' | 'production'));

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
        <LoginPage onBack={() => setView('landing')} onSuccess={handleAuthSuccess} />
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