/**
 * A failed API request, carrying enough to tell the user what went wrong. `timeout` covers API
 * Gateway's timeout, whose response has no CORS headers, so the browser reports it as a TypeError.
 */
export class ApiError extends Error {
  kind: 'timeout' | 'http';
  status?: number;
  /** The Chalice error `Code`, e.g. `RANGE_TOO_LONG`, when the body has one. */
  code?: string;

  constructor(
    kind: ApiError['kind'],
    { status, code, message }: { status?: number; code?: string; message?: string } = {}
  ) {
    super(`${message ?? 'API request failed'} (${kind === 'timeout' ? 'timed out' : status})`);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
  }
}

/**
 * `fetch`, with failures thrown as `ApiError`s. `message` labels the error in logs; it is never
 * shown. Aborts are rethrown untouched so React Query can cancel.
 */
export const fetchOrThrow = async (url: string, init?: RequestInit, message?: string) => {
  const response = await fetch(url, init).catch((error) => {
    if (error instanceof TypeError) throw new ApiError('timeout', { message });
    throw error;
  });
  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    const code = typeof body?.Code === 'string' ? body.Code : undefined;
    throw new ApiError('http', { status: response.status, code, message });
  }
  return response;
};

interface ErrorCopy {
  title: string;
  detail: string;
}

export const getErrorCopy = (
  error: unknown,
  { isRange = false, isOnline = true }: { isRange?: boolean; isOnline?: boolean } = {}
): ErrorCopy => {
  if (!isOnline) {
    return { title: "You're offline", detail: 'Reconnect to the internet to load this chart.' };
  }
  if (!(error instanceof ApiError)) {
    return {
      title: "Couldn't load this chart",
      detail: 'Something went wrong showing this data. This is usually temporary.',
    };
  }
  if (error.kind === 'timeout' || error.status === 504) {
    return {
      title: 'The response took too long',
      detail: isRange ? 'Try a shorter date range.' : 'This is usually temporary.',
    };
  }
  if (error.code === 'RANGE_TOO_LONG') {
    return { title: 'This date range is too long', detail: 'Pick a shorter range.' };
  }
  if (error.status && error.status >= 400 && error.status < 500) {
    return {
      title: "We couldn't load this selection",
      detail: isRange ? 'Try different stops or dates.' : 'Try different stops or another day.',
    };
  }
  return {
    title: 'The data service hit an error',
    detail: 'This is usually temporary.',
  };
};
