/** Session-scoped debug ingest (Cursor debug mode). No secrets in payloads. */
const DEBUG_ENDPOINT =
  'http://127.0.0.1:7581/ingest/a793045d-890c-41cf-9fa7-f4fe0528e700';
const DEBUG_SESSION_ID = '77be71';

export function agentDebugLog(
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
  runId = 'pre-fix'
): void {
  if (typeof window === 'undefined') {
    return;
  }
  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}
