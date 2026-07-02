export class ApiRequestError extends Error {
  readonly status: number;
  readonly path: string;
  readonly correlationId: string;

  constructor(
    message: string,
    options: { status: number; path: string; correlationId: string }
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = options.status;
    this.path = options.path;
    this.correlationId = options.correlationId;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}
