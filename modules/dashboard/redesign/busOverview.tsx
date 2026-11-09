import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useHistoricalBaselines, useRidershipBaseline } from '../../../common/api/hooks/baselines';
import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { useAlertDelays } from '../../../common/api/hooks/delays';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import { getBusRouteIds } from '../../../common/constants/lines';
import type { FetchAlertDelaysByLineOptions } from '../../../common/types/api';
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
  YEAR_OVER_YEAR_START,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  toSpeedPoints,
  trimTrailingEmpty,
} from './scorecardUtils';
import type { MetricKey, ScorecardRow } from './types';

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
  const delays = useAlertDelays(delaysOptions(busRoute));

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

    const ridershipRow =
      ridership.data && buildRidershipRow(ridership.data, color, { yearOverYear: true, peak });
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
  }, [tripMetrics.data, ridership.data, peak, delays.data]);

  return {
    rows,
    isLoading: tripMetrics.isLoading || ridership.isLoading || delays.isLoading,
  };
};

export const BusMetricChart = ({ metric, busRoute }: { metric: MetricKey; busRoute: BusRoute }) => {
  const config = getSpeedGraphConfig(dayjs(CHART_FETCH_START), dayjs(TODAY_STRING));

  const tripMetrics = useBusTripMetrics(
    {
      start_date: CHART_FETCH_START,
      end_date: TODAY_STRING,
      route: getBusRouteIds(busRoute).join(','),
      agg: config.agg,
    },
    metric === 'speed'
  );
  // Ridership is weekly and can lag.
  const ridership = useRidershipData(ridershipOptions(busRoute), metric === 'ridership');
  const delays = useAlertDelays(delaysOptions(busRoute), metric === 'delays');

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
