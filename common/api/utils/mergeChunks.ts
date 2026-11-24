import type { UseQueryResult } from '@tanstack/react-query';
import type { AggregateDataResponse, ChunkedAggregateQueryResult } from '../../types/charts';
import type { DateChunk } from '../../utils/dateChunks';
import { joinAdjacentChunks } from '../../utils/dateChunks';

const isPending = (result: UseQueryResult) => !result.data && !result.isError;

const statusOf = (result: UseQueryResult) =>
  result.data ? 'success' : result.isError ? 'error' : 'pending';

/**
 * One metric's date-range chunks (newest first) as a single query result. It has data as soon as
 * any chunk has rows, errors only once nothing is loading and no chunk had rows, and refetching
 * retries just the failed chunks.
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
    by_time: newest.data?.by_time ?? [],
  };
  // An empty result could still be filled by a chunk that is loading or failed, so wait for those.
  const canShow = merged.by_date.length > 0 || (!pending.length && !failed.length);
  const data = loaded.length && canShow ? merged : undefined;
  const isError = !data && !pending.length;
  const isFetching = results.some((result) => result.isFetching);

  const shared = {
    ...newest,
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
    // Each branch below is one of UseQueryResult's status variants, so these match it rather than
    // the newest chunk.
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
  } as const;
  if (data) {
    return {
      ...shared,
      data,
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isSuccess: true,
      status: 'success',
    };
  }
  if (isError) {
    return {
      ...shared,
      data: undefined,
      error: failed[0].error,
      isError: true,
      isPending: false,
      isLoading: false,
      isLoadingError: true,
      isSuccess: false,
      status: 'error',
    };
  }
  return {
    ...shared,
    data: undefined,
    error: null,
    isError: false,
    isPending: true,
    isLoading: isFetching,
    isSuccess: false,
    status: 'pending',
  };
};
