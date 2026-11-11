import type { Line } from '../../common/types/lines';
import type { DelayAgg } from './format';
import type { RangeRow } from './range';
import { causeRows } from './reasonSeries';

// A month is an average month here, so the figure doesn't depend on which months the range covers.
const PERIOD_DAYS: Record<DelayAgg, number> = { daily: 1, weekly: 7, monthly: 365.25 / 12 };

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

/**
 * Minutes delayed per period, from the days the rows cover. A week with only two days of data so
 * far counts as two days, not a quiet week.
 */
const perPeriod = (rows: RangeRow[], periodDays: number) =>
  (sum(rows.map((row) => row.total_delay_time)) / sum(rows.map((row) => row.days))) * periodDays;

/** The rows before and after the point where half the days have gone by. */
const halves = (rows: RangeRow[]): [RangeRow[], RangeRow[]] => {
  const half = sum(rows.map((row) => row.days)) / 2;
  let days = 0;
  let mid = 0;
  while (mid < rows.length && days + rows[mid].days <= half) {
    days += rows[mid].days;
    mid++;
  }
  return [rows.slice(0, mid), rows.slice(mid)];
};

/** Stats for rows that cover exactly the selected dates (see `coverRange`). */
export const getDelayStats = (data: RangeRow[], agg: DelayAgg, line?: Line) => {
  const periodDays = PERIOD_DAYS[agg];
  const [leading, trailing] = halves(data);

  // Same ranking and share as the cause chart, so the two always agree
  const [topReason] = causeRows(data, line);

  return {
    totalDelay: sum(data.map((row) => row.total_delay_time)), // total minutes delayed across the window
    avgDelay: perPeriod(data, periodDays), // minutes delayed per period (day, week or month)
    avgDelayDelta: perPeriod(trailing, periodDays) - perPeriod(leading, periodDays), // minutes, trailing minus leading half
    agg,
    topReasonLabel: topReason?.label ?? null,
    topReasonShare: topReason?.share ?? null,
  };
};
