import { useMemo } from 'react';

import { useBusTripMetrics } from '../../common/api/hooks/busTripMetrics';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { CHART_COLORS } from '../../common/constants/colors';
import {
  getBusRouteDisplayName,
  getBusRouteIds,
  getFrequentBusRouteIds,
} from '../../common/constants/lines';
import type { BusRoute } from '../../common/types/lines';
import type { AggType } from '../speed/constants/speeds';
import { CHART_CONFIG, toSlot } from './scorecardUtils';
import type { OverviewWindow } from './scorecardUtils';
import { ReliabilityChart, buildReliabilityRow, reliabilityMeta } from './ReliabilityChart';

/**
 * Headway reliability is for routes people turn up for without a schedule, so it's shown only for
 * MBTA Frequent Bus Routes. A curated label mixing frequent and other routes (114/116/117) counts
 * only its frequent ones, rather than pooling in the others' longer, timetabled headways.
 */
export const hasBusReliability = (busRoute: BusRoute) =>
  getFrequentBusRouteIds(busRoute).length > 0;

/** The frequent route names when they're only some of the label's, e.g. "116" for 114/116/117. */
const frequentSubset = (busRoute: BusRoute) => {
  const frequentIds = getFrequentBusRouteIds(busRoute);
  return frequentIds.length < getBusRouteIds(busRoute).length
    ? frequentIds.map(getBusRouteDisplayName).join('/')
    : undefined;
};

/** When every route_id is frequent, this is the same query as the speed row, so it's fetched once. */
const useFrequentTripMetrics = (
  busRoute: BusRoute,
  startDate: string,
  endDate: string,
  agg: AggType,
  enabled = true
) => {
  const frequentIds = getFrequentBusRouteIds(busRoute);
  return useBusTripMetrics(
    { start_date: startDate, end_date: endDate, route: frequentIds.join(','), agg },
    enabled && frequentIds.length > 0
  );
};

/**
 * The Reliability slot, or null for a route that isn't frequent, or has no trip metrics (`enabled`),
 * and so has no such row.
 */
export const useBusReliabilitySlot = (
  busRoute: BusRoute,
  color: string,
  span: OverviewWindow,
  enabled: boolean
) => {
  const tripMetrics = useFrequentTripMetrics(
    busRoute,
    span.windowStart,
    span.end,
    'weekly',
    enabled
  );
  const subset = frequentSubset(busRoute);
  const subtitleSuffix = subset ? `, Route ${subset} only` : '';
  const row = useMemo(
    () => (tripMetrics.data ? buildReliabilityRow(tripMetrics.data, color, subtitleSuffix) : null),
    [tripMetrics.data, subtitleSuffix, color]
  );
  return enabled && hasBusReliability(busRoute)
    ? toSlot(reliabilityMeta(subtitleSuffix), [tripMetrics], () => row)
    : null;
};

/** How the figures are counted (#1339). Bus pages also show the Schleppie "most bunched" award,
 * which people will compare these with. */
const ReliabilityNote = ({ busRoute }: { busRoute: BusRoute }) => {
  const subset = frequentSubset(busRoute);
  return (
    <>
      A headway is the time between one bus and the next at a mid-route timepoint. It&apos;s within
      75–125% when it&apos;s close to the scheduled headway, and bunched when it&apos;s half the
      scheduled headway or less. Each share is of all the route&apos;s headways at those timepoints.
      We show this for frequent routes only, where riders turn up without checking a schedule
      {subset ? `, so this counts Route ${subset} only` : ''}. The Pokey/Schleppie Awards measure
      bunching their own way, so their rankings can differ.
    </>
  );
};

export const BusReliabilityChart = ({
  busRoute,
  span,
}: {
  busRoute: BusRoute;
  span: OverviewWindow;
}) => {
  const tripMetrics = useFrequentTripMetrics(
    busRoute,
    span.chartFetchStart,
    span.end,
    CHART_CONFIG.agg
  );

  if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
  return (
    <ReliabilityChart
      data={tripMetrics.data}
      line="line-bus"
      end={span.end}
      // Bus's dark shade is too close to its yellow to tell apart from the filled series
      bunchedStyle={{ color: CHART_COLORS.ANNOTATIONS }}
      note={<ReliabilityNote busRoute={busRoute} />}
    />
  );
};
