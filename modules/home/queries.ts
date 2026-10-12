import { historicalBaselinesQuery } from '../../common/api/hooks/baselines';
import { systemBusFleetQuery } from '../../common/api/hooks/busTripMetrics';
import { serviceAndRidershipQuery } from '../../common/api/hooks/serviceAndRidership';
import { slowzoneDelayTotalsQuery } from '../../common/api/hooks/slowzones';
import { tripMetricsLandingQuery } from '../../common/api/hooks/tripmetrics';
import { queryClient } from '../../common/api/queryClient';

/** The home page's queries, shared by the hook and the prefetch so they stay in step. */
export const homeQueries = () => ({
  tripMetrics: tripMetricsLandingQuery,
  baselines: historicalBaselinesQuery,
  delayTotals: slowzoneDelayTotalsQuery,
  serviceAndRidership: serviceAndRidershipQuery,
  busFleet: systemBusFleetQuery(),
});

/** Starts the home page's fetches from the route loader, before the page's own code has loaded. */
export const prefetchHomeData = () => {
  const queries = homeQueries();
  return Promise.all([
    queryClient.prefetchQuery(queries.tripMetrics),
    queryClient.prefetchQuery(queries.baselines),
    queryClient.prefetchQuery(queries.delayTotals),
    queryClient.prefetchQuery(queries.serviceAndRidership),
    queryClient.prefetchQuery(queries.busFleet),
  ]);
};
