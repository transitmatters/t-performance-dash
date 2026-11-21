import { useMemo } from 'react';

import { useAlertDelays } from '../../common/api/hooks/delays';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { LINE_COLORS } from '../../common/constants/colors';
import { TODAY_STRING } from '../../common/constants/dates';
import type { CommuterRailRoute } from '../../common/types/lines';
import { getRidershipLineId } from '../../common/utils/ridership';
import { RidershipGraph } from '../ridership/RidershipGraph';
import { TotalDelayGraph } from '../delays/charts/TotalDelayGraph';
import { toDisplayedDelays } from '../delays/charts/utils';
import {
  CHART_CONFIG,
  WINDOW_START,
  buildRidershipRow,
  buildRow,
  chartWindowStart,
  toSlot,
  trailingWindowLabel,
} from './scorecardUtils';
import type { MetricCopy } from './MetricChartCard';
import type { MetricKey, ScorecardSlot } from './types';

const ridershipLineId = (crRoute: CommuterRailRoute) =>
  getRidershipLineId('line-commuter-rail', undefined, crRoute, undefined);

const RIDERSHIP = {
  key: 'ridership',
  label: 'Ridership',
  subtitle: 'Fare validations, daily average',
} as const;
const DELAYS = {
  key: 'delays',
  label: 'Delays',
  subtitle: 'Time delayed per MBTA alerts, daily average',
} as const;
const COLOR = LINE_COLORS['line-commuter-rail'];

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

  const ridershipRow = useMemo(
    () => (ridership.data ? buildRidershipRow(ridership.data, COLOR) : null),
    [ridership.data]
  );
  const delaysRow = useMemo(
    () =>
      delays.data
        ? buildRow({
            ...DELAYS,
            points: delays.data.map((point) => ({
              date: point.date,
              value: point.total_delay_time,
            })),
            reducer: 'avg',
            unit: 'min/day',
            formatValue: (v) => Math.round(v).toString(),
            negligibleDelta: 1,
            higherIsBetter: false,
            color: COLOR,
          })
        : null,
    [delays.data]
  );

  const slots: ScorecardSlot[] = [
    toSlot(RIDERSHIP, [ridership], () => ridershipRow),
    toSlot(DELAYS, [delays], () => delaysRow),
  ];

  return { slots, color: COLOR };
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
  // Ridership lags by months, so leave the window off until we know it rather than say "last 30 days"
  const withWindow = (text: string, data?: { date: string }[]) => {
    const lastDate = data?.[data.length - 1]?.date;
    return lastDate ? `${text}, ${trailingWindowLabel(lastDate)}` : text;
  };
  return {
    ridership: { title: 'Ridership', subtitle: withWindow('Fare validations', ridership.data) },
    delays: {
      title: 'Delays',
      subtitle: withWindow('Daily time delayed per MBTA alerts', delays.data),
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
    if (!delays.data.length)
      return <NoDataNotice isLineMetric message="No delay data in the last year." />;
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
