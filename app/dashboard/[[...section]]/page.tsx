'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../state/hooks';
import { resetToSandbox } from '../../../state/slices/environmentSlice';
import { getClientServerUrl } from '../../../lib/env';
import { clearRailsSession, readValidRailsSession } from '../../../lib/authSession';
import type { RailsSession } from '../../../lib/authSession';
import Dashboard from '../../../components/Dashboard';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  business_name?: string;
  website?: string;
}

export default function DashboardRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [session, setSession] = useState<RailsSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const clientServerUrl = getClientServerUrl() || '';

  useEffect(() => {
    const parsed = readValidRailsSession();
    if (!parsed) {
      router.replace('/login');
      return;
    }

    setSession(parsed);
  }, [router]);

  useEffect(() => {
    if (!session || !clientServerUrl) return;
    const isIdentityRoute = pathname?.replace(/\/$/, '') === '/dashboard/identity';
    if (!isIdentityRoute) return;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`${clientServerUrl.replace(/\/$/, '')}/api/v1/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: 'application/json',
            'X-Environment-Id': session.environment_id,
            'X-Environment': 'sandbox',
          },
        });
        if (!response.ok) return;
        const data = await response.json();
        const user = data.user ?? data;
        setProfile({
          id: user.id,
          name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
          business_name: data.business?.name || user.business_name,
          website: data.business?.website || data.business?.website_url || user.business_website || user.website,
        });
      } catch {
        // Keep dashboard usable even if profile hydration fails.
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [clientServerUrl, pathname, session]);

  const handleLogout = () => {
    clearRailsSession();
    dispatch(resetToSandbox());
    router.replace('/');
  };

  if (!session) return null;

  return (
    <Dashboard onLogout={handleLogout} session={session} profile={profile} isLoadingProfile={isLoadingProfile} />
  );
}
