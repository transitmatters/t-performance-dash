import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
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
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import type { AggType } from '../../speed/constants/speeds';
import { ReliabilityGraph } from '../../reliability/charts/ReliabilityGraph';
import { BUNCHED, headwayShare, WITHIN_75_125 } from '../../reliability/utils';
import { CHART_FETCH_START, WINDOW_START, buildRow, chartWindowStart } from './scorecardUtils';

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

/** Each period's share of headways in `fields`, skipping periods with no headways counted. */
const toHeadwayPoints = (
  data: DeliveredTripMetricsBus[],
  fields: typeof WITHIN_75_125
): DatedValue[] =>
  data.flatMap((entry) => {
    const share = headwayShare(entry, fields);
    return share === undefined ? [] : [{ date: entry.date, value: share }];
  });

/** When every route_id is frequent, this is the same query as the speed row, so it's fetched once. */
const useFrequentTripMetrics = (busRoute: BusRoute, startDate: string, agg: AggType) => {
  const frequentIds = getFrequentBusRouteIds(busRoute);
  return useBusTripMetrics(
    { start_date: startDate, end_date: TODAY_STRING, route: frequentIds.join(','), agg },
    frequentIds.length > 0
  );
};

export const useBusReliabilityRow = (busRoute: BusRoute, color: string) => {
  const tripMetrics = useFrequentTripMetrics(busRoute, WINDOW_START, 'weekly');
  const subset = frequentSubset(busRoute);
  const row = useMemo(
    () =>
      tripMetrics.data &&
      buildRow({
        key: 'reliability',
        label: 'Reliability',
        subtitle: `Headways within 75–125% of schedule${subset ? `, Route ${subset} only` : ''}`,
        points: toHeadwayPoints(tripMetrics.data, WITHIN_75_125),
        reducer: 'avg',
        unit: '%',
        formatValue: (v) => v.toFixed(1),
        negligibleDelta: 0.5,
        higherIsBetter: true,
        color,
      }),
    [tripMetrics.data, subset, color]
  );
  return { row, isLoading: tripMetrics.isLoading };
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

export const BusReliabilityChart = ({ busRoute }: { busRoute: BusRoute }) => {
  const config = getSpeedGraphConfig(dayjs(CHART_FETCH_START), dayjs(TODAY_STRING));
  const tripMetrics = useFrequentTripMetrics(busRoute, CHART_FETCH_START, config.agg);

  if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
  const within = toHeadwayPoints(tripMetrics.data, WITHIN_75_125);
  const chartEnd = within[within.length - 1]?.date ?? TODAY_STRING;
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
        agg={config.agg}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        kind="percent"
        valueAxisLabel="Headways"
      />
      <ReliabilityNote busRoute={busRoute} />
    </div>
  );
};
