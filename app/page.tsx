'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import BetaSignup from '../components/BetaSignup';
import Footer from '../components/Footer';
import { startLandingTracking } from '../lib/analytics';
import { useTheme } from '../lib/useTheme';

export default function HomePage() {
  const router = useRouter();
  const [isLandingLoading, setIsLandingLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setIsLandingLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    startLandingTracking();
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-800 selection:bg-zinc-100 selection:text-zinc-900 transition-colors duration-300 dark:bg-black dark:text-white dark:selection:bg-white dark:selection:text-black">
      <Navbar onLogin={() => router.push('/login')} onRegister={() => router.push('/register')} />
      <main>
        <Hero isLoading={isLandingLoading} />
        {!isLandingLoading && (
          <>
            <div className="mx-auto max-w-7xl px-6">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-100 to-transparent dark:via-zinc-800"></div>
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
