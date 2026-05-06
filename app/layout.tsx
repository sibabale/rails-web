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

const defaultTitle = 'Rails Infra — Ledger infrastructure and APIs';
const defaultDescription =
  'Rails Infra provides ledger infrastructure, APIs, and SDKs to build financial and accounting workflows with confidence.';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: '/',
    siteName: 'Rails Infra',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="https://fonts.gstatic.com/s/materialsymbolssharp/v333/gNNBW2J8Roq16WD5tFNRaeLQk6-SHQ_R00k4c2_whPnoY9ruReaU4bHmz74m0ZkGH-VBYe1x0TV6x4yFH8F-H5OdzEL3sVTgJtfbYxPVojCO.ttf"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="https://fonts.gstatic.com/s/materialsymbolssharp/v333/gNNBW2J8Roq16WD5tFNRaeLQk6-SHQ_R00k4c2_whPnoY9ruReaU4bHmz74m0ZkGH-VBYe1x0TV6x4yFH8F-H5OdzEL3sVTgJtfbYxOLojCO.ttf"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${notoSansMono.variable} bg-white text-zinc-800 antialiased dark:bg-black dark:text-zinc-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
