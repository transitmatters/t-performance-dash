import { useMemo } from 'react';

import { useHistoricalBaselines, useRidershipBaseline } from '../../../common/api/hooks/baselines';
import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { useAlertDelays } from '../../../common/api/hooks/delays';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../../common/components/notices/NoDataNotice';
import { getLineColorKey, LINE_COLORS } from '../../../common/constants/colors';
import { getBusRouteIds } from '../../../common/constants/lines';
import type {
  FetchAlertDelaysByLineOptions,
  FetchBusTripMetricsOptions,
} from '../../../common/types/api';
import type { BusRoute } from '../../../common/types/lines';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { getMinMaxDatesForRoute } from '../../../common/utils/stations';
import { SpeedGraph } from '../../speed/charts/SpeedGraph';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import { TotalDelayGraph } from '../../delays/charts/TotalDelayGraph';
import { toDisplayedDelays } from '../../delays/charts/utils';
import {
  CHART_CONFIG,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  getOverviewWindow,
  hasTrips,
  toSlot,
  toSpeedPoints,
  trimTrailingEmpty,
} from './scorecardUtils';
import { BusReliabilityChart, useBusReliabilitySlot } from './busReliability';
import { BusServiceChart, buildBusServiceRow, summarizeBusService } from './busService';
import type { MetricKey, ScorecardSlot } from './types';

type OverviewWindow = ReturnType<typeof getOverviewWindow>;

/** A retired route's last day of service, or undefined for a route still running. */
export const getBusServiceEnd = (busRoute: BusRoute) =>
  getMinMaxDatesForRoute('Bus', busRoute).maxDate;

/** A retired route's overview ends on its last day of service, rather than showing an empty year. */
const getBusOverviewWindow = (busRoute: BusRoute) => getOverviewWindow(getBusServiceEnd(busRoute));

// From yearOverYearStart so the row can compare with a year ago. The chart makes the same
// request, so it's already cached.
const ridershipOptions = (busRoute: BusRoute, window: OverviewWindow) => ({
  line_id: getRidershipLineId('line-bus', busRoute, undefined, undefined),
  start_date: window.yearOverYearStart,
  end_date: window.end,
});

// Grouped routes (e.g. SL1/SL2/SL3/SLW) are summed per route server-side, so an alert posted on
// several of them counts once for each.
const delaysOptions = (
  busRoute: BusRoute,
  window: OverviewWindow
): FetchAlertDelaysByLineOptions => ({
  start_date: window.windowStart,
  end_date: window.end,
  line: getBusRouteIds(busRoute).join(','),
  agg: 'daily',
});

// The chart card's 60 days. The Service row pools the last 30 of them, the days its chart shows, and
// fetches them on page load with the speed chart, so the row costs no extra request.
const dailyTripMetricsOptions = (
  busRoute: BusRoute,
  window: OverviewWindow
): FetchBusTripMetricsOptions => ({
  start_date: window.chartFetchStart,
  end_date: window.end,
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
  const window = getBusOverviewWindow(busRoute);
  const tripMetrics = useBusTripMetrics({
    start_date: window.windowStart,
    end_date: window.end,
    route: getBusRouteIds(busRoute).join(','),
    agg: 'weekly',
  });
  const ridership = useRidershipData(ridershipOptions(busRoute, window));
  // The same peak as the Ridership page. It falls back to a hard-coded figure until baselines.json
  // loads, and some of those are inflated by stray mid-week records (data-ingestion#198), so wait.
  const baselines = useHistoricalBaselines();
  const ridershipPeak = useRidershipBaseline('line-bus', busRoute);
  const peak = baselines.isPending ? undefined : ridershipPeak;
  const dailyTripMetrics = useBusTripMetrics(dailyTripMetricsOptions(busRoute, window));
  const delays = useAlertDelays(delaysOptions(busRoute, window));
  const color = LINE_COLORS[getLineColorKey('line-bus', busRoute)];
  const reliability = useBusReliabilitySlot(busRoute, color, window);

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
        ? buildRidershipRow(ridership.data, color, {
            yearOverYear: true,
            peak,
            windowStart: window.windowStart,
          })
        : null,
    [ridership.data, peak, color, window.windowStart]
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
  const window = getBusOverviewWindow(busRoute);
  const retired = Boolean(getBusServiceEnd(busRoute));
  // CHART_CONFIG is daily, so this is the speed chart's query too
  const tripMetrics = useBusTripMetrics(
    dailyTripMetricsOptions(busRoute, window),
    metric === 'speed' || metric === 'service'
  );
  // Ridership is weekly and can lag.
  const ridership = useRidershipData(ridershipOptions(busRoute, window), metric === 'ridership');
  const delays = useAlertDelays(delaysOptions(busRoute, window), metric === 'delays');

  if (metric === 'reliability') return <BusReliabilityChart busRoute={busRoute} window={window} />;
  if (metric === 'speed') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    if (!hasTrips(tripMetrics.data))
      return (
        <NoDataNotice
          isLineMetric
          message={
            retired
              ? 'No trips recorded in its last 60 days of service.'
              : 'No trips recorded in the last 60 days.'
          }
        />
      );
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? window.end;
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
      return (
        <NoDataNotice
          isLineMetric
          message={
            retired
              ? 'No delay data in its last year of service.'
              : 'No delay data in the last year.'
          }
        />
      );
    const { delays: displayed, isActual } = toDisplayedDelays(delays.data);
    const delaysEnd = delays.data[delays.data.length - 1]?.date ?? window.end;
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
    return (
      <NoDataNotice
        isLineMetric
        message={
          retired
            ? 'No ridership counts in its last year of service.'
            : 'No ridership counts in the last year.'
        }
      />
    );
  const ridershipEnd = ridership.data[ridership.data.length - 1]?.date ?? window.end;
  return (
    <RidershipGraph
      data={ridership.data}
      config={CHART_CONFIG}
      startDate={chartWindowStart(ridershipEnd)}
      endDate={ridershipEnd}
    />
  );
};
