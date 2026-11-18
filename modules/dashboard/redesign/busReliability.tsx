import { useMemo } from 'react';

import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { CHART_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import {
  getBusRouteDisplayName,
  getBusRouteIds,
  getFrequentBusRouteIds,
} from '../../../common/constants/lines';
import type { DeliveredTripMetricsBus } from '../../../common/types/dataPoints';
import type { BusRoute } from '../../../common/types/lines';
import type { DatedValue } from '../../../common/utils/dateAggregation';
import { getMinMaxDatesForRoute } from '../../../common/utils/stations';
import type { AggType } from '../../speed/constants/speeds';
import { ReliabilityGraph } from '../../reliability/charts/ReliabilityGraph';
import { BUNCHED, headwayShare, ON_TIME } from '../../reliability/utils';
import { CHART_CONFIG, buildRow, chartWindowStart, toSlot } from './scorecardUtils';
import type { OverviewWindow } from './scorecardUtils';

/**
 * Headway reliability is for routes people turn up for without a schedule, so it's shown only for
 * MBTA Frequent Bus Routes. A curated label mixing frequent and other routes (114/116/117) counts
 * only its frequent ones, rather than pooling in the others' longer, timetabled headways. That list
 * is today's, so a retired route whose route_id is frequent now (pre-BNRD 110) doesn't count.
 */
const frequentIdsFor = (busRoute: BusRoute) =>
  getMinMaxDatesForRoute('Bus', busRoute).maxDate ? [] : getFrequentBusRouteIds(busRoute);

export const hasBusReliability = (busRoute: BusRoute) => frequentIdsFor(busRoute).length > 0;

/** The frequent route names when they're only some of the label's, e.g. "116" for 114/116/117. */
const frequentSubset = (busRoute: BusRoute) => {
  const frequentIds = frequentIdsFor(busRoute);
  return frequentIds.length < getBusRouteIds(busRoute).length
    ? frequentIds.map(getBusRouteDisplayName).join('/')
    : undefined;
};

/** Each period's share of headways in `fields`, skipping periods with no headways counted. */
const toHeadwayPoints = (data: DeliveredTripMetricsBus[], fields: typeof ON_TIME): DatedValue[] =>
  data.flatMap((entry) => {
    const share = headwayShare(entry, fields);
    return share === undefined ? [] : [{ date: entry.date, value: share }];
  });

/** When every route_id is frequent, this is the same query as the speed row, so it's fetched once. */
const useFrequentTripMetrics = (
  busRoute: BusRoute,
  startDate: string,
  endDate: string,
  agg: AggType
) => {
  const frequentIds = frequentIdsFor(busRoute);
  return useBusTripMetrics(
    { start_date: startDate, end_date: endDate, route: frequentIds.join(','), agg },
    frequentIds.length > 0
  );
};

const reliabilityMeta = (subset: string | undefined) =>
  ({
    key: 'reliability',
    label: 'Reliability',
    subtitle: `Headways within 75–125% of schedule${subset ? `, Route ${subset} only` : ''}`,
  }) as const;

/** The Reliability slot, or null for a route that isn't frequent and so has no such row. */
export const useBusReliabilitySlot = (
  busRoute: BusRoute,
  color: string,
  window: OverviewWindow
) => {
  const tripMetrics = useFrequentTripMetrics(busRoute, window.windowStart, window.end, 'weekly');
  const subset = frequentSubset(busRoute);
  const row = useMemo(
    () =>
      tripMetrics.data
        ? buildRow({
            ...reliabilityMeta(subset),
            points: toHeadwayPoints(tripMetrics.data, ON_TIME),
            reducer: 'avg',
            // "%" on the figure, as service delivered has it, rather than spaced off as a unit.
            unit: 'of headways',
            formatValue: (v) => `${v.toFixed(1)}%`,
            formatDelta: (v) => `${v.toFixed(1)} pts`,
            negligibleDelta: 0.5,
            higherIsBetter: true,
            color,
          })
        : null,
    [tripMetrics.data, subset, color]
  );
  return hasBusReliability(busRoute)
    ? toSlot(reliabilityMeta(subset), [tripMetrics], () => row)
    : null;
};

/** How the figures are counted (#1339). Bus pages also show the Schleppie "most bunched" award,
 * which people will compare these with. */
const ReliabilityNote = ({ busRoute }: { busRoute: BusRoute }) => {
  const subset = frequentSubset(busRoute);
  return (
    <p className="text-xs text-muted-foreground">
      A headway is the time between one bus and the next at a mid-route timepoint. It&apos;s within
      75–125% when it&apos;s close to the scheduled headway, and bunched when it&apos;s half the
      scheduled headway or less. Each share is of all the route&apos;s headways at those timepoints.
      We show this for frequent routes only, where riders turn up without checking a schedule
      {subset ? `, so this counts Route ${subset} only` : ''}. The Pokey/Schleppie Awards measure
      bunching their own way, so their rankings can differ.
    </p>
  );
};

export const BusReliabilityChart = ({
  busRoute,
  window,
}: {
  busRoute: BusRoute;
  window: OverviewWindow;
}) => {
  const tripMetrics = useFrequentTripMetrics(
    busRoute,
    window.chartFetchStart,
    window.end,
    CHART_CONFIG.agg
  );

  if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
  const within = toHeadwayPoints(tripMetrics.data, ON_TIME);
  if (!within.length)
    return (
      <NoDataNotice
        isLineMetric
        message={
          window.end < TODAY_STRING
            ? 'No headways recorded in its last 60 days of service.'
            : 'No headways recorded in the last 60 days.'
        }
      />
    );
  const chartEnd = within[within.length - 1]?.date ?? window.end;
  return (
    <div className="flex flex-col gap-3">
      <ReliabilityGraph
        data={[
          { label: 'Within 75–125%', data: within },
          {
            label: 'Bunched',
            data: toHeadwayPoints(tripMetrics.data, BUNCHED),
            // Bus's dark shade is too close to its yellow to tell apart from the filled series
            style: { color: CHART_COLORS.ANNOTATIONS },
          },
        ]}
        line="line-bus"
        agg={CHART_CONFIG.agg}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        kind="percent"
        valueAxisLabel="Headways"
      />
      <ReliabilityNote busRoute={busRoute} />
    </div>
  );
};
