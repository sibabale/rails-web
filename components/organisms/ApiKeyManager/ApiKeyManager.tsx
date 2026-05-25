import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getClientServerUrl } from '@/lib/env';
import { resolveEnvironmentId } from '@/lib/environment';
import { useAppSelector } from '@/state/hooks';

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
    environments?: { id: string; type: string }[];
  };
  canCreate?: boolean;
  blockedReason?: string;
  onActiveKeyChange?: (hasActiveKey: boolean) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  session,
  canCreate = true,
  blockedReason = 'Complete setup before creating an API key.',
  onActiveKeyChange,
}) => {
  const environment = useAppSelector((state) => state.environment.current);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [hasLoadedKeys, setHasLoadedKeys] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const onActiveKeyChangeRef = useRef(onActiveKeyChange);
  const hasLoadedKeysRef = useRef(false);

  useEffect(() => {
    onActiveKeyChangeRef.current = onActiveKeyChange;
  }, [onActiveKeyChange]);

  const [showPlaintextModal, setShowPlaintextModal] = useState(false);
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'failed'>('idle');

  const CLIENT_SERVER_URL = getClientServerUrl() || '';
  const environmentId = resolveEnvironmentId(session, environment);
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
  const isLoadingTokenRow = isLoadingKeys && !hasLoadedKeys && !isRevoking;

  const maskedPlaceholder = useMemo(() => {
    if (!apiKeyId) return null;
    return '********************************';
  }, [apiKeyId]);

  const fetchKeys = useCallback(async () => {
    if (!canCallApi) return;
    setError(null);
    const showRowLoader = !hasLoadedKeysRef.current;
    if (showRowLoader) setIsLoadingKeys(true);
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
      const hasActiveKey = fromApi.some(
        (key) =>
          (key.environment_id || '') === (environmentId || '') && (key.status || '').toLowerCase() === 'active'
      );
      onActiveKeyChangeRef.current?.(hasActiveKey);
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
      hasLoadedKeysRef.current = true;
      setHasLoadedKeys(true);
      setIsLoadingKeys(false);
    }
  }, [canCallApi, CLIENT_SERVER_URL, accessToken, environmentId, environment]);

  useEffect(() => {
    if (!canCallApi) {
      hasLoadedKeysRef.current = false;
      setHasLoadedKeys(false);
      setKeys([]);
      return;
    }
    hasLoadedKeysRef.current = false;
    setHasLoadedKeys(false);
    void fetchKeys();
    // Refetch when auth/environment changes; fetchKeys identity is derived from these inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCallApi, environmentId, environment, accessToken]);

  const handleCreate = async () => {
    if (!canCreate) {
      setError(blockedReason);
      return;
    }

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
      onActiveKeyChange?.(true);

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
      onActiveKeyChange?.(false);
      await fetchKeys();
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke API key.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <section
      id="api-keys"
      data-testid="api-key-manager"
      className="space-y-6 border border-zinc-200 bg-white p-4 transition-colors dark:border-zinc-800 dark:bg-[#050505] sm:p-6 lg:p-8"
    >
      <h4 className="mb-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Security Credentials</h4>

      <div className="space-y-4">
        <div className="border border-zinc-200 bg-zinc-50 p-3 transition-colors dark:border-zinc-800 dark:bg-[#050505] sm:p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-zinc-500">API Token</span>

            {apiKeyStatus === 'active' && apiKeyId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-tighter text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            ) : apiKeyStatus === 'revoked' && apiKeyId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-tighter text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Revoked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-tighter text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                Not Created
              </span>
            )}
          </div>

          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            aria-busy={isLoadingTokenRow}
            aria-label={isLoadingTokenRow ? 'Loading API token' : undefined}
            role={isLoadingTokenRow ? 'status' : undefined}
          >
            <div className="min-w-0 flex-1">
              {isLoadingTokenRow ? (
                <>
                  <span className="sr-only">Loading API token</span>
                  <div className="h-3 w-full animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                </>
              ) : (
                <p
                  className={`text-xs font-mono text-zinc-600 dark:text-zinc-300 ${
                    apiKeyId ? 'truncate' : 'break-words leading-relaxed'
                  }`}
                >
                  {apiKeyId ? maskedPlaceholder : 'No API key has been generated for this environment.'}
                </p>
              )}
            </div>

            {isLoadingTokenRow ? (
              <div className="h-7 w-full shrink-0 animate-pulse border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 sm:w-20" />
            ) : apiKeyStatus === 'active' && apiKeyId ? (
              <button
                className="h-7 w-full shrink-0 border border-zinc-200 bg-white px-2.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white sm:w-auto"
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
                className="h-7 w-full shrink-0 border border-zinc-200 bg-white px-2.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white sm:w-auto"
                onClick={handleCreate}
                disabled={isCreating || isRevoking || !canCreate}
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
            <div className="mt-3 break-words text-[10px] font-mono leading-relaxed text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>

      {showPlaintextModal && plaintextKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-6">
          <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col border border-zinc-200 bg-white shadow-2xl transition-colors dark:border-zinc-800 dark:bg-[#050505] sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <div>
                <h3 className="text-sm font-medium text-black dark:text-white">New API Key</h3>
              </div>
              <button
                type="button"
                className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white"
                aria-label="Close"
                onClick={() => {
                  setShowPlaintextModal(false);
                  setPlaintextKey(null);
                  setCopyFeedback('idle');
                }}
              >
                <span className="material-symbols-sharp !text-[18px] leading-none" aria-hidden>
                  close
                </span>
              </button>
            </div>

            <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-6">
              <div className="border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-800 transition-colors dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-200">
                You can only view API keys once. Make sure to store this in a safe place.
              </div>

              <div className="max-h-[40dvh] overflow-y-auto border border-zinc-200 bg-zinc-50 p-4 text-zinc-900 transition-colors dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
                <pre className="whitespace-pre-wrap break-all text-[11px] font-mono leading-relaxed">
                  {plaintextKey}
                </pre>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="w-full bg-black py-3.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:bg-zinc-900 dark:bg-white dark:text-black dark:shadow-none dark:hover:bg-zinc-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#050505] dark:active:bg-zinc-300"
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
