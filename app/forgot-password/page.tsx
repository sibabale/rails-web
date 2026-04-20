'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthViewsEnabled } from '../../lib/env';
import { useTheme } from '../../lib/useTheme';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ForgotPasswordPage from '../../components/ForgotPasswordPage';

export default function ForgotPasswordRoute() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const authEnabled = isAuthViewsEnabled();

  useEffect(() => {
    if (!authEnabled) router.replace('/');
  }, [authEnabled, router]);

  if (!authEnabled) return null;

  return (
    <div className="min-h-screen bg-white text-zinc-800 dark:bg-black dark:text-white transition-colors duration-300">
      <Navbar onLogin={() => router.push('/login')} onRegister={() => router.push('/register')} />
      <ForgotPasswordPage onBack={() => router.push('/login')} onSuccess={() => router.push('/login')} />
      <Footer onToggleTheme={toggleTheme} currentTheme={theme} />
    </div>
  );
}
