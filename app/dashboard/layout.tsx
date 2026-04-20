import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Rails',
  description: 'Rails operations dashboard.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/dashboard',
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
