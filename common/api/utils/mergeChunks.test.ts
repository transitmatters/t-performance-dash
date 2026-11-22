import type { UseQueryResult } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { AggregateDataResponse } from '../../types/charts';
import type { DateChunk } from '../../utils/dateChunks';
import { mergeChunks } from './mergeChunks';

type Result = UseQueryResult<AggregateDataResponse>;

const rows = (...dates: string[]) =>
  ({
    by_date: dates.map((date) => ({ service_date: date })),
    by_time: [],
  }) as unknown as AggregateDataResponse;

const loaded = (data: AggregateDataResponse): Result =>
  ({ data, isError: false, isFetching: false, refetch: vi.fn() }) as unknown as Result;
const pending = (): Result =>
  ({ data: undefined, isError: false, isFetching: true, refetch: vi.fn() }) as unknown as Result;
const failed = (): Result =>
  ({
    data: undefined,
    isError: true,
    error: new Error('timed out'),
    isFetching: false,
    refetch: vi.fn(),
  }) as unknown as Result;

// Newest first, as splitDateRange returns them.
const CHUNKS: DateChunk[] = [
  { startDate: '2025-07-01', endDate: '2025-12-31' },
  { startDate: '2025-01-01', endDate: '2025-06-30' },
];

const dates = (result: ReturnType<typeof mergeChunks>) =>
  result.data?.by_date.map((row) => (row as unknown as { service_date: string }).service_date);

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
