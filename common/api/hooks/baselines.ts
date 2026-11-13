import { useMemo } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { PEAK_RIDERSHIP, PEAK_SCHEDULED_SERVICE, PEAK_SPEED } from '../../constants/baselines';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../../types/lines';
import type { RidershipKey } from '../../types/ridership';
import { getBaseline, lineSeriesId } from '../../utils/baselines';
import { getRidershipLineId } from '../../utils/ridership';
import { getSeasonalMaximum, getSeasonalMaximums } from '../../utils/seasonalRidership';
import { fetchHistoricalBaselines } from '../baselines';
import { useRidershipData } from './ridership';

export const historicalBaselinesQuery = queryOptions({
  queryKey: ['historicalBaselines'],
  queryFn: fetchHistoricalBaselines,
  staleTime: ONE_HOUR,
  retry: false,
});

export const useHistoricalBaselines = () => {
  return useQuery(historicalBaselinesQuery);
};

export const useSpeedBaseline = (line: Line | undefined) => {
  const { data } = useHistoricalBaselines();
  return getBaseline(data, 'speed', line, PEAK_SPEED[line ?? 'DEFAULT']);
};

export const useScheduledServiceBaseline = (line: Line | undefined) => {
  const { data } = useHistoricalBaselines();
  return getBaseline(
    data,
    'scheduledService',
    lineSeriesId(line),
    PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT']
  );
};

export const useRidershipBaseline = (
  line: Line | undefined,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  const { data } = useHistoricalBaselines();
  const routeIndex = (crRoute ??
    ferryRoute ??
    (busRoute ? busRoute.replaceAll('/', '') : line)) as RidershipKey;
  return getBaseline(
    data,
    'ridership',
    getRidershipLineId(line, busRoute, crRoute, ferryRoute),
    PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT']
  );
};

/**
 * Looks up the most riders in a date's week of the year (see getSeasonalMaximums), over the same
 * history the published ridership baseline searched. `maximumFor` is undefined for series without
 * a published baseline (held back, or too little history), where callers keep useRidershipBaseline,
 * and until `isPending` clears, so a chart doesn't draw the flat maximum and then swap it out.
 *
 * Costs one extra /api/ridership request per line. It ends at the baseline's cutoff, three years
 * back, so the API marks it cacheable for months and the edge cache serves it to every visitor
 * until baselines.json moves the cutoff the next week.
 */
export const useSeasonalRidershipMaximums = (
  line: Line | undefined,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  const baselines = useHistoricalBaselines();
  const lineId = getRidershipLineId(line, busRoute, crRoute, ferryRoute);
  const series = lineId ? baselines.data?.metrics.ridership?.series[lineId] : undefined;
  const history = series?.value ? series.historyWindow : undefined;
  const ridership = useRidershipData(
    { line_id: lineId, start_date: history?.start, end_date: history?.end },
    Boolean(history)
  );
  const maximumFor = useMemo(() => {
    if (!ridership.data || !history) return undefined;
    const maximums = getSeasonalMaximums(ridership.data, history.end);
    return (date: string) => getSeasonalMaximum(maximums, date);
  }, [ridership.data, history]);
  // isLoading, not isPending: a disabled query stays pending forever.
  return { maximumFor, isPending: baselines.isPending || ridership.isLoading };
};
