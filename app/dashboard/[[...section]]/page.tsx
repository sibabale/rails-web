'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../state/hooks';
import { resetToSandbox } from '../../../state/slices/environmentSlice';
import { getClientServerUrl } from '../../../lib/env';
import { useTheme } from '../../../lib/useTheme';
import Dashboard from '../../../components/Dashboard';

interface EnvironmentInfo {
  id: string;
  type: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  timestamp: number;
  environment_id: string;
  environments: EnvironmentInfo[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  business_name?: string;
}

export default function DashboardRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const clientServerUrl = getClientServerUrl() || '';

  useEffect(() => {
    const rawSession = localStorage.getItem('rails_session');
    if (!rawSession) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(rawSession) as Session;
      const expiryTime = parsed.timestamp + parsed.expires_in * 1000;
      if (Date.now() >= expiryTime) {
        localStorage.removeItem('rails_session');
        router.replace('/login');
        return;
      }
      setSession(parsed);
    } catch {
      localStorage.removeItem('rails_session');
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!session || !clientServerUrl) return;

    const fetchProfile = async () => {
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
        });
      } catch {
        // Keep dashboard usable even if profile hydration fails.
      }
    };

    fetchProfile();
  }, [clientServerUrl, session]);

  const handleLogout = () => {
    localStorage.removeItem('rails_session');
    document.cookie = 'rails_session_present=; Path=/; Max-Age=0; SameSite=Lax';
    dispatch(resetToSandbox());
    router.replace('/');
  };

  if (!session) return null;

  return (
    <Dashboard
      onLogout={handleLogout}
      currentTheme={theme}
      onToggleTheme={toggleTheme}
      session={session}
      profile={profile}
    />
  );
}
