import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { buildHome } from './compute/buildHome';
import { homeQueries } from './queries';
import type { HomeData } from './types';

export type HomeState = 'loading' | 'ready' | 'error';

/**
 * Builds the home page from data the dashboard already publishes: the landing JSON, slow-zone
 * totals and baselines are static files; service & ridership and the bus fleet are cached API
 * calls. Once data-ingestion publishes static/landing/overview.json, this becomes one fetch of that.
 *
 * The bus fleet only feeds one cell, so if it fails that cell says so and the page still builds.
 */
export const useHomeData = (): { data?: HomeData; state: HomeState; retry: () => void } => {
  const queries = homeQueries();
  const [tripMetrics, baselines, delayTotals, serviceAndRidership, busFleet] = useQueries({
    queries: [
      queries.tripMetrics,
      queries.baselines,
      queries.delayTotals,
      queries.serviceAndRidership,
      queries.busFleet,
    ],
  });
  const required = [tripMetrics, baselines, delayTotals, serviceAndRidership];
  const busFleetSettled = busFleet.isSuccess || busFleet.isError;

  const data = useMemo(() => {
    if (
      !tripMetrics.data ||
      !baselines.isSuccess ||
      !delayTotals.data ||
      !serviceAndRidership.data ||
      !busFleetSettled
    ) {
      return undefined;
    }
    return buildHome({
      tripMetrics: tripMetrics.data,
      baselines: baselines.data,
      delayTotals: delayTotals.data,
      serviceAndRidership: serviceAndRidership.data,
      busFleet: busFleet.data ?? null,
      now: new Date(),
    });
  }, [
    tripMetrics.data,
    baselines.isSuccess,
    baselines.data,
    delayTotals.data,
    serviceAndRidership.data,
    busFleetSettled,
    busFleet.data,
  ]);

  const failed = [...required, busFleet].filter((query) => query.isError);
  // A failed query that's refetching (Try again) counts as loading, not still failed.
  const state: HomeState = data
    ? 'ready'
    : required.some((q) => q.isError && !q.isFetching)
      ? 'error'
      : 'loading';
  const retry = () => failed.forEach((query) => void query.refetch());

  return { data, state, retry };
};
