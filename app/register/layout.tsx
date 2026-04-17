import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Rails',
  description: 'Create your institutional Rails account and access financial infrastructure tools.',
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
