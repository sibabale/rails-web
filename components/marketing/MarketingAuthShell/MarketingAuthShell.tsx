'use client';

import { SiGithub } from '@icons-pack/react-simple-icons';
import { RAILSINFRA_GITHUB_ORG_REPOSITORIES_URL } from '@/lib/railsinfraGithub';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { isAuthButtonsEnabled } from '@/lib/env';
import { MarketingDocsCtaLink } from '@/components/marketing/atoms/MarketingDocsCtaLink/MarketingDocsCtaLink';
import { theme } from '@/lib/marketingTheme';
import { MarketingThemeToggle } from '../ThemeToggle/ThemeToggle';
import { RailsTrackMark } from '../atoms/RailsTrackMark/RailsTrackMark';

type MarketingAuthShellProps = {
  children: React.ReactNode;
};

export function MarketingAuthShell({ children }: MarketingAuthShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const showAuthButtons = isAuthButtonsEnabled();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-600 dark:text-zinc-300 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-black dark:selection:text-white flex flex-col transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b structural-border bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
              <div className="w-5 h-5 bg-black dark:bg-white flex items-center justify-center">
                <RailsTrackMark className="h-3 w-3 text-white dark:text-black" />
              </div>
              <span className="font-bold tracking-tight text-black dark:text-white">RAILS</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <MarketingDocsCtaLink
              data-testid="marketing-auth-shell-header-documentation"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              Documentation
            </MarketingDocsCtaLink>
            <Link
              href="/infrastructure"
              className={`${pathname?.startsWith('/infrastructure') ? 'text-black dark:text-white' : ''} hover:text-black dark:hover:text-white transition-colors`}
            >
              Infrastructure
            </Link>
            <Link
              href="/use-cases"
              className={`${pathname === '/use-cases' ? 'text-black dark:text-white' : ''} hover:text-black dark:hover:text-white transition-colors`}
            >
              Use Cases
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <MarketingThemeToggle />
            <a
              href={RAILSINFRA_GITHUB_ORG_REPOSITORIES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <SiGithub className="w-4 h-4" />
              <span className="hidden lg:inline">GitHub</span>
            </a>
            {showAuthButtons ? (
              <Link
                href="/login"
                data-testid="marketing-auth-shell-header-get-started"
                className="hidden sm:block bg-black text-white dark:bg-white dark:text-black px-4 py-1.5 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-center"
              >
                Get Started
              </Link>
            ) : null}
            <MarketingDocsCtaLink
              data-testid="marketing-auth-shell-header-read-docs"
              className={`hidden sm:block px-4 py-1.5 text-xs text-center transition-colors ${
                showAuthButtons ? theme.buttons.secondary : theme.buttons.primary
              }`}
            >
              Read Docs
            </MarketingDocsCtaLink>
            <button
              type="button"
              className="md:hidden text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <span className="material-symbols-sharp" style={{ fontSize: '1.25rem' }}>
                  close
                </span>
              ) : (
                <span className="material-symbols-sharp" style={{ fontSize: '1.25rem' }}>
                  menu
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t structural-border bg-white dark:bg-black px-6 py-4 flex flex-col gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="/infrastructure"
              className={`${pathname?.startsWith('/infrastructure') ? 'text-black dark:text-white' : ''} hover:text-black dark:hover:text-white transition-colors block`}
              onClick={closeMobileMenu}
            >
              Infrastructure
            </Link>
            <Link
              href="/use-cases"
              className={`${pathname === '/use-cases' ? 'text-black dark:text-white' : ''} hover:text-black dark:hover:text-white transition-colors block`}
              onClick={closeMobileMenu}
            >
              Use Cases
            </Link>
            <MarketingDocsCtaLink
              data-testid="marketing-auth-shell-header-documentation-mobile"
              onClick={closeMobileMenu}
              className="hover:text-black dark:hover:text-white transition-colors block"
            >
              Documentation
            </MarketingDocsCtaLink>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2 w-full"></div>
            {showAuthButtons ? (
              <Link
                href="/login"
                data-testid="marketing-auth-shell-header-get-started-mobile"
                className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors w-full text-center"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            ) : null}
            <MarketingDocsCtaLink
              data-testid="marketing-auth-shell-header-read-docs-mobile"
              className={`px-4 py-2 text-xs w-full text-center transition-colors ${
                showAuthButtons ? theme.buttons.secondary : theme.buttons.primary
              }`}
              onClick={closeMobileMenu}
            >
              Read Docs
            </MarketingDocsCtaLink>
          </div>
        )}
      </header>

      <div className="flex-grow flex flex-col justify-center">{children}</div>

      <footer className="border-t structural-border bg-zinc-50 dark:bg-black mt-12 pb-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center">
              <RailsTrackMark className="h-2.5 w-2.5 text-black dark:text-white" />
            </div>
            <span className="font-mono text-xs font-bold text-zinc-500 tracking-wider">
              RAILS INFRASTRUCTURE
            </span>
          </div>
          <div className="flex gap-6 text-[11px] font-mono text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">
            <a
              href={RAILSINFRA_GITHUB_ORG_REPOSITORIES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
