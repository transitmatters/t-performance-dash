import { useMemo } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { PEAK_SCHEDULED_SERVICE, PEAK_SPEED } from '../../constants/baselines';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../../types/lines';
import { getBaseline, lineSeriesId, ridershipFallbackPeak } from '../../utils/baselines';
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
  return getBaseline(data, 'speed', line, line ? PEAK_SPEED[line] : undefined);
};

export const useScheduledServiceBaseline = (line: Line | undefined) => {
  const { data } = useHistoricalBaselines();
  const peak = PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT'];
  // The Green Line is held back because the published series counts branch trips differently from
  // the dashboard's service metric. The hard-coded peak counts them the dashboard's way, so keep it.
  // Any other series held back later gets no maximum, as ridership does.
  const heldBackPeak = line === 'line-green' ? peak : undefined;
  return getBaseline(data, 'scheduledService', lineSeriesId(line), peak, heldBackPeak);
};

export const useRidershipBaseline = (
  line: Line | undefined,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  const { data } = useHistoricalBaselines();
  return getBaseline(
    data,
    'ridership',
    getRidershipLineId(line, busRoute, crRoute, ferryRoute),
    ridershipFallbackPeak(line, busRoute, crRoute, ferryRoute)
  );
};

/**
 * The flat all-time maximum the ridership chart draws, or 0 for none: for one station, for a line
 * with no maximum (as when its baseline is held back), and where the chart has the maximum for the
 * time of year instead, or is still waiting to hear whether it does.
 */
export const flatRidershipMaximum = (
  linePeak: number | undefined,
  { isStation, hasSeasonal }: { isStation: boolean; hasSeasonal: boolean }
): number => (isStation || hasSeasonal ? 0 : (linePeak ?? 0));

/**
 * Looks up the most riders in a date's week of the year (see getSeasonalMaximums), over the same
 * history the published ridership baseline searched. `maximumFor` is undefined for series without
 * a published baseline (held back, or too little history), where callers keep useRidershipBaseline
 * (which has no maximum for a held-back series), and until `isPending` clears, so a chart doesn't
 * draw the flat maximum and then swap it out.
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
