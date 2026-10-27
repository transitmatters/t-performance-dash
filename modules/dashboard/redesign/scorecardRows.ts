import dayjs from 'dayjs';
import { useMemo } from 'react';

import { useDeliveredTripMetrics } from '../../../common/api/hooks/tripmetrics';
import { useRidershipData } from '../../../common/api/hooks/ridership';
import { getRidershipLineId } from '../../../common/utils/ridership';
import { useSlowzoneAllData } from '../../../common/api/hooks/slowzones';
import { LINE_COLORS } from '../../../common/constants/colors';
import { TODAY_STRING } from '../../../common/constants/dates';
import { filterAllSlow } from '../../../common/utils/slowZoneUtils';
import type { DatedValue } from '../../../common/utils/dateAggregation';
import type { Line, LineShort } from '../../../common/types/lines';
import type { ScorecardRow } from './types';
import {
  WINDOW_START,
  buildRidershipRow,
  buildRow,
  deltaSentimentFor,
  toSpeedPoints,
} from './scorecardUtils';

export const useSubwayScorecardRows = (
  line: Line | undefined,
  lineShort: LineShort | undefined
) => {
  const enabled = Boolean(line);

  const tripMetrics = useDeliveredTripMetrics(
    { start_date: WINDOW_START, end_date: TODAY_STRING, agg: 'weekly', line },
    enabled
  );
  const ridership = useRidershipData(
    {
      line_id: getRidershipLineId(line, undefined, undefined, undefined),
      start_date: WINDOW_START,
      end_date: TODAY_STRING,
    },
    enabled
  );
  const allSlow = useSlowzoneAllData();

  const rows = useMemo(() => {
    if (!line) return [];
    const color = LINE_COLORS[line];
    const built: ScorecardRow[] = [];

    if (tripMetrics.data) {
      const speedRow = buildRow({
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

      const servicePoints: DatedValue[] = tripMetrics.data
        .filter((point) => point.miles_covered)
        .map((point) => ({ date: point.date, value: point.count }));
      const serviceRow = buildRow({
        key: 'service',
        label: 'Service delivered',
        subtitle: 'Round trips, daily average',
        points: servicePoints,
        reducer: 'avg',
        unit: '/day',
        formatValue: (v) => Math.round(v).toString(),
        negligibleDelta: 1,
        higherIsBetter: true,
        color,
      });
      if (serviceRow) built.push(serviceRow);
    }

    const ridershipRow = ridership.data && buildRidershipRow(ridership.data, color);
    if (ridershipRow) built.push(ridershipRow);

    if (allSlow.data && lineShort && lineShort in { Red: 1, Orange: 1, Blue: 1, Green: 1 }) {
      const now = dayjs.utc();
      const zones = allSlow.data.data;
      // Anchor "this month" to the data's latest coverage, not today: the feed lags a few days, so
      // on the 1st of a month the current calendar month is empty and would read a false "0 active".
      // This mirrors the other rows, whose getMonthlyDelta uses the last month that has data.
      const coverageEnd = zones.reduce(
        (max, z) => {
          const end = dayjs.utc(z.end);
          return end.isValid() && end.isAfter(max) && end.isBefore(now) ? end : max;
        },
        now.subtract(1, 'month')
      );
      // Count distinct slow zones active in each of the trailing 13 calendar months for this line.
      // A zone spanning multiple months is counted in each month it was active — this is "how many
      // slow zones there were," not time lost. filterAllSlow keeps zones overlapping the window.
      const monthlyCounts = Array.from({ length: 13 }, (_, i) => {
        const month = coverageEnd.subtract(12 - i, 'month');
        return filterAllSlow(zones, month.startOf('month'), month.endOf('month'), lineShort).length;
      });
      // Headline + delta are trailing 30-day windows (last 30 days vs the previous 30), anchored to
      // the coverage end — consistent with the other rows and stable across month boundaries. The
      // monthlyCounts above stay as the 12-month trend sparkline.
      const currentCount = filterAllSlow(
        zones,
        coverageEnd.subtract(30, 'day'),
        coverageEnd,
        lineShort
      ).length;
      const priorCount = filterAllSlow(
        zones,
        coverageEnd.subtract(60, 'day'),
        coverageEnd.subtract(30, 'day'),
        lineShort
      ).length;
      const delta = currentCount - priorCount;
      const sentiment = deltaSentimentFor(delta, 0, false);

      built.push({
        key: 'slowzones',
        label: 'Slow zones',
        subtitle: 'Speed-restricted segments',
        formattedCurrent: `${currentCount}`,
        currentValue: currentCount,
        // "zones" (a plain count noun under the "This month" column), not "active" — the count is a
        // monthly figure, and "active" would imply a live/right-now reading.
        formatValue: (v) => Math.round(v).toString(),
        unit: 'zones',
        deltaLabel:
          delta === 0
            ? 'No change · flat'
            : `${delta > 0 ? '+' : ''}${delta} · ${sentiment === 'good' ? 'better' : 'worse'}`,
        deltaValueLabel: delta === 0 ? '0' : `${delta > 0 ? '+' : ''}${delta}`,
        deltaSentiment: sentiment,
        trend: monthlyCounts,
        color,
      });
    }

    return built;
  }, [line, lineShort, tripMetrics.data, ridership.data, allSlow.data]);

  const isLoading = enabled && (tripMetrics.isLoading || ridership.isLoading || allSlow.isLoading);

  return { rows, isLoading };
};
