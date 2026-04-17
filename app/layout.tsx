import type { Metadata } from 'next';
import { Inter, Noto_Sans_Mono, Space_Grotesk } from 'next/font/google';
import '../main.css';
import '../theme.css';
import Providers from './providers';
import { getSiteUrl } from '../lib/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-sans-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Rails | Banking Infrastructure for Developers',
  description:
    'Developer-focused banking-as-a-service infrastructure with programmable accounts, payments, and ledger APIs.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Rails | Banking Infrastructure for Developers',
    description:
      'Developer-focused banking-as-a-service infrastructure with programmable accounts, payments, and ledger APIs.',
    url: '/',
    siteName: 'Rails',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rails | Banking Infrastructure for Developers',
    description:
      'Developer-focused banking-as-a-service infrastructure with programmable accounts, payments, and ledger APIs.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansMono.variable} bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
