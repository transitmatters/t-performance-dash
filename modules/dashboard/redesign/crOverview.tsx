import { useMemo } from 'react';
import dayjs from 'dayjs';

import { useAlertDelays } from '../../../common/api/hooks/delays';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import type { CommuterRailRoute } from '../../../common/types/lines';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { getSpeedGraphConfig } from '../../speed/constants/speeds';
import { RidershipGraph } from '../../ridership/RidershipGraph';
import { TotalDelayGraph } from '../../delays/charts/TotalDelayGraph';
import { toDisplayedDelays } from '../../delays/charts/utils';
import {
  CHART_FETCH_START,
  WINDOW_START,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  trailingWindowLabel,
} from './scorecardUtils';
import type { MetricCopy } from './MetricChartCard';
import type { MetricKey, ScorecardRow } from './types';

const ridershipLineId = (crRoute: CommuterRailRoute) =>
  getRidershipLineId('line-commuter-rail', undefined, crRoute, undefined);

export const useCrScorecardRows = (crRoute: CommuterRailRoute) => {
  const ridership = useRidershipData({
    line_id: ridershipLineId(crRoute),
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
  });
  const delays = useAlertDelays({
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
    line: crRoute,
    agg: 'daily',
  });

  const rows = useMemo(() => {
    const color = LINE_COLORS['line-commuter-rail'];
    const built: ScorecardRow[] = [];

    const ridershipRow = ridership.data && buildRidershipRow(ridership.data, color);
    if (ridershipRow) built.push(ridershipRow);

    const delaysRow =
      delays.data &&
      buildRow({
        key: 'delays',
        label: 'Delays',
        subtitle: 'Time delayed per MBTA alerts, daily average',
        points: delays.data.map((point) => ({ date: point.date, value: point.total_delay_time })),
        reducer: 'avg',
        unit: 'min/day',
        formatValue: (v) => Math.round(v).toString(),
        negligibleDelta: 1,
        higherIsBetter: false,
        color,
      });
    if (delaysRow) built.push(delaysRow);

    return built;
  }, [ridership.data, delays.data]);

  return { rows, isLoading: ridership.isLoading || delays.isLoading };
};

/** Chart titles that name the window the chart actually shows, since ridership lags by months. */
export const useCrChartCopy = (crRoute: CommuterRailRoute): MetricCopy => {
  // The scorecard's queries, so these read the cache.
  const ridership = useRidershipData({
    line_id: ridershipLineId(crRoute),
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
  });
  const delays = useAlertDelays({
    start_date: WINDOW_START,
    end_date: TODAY_STRING,
    line: crRoute,
    agg: 'daily',
  });
  const windowFor = (data?: { date: string }[]) =>
    trailingWindowLabel(data?.[data.length - 1]?.date ?? TODAY_STRING);
  return {
    ridership: { title: 'Ridership', subtitle: `Fare validations, ${windowFor(ridership.data)}` },
    delays: {
      title: 'Delays',
      subtitle: `Daily time delayed per MBTA alerts, ${windowFor(delays.data)}`,
    },
  };
};

export const CrMetricChart = ({
  metric,
  crRoute,
}: {
  metric: MetricKey;
  crRoute: CommuterRailRoute;
}) => {
  // Same queries as the scorecard rows, so they're already cached. CR ridership lags by months,
  // so the chart windows to the last 30 days with data rather than the last 30 calendar days.
  const ridership = useRidershipData(
    { line_id: ridershipLineId(crRoute), start_date: WINDOW_START, end_date: TODAY_STRING },
    metric === 'ridership'
  );
  const delays = useAlertDelays(
    { start_date: WINDOW_START, end_date: TODAY_STRING, line: crRoute, agg: 'daily' },
    metric === 'delays'
  );

  if (metric === 'delays') {
    if (!delays.data) return <ChartPlaceHolder query={delays} />;
    const delaysEnd = delays.data[delays.data.length - 1]?.date ?? TODAY_STRING;
    return (
      <TotalDelayGraph
        data={toDisplayedDelays(delays.data).delays}
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
      config={getSpeedGraphConfig(dayjs(CHART_FETCH_START), dayjs(TODAY_STRING))}
      startDate={chartWindowStart(ridershipEnd)}
      endDate={ridershipEnd}
    />
  );
};
