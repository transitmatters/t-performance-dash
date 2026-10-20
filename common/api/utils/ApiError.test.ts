import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchOrThrow, getErrorCopy } from './ApiError';

const respond = (status: number, body?: unknown) =>
  vi.fn().mockResolvedValue(new Response(body ? JSON.stringify(body) : null, { status }));

describe('fetchOrThrow', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the status and Chalice error code', async () => {
    vi.stubGlobal('fetch', respond(403, { Code: 'RANGE_TOO_LONG', Message: 'Too long' }));
    await expect(fetchOrThrow('/api/x')).rejects.toMatchObject({
      kind: 'http',
      status: 403,
      code: 'RANGE_TOO_LONG',
    });
  });

  it('survives a body that is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })));
    await expect(fetchOrThrow('/api/x')).rejects.toMatchObject({ status: 502, code: undefined });
  });

  it('treats a CORS-less gateway timeout as a timeout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchOrThrow('/api/x')).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('rethrows aborts untouched', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    await expect(fetchOrThrow('/api/x')).rejects.toBe(abort);
  });
});

describe('getErrorCopy', () => {
  it('only suggests a shorter range when there is a range', () => {
    const timeout = new ApiError('timeout');
    expect(getErrorCopy(timeout, { isRange: true }).detail).toBe('Try a shorter date range.');
    expect(getErrorCopy(timeout, { isRange: false }).detail).toBe('This is usually temporary.');
  });

  it('names each failure', () => {
    expect(getErrorCopy(new ApiError('http', { status: 403, code: 'RANGE_TOO_LONG' })).title).toBe(
      'This date range is too long'
    );
    expect(getErrorCopy(new ApiError('http', { status: 400 })).title).toBe(
      "We couldn't load this selection"
    );
    expect(getErrorCopy(new ApiError('http', { status: 500 })).title).toBe(
      'The data service hit an error'
    );
    expect(getErrorCopy(new ApiError('http', { status: 504 })).title).toBe(
      'The response took too long'
    );
    expect(getErrorCopy(new Error('render crash')).title).toBe("Couldn't load this chart");
    expect(getErrorCopy(new ApiError('timeout'), { isOnline: false }).title).toBe("You're offline");
  });
});
