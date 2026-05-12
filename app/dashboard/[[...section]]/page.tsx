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

interface MeUserProfile {
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  role?: string;
  business_name?: string;
  business_website?: string;
  website?: string;
}

interface MeBusinessProfile {
  name?: string;
  website?: string;
  website_url?: string;
}

interface MeResponse extends MeUserProfile {
  user?: MeUserProfile;
  business?: MeBusinessProfile;
}

const isIdentityDashboardRoute = (pathname: string | null) => pathname?.replace(/\/$/, '') === '/dashboard/identity';

const getProfileName = (user: MeUserProfile) =>
  user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || '';

const mapMeResponseToProfile = (data: MeResponse): UserProfile => {
  const user = data.user ?? data;
  return {
    id: user.id || '',
    name: getProfileName(user),
    email: user.email || '',
    role: user.role || '',
    avatar_url: user.avatar_url,
    business_name: data.business?.name || user.business_name,
    website: data.business?.website || data.business?.website_url || user.business_website || user.website,
  };
};

const fetchIdentityProfile = async (clientServerUrl: string, session: RailsSession) => {
  const response = await fetch(`${clientServerUrl.replace(/\/$/, '')}/api/v1/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json',
      'X-Environment-Id': session.environment_id,
      'X-Environment': 'sandbox',
    },
  });

  if (!response.ok) return null;
  return mapMeResponseToProfile((await response.json()) as MeResponse);
};

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
    if (!isIdentityDashboardRoute(pathname)) return;

    let isMounted = true;
    setIsLoadingProfile(true);
    fetchIdentityProfile(clientServerUrl, session)
      .then((nextProfile) => {
        if (isMounted && nextProfile) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        // Keep dashboard usable even if profile hydration fails.
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
