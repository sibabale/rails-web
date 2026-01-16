import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import BetaSignup from './components/BetaSignup';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Initial theme detection
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (systemPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('dark'); // Default fallback
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (view === 'dashboard') {
    return (
      <Dashboard 
        onLogout={() => setView('landing')} 
        currentTheme={theme} 
        onToggleTheme={toggleTheme} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <Navbar onLogin={() => setView('dashboard')} />
      
      <main>
        <Hero />
        
        {/* Stealth section divider */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>
        </div>

        <Features />
        
        <BetaSignup />
      </main>

      <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
    </div>
  );
}

export default App;