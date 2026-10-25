import React, { useMemo } from 'react';
import dayjs from 'dayjs';

import { useBusTripMetrics } from '../../../common/api/hooks/busTripMetrics';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import { getBusRouteIds } from '../../../common/constants/lines';
import type { BusRoute } from '../../../common/types/lines';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { SpeedGraph } from '../../speed/charts/SpeedGraph';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import {
  CHART_FETCH_START,
  WINDOW_START,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  toSpeedPoints,
  trimTrailingEmpty,
} from './scorecardUtils';
import type { MetricKey, ScorecardRow } from './types';

const ridershipLineId = (busRoute: BusRoute) =>
  getRidershipLineId('line-bus', busRoute, undefined, undefined);

export const useBusScorecardRows = (busRoute: BusRoute) => {
  const tripMetrics = useBusTripMetrics({
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
    route: getBusRouteIds(busRoute).join(','),
    agg: 'weekly',
  });
  const ridership = useRidershipData({
    line_id: ridershipLineId(busRoute),
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
  });

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

    const ridershipRow = ridership.data && buildRidershipRow(ridership.data, color);
    if (ridershipRow) built.push(ridershipRow);

    return built;
  }, [tripMetrics.data, ridership.data]);

  return { rows, isLoading: tripMetrics.isLoading || ridership.isLoading };
};

export const BusMetricChart: React.FC<{ metric: MetricKey; busRoute: BusRoute }> = ({
  metric,
  busRoute,
}) => {
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
  // Same query as the scorecard row, so it's already cached; ridership is weekly and can lag.
  const ridership = useRidershipData(
    { line_id: ridershipLineId(busRoute), start_date: WINDOW_START, end_date: TODAY_STRING },
    metric === 'ridership'
  );

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
