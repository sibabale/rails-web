import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Rails',
  description: 'Request a secure password reset link for your Rails account.',
  alternates: {
    canonical: '/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
