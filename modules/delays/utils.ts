import type { LineDelays } from '../../common/types/delays';
import type { Line } from '../../common/types/lines';
import { causeRows } from './reasonSeries';

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const halves = <T>(values: T[]): [T[], T[]] => {
  const mid = Math.floor(values.length / 2);
  return [values.slice(0, mid), values.slice(mid)];
};

export const getDelayStats = (data: LineDelays[], agg: 'daily' | 'weekly', line?: Line) => {
  const totals = data.map((point) => point.total_delay_time);
  const totalDelay = totals.reduce((sum, v) => sum + v, 0);
  const [leading, trailing] = halves(totals);

  // Same ranking and share as the cause chart, so the two always agree
  const [topReason] = causeRows(data, line);

  return {
    totalDelay, // total minutes delayed across the window
    avgDelay: mean(totals), // minutes delayed per period (day or week)
    avgDelayDelta: mean(trailing) - mean(leading), // minutes, trailing minus leading half
    agg,
    topReasonLabel: topReason?.label ?? null,
    topReasonShare: topReason?.share ?? null,
  };
};
