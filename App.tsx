
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BetaSignup from './components/BetaSignup';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  timestamp: number;
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
    {/* Sidebar Skeleton */}
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

    {/* Main Content Skeleton */}
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
            <div key={i} className="h-24 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800/50 rounded-xl animate-pulse"></div>
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
  const [view, setView] = useState<'landing' | 'dashboard' | 'register' | 'login'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLandingLoading, setIsLandingLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const API_BASE_URL = process.env.USERS_SERVICE || 'https://rails-client-server-production.up.railway.app';

  const fetchProfile = async (token: string) => {
    setIsProfileLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/v1/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        console.warn("Session unauthorized. Clearing state.");
        handleLogout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error("Failed to fetch profile:", response.status);
      }
    } catch (err) {
      console.error("Network error during profile sync:", err);
    } finally {
      // Small artificial delay for aesthetic transition
      setTimeout(() => setIsProfileLoading(false), 800);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedSession = localStorage.getItem('rails_session');
    if (savedSession) {
      try {
        const parsedSession: Session = JSON.parse(savedSession);
        const now = Date.now();
        const expiryTime = parsedSession.timestamp + (parsedSession.expires_in * 1000);
        
        if (now < expiryTime) {
          setSession(parsedSession);
          fetchProfile(parsedSession.access_token);
          setView('dashboard');
        } else {
          localStorage.removeItem('rails_session');
        }
      } catch (e) {
        localStorage.removeItem('rails_session');
      }
    }

    const timer = setTimeout(() => setIsLandingLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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
    const expiryTime = session.timestamp + (session.expires_in * 1000);
    const timeUntilExpiry = expiryTime - Date.now();
    if (timeUntilExpiry <= 0) {
      handleLogout();
      return;
    }
    const timer = setTimeout(() => handleLogout(), timeUntilExpiry);
    return () => clearTimeout(timer);
  }, [session]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAuthSuccess = (data: any) => {
    const sessionData: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      timestamp: Date.now()
    };
    
    setSession(sessionData);
    localStorage.setItem('rails_session', JSON.stringify(sessionData));
    fetchProfile(sessionData.access_token);
    setView('dashboard');
  };

  const handleLogout = () => {
    setSession(null);
    setProfile(null);
    localStorage.removeItem('rails_session');
    setView('landing');
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
