import React, { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../state/hooks';

type ApiKeyStatus = 'active' | 'revoked' | 'none';

interface ApiKeyResponse {
  id: string;
  key?: string;
  status?: string;
}

interface ApiKeyInfo {
  id: string;
  business_id: string;
  environment_id: string | null;
  status: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
  created_by_user_id: string | null;
}

interface ApiKeyManagerProps {
  session?: {
    access_token?: string;
    environment_id?: string;
  };
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ session }) => {
  const environment = useAppSelector((state) => state.environment.current);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);

  const [showPlaintextModal, setShowPlaintextModal] = useState(false);
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'failed'>('idle');

  const CLIENT_SERVER_URL = (import.meta.env.VITE_CLIENT_SERVER as string | undefined) || '';
  const environmentId = session?.environment_id;
  const accessToken = session?.access_token;

  const canCallApi = Boolean(accessToken && environmentId && CLIENT_SERVER_URL);

  const currentKey = useMemo(() => {
    const envKeys = keys.filter(k => (k.environment_id || '') === (environmentId || ''));
    const active = envKeys.find(k => (k.status || '').toLowerCase() === 'active');
    if (active) return active;
    return envKeys[0] || null;
  }, [keys, environmentId]);

  const apiKeyId = currentKey?.id ?? null;
  const apiKeyStatus: ApiKeyStatus = useMemo(() => {
    if (!currentKey) return 'none';
    const s = (currentKey.status || '').toLowerCase();
    if (s === 'revoked') return 'revoked';
    return 'active';
  }, [currentKey]);

  const maskedPlaceholder = useMemo(() => {
    if (!apiKeyId) return null;
    return '********************************';
  }, [apiKeyId]);

  const fetchKeys = async () => {
    if (!canCallApi) return;
    setError(null);
    setIsLoadingKeys(true);
    try {
      const response = await fetch(`${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/api-keys`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
          'x-environment-id': environmentId as string,
          'x-environment': environment, // ✅ REQUIRED: Always include environment (defaults to sandbox)
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to load API keys. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Log the actual error for debugging
          const text = await response.text();
          console.error('API key fetch error (not shown to user):', text);
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as ApiKeyInfo[];
      const fromApi = Array.isArray(data) ? data : [];
      // Preserve any revoked keys we have in state that the API might not return
      setKeys((prev) => {
        const revokedOnlyInState = prev.filter(
          (k) => (k.status || '').toLowerCase() === 'revoked' && !fromApi.some((n) => n.id === k.id)
        );
        return [...fromApi, ...revokedOnlyInState];
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load API keys.');
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (!canCallApi) return;
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, environmentId, environment]); // ✅ Refetch when environment changes

  const handleCreate = async () => {
    if (!canCallApi) {
      setError('Missing session token or environment id.');
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch(`${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/api-keys`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${accessToken}`,
          'x-environment-id': environmentId as string,
          'x-environment': environment, // ✅ REQUIRED: Always include environment (defaults to sandbox)
        },
        body: JSON.stringify({ environment_id: environmentId }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create API key. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Log the actual error for debugging
          const text = await response.text();
          console.error('API key creation error (not shown to user):', text);
        }
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as ApiKeyResponse;
      if (!data?.id) throw new Error('API did not return an id.');
      if (!data?.key) throw new Error('API did not return a plaintext key.');

      setPlaintextKey(data.key);
      setShowPlaintextModal(true);

      await fetchKeys();
    } catch (e: any) {
      setError(e?.message || 'Failed to create API key.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!canCallApi) {
      setError('Missing session token or environment id.');
      return;
    }

    if (!apiKeyId) {
      setError('No API key to revoke.');
      return;
    }

    setError(null);
    setIsRevoking(true);

    try {
      const response = await fetch(`${CLIENT_SERVER_URL.replace(/\/$/, '')}/api/v1/api-keys/${apiKeyId}/revoke`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${accessToken}`,
          'x-environment-id': environmentId as string,
          'x-environment': environment, // ✅ REQUIRED: Always include environment (defaults to sandbox)
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to revoke API key. Please try again.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Log the actual error for debugging
          const text = await response.text();
          console.error('API key revocation error (not shown to user):', text);
        }
        throw new Error(errorMessage);
      }

      // Optimistically mark the key as revoked so the UI shows "Revoked" immediately
      // (in case the list API omits or delays returning revoked keys)
      setKeys((prev) =>
        prev.map((k) =>
          k.id === apiKeyId ? { ...k, status: 'revoked', revoked_at: new Date().toISOString() } : k
        )
      );
      await fetchKeys();
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke API key.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <section className="space-y-6 pt-8 border-t border-zinc-50 dark:border-zinc-900">
      <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4">Security Credentials</h4>

      <div className="space-y-4">
        <div className="bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">API Token</span>

            {apiKeyStatus === 'active' && apiKeyId ? (
              <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-tighter flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                Active
              </span>
            ) : apiKeyStatus === 'revoked' && apiKeyId ? (
              <span className="text-[9px] font-mono text-amber-500 uppercase font-bold tracking-tighter flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                Revoked
              </span>
            ) : (
              <span className="text-[9px] font-mono text-zinc-400 uppercase font-bold tracking-tighter flex items-center gap-1">
                <span className="w-1 h-1 bg-zinc-400 rounded-full"></span>
                Not Created
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-zinc-600 dark:text-white truncate">
                {apiKeyId ? maskedPlaceholder : 'No API key has been generated for this environment.'}
              </p>
            </div>

            {apiKeyStatus === 'active' && apiKeyId ? (
              <button
                className="h-7 px-2.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/40 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleRevoke}
                disabled={isRevoking || isCreating}
              >
                <span className="inline-flex items-center gap-2">
                  {isRevoking && (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {isRevoking ? 'Revoking' : 'Revoke'}
                </span>
              </button>
            ) : (
              <button
                className="h-7 px-2.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-black/40 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleCreate}
                disabled={isCreating || isRevoking}
              >
                <span className="inline-flex items-center gap-2">
                  {isCreating && (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {isCreating ? 'Creating' : 'Create'}
                </span>
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 text-[10px] font-mono text-red-500">
              {error}
            </div>
          )}

          {isLoadingKeys && !isRevoking && (
            <div className="mt-3 text-[10px] font-mono text-zinc-400">
              Loading...
            </div>
          )}
        </div>
      </div>

      {showPlaintextModal && plaintextKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-white">New API Key</h3>
              </div>
              <button
                className="material-symbols-sharp !text-[18px] text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
                onClick={() => {
                  setShowPlaintextModal(false);
                  setPlaintextKey(null);
                  setCopyFeedback('idle');
                }}
              >
                close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs p-4 rounded-xl">
                You can only view API keys once. Make sure to store this in a safe place.
              </div>

              <div className="bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl p-4">
                <pre className="whitespace-pre-wrap break-words text-[11px] font-mono leading-relaxed">
                  {plaintextKey}
                </pre>
              </div>

              <div className="flex gap-3">
                <button
                  className="w-full py-3 bg-white dark:bg-white text-black text-[10px] font-bold rounded-xl transition-colors border border-zinc-200"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(plaintextKey);
                      setCopyFeedback('copied');
                      window.setTimeout(() => setCopyFeedback('idle'), 1600);
                    } catch {
                      setCopyFeedback('failed');
                      window.setTimeout(() => setCopyFeedback('idle'), 1600);
                    }
                  }}
                >
                  COPY
                </button>
              </div>

              {copyFeedback !== 'idle' && (
                <div
                  className={`text-[10px] font-mono text-center animate-in fade-in zoom-in-95 duration-200 ${
                    copyFeedback === 'copied'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {copyFeedback === 'copied' ? 'Copied to clipboard' : 'Copy failed'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ApiKeyManager;
