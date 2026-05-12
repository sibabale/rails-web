export interface EnvironmentInfo {
  id: string;
  type: string;
}

export interface RailsSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  timestamp: number;
  environment_id: string;
  environments: EnvironmentInfo[];
}

export const RAILS_SESSION_STORAGE_KEY = 'rails_session';
export const RAILS_SESSION_COOKIE_NAME = 'rails_session_present';

export const writeRailsSessionCookie = () => {
  document.cookie = `${RAILS_SESSION_COOKIE_NAME}=1; Path=/; SameSite=Lax`;
};

export const clearRailsSession = () => {
  localStorage.removeItem(RAILS_SESSION_STORAGE_KEY);
  document.cookie = `${RAILS_SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const readValidRailsSession = (): RailsSession | null => {
  const rawSession = localStorage.getItem(RAILS_SESSION_STORAGE_KEY);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession) as RailsSession;
    const expiryTime = parsed.timestamp + parsed.expires_in * 1000;
    if (Date.now() >= expiryTime) {
      clearRailsSession();
      return null;
    }
    return parsed;
  } catch {
    clearRailsSession();
    return null;
  }
};

export const getSessionEnvironmentType = (session: RailsSession) => {
  const selectedEnv = session.environments.find((environment) => environment.id === session.environment_id);
  return (selectedEnv?.type || 'sandbox') as 'sandbox' | 'production';
};
