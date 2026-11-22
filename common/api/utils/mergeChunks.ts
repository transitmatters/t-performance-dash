import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse, ChunkedAggregateQueryResult } from '../../types/charts';
import type { DateChunk } from '../../utils/dateChunks';
import { joinAdjacentChunks } from '../../utils/dateChunks';

const isPending = (result: UseQueryResult) => !result.data && !result.isError;

const statusOf = (result: UseQueryResult) =>
  result.data ? 'success' : result.isError ? 'error' : 'pending';

/**
 * Presents one metric's date-range chunks as a single query result, so a chart can treat a long
 * range like any other query. `results` and `chunks` line up, newest first.
 *
 * - It has data as soon as any chunk has rows, or once every chunk has come back empty.
 * - It errors only when nothing is still loading and no chunk had rows.
 * - Refetching retries just the chunks that failed.
 * - `chunks` reports progress, for the notice that says which dates are still loading.
 */
export const mergeChunks = (
  results: UseQueryResult<AggregateDataResponse>[],
  chunks: DateChunk[]
): ChunkedAggregateQueryResult => {
  const [newest] = results;
  if (results.length === 1) return newest;

  const loaded = results.filter((result) => result.data);
  const failed = results.filter((result) => result.isError);
  const pending = results.filter(isPending);

  const merged: AggregateDataResponse = {
    // Oldest chunk first keeps by_date in date order within each peak bucket.
    by_date: results.toReversed().flatMap((result) => result.data?.by_date ?? []),
    // The time-of-day breakdown comes from the newest chunk alone.
    by_time: newest.data?.by_time ?? [],
  };
  // An empty result could still be filled by a chunk that is loading or failed, so wait for those.
  const canShow = merged.by_date.length > 0 || (!pending.length && !failed.length);
  const data = loaded.length && canShow ? merged : undefined;
  const isError = !data && !pending.length;
  const isFetching = results.some((result) => result.isFetching);

  return {
    ...newest,
    data,
    error: isError ? failed[0].error : null,
    isError,
    isPending: !data && !isError,
    isLoading: !data && !isError && isFetching,
    isSuccess: Boolean(data),
    status: data ? 'success' : isError ? 'error' : 'pending',
    isFetching,
    refetch: () =>
      Promise.all((failed.length ? failed : results).map((result) => result.refetch())).then(
        () => newest
      ),
    chunks: {
      total: results.length,
      loaded: loaded.length,
      failed: failed.length,
      pending: pending.length,
      pendingRanges: joinAdjacentChunks(chunks.filter((_, i) => isPending(results[i]))),
      byTimeRange: chunks[0],
      byTimeStatus: statusOf(newest),
    },
  } as ChunkedAggregateQueryResult;
};
