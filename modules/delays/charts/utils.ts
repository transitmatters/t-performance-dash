import type { ChartDataset } from 'chart.js';
import {
  DELAY_CAUSES,
  type DelayCause,
  type DisplayedDelays,
  type LineDelays,
} from '../../../common/types/delays';
import type { Line } from '../../../common/types/lines';

// Bus alerts cite disabled buses, not trains
export const disabledVehicleLabel = (line?: Line) =>
  line === 'line-bus' ? '🚌 Disabled Bus' : '🚉 Disabled Train';

const labels = [
  '🚉 Disabled Train',
  '🚪 Door Problem',
  '🔌 Power/Wire Issue',
  '🚦 Signal Problem',
  '🎚️ Switch Problem',
  '🛑 Brake Issue',
  '🛤️ Track Issue',
  `🚧 Track Work`,
  `🚙 Cars/Traffic`,
  '🔧 Mechanical Problem',
  '🌊 Flooding',
  '🚓 Police Activity',
  '🚑 Medical Emergency',
  '🚒 Fire Department Activity',
  'Other/No Reason Given',
];

const backgroundColors = [
  '#dc2626',
  '#3f6212',
  '#eab308',
  '#84cc16',
  '#10b981',
  '#4c1d95',
  '#8b5cf6',
  '#f87171',
  '#f59e0b',
  '#451a03',
  '#0ea5e9',
  '#1d4ed8',
  '#be123c',
  '#ea580c',
  '#6b7280',
];

export const filterOutZeroValues = (delayTotals: number[], line?: Line) => {
  const populatedDelayTotalIdxs = delayTotals.map((delayTotal, idx) => {
    return delayTotal > 0 ? idx : -1;
  });

  return {
    labels: [disabledVehicleLabel(line), ...labels.slice(1)].filter(
      (_, idx) => populatedDelayTotalIdxs[idx] !== -1
    ),
    backgroundColors: backgroundColors.filter((_, idx) => populatedDelayTotalIdxs[idx] !== -1),
    delayTotals: delayTotals.filter((_, idx) => populatedDelayTotalIdxs[idx] !== -1),
  };
};

export const filterOutZeroValueDatasets = (datasets: ChartDataset<'line', number[]>[]) => {
  return datasets.filter((dataset) => {
    return dataset.data.some((data) => data > 0);
  });
};

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
