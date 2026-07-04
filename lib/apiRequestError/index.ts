export class ApiRequestError extends Error {
  readonly status: number;
  readonly path: string;
  readonly correlationId: string;
  /**
   * Parsed JSON error body when the response was JSON, otherwise null. Callers
   * inspect this to classify structured error contracts (e.g. RAI-71's
   * DUPLICATE_CONNECTION_STRING 409). Non-JSON payloads degrade to null; do
   * not throw on parse failures.
   */
  readonly body: unknown;

  constructor(
    message: string,
    options: { status: number; path: string; correlationId: string; body?: unknown }
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = options.status;
    this.path = options.path;
    this.correlationId = options.correlationId;
    this.body = options.body ?? null;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}
