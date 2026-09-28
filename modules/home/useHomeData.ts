import { useMemo } from 'react';
import { useHistoricalBaselines } from '../../common/api/hooks/baselines';
import { useRidershipDataLanding } from '../../common/api/hooks/ridership';
import { useServiceAndRidershipDashboard } from '../../common/api/hooks/serviceAndRidership';
import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { useTripMetricsForLanding } from '../../common/api/hooks/tripmetrics';
import { buildHome } from './compute/buildHome';

/**
 * Builds the home page from data the dashboard already publishes: the landing JSON, slow-zone
 * totals and baselines are static files, and the service & ridership data is one cached API call.
 * Once data-ingestion publishes static/landing/home.json, this becomes a single fetch of that.
 */
export const useHomeData = () => {
  const tripMetrics = useTripMetricsForLanding();
  const ridership = useRidershipDataLanding();
  const baselines = useHistoricalBaselines();
  const delayTotals = useSlowzoneDelayTotalData();
  const serviceAndRidership = useServiceAndRidershipDashboard();

  const queries = [tripMetrics, ridership, baselines, delayTotals, serviceAndRidership];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const data = useMemo(() => {
    if (!tripMetrics.data || !ridership.data || !delayTotals.data || !serviceAndRidership.data) {
      return undefined;
    }
    return buildHome({
      tripMetrics: tripMetrics.data,
      ridership: ridership.data,
      baselines: baselines.data ?? null,
      delayTotals: delayTotals.data,
      serviceAndRidership: serviceAndRidership.data,
      now: new Date(),
    });
  }, [
    tripMetrics.data,
    ridership.data,
    baselines.data,
    delayTotals.data,
    serviceAndRidership.data,
  ]);

  return { data, isLoading, isError };
};
