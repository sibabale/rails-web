'use client';

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../state/hooks';
import { resetToSandbox } from '../../../state/slices/environmentSlice';
import { getClientServerUrl } from '../../../lib/env';
import { clearRailsSession, readValidRailsSession } from '../../../lib/authSession';
import type { RailsSession } from '../../../lib/authSession';
import Dashboard from '../../../components/Dashboard/Dashboard';

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

const cleanString = (value: string | undefined) => value?.trim() ?? '';

const firstPresentString = (values: Array<string | undefined>) => values.map(cleanString).find(Boolean) ?? '';

const getProfileNameParts = (user: MeUserProfile) => [user.first_name, user.last_name].map(cleanString).filter(Boolean);

const getProfileNameCandidates = (user: MeUserProfile) => [user.name, getProfileNameParts(user).join(' '), user.email];

const getProfileWebsite = (business: MeBusinessProfile | undefined, user: MeUserProfile) =>
  firstPresentString([business?.website, business?.website_url, user.business_website, user.website]);

const getBusinessName = (business: MeBusinessProfile | undefined, user: MeUserProfile) =>
  firstPresentString([business?.name, user.business_name]);

const getMeUser = (data: MeResponse) => data.user ?? data;

const buildUserProfile = (user: MeUserProfile, business: MeBusinessProfile | undefined): UserProfile => ({
  id: cleanString(user.id),
  name: firstPresentString(getProfileNameCandidates(user)),
  email: cleanString(user.email),
  role: cleanString(user.role),
  avatar_url: user.avatar_url,
  business_name: getBusinessName(business, user),
  website: getProfileWebsite(business, user),
});

const mapMeResponseToProfile = (data: MeResponse): UserProfile => buildUserProfile(getMeUser(data), data.business);

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

const shouldLoadIdentityProfile = (session: RailsSession | null, clientServerUrl: string, pathname: string | null) =>
  Boolean(session && clientServerUrl && isIdentityDashboardRoute(pathname));

const loadIdentityProfile = async ({
  clientServerUrl,
  session,
  setProfile,
  setIsLoadingProfile,
}: {
  clientServerUrl: string;
  session: RailsSession;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
  setIsLoadingProfile: Dispatch<SetStateAction<boolean>>;
}) => {
  setIsLoadingProfile(true);
  try {
    const nextProfile = await fetchIdentityProfile(clientServerUrl, session);
    if (nextProfile) {
      setProfile(nextProfile);
    }
  } catch {
    // Keep dashboard usable even if profile hydration fails.
  } finally {
    setIsLoadingProfile(false);
  }
};

const DashboardRoute = () => {
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
    if (shouldLoadIdentityProfile(session, clientServerUrl, pathname) && session) {
      loadIdentityProfile({ clientServerUrl, session, setProfile, setIsLoadingProfile });
    }
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
};

export default DashboardRoute;
