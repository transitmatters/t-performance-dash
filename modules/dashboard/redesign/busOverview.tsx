import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { useAlertDelays } from '../../../common/api/hooks/delays';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import { getBusRouteIds } from '../../../common/constants/lines';
import type {
  FetchAlertDelaysByLineOptions,
  FetchBusTripMetricsOptions,
} from '../../../common/types/api';
import type { BusRoute } from '../../../common/types/lines';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { SpeedGraph } from '../../speed/charts/SpeedGraph';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import { TotalDelayGraph } from '../../delays/charts/TotalDelayGraph';
import { toDisplayedDelays } from '../../delays/charts/utils';
import {
  CHART_FETCH_START,
  WINDOW_START,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  toSpeedPoints,
  trimTrailingEmpty,
} from './scorecardUtils';
import { BusReliabilityChart, useBusReliabilityRow } from './busReliability';
import { BusServiceChart, buildBusServiceRow, summarizeBusService } from './busService';
import type { MetricKey, ScorecardRow } from './types';

const ridershipLineId = (busRoute: BusRoute) =>
  getRidershipLineId('line-bus', busRoute, undefined, undefined);

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

export const useBusScorecardRows = (busRoute: BusRoute) => {
  const tripMetrics = useBusTripMetrics({
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
    route: getBusRouteIds(busRoute).join(','),
    agg: 'weekly',
  });
  const dailyTripMetrics = useBusTripMetrics(dailyTripMetricsOptions(busRoute));
  const ridership = useRidershipData({
    line_id: ridershipLineId(busRoute),
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
  });
  const delays = useAlertDelays(delaysOptions(busRoute));
  const reliability = useBusReliabilityRow(busRoute, LINE_COLORS['line-bus']);

  const rows = useMemo(() => {
    const color = LINE_COLORS['line-bus'];
    const built: ScorecardRow[] = [];

    const speedRow =
      tripMetrics.data &&
      buildRow({
        key: 'speed',
        label: 'Speed',
        subtitle: 'Average, both directions',
        points: toSpeedPoints(tripMetrics.data),
        reducer: 'avg',
        unit: 'mph',
        formatValue: (v) => v.toFixed(1),
        negligibleDelta: 0.1,
        higherIsBetter: true,
        color,
      });
    if (speedRow) built.push(speedRow);
    if (reliability.row) built.push(reliability.row);

    const service = dailyTripMetrics.data && summarizeBusService(dailyTripMetrics.data);
    if (service) built.push(buildBusServiceRow(service, tripMetrics.data ?? [], color));

    const ridershipRow = ridership.data && buildRidershipRow(ridership.data, color);
    if (ridershipRow) built.push(ridershipRow);

    const delaysRow =
      delays.data &&
      buildRow({
        key: 'delays',
        label: 'Delays',
        subtitle: 'Minutes a delay alert was up, daily average',
        points: delays.data.map((point) => ({
          date: point.date,
          value: point.delay_alert_minutes ?? 0,
        })),
        reducer: 'avg',
        unit: 'min/day',
        formatValue: (v) => Math.round(v).toString(),
        negligibleDelta: 1,
        higherIsBetter: false,
        color,
      });
    if (delaysRow) built.push(delaysRow);

    return built;
  }, [tripMetrics.data, dailyTripMetrics.data, reliability.row, ridership.data, delays.data]);

  return {
    rows,
    isLoading:
      tripMetrics.isLoading ||
      dailyTripMetrics.isLoading ||
      reliability.isLoading ||
      ridership.isLoading ||
      delays.isLoading,
  };
};

export const BusMetricChart = ({ metric, busRoute }: { metric: MetricKey; busRoute: BusRoute }) => {
  const config = getSpeedGraphConfig(dayjs(CHART_FETCH_START), dayjs(TODAY_STRING));

  // 60 days is under getSpeedGraphConfig's daily cut-off, so this is the speed chart's query too
  const tripMetrics = useBusTripMetrics(
    dailyTripMetricsOptions(busRoute),
    metric === 'speed' || metric === 'service'
  );
  // Same query as the scorecard row, so it's already cached; ridership is weekly and can lag.
  const ridership = useRidershipData(
    { line_id: ridershipLineId(busRoute), start_date: WINDOW_START, end_date: TODAY_STRING },
    metric === 'ridership'
  );
  const delays = useAlertDelays(delaysOptions(busRoute), metric === 'delays');

  if (metric === 'reliability') return <BusReliabilityChart busRoute={busRoute} />;
  if (metric === 'speed') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    const data = trimTrailingEmpty(tripMetrics.data);
    const chartEnd = data[data.length - 1]?.date ?? TODAY_STRING;
    return (
      <SpeedGraph
        data={data}
        config={config}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        peakLineDashed
      />
    );
  }
  if (metric === 'service') {
    if (!tripMetrics.data) return <ChartPlaceHolder query={tripMetrics} />;
    return <BusServiceChart daily={tripMetrics.data} color={LINE_COLORS['line-bus']} />;
  }
  if (metric === 'delays') {
    if (!delays.data) return <ChartPlaceHolder query={delays} />;
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
  const ridershipEnd = ridership.data[ridership.data.length - 1]?.date ?? TODAY_STRING;
  return (
    <RidershipGraph
      data={ridership.data}
      config={config}
      startDate={chartWindowStart(ridershipEnd)}
      endDate={ridershipEnd}
    />
  );
};
