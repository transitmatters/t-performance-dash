import type { UseQueryResult } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { AggregateDataResponse } from '../../types/charts';
import type { DateChunk } from '../../utils/dateChunks';
import { mergeChunks } from './mergeChunks';

type Result = UseQueryResult<AggregateDataResponse>;

const rows = (...dates: string[]): AggregateDataResponse => ({
  by_date: dates.map((date) => ({
    service_date: date,
    count: 1,
    mean: 0,
    min: 0,
    max: 0,
    '25%': 0,
    '50%': 0,
    '75%': 0,
  })),
  by_time: [],
});

const settled = {
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: null,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isInitialLoading: false,
  isLoading: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetching: false,
  isStale: false,
  isEnabled: true,
  fetchStatus: 'idle',
} as const;

const loaded = (data: AggregateDataResponse): Result => ({
  ...settled,
  data,
  error: null,
  isError: false,
  isPending: false,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: true,
  status: 'success',
  refetch: vi.fn(),
});
const pending = (): Result => ({
  ...settled,
  data: undefined,
  error: null,
  isError: false,
  isFetched: false,
  isFetchedAfterMount: false,
  isFetching: true,
  isInitialLoading: true,
  isLoading: true,
  isPending: true,
  isLoadingError: false,
  isRefetchError: false,
  isSuccess: false,
  status: 'pending',
  fetchStatus: 'fetching',
  refetch: vi.fn(),
});
const failed = (): Result => ({
  ...settled,
  data: undefined,
  error: new Error('timed out'),
  failureCount: 1,
  isError: true,
  isPending: false,
  isLoadingError: true,
  isRefetchError: false,
  isSuccess: false,
  status: 'error',
  refetch: vi.fn(),
});

// Newest first, as splitDateRange returns them.
const CHUNKS: DateChunk[] = [
  { startDate: '2025-07-01', endDate: '2025-12-31' },
  { startDate: '2025-01-01', endDate: '2025-06-30' },
];

const dates = (result: ReturnType<typeof mergeChunks>) =>
  result.data?.by_date.map((row) => row.service_date);

describe('mergeChunks', () => {
  it('passes a single request through untouched', () => {
    const only = loaded(rows('2025-01-01'));
    expect(mergeChunks([only], [CHUNKS[0]])).toBe(only);
  });

  it('joins the chunks oldest first', () => {
    const result = mergeChunks([loaded(rows('2025-08-01')), loaded(rows('2025-02-01'))], CHUNKS);
    expect(dates(result)).toEqual(['2025-02-01', '2025-08-01']);
    expect(result.isSuccess).toBe(true);
    expect(result.chunks).toMatchObject({ total: 2, loaded: 2, failed: 0, pending: 0 });
  });

  it('shows rows while other chunks are still loading, and says which dates are', () => {
    const result = mergeChunks([loaded(rows('2025-08-01')), pending()], CHUNKS);
    expect(dates(result)).toEqual(['2025-08-01']);
    expect(result.chunks?.pendingRanges).toEqual([CHUNKS[1]]);
  });

  it('waits on an empty result that a loading chunk could still fill', () => {
    const result = mergeChunks([loaded(rows()), pending()], CHUNKS);
    expect(result.data).toBeUndefined();
    expect(result.isPending).toBe(true);
  });

  it('is empty, not an error, once every chunk came back with no rows', () => {
    const result = mergeChunks([loaded(rows()), loaded(rows())], CHUNKS);
    expect(result.data?.by_date).toEqual([]);
    expect(result.isError).toBe(false);
  });

  it('errors only once nothing is loading and no chunk had rows', () => {
    expect(mergeChunks([failed(), pending()], CHUNKS).isError).toBe(false);
    const result = mergeChunks([failed(), loaded(rows())], CHUNKS);
    expect(result.isError).toBe(true);
    expect(result.error?.message).toBe('timed out');
  });

  it('retries just the failed chunks', async () => {
    const ok = loaded(rows('2025-08-01'));
    const bad = failed();
    await mergeChunks([ok, bad], CHUNKS).refetch();
    expect(bad.refetch).toHaveBeenCalled();
    expect(ok.refetch).not.toHaveBeenCalled();
  });
});
