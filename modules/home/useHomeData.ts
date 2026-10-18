import { useOverviewData } from '../../common/api/hooks/overview';
import type { HomeData } from './types';

export type HomeState = 'loading' | 'ready' | 'error';

/** The scoreboard data-ingestion publishes daily as static/landing/overview.json. */
export const useHomeData = (): { data?: HomeData; state: HomeState; retry: () => void } => {
  const query = useOverviewData();
  // A failed query that's refetching (Try again) counts as loading, not still failed.
  const state: HomeState = query.data
    ? 'ready'
    : query.isError && !query.isFetching
      ? 'error'
      : 'loading';
  return { data: query.data, state, retry: () => void query.refetch() };
};
