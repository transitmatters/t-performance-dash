import type { ChartDataset } from 'chart.js';

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
  'Other',
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

export const filterOutZeroValues = (delayTotals: number[]) => {
  const populatedDelayTotalIdxs = delayTotals.map((delayTotal, idx) => {
    return delayTotal > 0 ? idx : -1;
  });

  return {
    labels: labels.filter((_, idx) => populatedDelayTotalIdxs[idx] !== -1),
    backgroundColors: backgroundColors.filter((_, idx) => populatedDelayTotalIdxs[idx] !== -1),
    delayTotals: delayTotals.filter((_, idx) => populatedDelayTotalIdxs[idx] !== -1),
  };
};

export const filterOutZeroValueDatasets = (datasets: ChartDataset<'line', number[]>[]) => {
  return datasets.filter((dataset) => {
    return dataset.data.some((data) => data > 0);
  });
};
