import { useMemo } from 'react';

import { useHistoricalBaselines, useRidershipBaseline } from '../../../common/api/hooks/baselines';
import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { useAlertDelays } from '../../../common/api/hooks/delays';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { getLineColorKey, LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import { getBusRouteIds } from '../../../common/constants/lines';
import type {
  FetchAlertDelaysByLineOptions,
  FetchBusTripMetricsOptions,
} from '../../../common/types/api';
import type { BusRoute } from '../../../common/types/lines';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { SpeedGraph } from '../../speed/charts/SpeedGraph';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import { TotalDelayGraph } from '../../delays/charts/TotalDelayGraph';
import { toDisplayedDelays } from '../../delays/charts/utils';
import {
  CHART_CONFIG,
  CHART_FETCH_START,
  WINDOW_START,
  YEAR_OVER_YEAR_START,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  hasTrips,
  toSlot,
  toSpeedPoints,
  trimTrailingEmpty,
} from './scorecardUtils';
import { BusReliabilityChart, useBusReliabilitySlot } from './busReliability';
import { BusServiceChart, buildBusServiceRow, summarizeBusService } from './busService';
import type { MetricKey, ScorecardSlot } from './types';

// From YEAR_OVER_YEAR_START so the row can compare with a year ago. The chart makes the same
// request, so it's already cached.
const ridershipOptions = (busRoute: BusRoute) => ({
  line_id: getRidershipLineId('line-bus', busRoute, undefined, undefined),
  start_date: YEAR_OVER_YEAR_START,
  end_date: TODAY_STRING,
});

// Grouped routes (e.g. SL1/SL2/SL3/SLW) are summed per route server-side, so an alert posted on
// several of them counts once for each.
const delaysOptions = (busRoute: BusRoute): FetchAlertDelaysByLineOptions => ({
  start_date: WINDOW_START,
  end_date: TODAY_STRING,
  line: getBusRouteIds(busRoute).join(','),
  agg: 'daily',
});

// The chart card's 60 days. The Service row pools the last 30 of them, the days its chart shows, and
// fetches them on page load with the speed chart, so the row costs no extra request.
const dailyTripMetricsOptions = (busRoute: BusRoute): FetchBusTripMetricsOptions => ({
  start_date: CHART_FETCH_START,
  end_date: TODAY_STRING,
  route: getBusRouteIds(busRoute).join(','),
  agg: 'daily',
});

const SPEED = { key: 'speed', label: 'Speed', subtitle: 'Average, both directions' } as const;
const SERVICE = {
  key: 'service',
  label: 'Service delivered',
  subtitle: 'Share of scheduled trips run',
} as const;
const RIDERSHIP = {
  key: 'ridership',
  label: 'Ridership',
  subtitle: 'Fare validations, daily average',
} as const;
const DELAYS = {
  key: 'delays',
  label: 'Delays',
  subtitle: 'Minutes a delay alert was up, daily average',
} as const;

export const useBusScorecardRows = (busRoute: BusRoute) => {
  const tripMetrics = useBusTripMetrics({
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
    route: getBusRouteIds(busRoute).join(','),
    agg: 'weekly',
  });
  const ridership = useRidershipData(ridershipOptions(busRoute));
  // The same peak as the Ridership page. It falls back to a hard-coded figure until baselines.json
  // loads, and some of those are inflated by stray mid-week records (data-ingestion#198), so wait.
  const baselines = useHistoricalBaselines();
  const ridershipPeak = useRidershipBaseline('line-bus', busRoute);
  const peak = baselines.isPending ? undefined : ridershipPeak;
  const dailyTripMetrics = useBusTripMetrics(dailyTripMetricsOptions(busRoute));
  const delays = useAlertDelays(delaysOptions(busRoute));
  const color = LINE_COLORS[getLineColorKey('line-bus', busRoute)];
  const reliability = useBusReliabilitySlot(busRoute, color);

  const speedRow = useMemo(
    () =>
      tripMetrics.data
        ? buildRow({
            ...SPEED,
            points: toSpeedPoints(tripMetrics.data),
            reducer: 'avg',
            unit: 'mph',
            formatValue: (v) => v.toFixed(1),
            negligibleDelta: 0.1,
            higherIsBetter: true,
            color,
          })
        : null,
    [tripMetrics.data, color]
  );

  const serviceRow = useMemo(() => {
    const service = dailyTripMetrics.data && summarizeBusService(dailyTripMetrics.data);
    return service ? buildBusServiceRow(service, tripMetrics.data ?? [], color) : null;
  }, [dailyTripMetrics.data, tripMetrics.data, color]);

  const ridershipRow = useMemo(
    () =>
      ridership.data
        ? buildRidershipRow(ridership.data, color, { yearOverYear: true, peak })
        : null,
    [ridership.data, peak, color]
  );

  const delaysRow = useMemo(
    () =>
      delays.data
        ? buildRow({
            ...DELAYS,
            // Today has no alert minutes until LAMP fills it in tomorrow. Leave it out rather than
            // count a 0-minute day, as the Delays page does.
            points: delays.data.flatMap((point) =>
              point.delay_alert_minutes == null
                ? []
                : [{ date: point.date, value: point.delay_alert_minutes }]
            ),
            reducer: 'avg',
            unit: 'min/day',
            formatValue: (v) => Math.round(v).toString(),
            negligibleDelta: 1,
            higherIsBetter: false,
            color,
          })
        : null,
    [delays.data, color]
  );

  // Service and Ridership wait for the weekly trend and the ridership peak, which they can do
  // without, so those don't pop in after the row.
  const slots: ScorecardSlot[] = [
    toSlot(SPEED, [tripMetrics], () => speedRow),
    ...(reliability ? [reliability] : []),
    toSlot(SERVICE, [dailyTripMetrics], () => serviceRow, tripMetrics.isPending),
    toSlot(RIDERSHIP, [ridership], () => ridershipRow, baselines.isPending),
    toSlot(DELAYS, [delays], () => delaysRow),
  ];

  return { slots, color };
};

export const BusMetricChart = ({ metric, busRoute }: { metric: MetricKey; busRoute: BusRoute }) => {
  // CHART_CONFIG is daily, so this is the speed chart's query too
  const tripMetrics = useBusTripMetrics(
    dailyTripMetricsOptions(busRoute),
    metric === 'speed' || metric === 'service'
  );
  // Ridership is weekly and can lag.
  const ridership = useRidershipData(ridershipOptions(busRoute), metric === 'ridership');
  const delays = useAlertDelays(delaysOptions(busRoute), metric === 'delays');

  if (metric === 'reliability') return <BusReliabilityChart busRoute={busRoute} />;
  if (metric === 'speed') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    if (!hasTrips(tripMetrics.data))
      return <NoDataNotice isLineMetric message="No trips recorded in the last 60 days." />;
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? TODAY_STRING;
    return (
      <SpeedGraph
        data={data}
        config={CHART_CONFIG}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        peakLineDashed
      />
    );
  }
  if (metric === 'service') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    return (
      <BusServiceChart
        daily={tripMetrics.data}
        color={LINE_COLORS[getLineColorKey('line-bus', busRoute)]}
      />
    );
  }
  if (metric === 'delays') {
    if (!delays.data) return <ChartPlaceHolder query={delays} />;
    if (!delays.data.length)
      return <NoDataNotice isLineMetric message="No delay data in the last year." />;
    const { delays: displayed, isActual } = toDisplayedDelays(delays.data);
    const delaysEnd = delays.data[delays.data.length - 1]?.date ?? TODAY_STRING;
    return (
      <TotalDelayGraph
        data={displayed}
        isActual={isActual}
        startDate={chartWindowStart(delaysEnd)}
        endDate={delaysEnd}
        agg="daily"
      />
    );
  }
  if (!ridership.data) return <ChartPlaceHolder query={ridership} />;
  if (!ridership.data.length)
    return <NoDataNotice isLineMetric message="No ridership counts in the last year." />;
  const ridershipEnd = ridership.data[ridership.data.length - 1]?.date ?? TODAY_STRING;
  return (
    <RidershipGraph
      data={ridership.data}
      config={CHART_CONFIG}
      startDate={chartWindowStart(ridershipEnd)}
      endDate={ridershipEnd}
    />
  );
};
