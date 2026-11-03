import {
  DELAY_CAUSES,
  type DelayCause,
  type DisplayedDelays,
  type LineDelays,
} from '../../../common/types/delays';

/**
 * Use the actual delay (how long delay alerts were active) everywhere it exists: subway
 * lines and bus routes with alert history. Commuter Rail alerts state how far behind
 * schedule a train is, which already is its delay, so those rows keep the stated delay.
 */
export const toDisplayedDelays = (
  data: LineDelays[]
): { delays: DisplayedDelays[]; isActual: boolean } => {
  const isActual = data.some((row) => row.delay_alert_minutes != null);
  const delays = data.map((row) => {
    const causes = Object.fromEntries(
      DELAY_CAUSES.map((cause) => [
        cause,
        isActual ? (row[`delay_alert_minutes_${cause}`] ?? 0) : row[cause],
      ])
    ) as Record<DelayCause, number>;
    return {
      date: row.date,
      total_delay_time: isActual ? (row.delay_alert_minutes ?? null) : row.total_delay_time,
      stated_delay_time: row.total_delay_time,
      ...causes,
    };
  });
  return { delays, isActual };
};
